const express = require("express");
const router = express.Router();
const QrController = require("../controllers/QrControllers");

router.post("/create/qrcode", QrController.addTable);

router.get("/qrcodes/all", QrController.getQrs);

router.get("/:id", QrController.getQrById);

router.delete("/delete/qrcodes/:id", QrController.deleteQr);

router.get("/floor/:floorId", QrController.getTablesByFloor);

router.get("/stats/:restaurantId", QrController.countTablesPerFloor);

module.exports = router;
