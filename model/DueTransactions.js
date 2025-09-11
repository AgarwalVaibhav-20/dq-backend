const mongoose = require("mongoose");

const dueTransactionSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer", // Reference to Customer collection
    },
    total: {
      type: Number,
    },
    customerName:{
      type:String
    },
    status: {
      type: String,
      enum: ["paid" , "unpaid"], 
    },
    restaurantId: {
      type: String,
    },
  },
  {
    timestamps: true, // auto adds createdAt & updatedAt
  }
);

const DueTransaction = mongoose.model("DueTransaction", dueTransactionSchema);

module.exports = DueTransaction;
