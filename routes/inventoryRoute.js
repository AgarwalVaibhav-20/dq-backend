const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/InventoryController");
const {authMiddleware} = require("../middleware/authMiddleware");


router.post("/create/adding/inventories", authMiddleware, inventoryController.addInventory);
router.get("/stock/inventories", authMiddleware, inventoryController.getInventory);
router.get("/:id", authMiddleware, inventoryController.getInventoryById);
router.put("/update/:id", authMiddleware, inventoryController.updateInventory);
router.delete("/delete/:id", authMiddleware, inventoryController.deleteInventory);
router.patch("/:id/stock", authMiddleware, inventoryController.updateStock);

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const inventoryController = require("../controllers/InventoryController");
// const { authMiddleware } = require("../middleware/authMiddleware");

// // Add new inventory (creates Item if not exists & Purchase)
// router.post("/create/adding/inventories", authMiddleware, inventoryController.addInventory);

// // Get aggregated inventory (total quantities across purchases)
// router.get("/stock/inventories", authMiddleware, inventoryController.getInventory);

// // Get single item by Item ID
// router.get("/:id", authMiddleware, inventoryController.getInventoryById);

// // Update Purchase stock
// router.patch("/purchase/:purchaseId/stock", authMiddleware, inventoryController.updateStock);

// // Delete Purchase (soft delete)
// router.delete("/purchase/:purchaseId", authMiddleware, inventoryController.deleteInventory);

// module.exports = router;
