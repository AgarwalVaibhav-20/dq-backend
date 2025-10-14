const express = require("express");
const router = express.Router();
const CustomerController = require("../controllers/CustomerController");

router.post("/customer/add", CustomerController.createCustomer);
router.get("/customer/all", CustomerController.getAllCustomersForReservation);
router.get("/customer/type/:restaurantId/:customerType", CustomerController.getCustomersByType);
router.get("/customer/:restaurantId", CustomerController.getAllCustomers);
router.get("/customer/:id", CustomerController.getCustomerById);

router.put("/customer/update/:id", CustomerController.updateCustomer);
router.put("/customer/frequency/:id", CustomerController.updateCustomerFrequency);

router.delete("/customer/delete/:id", CustomerController.deleteCustomer);
// Add these routes
router.patch('/customer/reward-points/add/:id', CustomerController.addRewardPoints);
router.patch('/customer/reward-points/deduct/:id', CustomerController.deductRewardPoints);
router.post("/customer/calculate-total-spent", CustomerController.calculateCustomerTotalSpent);
router.post("/customer/calculate-total-spent/:customerId", CustomerController.calculateSingleCustomerTotalSpent);
module.exports = router;
