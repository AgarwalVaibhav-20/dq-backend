// routes/menuRoutes.js
const express = require("express");
const router = express.Router();
const {
  createMenuItem,
  uploadMiddleware,
  getMenuItems,
  updateMenuItem,
  deleteMenuItem,
  updateMenuStatus
} = require("../controllers/menuController");

// GET all menu items for a restaurant
router.get("/menu/allmenues", getMenuItems);

// GET single menu item by ID
// router.get("/menu/:menuId", getMenuItemById);

// CREATE menu item
router.post("/menu/add", uploadMiddleware, createMenuItem);
router.put('/menus/status' ,updateMenuStatus)
// UPDATE menu item by ID
router.put("/menu/:id", uploadMiddleware, updateMenuItem);

// DELETE menu item by ID (soft delete)
router.delete("/menu/delete/:id", deleteMenuItem);

module.exports = router;
