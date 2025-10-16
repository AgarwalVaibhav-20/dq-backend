// const Item = require("../model/Inventory");
// const Purchase = require("../model/Purchase");
// const Supplier = require("../model/Supplier");
// const Menu = require("../model/Menu"); // optional, menu deduction ke liye

// // ➤ Add new inventory item (creates Item if not exists & Purchase)
// exports.addInventory = async (req, res) => {
//   try {
//     const { itemName, unit, restaurantId, supplierId, quantity, pricePerUnit } = req.body;

//     if (!itemName || !unit || !restaurantId || !supplierId || !quantity || !pricePerUnit) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     // Check if Supplier exists
//     const supplier = await Supplier.findById(supplierId);
//     if (!supplier) return res.status(404).json({ message: "Supplier not found" });

//     // Check if Item exists
//     let item = await Item.findOne({ name: itemName.trim().toLowerCase(), restaurantId });
//     if (!item) {
//       item = await Item.create({ name: itemName.trim().toLowerCase(), unit, restaurantId });
//     }

//     // Create Purchase
//     const purchase = await Purchase.create({
//       itemId: item._id,
//       supplierId: supplier._id,
//       pricePerUnit,
//       quantity,
//       restaurantId,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Inventory added successfully",
//       item,
//       purchase,
//     });
//   } catch (err) {
//     console.error("Error adding inventory:", err);
//     res.status(500).json({ message: "Error adding inventory", error: err.message });
//   }
// };

// // ➤ Get all inventory items with total quantity across purchases
// exports.getInventory = async (req, res) => {
//   try {
//     // Aggregate purchases grouped by item
//     const purchases = await Purchase.find({ isDeleted: { $ne: true } }).populate("itemId supplierId");

//     const groupedItems = {};

//     purchases.forEach((p) => {
//       const key = p.itemId._id.toString();
//       if (!groupedItems[key]) {
//         groupedItems[key] = {
//           itemId: p.itemId._id,
//           itemName: p.itemId.name,
//           unit: p.itemId.unit,
//           totalQuantity: p.quantity,
//           totalValue: p.quantity * p.pricePerUnit,
//           suppliers: [{ supplierId: p.supplierId._id, supplierName: p.supplierId.supplierName, quantity: p.quantity }],
//         };
//       } else {
//         groupedItems[key].totalQuantity += p.quantity;
//         groupedItems[key].totalValue += p.quantity * p.pricePerUnit;
//         groupedItems[key].suppliers.push({ supplierId: p.supplierId._id, supplierName: p.supplierId.supplierName, quantity: p.quantity });
//       }
//     });

//     res.status(200).json(Object.values(groupedItems));
//   } catch (err) {
//     console.error("Error fetching inventory:", err);
//     res.status(500).json({ message: "Error fetching inventory", error: err.message });
//   }
// };

// // ➤ Update Purchase stock
// exports.updateStock = async (req, res) => {
//   try {
//     const { purchaseId } = req.params;
//     const { quantity, pricePerUnit } = req.body;

//     const purchase = await Purchase.findById(purchaseId);
//     if (!purchase) return res.status(404).json({ message: "Purchase not found" });

//     if (quantity !== undefined) purchase.quantity = quantity;
//     if (pricePerUnit !== undefined) purchase.pricePerUnit = pricePerUnit;
//     purchase.totalAmount = purchase.quantity * purchase.pricePerUnit;

//     await purchase.save();

//     res.status(200).json({ message: "Stock updated successfully", purchase });
//   } catch (err) {
//     console.error("Error updating stock:", err);
//     res.status(500).json({ message: "Error updating stock", error: err.message });
//   }
// };

// // ➤ Delete Purchase (soft delete)
// exports.deleteInventory = async (req, res) => {
//   try {
//     const { purchaseId } = req.params;
//     const purchase = await Purchase.findById(purchaseId);
//     if (!purchase) return res.status(404).json({ message: "Purchase not found" });

//     purchase.isDeleted = true;
//     purchase.deletedTime = new Date();
//     await purchase.save();

//     res.status(200).json({ message: "Purchase deleted successfully", purchase });
//   } catch (err) {
//     console.error("Error deleting purchase:", err);
//     res.status(500).json({ message: "Error deleting purchase", error: err.message });
//   }
// };

