const mongoose = require("mongoose");

const deliveryManagementSchema = new mongoose.Schema(
  {
    restaurantId: { type: String },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },   
    delivery_status: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

const DeliveryManagement = mongoose.model(
  "DeliveryManagement",
  deliveryManagementSchema
);

module.exports = DeliveryManagement;
