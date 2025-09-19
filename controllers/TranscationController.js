const Transaction = require("../model/Transaction");
const User = require("../model/User");
const Restaurant = require("../model/Restaurant");
const Customer = require("../model/Customer");

// ---------------- CREATE TRANSACTION ----------------
exports.createTransaction = async (req, res) => {
  console.log("Creating transaction...")
  try {
    const {
      restaurantId,
      userId,
      tableNumber,
      items,
      sub_total,
      tax,
      discount,
      total,
      type,
      customerId,
      transactionId
    } = req.body;

    // Enhanced validation
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant ID is required"
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items array is required and cannot be empty"
      });
    }

    if (!tableNumber) {
      return res.status(400).json({
        success: false,
        message: "Table number is required"
      });
    }

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Payment type is required"
      });
    }

    // Initialize username variable
    let username;

    // If userId is provided but no username, fetch the user
    if (userId && !username) {
      console.log("Fetching user for username...")
      const user = await User.findById(userId);
      console.log("Found user:", user)
      if (user) {
        username = user.username;
      } else {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
    }

    // Validate and process items
    const processedItems = items.map(item => {
      if (!item.itemId || !item.itemName || !item.price || !item.quantity) {
        throw new Error('Each item must have itemId, itemName, price, and quantity');
      }

      return {
        itemId: item.itemId,
        itemName: item.itemName,
        price: Number(item.price),
        quantity: Number(item.quantity),
        selectedSubcategoryId: item.selectedSubcategoryId || null,
        subtotal: Number(item.price) * Number(item.quantity)
      };
    });

    // Create new transaction
    const newTransaction = new Transaction({
      restaurantId,
      userId: userId || null,
      username: username,
      tableNumber,
      items: processedItems,
      sub_total: Number(sub_total) || 0,
      tax: Number(tax) || 0,
      discount: Number(discount) || 0,
      total: Number(total) || 0,
      type,
      customerId,
      transactionId,
    });
    console.log("Incoming customerId:", customerId);


    const savedTransaction = await newTransaction.save();

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      transaction: savedTransaction,
    });
  } catch (error) {
    console.error("Create Transaction Error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating transaction",
      error: error.message
    });
  }
};

// ---------------- GET ALL TRANSACTIONS ----------------
exports.getAllTransactions = async (req, res) => {
  try {
    console.log("Fetching all transactions...");
    
    const transactions = await Transaction.find({
      status: { $ne: 'cancelled' } // Exclude cancelled transactions
    }).sort({ createdAt: -1 }); // Sort by newest first

    console.log(`Found ${transactions.length} transactions`);

    res.status(200).json({
      success: true,
      data: transactions,
      count: transactions.length
    });
  } catch (err) {
    console.error("Get All Transactions Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// ---------------- GET TRANSACTIONS BY RESTAURANT ----------------
exports.getTransactionsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant ID is required"
      });
    }

    const transactions = await Transaction.find({
      restaurantId,
      status: { $ne: 'cancelled' }
    })
      .populate("userId", "username email fullName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: transactions,
      count: transactions.length
    });
  } catch (err) {
    console.error("Get Transactions By Restaurant Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// ---------------- GET TRANSACTION BY ID ----------------
exports.getTransactionById = async (req, res) => {
  const { transactionId } = req.params;

  try {
    console.log(`Fetching transaction with ID: ${transactionId}`);
    
    // Try to find by transactionId first, then by _id if not found
    let transaction = await Transaction.findOne({ transactionId })
      .populate('customerId', 'name email phoneNumber address')
      .populate('userId', 'name username')
      .populate('restaurantId', 'name address phone email');
    
    if (!transaction) {
      transaction = await Transaction.findById(transactionId)
        .populate('customerId', 'name email phoneNumber address')
        .populate('userId', 'name username')
        .populate('restaurantId', 'name address phone email');
    }

    if (!transaction) {
      return res.status(404).json({ 
        success: false,
        message: 'Transaction not found' 
      });
    }

    console.log('📤 Sending transaction data:', transaction);
    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// ---------------- UPDATE TRANSACTION ----------------
exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
      message: "Transaction updated successfully"
    });
  } catch (err) {
    console.error("Update Transaction Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// ---------------- DELETE TRANSACTION (SOFT DELETE) ----------------
exports.deleteTransaction = async (req, res) => {
  try {
    const { note } = req.body;
    const transactionId = req.params.id;

    console.log(`Deleting transaction ${transactionId} with note: ${note}`);

    // Find the transaction first to get existing notes
    const existingTransaction = await Transaction.findById(transactionId);
    
    if (!existingTransaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }

    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      {
        status: "cancelled",
        notes: note ? `${existingTransaction.notes || ''} | Cancelled: ${note}` : existingTransaction.notes,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Transaction cancelled successfully",
      data: transaction
    });
  } catch (err) {
    console.error("Delete Transaction Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// ---------------- GET TRANSACTIONS BY CUSTOMER ----------------
exports.getTransactionByCustomer = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      customerId: req.params.id,
      status: { $ne: 'cancelled' }
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: transactions,
      count: transactions.length
    });
  } catch (err) {
    console.error("Get Transactions By Customer Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// ---------------- GET TRANSACTIONS BY PAYMENT TYPE ----------------
exports.getTransactionsByPaymentType = async (req, res) => {
  try {
    const { type } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Payment type is required"
      });
    }

    const transactions = await Transaction.find({
      type,
      status: { $ne: 'cancelled' }
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: transactions,
      count: transactions.length
    });
  } catch (err) {
    console.error("Get Transactions By Payment Type Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// ---------------- GET POS TRANSACTIONS ----------------
exports.getPOSTransactions = async (req, res) => {
  try {
    console.log("Fetching POS transactions...");
    
    const transactions = await Transaction.find({
      status: { $ne: 'cancelled' }
    })
      .populate("userId", "username email fullName")
      .populate("restaurantId", "name")
      .sort({ createdAt: -1 });

    console.log(`Found ${transactions.length} POS transactions`);

    res.status(200).json({
      success: true,
      data: transactions,
      count: transactions.length
    });
  } catch (err) {
    console.error("Get POS Transactions Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};
