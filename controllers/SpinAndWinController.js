const Wheel = require('../model/SpinAndWin');

// ➤ Create a new Wheel
const createWheel = async (req, res) => {
  try {
    const { name, segments, isActive } = req.body;

    const wheel = new Wheel({
      name,
      segments,
      isActive,
      restaurantId: req.userId, // attach logged-in restaurant ID
    });

    await wheel.save();

    res.status(201).json({
      success: true,
      message: "Wheel created successfully",
      wheel,
    });
  } catch (error) {
    console.error("Error creating wheel:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create wheel",
      error: error.message,
    });
  }
};

// ➤ Get all wheels for current restaurant
const getAllWheels = async (req, res) => {
  try {
    const { isActive, page = 1, limit = 10 } = req.query;

    const filter = {
      restaurantId: req.userId, // fetch only wheels for this restaurant
    };
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const wheels = await Wheel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Wheel.countDocuments(filter);

    res.json({
      success: true,
      wheels,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching wheels:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wheels",
      error: error.message,
    });
  }
};
 const getWheelById = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Wheel ID",
      });
    }

    const wheel = await Wheel.findOne({
      _id: id,
      restaurantId: req.userId,
    });

    if (!wheel) {
      return res.status(404).json({
        success: false,
        message: "Wheel not found",
      });
    }

    res.status(200).json({ success: true, wheel });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch wheel",
      error: error.message,
    });
  }
};

// ➤ Update wheel
const updateWheel = async (req, res) => {
  try {
    const wheel = await Wheel.findOneAndUpdate(
      { _id: req.params.id, restaurantId: req.userId },
      req.body,
      { new: true }
    );

    if (!wheel) {
      return res.status(404).json({
        success: false,
        message: "Wheel not found",
      });
    }

    res.json({
      success: true,
      message: "Wheel updated successfully",
      wheel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update wheel",
      error: error.message,
    });
  }
};

// ➤ Delete wheel
const deleteWheel = async (req, res) => {
  try {
    const wheel = await Wheel.findOneAndDelete({
      _id: req.params.id,
      restaurantId: req.userId,
    });

    if (!wheel) {
      return res.status(404).json({
        success: false,
        message: "Wheel not found",
      });
    }

    res.json({
      success: true,
      message: "Wheel deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete wheel",
      error: error.message,
    });
  }
};
module.exports = {
  createWheel,
  getAllWheels,
  getWheelById,
  updateWheel,
  deleteWheel,
};