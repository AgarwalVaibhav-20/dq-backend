// const mongoose = require("mongoose");

// const itemSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true },
//   unit: { type: String, required: true, enum: ["kg","litre","gm","pcs","mg","ml"] },
//   restaurantId: { type: String, required: true },
//   isDeleted: { type: Boolean, default: false },
//   deletedTime: { type: Date },
// }, { timestamps: true });

// const Item = mongoose.model("Item", itemSchema);

const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    stock: {
      amount: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      total:{
        type:Number,
      },
      totalQuantity: {
        type: Number,
        default: 0,
      },
      purchasedAt: {
        type: Date,
        default: Date.now,
      },
    },
    //  Changed to suppliers array instead of single supplier
    suppliers: [{
      supplierName: {
        type: String,
        required: true,
        trim: true,
      },
      supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      total: {
        type: Number,
      },
      purchasedAt: {
        type: Date,
        default: Date.now,
      }
    }],
    restaurantId: {
      type: String,
      required: true,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedTime: {
      type: Date,
    },
  },
  { timestamps: true }
);

// ✅ Virtual for supplier population
inventorySchema.virtual("supplier", {
  ref: "Supplier",
  localField: "suppliers.supplierId",
  foreignField: "_id",
  justOne: false,
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
//     amount:{
//       type:Number,
//       default:0
//     },
//     supplierName:{
//       type:String
//     },
//     quantity: {
//       type: Number,
//       required: true,
//     },
//     supplierId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref:"Supplier",
//       required: true,
//     },
//     restaurantId:{
//       type:String,
//     },
//     unit: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     isDeleted:{
//       type:Boolean,
//       default:false
//     },
//     deletedTime:{
//       type:Date,
//     }
//   },
//   { timestamps: true }
// );

// // ✅ FIXED - Correct model name
// inventorySchema.virtual("supplier", {
//   ref: "Supplier",
//   localField: "supplierId",
//   foreignField: "_id",
//   justOne: true,
// });

// const Inventory = mongoose.model("Inventory", inventorySchema);
// module.exports = Inventory;