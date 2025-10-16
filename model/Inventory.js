const mongoose = require("mongoose");

const supplierStockSchema = new mongoose.Schema({
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true,
  },
  supplierName: {
    type: String,
    required: true,
  },
  purchasedQuantity: {
    type: Number,
    required: true,
    default: 0,
  },
  remainingQuantity: {
    type: Number,
    required: true,
    default: 0,
  },
  usedQuantity: {
    type: Number,
    default: 0,
  },
  pricePerUnit: {
    type: Number,
    required: true,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  purchasedAt: {
    type: Date,
    default: Date.now,
  },
  isFullyUsed: {
    type: Boolean,
    default: false,
  },
});

const inventorySchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    unit: {
      type: String,
      required: true,
      enum: ["kg", "gm", "ltr", "ml", "pcs", "mg"],
    },
    restaurantId: {
      type: String,
      required: true,
    },
    // Aggregate stock information
    totalQuantity: {
      type: Number,
      default: 0,
    },
    totalUsedQuantity: {
      type: Number,
      default: 0,
    },
    totalRemainingQuantity: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    // Array of supplier stocks (FIFO order maintained by purchasedAt)
    supplierStocks: [supplierStockSchema],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Method to add stock from a supplier
inventorySchema.methods.addSupplierStock = function(supplierData) {
  const newStock = {
    supplierId: supplierData.supplierId,
    supplierName: supplierData.supplierName,
    purchasedQuantity: supplierData.quantity,
    remainingQuantity: supplierData.quantity,
    usedQuantity: 0,
    pricePerUnit: supplierData.pricePerUnit,
    totalAmount: supplierData.quantity * supplierData.pricePerUnit,
    purchasedAt: new Date(),
    isFullyUsed: false,
  };

  this.supplierStocks.push(newStock);
  
  // Update totals
  this.totalQuantity += supplierData.quantity;
  this.totalRemainingQuantity += supplierData.quantity;
  this.totalAmount += newStock.totalAmount;
  
  // Sort by purchasedAt to maintain FIFO
  this.supplierStocks.sort((a, b) => a.purchasedAt - b.purchasedAt);
  
  return this;
};

// Method to deduct stock using FIFO
inventorySchema.methods.deductStock = function(quantityToDeduct) {
  let remainingToDeduct = quantityToDeduct;
  
  // Sort to ensure FIFO (oldest first)
  this.supplierStocks.sort((a, b) => a.purchasedAt - b.purchasedAt);
  
  for (let stock of this.supplierStocks) {
    if (remainingToDeduct <= 0) break;
    if (stock.isFullyUsed) continue;
    
    if (stock.remainingQuantity >= remainingToDeduct) {
      // This supplier has enough stock
      stock.remainingQuantity -= remainingToDeduct;
      stock.usedQuantity += remainingToDeduct;
      remainingToDeduct = 0;
      
      if (stock.remainingQuantity === 0) {
        stock.isFullyUsed = true;
      }
    } else {
      // Use all remaining stock from this supplier
      remainingToDeduct -= stock.remainingQuantity;
      stock.usedQuantity += stock.remainingQuantity;
      stock.remainingQuantity = 0;
      stock.isFullyUsed = true;
    }
  }
  
  // Update totals
  this.totalUsedQuantity += quantityToDeduct;
  this.totalRemainingQuantity -= quantityToDeduct;
  
  return remainingToDeduct === 0;
};

// Virtual to get active supplier stocks (not fully used)
inventorySchema.virtual('activeSupplierStocks').get(function() {
  return this.supplierStocks.filter(stock => !stock.isFullyUsed);
});

const Inventory = mongoose.model("Inventory", inventorySchema);

module.exports = Inventory;

// const mongoose = require("mongoose");

// const inventorySchema = new mongoose.Schema(
//   {
//     itemName: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     stock: {
//       amount: {
//         type: Number,
//         required: true,
//       },
//       quantity: {
//         type: Number,
//         required: true,
//       },
//       total:{
//         type:Number,
//       },
//       totalQuantity: {
//         type: Number,
//         default: 0,
//       },
//       purchasedAt: {
//         type: Date,
//         default: Date.now,
//       },
//     },
//     //  Changed to suppliers array instead of single supplier
//     suppliers: [{
//       supplierName: {
//         type: String,
//         required: true,
//         trim: true,
//       },
//       supplierId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Supplier",
//         required: true,
//       },
//       quantity: {
//         type: Number,
//         required: true,
//       },
//       amount: {
//         type: Number,
//         required: true,
//       },
//       total: {
//         type: Number,
//       },
//       purchasedAt: {
//         type: Date,
//         default: Date.now,
//       }
//     }],
//     restaurantId: {
//       type: String,
//       required: true,
//     },
//     unit: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     isDeleted: {
//       type: Boolean,
//       default: false,
//     },
//     deletedTime: {
//       type: Date,
//     },
//   },
//   { timestamps: true }
// );

// // ✅ Virtual for supplier population
// inventorySchema.virtual("supplier", {
//   ref: "Supplier",
//   localField: "suppliers.supplierId",
//   foreignField: "_id",
//   justOne: false,
// });


// const Inventory = mongoose.model("Inventory", inventorySchema);
// module.exports = Inventory;

