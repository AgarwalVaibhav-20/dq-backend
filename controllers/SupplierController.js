const Supplier = require("../model/Supplier");

// Get all suppliers
exports.getSuppliers = async (req, res) => {
  try {
    const restaurantId = req.query.restaurantId || req.userId;

    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    const suppliers = await Supplier.find({ restaurantId })
      .populate("inventories");

    res.json({ success: true, data: suppliers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new supplier
exports.createSupplier = async (req, res) => {
  try {
    const { supplierName, email, phoneNumber, rawItem, restaurantId, inventoryId } = req.body;

    // Validation
    if (!supplierName || !phoneNumber) {
      return res.status(400).json({
        message: "Supplier name and phone number are required",
      });
    }
    // if (email) {
    //   const existingSupplier = await Supplier.findOne({ email, restaurantId });
    //   if (existingSupplier) {
    //     return res
    //       .status(400)
    //       .json({ message: "Supplier already exists with this email" });
    //   }
    // }
    const supplier = new Supplier({
      supplierName,
      email,
      phoneNumber,
      rawItem,
      restaurantId,
      inventoryId
    });

    await supplier.save();

    res.status(201).json({
      success: true,
      message: "Supplier created successfully",
      data: supplier,
    });
  } catch (err) {
    console.error("❌ Error creating supplier:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};


// Update supplier
exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    res.json({ success: true, data: supplier });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete supplier
// controllers/supplierController.js
exports.deleteSupplier = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;

    const supplier = await Supplier.findByIdAndDelete(restaurantId);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.json({ success: true, message: "Supplier deleted successfully" });
  } catch (err) {
    console.error("Delete supplier error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

