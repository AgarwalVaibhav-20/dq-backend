const Menu = require("../model/Menu");
const Inventory = require("../model/Inventory"); // make sure this exists
const multer = require("multer");
const path = require("path");
const fs = require("fs");
// ---------------- Multer Config ----------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ---------------- CREATE MENU ITEM ----------------

exports.createMenuItem = async (req, res) => {
  try {
    const { itemName, price, categoryId, restaurantId, sub_category, status } = req.body;

    // Parse stockItems if it exists and is a string (from FormData)
    let frontendStock = [];
    if (req.body.stockItems) {
      try {
        frontendStock = typeof req.body.stockItems === 'string' 
          ? JSON.parse(req.body.stockItems) 
          : req.body.stockItems;
      } catch (parseError) {
        console.error("Error parsing stockItems:", parseError);
        return res.status(400).json({ message: "Invalid stockItems format" });
      }
    }

    // Validation
    if (!itemName || !price || !categoryId || !restaurantId) {
      return res.status(400).json({ message: "itemName, price, categoryId, and restaurantId are required." });
    }

    // Validate price is a number
    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ message: "Price must be a valid positive number." });
    }

    // Normalize uploaded image path
    let itemImage = req.file ? req.file.path.replace(/\\/g, "/") : null;

    // Fetch inventory items
    const inventoryItems = await Inventory.find({ restaurantId });
    if (!inventoryItems || inventoryItems.length === 0) {
      console.log("No inventory items found for restaurant:", restaurantId);
      return res.status(400).json({ message: "No inventory items found for this restaurant." });
    }

    // Merge frontend stockItems with inventory
    const stockItems = inventoryItems.map(item => {
      const frontendItem = frontendStock?.find(f => f.stockId === item._id.toString());
      return {
        stockId: item._id,
        quantity: frontendItem ? Number(frontendItem.quantity) || 0 : 0,
      };
    });

    // Create menu item
    const menuItem = await Menu.create({
      itemName: itemName.trim(),
      price: numericPrice,
      categoryId,
      restaurantId,
      sub_category: sub_category || "",
      status: Number(status) || 1,
      itemImage,
      stockItems,
    });

    console.log("Menu item created successfully:", menuItem._id);
    res.status(201).json({ 
      message: "Menu item created successfully",
      data: menuItem 
    });

  } catch (error) {
    console.error("Failed to create menu item:", error);
    
    // Check for specific mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Validation error", 
        errors: validationErrors 
      });
    }

    // Check for duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "Duplicate entry", 
        error: error.message 
      });
    }

    res.status(500).json({ 
      message: "Failed to create menu item", 
      error: error.message 
    });
  }
};
// Export multer middleware if you want to use it in route
exports.uploadMiddleware = upload.single("itemImage");
// ---------------- GET ALL MENU ITEMS ----------------
exports.getMenuItems = async (req, res) => {
  try {
    const menuItems = await Menu.find(); // fetch all items
    res.status(200).json(menuItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch menu items", error });
  }
};
// ---------------- GET SINGLE MENU ITEM ----------------
exports.getMenuItemById = async (req, res) => {
  try {
    const { restaurantId} = req.params;

    const menuItem = await Menu.findById(restaurantId)
      .populate("categoryId", "categoryName")
      .populate("stockItems");

    if (!menuItem) return res.status(404).json({ message: "Menu item not found" });

    res.status(200).json(menuItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch menu item", error });
  }
};

// ---------------- UPDATE MENU ITEM ----------------
exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { itemName, price, categoryId, sub_category, stock } = req.body;
    const updateData = { itemName, price, categoryId, sub_category, stock };

    if (req.file) {
      updateData.itemImage = req.file.path;
    }

    const updatedMenu = await Menu.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedMenu) return res.status(404).json({ message: "Menu item not found" });

    res.status(200).json(updatedMenu);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update menu item", error });
  }
};


exports.updateMenuStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    // Validate input
    if (!id || status === undefined) {
      return res.status(400).json({
        success: false,
        message: "Menu item ID and status are required",
      });
    }

    // Ensure status is either 0 or 1
    if (![0, 1].includes(Number(status))) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value. Must be 0 (Inactive) or 1 (Active)",
      });
    }

    const updatedMenu = await Menu.findByIdAndUpdate(
      id,
      { status: Number(status) },
      { new: true }
    );

    if (!updatedMenu) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Menu item status updated successfully",
      data: {
        id: updatedMenu._id,
        status: updatedMenu.status,
      },
    });
  } catch (error) {
    console.error("Error updating menu status:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while updating menu status",
    });
  }
};
// ---------------- DELETE MENU ITEM ----------------
// controller
exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMenu = await Menu.findByIdAndUpdate(
      id,
      { status: 0 }, // soft delete (status 0)
      { new: true }
    );

    if (!deletedMenu) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.status(200).json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete menu item", error });
  }
};
