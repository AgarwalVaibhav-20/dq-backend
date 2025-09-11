const express = require("express");
const router = express.Router();
const QrController = require("../controllers/QrControllers");

// Routes
router.post("/qr/generate", QrController.generateQr);
router.get("/qr/allQr", QrController.getQrs);
router.get("/qr/:id", QrController.getQrById);
router.delete("/qr/:id", QrController.deleteQr);

module.exports = router;
