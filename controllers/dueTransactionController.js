// controllers/dueTransactionController.js
const DueTransaction = require("../model/DueTransactions");
const Customer = require('../model/Customer');

exports.createDueTransaction = async (req, res) => {
  try {
    const { customer_id, total, status, restaurantId } = req.body;
    const customer = await Customer.findOne({ restaurantId });
    // Create Due Transaction
    const dueTransaction = new DueTransaction({
      customer_id,
      total,
      customerName: customer.name,
      status: status || "Unpaid",
      restaurantId,
    });

    await dueTransaction.save();

    return res.status(201).json({
      message: "Due Transaction created successfully",
      dueTransaction,
    });
  } catch (error) {
    console.error("Error creating due transaction:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
// ---------------- GET ALL DUE TRANSACTIONS ----------------
exports.getAllDueTransactions = async (req, res) => {
  try {
    const items = await DueTransaction.find();
    res.status(200).json(items);
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Error fetching Due", error: err.message });
  }
}
exports.deleteDueTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Delete request for ID:', id); // Debug log

    if (!id) {
      return res.status(400).json({
        message: "Due transaction ID is required",
        success: false
      });
    }

    const dueTransaction = await DueTransaction.findById(id);
    if (!dueTransaction) {
      return res.status(404).json({
        message: "Due transaction not found",
        success: false
      });
    }

    await DueTransaction.findByIdAndDelete(id);

    res.status(200).json({
      message: "Due transaction deleted successfully",
      success: true,
      data: { id } // Return the deleted ID
    });
  } catch (error) {
    console.error("Error deleting due transaction:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message
    });
  }
};

exports.updateDueTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    // FIXED: Accept both customer_id and transaction_id for compatibility
    const { customer_id, transaction_id, total, status, restaurantId } = req.body;

    console.log('Update request for ID:', id, 'Body:', req.body); // Debug log

    // Validation
    if (!id) {
      return res.status(400).json({
        message: "Due transaction ID is required",
        success: false
      });
    }

    // Find the due transaction
    const dueTransaction = await DueTransaction.findById(id);
    if (!dueTransaction) {
      return res.status(404).json({
        message: "Due transaction not found",
        success: false
      });
    }

    // Update fields
    const updateData = {
      updatedAt: new Date()
    };

    // FIXED: Handle both customer_id and transaction_id
    const customerId = customer_id || transaction_id;
    if (customerId) {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res.status(404).json({
          message: "Customer not found",
          success: false
        });
      }
      updateData.customer_id = customerId;
      updateData.customerName = customer.name || customer.customerName;
    }

    if (total !== undefined) {
      const parsedTotal = parseFloat(total);
      if (isNaN(parsedTotal) || parsedTotal <= 0) {
        return res.status(400).json({
          message: "Invalid total amount",
          success: false
        });
      }
      updateData.total = parsedTotal;
    }

    if (status && ['paid', 'unpaid'].includes(status)) {
      updateData.status = status;
    }

    // Update the due transaction
    const updatedDueTransaction = await DueTransaction.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('customer_id', 'name customerName email phone');

    res.status(200).json({
      message: "Due transaction updated successfully",
      success: true,
      data: updatedDueTransaction
    });
  } catch (error) {
    console.error("Error updating due transaction:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message
    });
  }
};
// ---------------- DELETE DUE TRANSACTION ----------------

exports.deleteDueTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Delete request for ID:', id); // Debug log

    if (!id) {
      return res.status(400).json({
        message: "Due transaction ID is required",
        success: false
      });
    }

    const dueTransaction = await DueTransaction.findById(id);
    if (!dueTransaction) {
      return res.status(404).json({
        message: "Due transaction not found",
        success: false
      });
    }

    await DueTransaction.findByIdAndDelete(id);

    res.status(200).json({
      message: "Due transaction deleted successfully",
      success: true,
      data: { id } // Return the deleted ID
    });
  } catch (error) {
    console.error("Error deleting due transaction:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message
    });
  }
};

// ---------------- GET DUE TRANSACTION BY ID ----------------
exports.getDueTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Due transaction ID is required",
        success: false
      });
    }

    const dueTransaction = await DueTransaction.findById(id)
      .populate('customer_id', 'name customerName email phone');

    if (!dueTransaction) {
      return res.status(404).json({
        message: "Due transaction not found",
        success: false
      });
    }

    res.status(200).json({
      message: "Due transaction retrieved successfully",
      success: true,
      data: dueTransaction
    });
  } catch (error) {
    console.error("Error fetching due transaction:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message
    });
  }
};