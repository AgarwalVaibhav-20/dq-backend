const QRCode = require('../model/QrCode');
const Table = require('../model/Table');
const { generateResponse } = require('../utils/responseHelper');
const { generateQRCode } = require('../utils/qrCodeGenerator');

// Get all QR codes for a restaurant
const getQRCodes = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const qrCodes = await QRCode.find({ restaurantId, isActive: true })
      .populate('tableId', 'tableNumber capacity status')
      .sort({ tableNumber: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await QRCode.countDocuments({ restaurantId, isActive: true });

    return res.status(200).json(generateResponse(true, 'QR codes fetched successfully', {
      qrCodes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    }));
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    return res.status(500).json(generateResponse(false, 'Failed to fetch QR codes', null, error.message));
  }
};

// Create QR code
const createQRCode = async (req, res) => {
  try {
    const { tableNumber, tableId } = req.body;
    const { restaurantId } = req.params;
    const userId = req.user.id;

    // Check if QR code already exists for this table
    const existingQR = await QRCode.findOne({ 
      tableNumber, 
      restaurantId, 
      isActive: true 
    });

    if (existingQR) {
      return res.status(400).json(generateResponse(false, 'QR code already exists for this table'));
    }

    // Generate QR code data and image
    const qrData = `${process.env.FRONTEND_URL}/menu/${restaurantId}?table=${tableNumber}`;
    const qrImage = await generateQRCode(qrData);

    // Create QR code
    const qrCode = new QRCode({
      tableNumber,
      tableId,
      qrImage,
      qrData,
      restaurantId,
      createdBy: userId,
    });

    await qrCode.save();

    // Update table with QR code reference if tableId provided
    if (tableId) {
      await Table.findByIdAndUpdate(tableId, { qrCodeId: qrCode._id });
    }

    const populatedQR = await QRCode.findById(qrCode._id)
      .populate('tableId', 'tableNumber capacity status');

    return res.status(201).json(generateResponse(true, 'QR code created successfully', populatedQR));
  } catch (error) {
    console.error('Error creating QR code:', error);
    return res.status(500).json(generateResponse(false, 'Failed to create QR code', null, error.message));
  }
};

// Update QR code scan count
const updateScanCount = async (req, res) => {
  try {
    const { id } = req.params;
    const { restaurantId } = req.params;

    const qrCode = await QRCode.findOne({ _id: id, restaurantId, isActive: true });
    if (!qrCode) {
      return res.status(404).json(generateResponse(false, 'QR code not found'));
    }

    qrCode.scanCount += 1;
    qrCode.lastScanned = new Date();
    await qrCode.save();

    return res.status(200).json(generateResponse(true, 'Scan count updated', qrCode));
  } catch (error) {
    console.error('Error updating scan count:', error);
    return res.status(500).json(generateResponse(false, 'Failed to update scan count', null, error.message));
  }
};

// Delete QR code
const deleteQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { restaurantId } = req.params;

    const qrCode = await QRCode.findOne({ _id: id, restaurantId, isActive: true });
    if (!qrCode) {
      return res.status(404).json(generateResponse(false, 'QR code not found'));
    }

    // Soft delete
    qrCode.isActive = false;
    await qrCode.save();

    // Remove QR code reference from table
    if (qrCode.tableId) {
      await Table.findByIdAndUpdate(qrCode.tableId, { $unset: { qrCodeId: 1 } });
    }

    return res.status(200).json(generateResponse(true, 'QR code deleted successfully'));
  } catch (error) {
    console.error('Error deleting QR code:', error);
    return res.status(500).json(generateResponse(false, 'Failed to delete QR code', null, error.message));
  }
};

module.exports = {
  getQRCodes,
  createQRCode,
  updateScanCount,
  deleteQRCode,
};

// const QRCode = require("qrcode");
// const Qr = require("../model/QrCode");

// // Generate QR Code for a URL/Text
// exports.generateQr = async (req, res) => {
//   try {
//     const { tableNumber, restaurantId, qrCodeUrl } = req.body;

//     if (!tableNumber || !restaurantId) {
//       return res.status(400).json({ message: "Table number and restaurant ID are required" });
//     }

//     const qrContent = qrCodeUrl || `${tableNumber}`;
//     const qrImage = await QRCode.toDataURL(qrContent);

//     // ✅ use Qr (the imported model), not QrCode
//     const qrCode = await Qr.create({
//       restaurantId,
//       tableNumber,
//       qrImage,
//       qrCodeUrl: qrCodeUrl || null,
//     });

//     res.status(201).json(qrCode);
//   } catch (error) {
//     console.error("QR generation error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // Get all QR Codes
// exports.getQrs = async (req, res) => {
//   try {
//     const qrs = await Qr.find();
//     res.json({ data: qrs });
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching QR codes", error: err.message });
//   }
// };


// // Get QR Code by ID
// exports.getQrById = async (req, res) => {
//   try {
//     const qr = await Qr.findById(req.params.id);
//     if (!qr) return res.status(404).json({ message: "QR Code not found" });
//     res.json({ data: qr });
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching QR code", error: err.message });
//   }
// };

// // Delete QR Code
// exports.deleteQr = async (req, res) => {
//   try {
//     const qr = await Qr.findByIdAndDelete(req.params.id);
//     if (!qr) return res.status(404).json({ message: "QR Code not found" });
//     res.json({ message: "QR Code deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Error deleting QR code", error: err.message });
//   }
// };
