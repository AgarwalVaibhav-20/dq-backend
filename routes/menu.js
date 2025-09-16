// routes/menuRoutes.js
const express = require("express");
const router = express.Router();
const {
  createMenuItem,
  uploadMiddleware,
  getMenuItems,
  updateMenuItem,
  // deleteMenuItem,
  hardDeleteMenuItem,
  updateMenuStatus
} = require("../controllers/menuController");

router.get("/menu/allmenues", getMenuItems);

// router.get("/menu/:menuId", getMenuItemById);

router.post("/menu/add", uploadMiddleware, createMenuItem);
router.put('/menus/status', updateMenuStatus);
// UPDATE menu item by ID
router.put("/menu/update/:id", uploadMiddleware, updateMenuItem);

router.delete("/menu/delete/:id", hardDeleteMenuItem);

module.exports = router;
