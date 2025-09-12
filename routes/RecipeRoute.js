const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const MenuItem = require('../models/MenuItem');
const Inventory = require('../models/Inventory');
const { authenticateToken } = require('../middleware/auth');

// Get all recipes for a restaurant
router.get('/', authenticateToken, async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const recipes = await Recipe.find({ restaurantId })
      .populate('menuItemId', 'itemName')
      .populate('ingredients.inventoryId', 'itemName unit');
    
    res.json({
      success: true,
      recipes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create or update recipe
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { menuItemId, ingredients } = req.body;
    const restaurantId = req.user.restaurantId;

    // Check if recipe already exists
    let recipe = await Recipe.findOne({ menuItemId, restaurantId });

    if (recipe) {
      recipe.ingredients = ingredients;
      recipe.updatedAt = new Date();
    } else {
      recipe = new Recipe({
        menuItemId,
        restaurantId,
        ingredients
      });
    }

    await recipe.save();
    await recipe.populate('menuItemId', 'itemName');
    await recipe.populate('ingredients.inventoryId', 'itemName unit');

    res.json({
      success: true,
      message: 'Recipe saved successfully',
      recipe
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete recipe
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await Recipe.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Recipe deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


router.post('/reduce-stock', authenticateToken, async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const { reductions } = req.body;
      const restaurantId = req.user.restaurantId;

      for (const reduction of reductions) {
        const { inventoryId, quantityUsed } = reduction;
        
        const inventoryItem = await Inventory.findOne({
          _id: inventoryId,
          restaurantId: restaurantId
        }).session(session);

        if (!inventoryItem) {
          throw new Error(`Inventory item with ID ${inventoryId} not found`);
        }

        if (inventoryItem.quantity < quantityUsed) {
          throw new Error(`Insufficient stock for ${inventoryItem.itemName}. Available: ${inventoryItem.quantity}, Required: ${quantityUsed}`);
        }

        inventoryItem.quantity -= quantityUsed;
        
        // Add low stock alert if quantity falls below threshold (5 units)
        if (inventoryItem.quantity <= 5) {
          inventoryItem.lowStockAlert = true;
        }

        await inventoryItem.save({ session });
      }
    });

    res.json({ 
      success: true, 
      message: 'Stock quantities updated successfully',
      updatedItems: req.body.reductions.length
    });

  } catch (error) {
    console.error('Error reducing stock:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message
    });
  } finally {
    session.endSession();
  }
});

// Check stock availability
router.post('/check-availability', authenticateToken, async (req, res) => {
  try {
    const { items } = req.body; // Array of {menuItemId, quantity}
    const restaurantId = req.user.restaurantId;
    
    const stockRequirements = {};
    const unavailableItems = [];

    // Calculate total stock requirements
    for (const item of items) {
      const recipe = await Recipe.findOne({ 
        menuItemId: item.menuItemId, 
        restaurantId 
      }).populate('menuItemId', 'itemName');

      if (recipe) {
        for (const ingredient of recipe.ingredients) {
          const totalNeeded = ingredient.quantity * item.quantity;
          const key = ingredient.inventoryId.toString();
          
          stockRequirements[key] = (stockRequirements[key] || 0) + totalNeeded;
        }
      }
    }

    // Check availability
    for (const [inventoryId, requiredQuantity] of Object.entries(stockRequirements)) {
      const inventoryItem = await Inventory.findById(inventoryId);
      
      if (!inventoryItem || inventoryItem.quantity < requiredQuantity) {
        unavailableItems.push({
          inventoryId,
          itemName: inventoryItem?.itemName || 'Unknown',
          available: inventoryItem?.quantity || 0,
          required: requiredQuantity
        });
      }
    }

    res.json({
      success: true,
      available: unavailableItems.length === 0,
      unavailableItems
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;