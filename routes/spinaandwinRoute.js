const express = require("express");
const {
  createWheel,
  getAllWheels,
  getWheelById,
  updateWheel,
  deleteWheel,
} = require("../controllers/SpinAndWinController");

const { authMiddleware } = require("../middleware/authMiddleware.js"); // ✅ fixed require

const router = express.Router();

// ➤ Create a new wheel
router.post("/api/wheel/create", authMiddleware, createWheel);

// ➤ Get all wheels for logged-in restaurant (admin)
router.get("/api/wheel/all", authMiddleware, getAllWheels);

// ➤ Public endpoint: Get active wheels for customer-facing spin page
router.get("/api/wheel/public", getAllWheels);

// ➤ Get single wheel by ID
router.get("/single/:id", authMiddleware, getWheelById);

// ➤ Update a wheel
router.put("/api/wheel/update/:id", authMiddleware, updateWheel);

// ➤ Delete a wheel
router.delete("/api/wheel/delete/:id", authMiddleware, deleteWheel);

module.exports = router; // ✅ export router
