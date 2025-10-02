// controllers/CustomerController.js
const Customer = require("../model/Customer");

exports.createCustomer = async (req, res) => {
  try {
    const { name, email, address, phoneNumber, restaurantId, birthday, anniversary } = req.body;

    if (!name || !email || !restaurantId) {
      return res.status(400).json({ message: "Name, email and restaurantId are required" });
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
      anniversary
    });
    await newCustomer.save();

    return res.status(201).json({
      message: "Customer created successfully",
      customer: newCustomer
    });
  } catch (err) {
    console.error("Error in createCustomer:", err);
    return res.status(500).json({ error: err.message });
  }
};



// 📌 Get All Customers
exports.getAllCustomers = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const customers = await Customer.find({ restaurantId });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Get ALL Customers (for reservation dropdown)
exports.getAllCustomersForReservation = async (req, res) => {
  try {
    console.log("🔍 Fetching ALL customers for reservation dropdown...");
    const customers = await Customer.find({});
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
    if (updates.password) delete updates.password; // password should be updated separately

    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, role: "Customer" },
      updates,
      { new: true }
    ).select("-password -verifyOTP -otpExpiry");

    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json({ message: "Customer updated successfully", customer });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
      message: `Successfully updated total spent for ${updatedCount} customers`,
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
    res.status(500).json({ error: err.message });
  }
};
