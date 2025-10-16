// routes/menuRoutes.js
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  createMenuItem,
  uploadMiddleware,
  getMenuItems,
  updateMenuItem,
  // deleteMenuItem,
  hardDeleteMenuItem,
  updateMenuStatus
} = require("../controllers/NewMenuController");

router.get("/menu/allmenues", authMiddleware, getMenuItems);
router.post("/menu/add", authMiddleware, uploadMiddleware, createMenuItem);
router.put('/menus/status', authMiddleware, updateMenuStatus);
router.put("/menu/update/:id", authMiddleware, uploadMiddleware, updateMenuItem);

router.delete("/menu/delete/:id", authMiddleware, hardDeleteMenuItem);

module.exports = router;
