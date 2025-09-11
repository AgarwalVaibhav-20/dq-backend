const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/InventoryController");
const {authMiddleware} = require("../middleware/authMiddleware");


router.post("/create/inventories", authMiddleware, inventoryController.addInventory);
router.get("/stock/inventories", authMiddleware, inventoryController.getInventory);
router.get("/:id", authMiddleware, inventoryController.getInventoryById);
router.put("/update/:id", authMiddleware, inventoryController.updateInventory);
router.delete("/delete/:id", authMiddleware, inventoryController.deleteInventory);
router.patch("/:id/stock", authMiddleware, inventoryController.updateStock);

module.exports = router;
