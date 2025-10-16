// controllers/CustomerController.js
const Customer = require("../model/Customer");

exports.createCustomer = async (req, res) => {
  try {
    let {
      name,
      email,
      address,
      phoneNumber,
      restaurantId,
      birthday,
      anniversary,
      corporate,
      membershipId,
      membershipName,
      rewardCustomerPoints,
    } = req.body;

    // ✅ Clean membershipId if empty string
    if (membershipId === "") {
      membershipId = null;
    }

    if (!name || !email || !restaurantId) {
      return res
        .status(400)
        .json({ message: "Name, email, and restaurantId are required" });
    }

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const newCustomer = new Customer({
      name,
      email,
      address,
      phoneNumber,
      restaurantId,
      birthday,
      anniversary,
      corporate,
      membershipId,
      membershipName,
      rewardCustomerPoints,
    });

    await newCustomer.save();

    return res.status(201).json({
      message: "Customer created successfully",
      customer: newCustomer,
    });
  } catch (err) {
    console.error("Error in createCustomer:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.addRewardPoints = async (req, res) => {
  try {
    const { id } = req.params;
    const { pointsToAdd } = req.body;

    console.log("🎁 Adding ${pointsToAdd} reward points to customer ${id}");

    // Validate input
    if (!pointsToAdd || pointsToAdd < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid points to add. Must be a positive number."
      });
    }

    // Find customer
    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Add points to existing balance
    const currentPoints = Number(customer.rewardCustomerPoints) || 0;
    customer.rewardCustomerPoints = currentPoints + pointsToAdd;

    // Save updated customer
    await customer.save();

    console.log(" Customer ${customer.name} now has ${customer.rewardCustomerPoints} points");

    res.status(200).json({
      success: true,
      message: "Successfully added ${pointsToAdd} reward points",
      data: {
        customerId: customer._id,
        customerName: customer.name,
        previousPoints: currentPoints,
        pointsAdded: pointsToAdd,
        totalPoints: customer.rewardCustomerPoints
      }
    });
  } catch (error) {
    console.error('❌ Error adding reward points:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding reward points',
      error: error.message
    });
  }
};

exports.deductRewardPoints = async (req, res) => {
  try {
    const { id } = req.params;
    const { pointsToDeduct } = req.body;

    console.log(" Deducting ${pointsToDeduct} reward points from customer ${id}");

    // Validate input
    if (!pointsToDeduct || pointsToDeduct <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid points to deduct. Must be a positive number."
      });
    }

    // Find customer
    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if customer has enough points
    const currentPoints = Number(customer.rewardCustomerPoints) || 0;
    if (currentPoints < pointsToDeduct) {
      return res.status(400).json({
        success: false,
        message: "Insufficient reward points. Customer has ${currentPoints} points, but trying to deduct ${pointsToDeduct} points."
      });
    }

    // Deduct points
    customer.rewardCustomerPoints = currentPoints - pointsToDeduct;
    await customer.save();

    console.log("Customer ${customer.name} now has ${customer.rewardCustomerPoints} points");

    res.status(200).json({
      success: true,
      message: "Successfully deducted ${pointsToDeduct} reward points",
      data: {
        customerId: customer._id,
        customerName: customer.name,
        previousPoints: currentPoints,
        pointsDeducted: pointsToDeduct,
        remainingPoints: customer.rewardCustomerPoints
      }
    });
  } catch (error) {
    console.error('❌ Error deducting reward points:', error);
    res.status(500).json({
      success: false,
      message: 'Error deducting reward points',
      error: error.message
    });
  }
};
// 📌 Get All Customers
exports.getAllCustomers = async (req, res) => {
  try {
    // 🔥 ALWAYS use req.userId (which is user.restaurantId from user collection)
    const restaurantId = req.userId;
    const filter = restaurantId ? { restaurantId } : {};
    const customers = await Customer.find(filter)

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (err) {
    console.error("❌ Error fetching customers:", err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};


// 📌 Get ALL Customers (for reservation dropdown)
exports.getAllCustomersForReservation = async (req, res) => {
  try {
    console.log("🔍 Fetching ALL customers for reservation dropdown...");
    // 🔥 ALWAYS use req.userId (which is user.restaurantId from user collection)
    const restaurantId = req.userId;
    const customers = await Customer.find({ restaurantId }).populate('membershipId');;
    console.log("📊 Total customers found:", customers.length);
    res.json(customers);
  } catch (err) {
    console.error("Error fetching all customers:", err);
    res.status(500).json({ error: err.message });
  }
};


// 📌 Get Single Customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, role: "Customer" }).select("-password -verifyOTP -otpExpiry");
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Update Customer
exports.updateCustomer = async (req, res) => {
  try {
    const updates = req.body;
    const customerId = req.params.id;

    // Prevent sensitive updates
    delete updates.password;
    delete updates.role;

    const customer = await Customer.findOneAndUpdate(
      { _id: customerId },
      updates,
      { new: true }
    ).select("-password -verifyOTP -otpExpiry");

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({
      success: true,
      message: "Customer updated successfully",
      customer,
    });
  } catch (err) {
    console.error("Error updating customer:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ message: "Customer deleted successfully", customer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 📌 Restore Customer
exports.restoreCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, role: "Customer" },
      { status: 1 }, // mark active again
      { new: true }
    );
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json({ message: "Customer restored", customer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Get Customers by Type
exports.getCustomersByType = async (req, res) => {
  try {
    const { restaurantId, customerType } = req.params;
    // Decode URL-encoded customer type (e.g., "Lost%20Customer" -> "Lost Customer")
    const decodedCustomerType = decodeURIComponent(customerType);
    const customers = await Customer.find({
      restaurantId,
      customerType: decodedCustomerType
    });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Update Customer Frequency and Type
exports.updateCustomerFrequency = async (req, res) => {
  try {
    const { id } = req.params;
    const { frequency, totalSpent } = req.body;

    const customer = await Customer.findByIdAndUpdate(
      id,
      { frequency, totalSpent },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({
      message: "Customer frequency updated successfully",
      customer
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Calculate and Update Customer Total Spent
exports.calculateCustomerTotalSpent = async (req, res) => {
  try {
    const Order = require("../model/Order");

    // Get all customers
    const customers = await Customer.find({});
    let updatedCount = 0;

    for (const customer of customers) {
      // Calculate total spent from orders
      const orders = await Order.find({
        customerId: customer._id,
        status: { $in: ['completed', 'served'] } // Only count completed/served orders
      });

      const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      // Update customer's totalSpent
      await Customer.findByIdAndUpdate(
        customer._id,
        { totalSpent },
        { new: true }
      );

      updatedCount++;
    }

    res.json({
      message: "Successfully updated total spent for ${updatedCount} customers",
      updatedCount
    });
  } catch (err) {
    console.error("Error calculating customer total spent:", err);
    res.status(500).json({ error: err.message });
  }
};

// 📌 Calculate Total Spent for Single Customer
exports.calculateSingleCustomerTotalSpent = async (req, res) => {
  try {
    const { customerId } = req.params;
    const Order = require("../model/Order");

    // Find customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Calculate total spent from orders
    const orders = await Order.find({
      customerId: customerId,
      status: { $in: ['completed', 'served'] } // Only count completed/served orders
    });

    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Update customer's totalSpent
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { totalSpent },
      { new: true }
    );

    res.json({
      message: "Customer total spent updated successfully",
      customer: updatedCustomer,
      totalSpent,
      orderCount: orders.length
    });
  } catch (err) {
    console.error("Error calculating single customer total spent:", err);
    res.status(500).json({ error: err.message});
  }
};