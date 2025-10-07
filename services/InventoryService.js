const Menu = require("../model/Menu");
const Inventory = require("../model/Inventory");
const { roundToDecimals } = require("../utils/numberUtils");


/**
 * Convert units to a common base unit for comparison
 * @param {Number} quantity - Quantity to convert
 * @param {String} fromUnit - Source unit
 * @param {String} toUnit - Target unit
 * @returns {Number} - Converted quantity
 */
const convertUnits = (quantity, fromUnit, toUnit) => {
  // Define conversion factors to grams as base unit
  const conversionFactors = {
    'mg': 0.001,    // 1 mg = 0.001 g
    'gm': 1,        // 1 gm = 1 g
    'kg': 1000,     // 1 kg = 1000 g
    'ml': 1,        // 1 ml = 1 ml (for liquids)
    'litre': 1000,  // 1 litre = 1000 ml
    'pcs': 1        // 1 piece = 1 piece
  };

  // If units are the same, no conversion needed
  if (fromUnit === toUnit) {
    return roundToDecimals(quantity, 2);
  }

  // Convert to base unit first
  const baseQuantity = quantity * (conversionFactors[fromUnit] || 1);
  
  // Convert from base unit to target unit
  const convertedQuantity = baseQuantity / (conversionFactors[toUnit] || 1);
  
  // Round to avoid floating point precision issues
  const roundedQuantity = roundToDecimals(convertedQuantity, 2);
  
  // Debug logging
  console.log(`Unit conversion: ${quantity} ${fromUnit} = ${roundedQuantity} ${toUnit}`);
  console.log(`Base quantity: ${baseQuantity}, Conversion factor: ${conversionFactors[toUnit]}`);
  
  return roundedQuantity;
};

/**
 * Check if two units are compatible (same type)
 * @param {String} unit1 - First unit
 * @param {String} unit2 - Second unit
 * @returns {Boolean} - True if compatible
 */
const areUnitsCompatible = (unit1, unit2) => {
  const weightUnits = ['mg', 'gm', 'kg'];
  const volumeUnits = ['ml', 'litre'];
  const countUnits = ['pcs'];
  
  const unit1Type = weightUnits.includes(unit1) ? 'weight' : 
                   volumeUnits.includes(unit1) ? 'volume' : 
                   countUnits.includes(unit1) ? 'count' : 'unknown';
  
  const unit2Type = weightUnits.includes(unit2) ? 'weight' : 
                   volumeUnits.includes(unit2) ? 'volume' : 
                   countUnits.includes(unit2) ? 'count' : 'unknown';
  
  return unit1Type === unit2Type;
};

/**
 * Deduct inventory for items in a transaction or order
 * @param {Array} items - Array of items with itemId and quantity
 * @param {String} restaurantId - Restaurant ID
 * @param {String} sourceId - Transaction ID or Order ID for logging
 * @param {String} sourceType - 'transaction' or 'order'
 * @returns {Object} - Result object with success status and details
 */
