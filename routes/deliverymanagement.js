const express = require("express");
const router = express.Router();
const DeliveryManagementController = require("../controllers/DeliveryManagementController");
const {authMiddleware} = require("../middleware/authMiddleware");

// ✅ Delivery Management Routes
router.post("/assign", authMiddleware, DeliveryManagementController.createDelivery);
router.put("/delivery-timings/:id/status", authMiddleware, DeliveryManagementController.updateDeliveryStatus);
router.get("/delivery-timings/:restaurantId", authMiddleware, DeliveryManagementController.getAllDeliveries);

module.exports = router;
