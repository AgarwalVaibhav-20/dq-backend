const express = require('express');
const router = express();
const DueTransactionController = require('../controllers/dueTransactionController');

router.post('/due/add', DueTransactionController.createDueTransaction);
router.get("/alldue/due", DueTransactionController.getAllDueTransactions);
router.get('/dues/customer/:customer_id', DueTransactionController.getDueTransactionsByCustomer);

router.put('/dues/:id', DueTransactionController.updateDueTransaction);
router.delete('/dues/:id', DueTransactionController.deleteDueTransaction);

module.exports = router;