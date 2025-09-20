const Floor = require('../models/Floor');
const Table = require('../models/Table');
const { generateResponse } = require('../utils/responseHelper');

// Get all floors for a restaurant
const getFloors = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { page = 1, limit = 20, includeTables = false } = req.query;

    let query = Floor.find({ restaurantId, isActive: true });

    // Populate tables if requested
    if (includeTables === 'true') {
      query = query.populate({
        path: 'tables',
        match: { isActive: true },
        select: 'tableNumber capacity status position qrCodeId',
        populate: {
          path: 'qrCodeId',
          select: 'qrImage scanCount'
        }
      });
    }

    const floors = await query
      .sort({ floorNumber: 1, floorName: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Floor.countDocuments({ restaurantId, isActive: true });

    // Calculate floor statistics
    const floorsWithStats = await Promise.all(
      floors.map(async (floor) => {
        const floorObj = floor.toObject();
        
        // Get table count and capacity for this floor
        const tableStats = await Table.aggregate([
          { $match: { floorId: floor._id, isActive: true } },
          {
            $group: {
              _id: null,
              totalTables: { $sum: 1 },
              totalCapacity: { $sum: '$capacity' },
              availableTables: {
                $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] }
              },
              occupiedTables: {
                $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] }
              }
            }
          }
        ]);

        floorObj.stats = tableStats[0] || {
          totalTables: 0,
          totalCapacity: 0,
          availableTables: 0,
          occupiedTables: 0
        };

        return floorObj;
      })
    );

    return res.status(200).json(generateResponse(true, 'Floors fetched successfully', {
      floors: floorsWithStats,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    }));
  } catch (error) {
    console.error('Error fetching floors:', error);
    return res.status(500).json(generateResponse(false, 'Failed to fetch floors', null, error.message));
  }
};

// Create a new floor
const createFloor = async (req, res) => {
  try {
    const { 
      floorName, 
      description = '', 
      floorNumber,
      layout = { width: 1000, height: 800 }
    } = req.body;
    const { restaurantId } = req.params;
    const userId = req.user.id;

    // Check if floor name already exists
    const existingFloor = await Floor.findOne({ 
      floorName, 
      restaurantId, 
      isActive: true 
    });

    if (existingFloor) {
      return res.status(400).json(generateResponse(false, 'Floor name already exists'));
    }

    // Create floor
    const floor = new Floor({
      floorName,
      description,
      floorNumber,
      restaurantId,
      layout,
      createdBy: userId,
    });

    await floor.save();

    return res.status(201).json(generateResponse(true, 'Floor created successfully', floor));
  } catch (error) {
    console.error('Error creating floor:', error);
    return res.status(500).json(generateResponse(false, 'Failed to create floor', null, error.message));
  }
};

// Update floor
const updateFloor = async (req, res) => {
  try {
    const { id } = req.params;
    const { floorName, description, floorNumber, layout } = req.body;
    const { restaurantId } = req.params;

    const floor = await Floor.findOne({ _id: id, restaurantId, isActive: true });
    if (!floor) {
      return res.status(404).json(generateResponse(false, 'Floor not found'));
    }

    // Check if new floor name already exists (if changing)
    if (floorName && floorName !== floor.floorName) {
      const existingFloor = await Floor.findOne({ 
        floorName, 
        restaurantId, 
        isActive: true,
        _id: { $ne: id }
      });

      if (existingFloor) {
        return res.status(400).json(generateResponse(false, 'Floor name already exists'));
      }
    }

    // Update fields
    if (floorName) floor.floorName = floorName;
    if (description !== undefined) floor.description = description;
    if (floorNumber !== undefined) floor.floorNumber = floorNumber;
    if (layout) floor.layout = { ...floor.layout, ...layout };

    await floor.save();

    return res.status(200).json(generateResponse(true, 'Floor updated successfully', floor));
  } catch (error) {
    console.error('Error updating floor:', error);
    return res.status(500).json(generateResponse(false, 'Failed to update floor', null, error.message));
  }
};

// Delete floor
const deleteFloor = async (req, res) => {
  try {
    const { id } = req.params;
    const { restaurantId } = req.params;
    const { forceDelete = false } = req.query;

    const floor = await Floor.findOne({ _id: id, restaurantId, isActive: true });
    if (!floor) {
      return res.status(404).json(generateResponse(false, 'Floor not found'));
    }

    // Check if floor has tables
    const tablesOnFloor = await Table.countDocuments({ 
      floorId: id, 
      isActive: true 
    });

    if (tablesOnFloor > 0 && forceDelete !== 'true') {
      return res.status(400).json(generateResponse(
        false, 
        `Cannot delete floor with ${tablesOnFloor} active tables. Use forceDelete=true to delete floor and move tables to no floor.`,
        { tablesCount: tablesOnFloor }
      ));
    }

    // If force delete, remove floor reference from tables
    if (forceDelete === 'true') {
      await Table.updateMany(
        { floorId: id, isActive: true },
        { $unset: { floorId: 1 } }
      );
    }

    // Soft delete floor
    floor.isActive = false;
    await floor.save();

    return res.status(200).json(generateResponse(true, 'Floor deleted successfully'));
  } catch (error) {
    console.error('Error deleting floor:', error);
    return res.status(500).json(generateResponse(false, 'Failed to delete floor', null, error.message));
  }
};

// Add table to floor
const addTableToFloor = async (req, res) => {
  try {
    const { id: floorId } = req.params;
    const { tableId } = req.body;
    const { restaurantId } = req.params;

    const floor = await Floor.findOne({ _id: floorId, restaurantId, isActive: true });
    if (!floor) {
      return res.status(404).json(generateResponse(false, 'Floor not found'));
    }

    const table = await Table.findOne({ _id: tableId, restaurantId, isActive: true });
    if (!table) {
      return res.status(404).json(generateResponse(false, 'Table not found'));
    }

    // Update table's floor
    table.floorId = floorId;
    await table.save();

    const updatedFloor = await Floor.findById(floorId).populate({
      path: 'tables',
      match: { isActive: true },
      select: 'tableNumber capacity status position'
    });

    return res.status(200).json(generateResponse(true, 'Table added to floor successfully', updatedFloor));
  } catch (error) {
    console.error('Error adding table to floor:', error);
    return res.status(500).json(generateResponse(false, 'Failed to add table to floor', null, error.message));
  }
};

// Remove table from floor
const removeTableFromFloor = async (req, res) => {
  try {
    const { id: floorId } = req.params;
    const { tableId } = req.body;
    const { restaurantId } = req.params;

    const table = await Table.findOne({ 
      _id: tableId, 
      floorId, 
      restaurantId, 
      isActive: true 
    });

    if (!table) {
      return res.status(404).json(generateResponse(false, 'Table not found on this floor'));
    }

    // Remove floor reference from table
    table.floorId = undefined;
    await table.save();

    return res.status(200).json(generateResponse(true, 'Table removed from floor successfully'));
  } catch (error) {
    console.error('Error removing table from floor:', error);
    return res.status(500).json(generateResponse(false, 'Failed to remove table from floor', null, error.message));
  }
};

module.exports = {
  getFloors,
  createFloor,
  updateFloor,
  deleteFloor,
  addTableToFloor,
  removeTableFromFloor,
};
