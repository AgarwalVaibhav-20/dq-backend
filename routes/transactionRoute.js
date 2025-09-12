const express = require("express");
const router = express.Router();
const TransactionController = require("../controllers/TranscationController");

// CRUD routes
router.get("/get-all/transaction", TransactionController.getAllTransactions);
router.get("/transactionById/:transactionId", TransactionController.getTransactionById);
router.post("/create/transaction", TransactionController.createTransaction);
router.put("/:id", TransactionController.updateTransaction);
router.delete("/deleteTransaction/:id", TransactionController.deleteTransaction);

// Extra routes
router.get("/customer/:id", TransactionController.getTransactionByCustomer);
router.post("/by-payment-type", TransactionController.getTransactionsByPaymentType);

module.exports = router;
