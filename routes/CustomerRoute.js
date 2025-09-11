const express = require("express");
const router = express.Router();

const CustomerController = require("../controllers/CustomerController");



// ------------------ Routes ------------------ //

router.post("/customer/add",CustomerController.createCustomer);

router.get("/customer/:restaurantId", CustomerController.getAllCustomers);

router.get("/customer/:id",CustomerController.getCustomerById);

router.put("/customer/:id",CustomerController.updateCustomer);

router.delete("/customer/delete/:id", CustomerController.deleteCustomer);
module.exports = router;
