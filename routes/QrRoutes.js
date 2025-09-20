const express = require('express');
const router = express.Router();
const {authMiddleware} = require('../middleware/authMiddleware');
const {
  getQRCodes,
  createQRCode,
  updateScanCount,
  deleteQRCode,
} = require('../controllers/QrControllers');

// All routes require authentication
router.use(authMiddleware);

// Get all QR codes for a restaurant
router.get('/restaurants/:restaurantId/qrcodes', authMiddleware, getQRCodes);

// Create QR code
router.post('/restaurants/:restaurantId/qrcodes', authMiddleware, createQRCode);

// Update scan count (public route for customers)
router.put('/restaurants/:restaurantId/qrcodes/:id/scan', updateScanCount);

// Delete QR code
router.delete('/restaurants/:restaurantId/qrcodes/:id', authMiddleware, deleteQRCode);

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const QrController = require("../controllers/QrControllers");

// // Routes
// router.post("/qr/generate", QrController.generateQr);
// router.get("/qr/allQr", QrController.getQrs);
// router.get("/qr/:id", QrController.getQrById);
// router.delete("/qr/:id", QrController.deleteQr);

// module.exports = router;