const deductInventory = async (items, restaurantId, sourceId, sourceType = 'transaction') => {
  try {
    console.log(`Starting inventory deduction for ${sourceType}:`, sourceId);
    
    const results = {
      success: true,
      deductedItems: [],
      warnings: [],
      errors: []
    };
    
    for (const item of items) {
      try {
        // Find the menu item to get its stockItems (ingredients)
        const menuItem = await Menu.findById(item.itemId);
        if (!menuItem) {
          results.warnings.push(`Menu item not found: ${item.itemName} (ID: ${item.itemId})`);
          continue;
        }
        
        if (!menuItem.stockItems || menuItem.stockItems.length === 0) {
          console.log(`No stock items found for menu item: ${item.itemName}`);
          continue;
        }
        
        console.log(`Processing item: ${item.itemName} (Quantity: ${item.quantity})`);
        
        for (const stockItem of menuItem.stockItems) {
          // Calculate total quantity needed for this stock item
          const totalQuantityNeeded = stockItem.quantity * item.quantity;
          
          console.log(`Deducting stock: ${stockItem.stockId} - Quantity needed: ${totalQuantityNeeded} ${stockItem.unit}`);
          
          // Find and update the inventory item
          const inventoryItem = await Inventory.findOne({
            _id: stockItem.stockId,
            restaurantId: restaurantId,
            isDeleted: { $ne: true }
          });
          
          if (!inventoryItem) {
            results.warnings.push(`Inventory item not found for stockId: ${stockItem.stockId}`);
            continue;
          }
          
          // Check unit compatibility
          if (!areUnitsCompatible(stockItem.unit, inventoryItem.unit)) {
            const warning = `Unit mismatch: Menu uses ${stockItem.unit}, Inventory uses ${inventoryItem.unit} for ${inventoryItem.itemName}`;
            results.warnings.push(warning);
            console.warn(warning);
            continue;
          }
          
          // Convert quantity to inventory unit
          const convertedQuantityNeeded = convertUnits(totalQuantityNeeded, stockItem.unit, inventoryItem.unit);
          
          console.log(`Converted quantity: ${totalQuantityNeeded} ${stockItem.unit} = ${convertedQuantityNeeded} ${inventoryItem.unit}`);
          
          // Check if sufficient stock is available
          const currentStock = inventoryItem.stock.totalQuantity || 0;
          if (currentStock >= convertedQuantityNeeded) {
            // Round the deducted quantity to avoid floating point issues
            const roundedDeductedQuantity = roundToDecimals(convertedQuantityNeeded, 2);
            
            // Deduct the quantity from inventory
            await Inventory.findByIdAndUpdate(
              stockItem.stockId,
              { 
                $inc: { 
                  'stock.totalQuantity': -roundedDeductedQuantity,
                  'stock.quantity': -roundedDeductedQuantity
                }
              },
              { new: true }
            );
            
            results.deductedItems.push({
              inventoryItemName: inventoryItem.itemName,
              stockId: stockItem.stockId,
              quantityDeducted: roundedDeductedQuantity,
              unit: inventoryItem.unit,
              remainingStock: roundToDecimals(currentStock - roundedDeductedQuantity, 2),
              originalQuantity: totalQuantityNeeded,
              originalUnit: stockItem.unit
            });
            
            console.log(`Successfully deducted ${convertedQuantityNeeded} ${inventoryItem.unit} from inventory item: ${inventoryItem.itemName}`);
          } else {
            const warning = `Insufficient stock for ${inventoryItem.itemName}. Available: ${currentStock} ${inventoryItem.unit}, Needed: ${convertedQuantityNeeded} ${inventoryItem.unit}`;
            results.warnings.push(warning);
            console.warn(warning);
            // You might want to handle this case differently - maybe throw an error or log it
          }
        }
      } catch (itemError) {
        const error = `Error processing item ${item.itemName}: ${itemError.message}`;
        results.errors.push(error);
        console.error(error);
      }
    }
    
    if (results.errors.length > 0) {
      results.success = false;
    }
    
    console.log(`Inventory deduction completed for ${sourceType}:`, sourceId);
    console.log(`Results:`, {
      deductedItems: results.deductedItems.length,
      warnings: results.warnings.length,
      errors: results.errors.length
    });
    
    return results;
  } catch (error) {
    console.error(`Error in inventory deduction for ${sourceType}:`, error);
    return {
      success: false,
      deductedItems: [],
      warnings: [],
      errors: [error.message]
    };
  }
};

/**
 * Check if sufficient inventory is available for items
 * @param {Array} items - Array of items with itemId and quantity
 * @param {String} restaurantId - Restaurant ID
 * @returns {Object} - Result object with availability status
 */
const checkInventoryAvailability = async (items, restaurantId) => {
  try {
    const results = {
      available: true,
      unavailableItems: [],
      warnings: []
    };
    
    for (const item of items) {
      const menuItem = await Menu.findById(item.itemId);
      if (!menuItem || !menuItem.stockItems || menuItem.stockItems.length === 0) {
        continue;
      }
      
      for (const stockItem of menuItem.stockItems) {
        const totalQuantityNeeded = stockItem.quantity * item.quantity;
        
        const inventoryItem = await Inventory.findOne({
          _id: stockItem.stockId,
          restaurantId: restaurantId,
          isDeleted: { $ne: true }
        });
        
        if (!inventoryItem) {
          results.warnings.push(`Inventory item not found for stockId: ${stockItem.stockId}`);
          continue;
        }
        
        // Check unit compatibility
        if (!areUnitsCompatible(stockItem.unit, inventoryItem.unit)) {
          results.warnings.push(`Unit mismatch: Menu uses ${stockItem.unit}, Inventory uses ${inventoryItem.unit} for ${inventoryItem.itemName}`);
          continue;
        }
        
        // Convert quantity to inventory unit
        const convertedQuantityNeeded = convertUnits(totalQuantityNeeded, stockItem.unit, inventoryItem.unit);
        const currentStock = inventoryItem.stock.totalQuantity || 0;
        
        if (currentStock < convertedQuantityNeeded) {
          results.available = false;
          results.unavailableItems.push({
            itemName: item.itemName,
            inventoryItemName: inventoryItem.itemName,
            needed: convertedQuantityNeeded,
            available: currentStock,
            shortfall: roundToDecimals(convertedQuantityNeeded - currentStock, 2),
            unit: inventoryItem.unit,
            originalNeeded: totalQuantityNeeded,
            originalUnit: stockItem.unit
          });
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error("Error checking inventory availability:", error);
    return {
      available: false,
      unavailableItems: [],
      warnings: [error.message]
    };
  }
};

module.exports = {
  deductInventory,
  checkInventoryAvailability,
  convertUnits,
  areUnitsCompatible,
  roundToDecimals
};