// // ➤ Deduct inventory when menu item is ordered
// exports.deductInventory = async (menuItemId, orderQuantity) => {
//   try {
//     const menuItem = await Menu.findById(menuItemId);
//     if (!menuItem) throw new Error("Menu item not found");

//     for (const stockItem of menuItem.stockItems) {
//       let qtyToDeduct = stockItem.quantity * orderQuantity;

//       // Get purchases for this item, sorted FIFO
//       const purchases = await Purchase.find({
//         itemId: stockItem.stockId,
//         quantity: { $gt: 0 },
//         isDeleted: { $ne: true },
//       }).sort({ purchasedAt: 1 });

//       for (const p of purchases) {
//         if (qtyToDeduct <= 0) break;

//         if (p.quantity >= qtyToDeduct) {
//           p.quantity -= qtyToDeduct;
//           qtyToDeduct = 0;
//         } else {
//           qtyToDeduct -= p.quantity;
//           p.quantity = 0;
//         }
//         await p.save();
//       }

//       if (qtyToDeduct > 0) {
//         throw new Error(`Not enough stock for itemId: ${stockItem.stockId}`);
//       }
//     }

//     // Optional: update menu stock based on min remaining ingredient
//     const ingredientStocks = await Promise.all(
//       menuItem.stockItems.map(async (s) => {
//         const totalQty = await Purchase.aggregate([
//           { $match: { itemId: s.stockId, isDeleted: { $ne: true } } },
//           { $group: { _id: "$itemId", total: { $sum: "$quantity" } } },
//         ]);
//         return totalQty.length ? totalQty[0].total : 0;
//       })
//     );

//     menuItem.stock = Math.min(...ingredientStocks);
//     await menuItem.save();

//     return menuItem.stock;
//   } catch (err) {
//     console.error("Error deducting inventory:", err);
//     throw err;
//   }
// };

//************************************************************************************//

const Inventory = require("../model/Inventory");
const Supplier = require("../model/Supplier");
const { roundToDecimals, safeAdd, safeMultiply } = require("../utils/numberUtils");

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

    // ✅ FIXED: Check if inventory item already exists
    let existingInventory = await Inventory.findOne({
      itemName: itemName.trim().toLowerCase(),
      restaurantId,
      isDeleted: { $ne: true }
    });

    if (existingInventory) {
      // Add new supplier to existing inventory item
      const newSupplier = {
        supplierName: supplier.supplierName,
        supplierId: supplier._id,
        quantity: Number(stock.quantity),
        amount: Number(stock.amount),
        total: Number(stock.quantity) * Number(stock.amount),
        purchasedAt: new Date(),
      };

      existingInventory.suppliers.push(newSupplier);

      // Update total stock with proper rounding using utility functions
      existingInventory.stock.quantity = safeAdd(existingInventory.stock.quantity, Number(stock.quantity));
      existingInventory.stock.amount = safeAdd(existingInventory.stock.amount, Number(stock.amount));
      existingInventory.stock.total = safeMultiply(existingInventory.stock.quantity, existingInventory.stock.amount);

      // ✅ Calculate totalQuantity from all suppliers with proper rounding
      existingInventory.stock.totalQuantity = roundToDecimals(existingInventory.suppliers.reduce((total, supplier) => {
        return safeAdd(total, supplier.quantity || 0);
      }, 0));

      await existingInventory.save();

      res.status(200).json({
        success: true,
        message: "Inventory updated successfully - new supplier added",
        inventory: existingInventory,
      });
    } else {
      // Create new inventory item with proper rounding using utility functions
      const quantity = roundToDecimals(Number(stock.quantity));
      const amount = roundToDecimals(Number(stock.amount));
      const total = safeMultiply(quantity, amount);

      const newInventory = new Inventory({
        itemName: itemName.trim().toLowerCase(),
        stock: {
          quantity: quantity,
          amount: amount,
          total: total,
          totalQuantity: quantity, // ✅ Set totalQuantity for new item
          purchasedAt: new Date(),
        },
        suppliers: [{
          supplierName: supplier.supplierName,
          supplierId: supplier._id,
          quantity: quantity,
          amount: amount,
          total: total,
          purchasedAt: new Date(),
        }],
        unit,
        restaurantId,
      });

      await newInventory.save();

      res.status(201).json({
        success: true,
        message: "Inventory added successfully",
        inventory: newInventory,
      });
    }
  } catch (error) {
    console.log("error is here", error)
    console.error("Error adding inventory:", error);
    res.status(500).json({ message: "Error adding inventory", error: error.message });
  }
};

