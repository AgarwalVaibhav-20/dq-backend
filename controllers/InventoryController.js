const Inventory = require("../model/Inventory");
const Supplier = require("../model/Supplier");

// ➤ Add new inventory item
exports.addInventory = async (req, res) => {
  try {
    const { itemName, unit, restaurantId, supplierId, stock } = req.body;
    const missingFields = [];

    if (!itemName) missingFields.push("itemName");
    if (!unit) missingFields.push("unit");
    if (!restaurantId) missingFields.push("restaurantId");
    if (!supplierId) missingFields.push("supplierId");

    // ✅ FIX: Check for the nested stock object and its properties
    if (!stock || !stock.quantity) missingFields.push("quantity");
    if (!stock || !stock.amount) missingFields.push("amount");

    if (missingFields.length > 0) {
      console.error("Missing fields:", missingFields.join(", "));
      return res.status(400).json({ message: "All fields are required", missingFields });
    }

    // Find supplier by supplierId
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    const newInventory = new Inventory({
      itemName,
      stock: {
        quantity: Number(stock.quantity),
        amount: Number(stock.amount),
        total: Number(stock.quantity) * Number(stock.amount),
        purchasedAt: new Date(),
      },
      unit,
      restaurantId,
      supplierId: supplier._id,
      supplierName: supplier.supplierName,
    });

    await newInventory.save();

    res.status(201).json({
      success: true,
      message: "Inventory added successfully",
      inventory: newInventory,
    });
  } catch (error) {
    console.log("error is here", error)
    console.error("Error adding inventory:", error);
    res.status(500).json({ message: "Error adding inventory", error: error.message });
  }
};

// ➤ Get all inventory items
exports.getInventory = async (req, res) => {
  try {
    const items = await Inventory.find().populate("supplier");
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ message: "Error fetching inventory", error: err.message });
  }
};

// ➤ Get single inventory item
exports.getInventoryById = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ message: "Error fetching item", error: err.message });
  }
};

// ➤ Update inventory item
exports.updateInventory = async (req, res) => {
  try {
    // ✅ FIX: The req.body from the thunk is already structured correctly.
    // No need to manually rebuild the stock object.
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!item) return res.status(404).json({ message: "Item not found" });

    // The response from the thunk expects `response.data.inventory`
    // Let's keep the response structure consistent
    res.status(200).json({ message: "Item updated successfully", inventory: item });
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).json({ message: "Error updating item", error: err.message });
  }
};

// ➤ Delete inventory item (soft delete)
exports.deleteInventory = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.isDeleted = true;
    item.deletedTime = new Date();

    await item.save();

    res.status(200).json({ message: "Item deleted successfully", item });
  } catch (err) {
    res.status(500).json({ message: "Error deleting item", error: err.message });
  }
};

// ➤ Update stock quantity
exports.updateStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.stock.quantity = Number(quantity);
    await item.save();

    res.status(200).json({ message: "Stock updated successfully", item });
  } catch (err) {
    res.status(500).json({ message: "Error updating stock", error: err.message });
  }
};


// const Inventory = require("../model/Inventory");
// const Supplier = require('../model/Supplier');
// // ➤ Add new inventory item
// exports.addInventory = async (req, res) => {
//   try {
//     const { itemName, quantity, unit, restaurantId, supplierId, amount } = req.body;

//     // Validate required fields
//     if (!amount || !itemName || !quantity || !unit || !restaurantId || !supplierId) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     // Find supplier by supplierId
//     const supplier = await Supplier.findById(supplierId);
//     if (!supplier) {
//       return res.status(404).json({ message: "Supplier not found" });
//     }

//     // Create new inventory item
//     const newInventory = new Inventory({
//       itemName,
//       quantity: Number(quantity),
//       unit,
//       amount: Number(amount),
//       restaurantId,
//       supplierId: supplier._id,
//       supplierName: supplier.supplierName,
//     });

//     await newInventory.save();

//     res.status(201).json({
//       success: true,
//       message: "Inventory added successfully",
//       inventory: newInventory,
//     });
//   } catch (error) {
//     console.error("Error adding inventory:", error);
//     res.status(500).json({ message: "Error adding inventory", error: error.message });
//   }
// };
// // ➤ Get all inventory items
// exports.getInventory = async (req, res) => {
//   try {
//     const items = await Inventory.find().populate('supplier');
//     res.status(200).json(items);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching inventory", error: err.message });
//   }
// };


// // ➤ Get single inventory item
// exports.getInventoryById = async (req, res) => {
//   try {
//     const item = await Inventory.findById(req.params.id);
//     if (!item) return res.status(404).json({ message: "Item not found" });
//     res.status(200).json(item);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching item", error: err.message });
//   }
// };

// // ➤ Update inventory item
// exports.updateInventory = async (req, res) => {
//   try {
//     const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!item) return res.status(404).json({ message: "Item not found" });
//     res.status(200).json({ message: "Item updated successfully", item });
//   } catch (err) {
//     res.status(500).json({ message: "Error updating item", error: err.message });
//   }
// };

// // ➤ Delete inventory item
// exports.deleteInventory = async (req, res) => {
//   try {
//     const item = await Inventory.findById(req.params.id);

//     if (!item) {
//       return res.status(404).json({ message: "Item not found" });
//     }

//     item.isDeleted = true;
//     item.deletedTime = new Date();

//     await item.save();

//     res.status(200).json({ message: "Item deleted successfully", item });
//   } catch (err) {
//     res.status(500).json({ message: "Error deleting item", error: err.message });
//   }
// };


// // ➤ Update stock quantity
// exports.updateStock = async (req, res) => {
//   try {
//     const { quantity } = req.body;
//     const item = await Inventory.findById(req.params.id);
//     if (!item) return res.status(404).json({ message: "Item not found" });

//     item.quantity = quantity;
//     await item.save();

//     res.status(200).json({ message: "Stock updated successfully", item });
//   } catch (err) {
//     res.status(500).json({ message: "Error updating stock", error: err.message });
//   }
// };
