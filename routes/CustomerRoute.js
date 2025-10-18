const express = require("express");
const router = express.Router();
const CustomerController = require("../controllers/CustomerController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/customer/add", authMiddleware, CustomerController.createCustomer);
router.get("/customer/all", authMiddleware, CustomerController.getAllCustomersForReservation);
router.get("/customer/type/:restaurantId/:customerType", authMiddleware, CustomerController.getCustomersByType);
router.get("/customer/:restaurantId", authMiddleware, CustomerController.getAllCustomers);
router.get("/customer/:id", authMiddleware, CustomerController.getCustomerById);

router.put("/customer/update/:id", authMiddleware, CustomerController.updateCustomer);
router.put("/customer/frequency/:id", authMiddleware, CustomerController.updateCustomerFrequency);

router.delete("/customer/delete/:id", authMiddleware, CustomerController.deleteCustomer);
// Add these routes
router.patch('/customer/reward-points/add/:id', authMiddleware, CustomerController.addRewardPoints);
router.patch('/customer/reward-points/deduct/:id', authMiddleware, CustomerController.deductRewardPoints);
router.post("/customer/calculate-total-spent", authMiddleware, CustomerController.calculateCustomerTotalSpent);
router.post("/customer/calculate-total-spent/:customerId", authMiddleware, CustomerController.calculateSingleCustomerTotalSpent);
module.exports = router;
