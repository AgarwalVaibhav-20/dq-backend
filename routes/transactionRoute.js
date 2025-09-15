const express = require("express");
const router = express.Router();
const TransactionController = require("../controllers/TranscationController");
const {authMiddleware} = require("../middleware/authMiddleware");

// CRUD routes
router.get("/get-all/transaction", authMiddleware, TransactionController.getAllTransactions);
router.get("/transactionById/:transactionId", authMiddleware, TransactionController.getTransactionById);
router.post("/create/transaction", authMiddleware, TransactionController.createTransaction);
router.put("/:id", authMiddleware, TransactionController.updateTransaction);
router.delete("/deleteTransaction/:id", authMiddleware, TransactionController.deleteTransaction);

// Extra routes
router.get("/customer/:id", authMiddleware, TransactionController.getTransactionByCustomer);
router.post("/by-payment-type", authMiddleware, TransactionController.getTransactionsByPaymentType);

module.exports = router;
