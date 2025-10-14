const WasteMaterial = require("../model/Waste");
const Inventory = require("../model/Inventory"); // ✅ ADD THIS IMPORT

// ✅ Create new waste material entry
exports.createWasteMaterial = async (req, res) => {
    try {
        const { itemId, itemName, wasteQuantity, restaurantId, unit, reason, date } = req.body;

        if (!itemName || !wasteQuantity || !restaurantId) {
            return res.status(400).json({
                success: false,
                message: "Item name, waste quantity, and restaurant ID are required.",
            });
        }

        // ✅ Find inventory item by ID (not by name)
        const inventoryItem = await Inventory.findOne({ _id: itemId, restaurantId });

        if (!inventoryItem) {
            return res.status(404).json({
                success: false,
                message: `Item "${itemName}" not found in inventory.`,
            });
        }

        // ✅ Get current total quantity
        const currentQuantity = inventoryItem.stock?.quantity ?? 0;

        if (currentQuantity <= 0) {
            return res.status(400).json({
                success: false,
                message: `No stock available for "${itemName}".`,
            });
        }

        // ✅ Prevent waste > available quantity
        if (wasteQuantity > currentQuantity) {
            return res.status(400).json({
                success: false,
                message: `Cannot waste ${wasteQuantity} ${unit}. Only ${currentQuantity} ${unit} available.`,
            });
        }

        // ✅ Create waste record
        const waste = new WasteMaterial({
            itemId,
            stockName: itemName,
            wasteQuantity,
            restaurantId,
            unit,
            note: reason,
            date,
        });

        await waste.save();

        // ✅ Reduce available stock
        inventoryItem.stock.quantity = currentQuantity - wasteQuantity;

        // Also update totalQuantity if it exists
        if (inventoryItem.stock.totalQuantity) {
            inventoryItem.stock.totalQuantity = inventoryItem.stock.totalQuantity - wasteQuantity;
        }

        await inventoryItem.save();

        res.status(201).json({
            success: true,
            message: `Waste added. Remaining ${itemName}: ${inventoryItem.stock.quantity} ${unit}`,
            waste,
        });
    } catch (error) {
        console.error("Error creating waste material:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// ✅ Get all waste materials (optionally by restaurant)
exports.getWasteMaterials = async (req, res) => {
    try {
        const { restaurantId } = req.query;
        const filter = restaurantId ? { restaurantId } : {};

        const wastes = await WasteMaterial.find(filter)
            .populate("restaurantId", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: wastes.length,
            wastes,
        });
    } catch (error) {
        console.error("Error fetching waste materials:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ✅ Update waste material
// 📍 File: WasteController.js

// ✅ CORRECTED Update waste material function
exports.updateWasteMaterial = async (req, res) => {
    try {
        const { itemId: newItemId, itemName, wasteQuantity: newWasteQuantity, unit, reason, date } = req.body; //
        const wasteId = req.params.id; //

        // 1. Find the existing waste record
        const existingWaste = await WasteMaterial.findById(wasteId); //
        if (!existingWaste) {
            return res.status(404).json({ success: false, message: "Waste material not found" }); //
        }

        const oldItemId = existingWaste.itemId; //
        const oldWasteQuantity = existingWaste.wasteQuantity; //

        // CHANGE #1: Safely check if the item has changed. This prevents a crash if oldItemId is null.
        const itemHasChanged = oldItemId && newItemId ? oldItemId.toString() !== newItemId : false;

        // 2. Handle stock adjustment
        if (itemHasChanged) {
            // ... (Code for when the item is changed)
            const oldInventoryItem = await Inventory.findById(oldItemId); //
            if (oldInventoryItem) {
                oldInventoryItem.stock.quantity = (oldInventoryItem.stock?.quantity ?? 0) + oldWasteQuantity; //
                // CHANGE #2: Use optional chaining (?.) to safely access nested properties.
                if (oldInventoryItem.stock?.totalQuantity) {
                    oldInventoryItem.stock.totalQuantity += oldWasteQuantity; //
                }
                await oldInventoryItem.save(); //
            }

            const newInventoryItem = await Inventory.findById(newItemId); //
            // ... (rest of logic for new item)

        } else {
            // CASE B: The item is the same, or one of the IDs was missing
            const currentItemId = newItemId || oldItemId;
            if (!currentItemId) {
                return res.status(400).json({ success: false, message: "Inventory item ID is missing." });
            }
            const inventoryItem = await Inventory.findById(currentItemId); //
            if (!inventoryItem) {
                return res.status(404).json({ success: false, message: "Inventory item not found" }); //
            }

            const quantityDifference = newWasteQuantity - oldWasteQuantity; //
            inventoryItem.stock.quantity -= quantityDifference; //
            // Also use optional chaining here for safety
            if (inventoryItem.stock?.totalQuantity) {
                inventoryItem.stock.totalQuantity -= quantityDifference; //
            }
            await inventoryItem.save(); //
        }

        // 3. Update the waste record itself with the new data
        existingWaste.itemId = newItemId; //
        existingWaste.stockName = itemName; //
        existingWaste.wasteQuantity = newWasteQuantity; //
        existingWaste.unit = unit; //
        existingWaste.note = reason; //
        existingWaste.date = date; //
        await existingWaste.save(); //

        res.status(200).json({
            success: true,
            message: "Waste material updated successfully",
            waste: existingWaste,
        }); //

    } catch (error) {
        // CHANGE #3: Add detailed logging to make future debugging easier.
        console.error("CRITICAL ERROR in updateWasteMaterial:", error);
        res.status(500).json({ success: false, message: "Internal server error" }); //
    }
};
// ✅ Delete waste material
exports.deleteWasteMaterial = async (req, res) => {
    try {
        const wasteId = req.params.id;

        const deletedWaste = await WasteMaterial.findById(wasteId);
        if (!deletedWaste) {
            return res.status(404).json({
                success: false,
                message: "Waste material not found",
            });
        }

        // Find inventory and restore the wasted quantity
        const inventoryItem = await Inventory.findById(deletedWaste.itemId);
        if (inventoryItem) {
            inventoryItem.stock.quantity = (inventoryItem.stock?.quantity ?? 0) + deletedWaste.wasteQuantity;
            if (inventoryItem.stock.totalQuantity) {
                inventoryItem.stock.totalQuantity += deletedWaste.wasteQuantity;
            }
            await inventoryItem.save();
        }

        // Delete the waste record
        await WasteMaterial.findByIdAndDelete(wasteId);

        res.status(200).json({
            success: true,
            message: "Waste material deleted and stock restored successfully",
        });
    } catch (error) {
        console.error("Error deleting waste material:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// const WasteMaterial = require("../model/Waste");

// // ✅ Create new waste material entry
// const Stock = require("../model/Inventory"); // <-- import your Stock model

// // ✅ Create new waste material entry
// exports.createWasteMaterial = async (req, res) => {
//     try {
//         const { itemId, itemName, wasteQuantity, restaurantId, unit, reason, date } = req.body;

//         if (!itemName || !wasteQuantity || !restaurantId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Item name, waste quantity, and restaurant ID are required.",
//             });
//         }

//         // ✅ 1️⃣ Find inventory item
//         const inventoryItem = await Inventory.findOne({ itemName, restaurantId });

//         if (!inventoryItem) {
//             return res.status(404).json({
//                 success: false,
//                 message: `Item "${itemName}" not found in inventory.`,
//             });
//         }

//         // ✅ 2️⃣ Get current total quantity
//         const currentQuantity = inventoryItem.stock?.totalQuantity ?? 0;

//         if (currentQuantity <= 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: `No stock available for "${itemName}".`,
//             });
//         }

//         // ✅ 3️⃣ Prevent waste > available quantity
//         if (wasteQuantity > currentQuantity) {
//             return res.status(400).json({
//                 success: false,
//                 message: `Cannot waste ${wasteQuantity} ${unit}. Only ${currentQuantity} ${unit} available.`,
//             });
//         }

//         // ✅ 4️⃣ Create waste record
//         const waste = new WasteMaterial({
//             itemId,
//             stockName: itemName,
//             wasteQuantity,
//             restaurantId,
//             unit,
//             note: reason,
//             date,
//         });

//         await waste.save();

//         // ✅ 5️⃣ Reduce available stock
//         inventoryItem.stock.totalQuantity = currentQuantity - wasteQuantity;
//         await inventoryItem.save();

//         res.status(201).json({
//             success: true,
//             message: `Waste added. Remaining ${itemName}: ${inventoryItem.stock.totalQuantity} ${unit}`,
//             waste,
//         });
//     } catch (error) {
//         console.error("Error creating waste material:", error);
//         res.status(500).json({
//             success: false,
//             message: "Internal server error",
//         });
//     }
// };

// // exports.createWasteMaterial = async (req, res) => {
// //     try {
// //         const { itemId, itemName, wasteQuantity, restaurantId, unit, reason, date } = req.body;

// //         if (!itemName || !wasteQuantity || !restaurantId) {
// //             return res.status(400).json({
// //                 success: false,
// //                 message: "Item name, waste quantity, and restaurant ID are required.",
// //             });
// //         }

// //         const waste = new WasteMaterial({
// //             itemId,
// //             stockName: itemName, // keep compatibility
// //             wasteQuantity,
// //             restaurantId,
// //             unit,
// //             note: reason, // save reason in note field
// //             date,
// //         });

// //         await waste.save();

// //         res.status(201).json({
// //             success: true,
// //             message: "Waste material added successfully",
// //             waste,
// //         });
// //     } catch (error) {
// //         console.error("Error creating waste material:", error);
// //         res.status(500).json({
// //             success: false,
// //             message: "Internal server error",
// //         });
// //     }
// // };


// // ✅ Get all waste materials (optionally by restaurant)
// exports.getWasteMaterials = async (req, res) => {
//     try {
//         const { restaurantId } = req.query;
//         const filter = restaurantId ? { restaurantId } : {};

//         const wastes = await WasteMaterial.find(filter)
//             .populate("restaurantId", "name email")
//             .sort({ createdAt: -1 });

//         res.status(200).json({
//             success: true,
//             count: wastes.length,
//             wastes,
//         });
//     } catch (error) {
//         console.error("Error fetching waste materials:", error);
//         res.status(500).json({
//             success: false,
//             message: "Internal server error",
//         });
//     }
// };

// // ✅ Get single waste material by ID
// exports.getWasteMaterialById = async (req, res) => {
//     try {
//         const waste = await WasteMaterial.findById(req.params.id).populate(
//             "restaurantId",
//             "name email"
//         );

//         if (!waste) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Waste material not found",
//             });
//         }

//         res.status(200).json({
//             success: true,
//             waste,
//         });
//     } catch (error) {
//         console.error("Error fetching waste material:", error);
//         res.status(500).json({
//             success: false,
//             message: "Internal server error",
//         });
//     }
// };

// // ✅ Update waste material
// exports.updateWasteMaterial = async (req, res) => {
//     try {
//         const updatedWaste = await WasteMaterial.findByIdAndUpdate(
//             req.params.id,
//             req.body,
//             { new: true, runValidators: true }
//         );

//         if (!updatedWaste) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Waste material not found",
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: "Waste material updated successfully",
//             waste: updatedWaste,
//         });
//     } catch (error) {
//         console.error("Error updating waste material:", error);
//         res.status(500).json({
//             success: false,
//             message: "Internal server error",
//         });
//     }
// };

// // ✅ Delete waste material
// exports.deleteWasteMaterial = async (req, res) => {
//     try {
//         const deletedWaste = await WasteMaterial.findByIdAndDelete(req.params.id);

//         if (!deletedWaste) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Waste material not found",
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: "Waste material deleted successfully",
//         });
//     } catch (error) {
//         console.error("Error deleting waste material:", error);
//         res.status(500).json({
//             success: false,
//             message: "Internal server error",
//         });
//     }
// };
