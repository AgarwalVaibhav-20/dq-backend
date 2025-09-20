const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  tableNumber: {
    type: String,
    required: true,
  },
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: false,
  },
  qrImage: {
    type: String, // Base64 or URL to QR image
    required: true,
  },
  qrData: {
    type: String, // The actual QR code data/URL
    required: true,
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  scanCount: {
    type: Number,
    default: 0,
  },
  lastScanned: {
    type: Date,
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Compound index for unique QR codes per restaurant
qrCodeSchema.index({ tableNumber: 1, restaurantId: 1 }, { unique: true });

module.exports = mongoose.model('QRCode', qrCodeSchema);

// const mongoose = require("mongoose");

// const qrCodeSchema = new mongoose.Schema(
//   {
//     restaurantId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Restaurant", // ✅ Better: reference the Restaurant collection
//       required: true,
//     },
//     tableNumber: {
//       type: String,
//       trim: true,
//       required: true,
//     },
//     qrImage: {
//       type: String, // base64 or Cloudinary URL
//       trim: true,
//       required: true,
//     },
//     qrCodeUrl: {
//       type: String,
//       default: null,
//       trim: true,
//     },
//   },
//   {
//     timestamps: true, // adds createdAt & updatedAt
//   }
// );

// const QrCode = mongoose.model("QrCode", qrCodeSchema);

// module.exports = QrCode;