// ➤ Get all inventory items with unique items and summed quantities
exports.getInventory = async (req, res) => {
  try {
    console.log('=== BACKEND API CALLED ===');

    // 🔥 ALWAYS use req.userId (which is user.restaurantId from user collection)
    const restaurantId = req.userId;

    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    // ✅ Filter by restaurantId + exclude deleted
    const items = await Inventory.find({
      restaurantId,
      isDeleted: { $ne: true },
    }).populate({
      path: "suppliers.supplierId",
      model: "Supplier",
      select: "supplierName email phoneNumber rawItem",
    });

    console.log('Raw items from database:', items.length);

    // ✅ Process the inventory data
    const processedItems = items.map((item) => ({
      _id: item._id,
      itemName: item.itemName,
      unit: item.unit,
      restaurantId: item.restaurantId,
      stock: {
        quantity: roundToDecimals(Number(item.stock?.quantity || 0)),
        amount: roundToDecimals(Number(item.stock?.amount || 0)),
        total: roundToDecimals(Number(item.stock?.total || 0)),
        totalQuantity: roundToDecimals(Number(item.stock?.totalQuantity || 0)),
        purchasedAt: item.stock?.purchasedAt,
      },
      suppliers: item.suppliers || [],
      isDeleted: item.isDeleted,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    console.log('=== SENDING RESPONSE ===');
    console.log('Processed items count:', processedItems.length);
    console.log('Sample item:', processedItems[0]);

    res.status(200).json(processedItems);
  } catch (err) {
    console.error('Error in getInventory:', err);
    res.status(500).json({
      message: "Error fetching inventory",
      error: err.message,
    });
  }
};

// exports.getInventory = async (req, res) => {
//   try {
//     console.log('=== BACKEND API CALLED ===');
//     const items = await Inventory.find({ isDeleted: { $ne: true } }).populate({
//       path: "suppliers.supplierId",
//       model: "Supplier",
//       select: "supplierName email phoneNumber rawItem"
//     });
//     console.log('Raw items from database:', items.length);

//     // ✅ FIXED: Now each item has suppliers array, no need to group
//     const processedItems = items.map(item => ({
//       _id: item._id,
//       itemName: item.itemName,
//       unit: item.unit,
//       restaurantId: item.restaurantId,
//       stock: {
//         quantity: roundToDecimals(Number(item.stock?.quantity || 0)),
//         amount: roundToDecimals(Number(item.stock?.amount || 0)),
//         total: roundToDecimals(Number(item.stock?.total || 0)),
//         totalQuantity: roundToDecimals(Number(item.stock?.totalQuantity || 0)), // ✅ Include totalQuantity with rounding
//         purchasedAt: item.stock?.purchasedAt
//       },
//       suppliers: item.suppliers || [],
//       isDeleted: item.isDeleted,
//       createdAt: item.createdAt,
//       updatedAt: item.updatedAt
//     }));

//     console.log('=== SENDING RESPONSE ===');
//     console.log('Processed items count:', processedItems.length);
//     console.log('Sample item:', processedItems[0]);

//     res.status(200).json(processedItems);
//   } catch (err) {
//     console.error('Error in getInventory:', err);
//     res.status(500).json({ message: "Error fetching inventory", error: err.message });
//   }
// };

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

    // Round quantity to avoid floating point precision issues using utility function
    const roundedQuantity = roundToDecimals(Number(quantity));
    item.stock.quantity = roundedQuantity;
    item.stock.totalQuantity = roundedQuantity; // Update totalQuantity as well

    await item.save();

    res.status(200).json({ message: "Stock updated successfully", item });
  } catch (err) {
    res.status(500).json({ message: "Error updating stock", error: err.message });
  }
};

//*********************************************************************************** */
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
