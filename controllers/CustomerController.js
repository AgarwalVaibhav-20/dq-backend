// controllers/CustomerController.js
const Customer = require("../model/Customer");

exports.createCustomer = async (req, res) => {
  try {
    const { name, email, address, phoneNumber, restaurantId , birthday , anniversary } = req.body;

    if (!name || !email || !restaurantId) {
      return res.status(400).json({ message: "Name, email and restaurantId are required" });
    }

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const newCustomer = new Customer({ name, email, address, phoneNumber, restaurantId , birthday , anniversary });
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
