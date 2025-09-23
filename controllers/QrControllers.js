const QrCode = require("../model/QrCode");
const Floor = require("../model/Floor");
const { generateQRCode } = require('../utils/qrCodeGenerator');
// Create QR for a table
exports.addTable = async (req, res) => {
  try {
    const { restaurantId, floorId, tableNumber } = req.body;

    console.log('=== Backend Debug ===');
    console.log('Received data:', { restaurantId, floorId, tableNumber });

    // ... validation code ...

    const qrData = `${process.env.FRONTEND_URL}/table/${restaurantId}/${floorId}/${tableNumber}`;
    const qrImage = await generateQRCode(qrData);

    const qrCode = new QrCode({
      restaurantId,
      floorId,
      tableNumber,
      qrImage
    });

    const savedQrCode = await qrCode.save();

    console.log('Saved QR Code:', savedQrCode);
    console.log('Response data:', { success: true, data: savedQrCode });

    res.status(201).json({ success: true, data: savedQrCode });
  } catch (error) {
    console.error("addTable error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Table already exists on this floor"
      });
    }

    res.status(500).json({ success: false, message: error.message });
  }
};
// exports.addTable = async (req, res) => {
//   try {
//     const { restaurantId, floorId, tableNumber } = req.body;

//     // Validate required fields
//     if (!restaurantId || !floorId || !tableNumber) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Restaurant ID, Floor ID, and Table Number are required" 
//       });
//     }

//     const floor = await Floor.findById(floorId);
//     if (!floor) {
//       return res.status(404).json({ success: false, message: "Floor not found" });
//     }

//     // Generate QR code data (customize this URL as needed)
//     const qrData = `${process.env.FRONTEND_URL}/table/${restaurantId}/${floorId}/${tableNumber}`;

//     // Use your utility function to generate QR image
//     const qrImage = await generateQRCode(qrData);

//     const qrCode = new QrCode({ 
//       restaurantId, 
//       floorId, 
//       tableNumber, 
//       qrImage 
//     });

//     await qrCode.save();

//     res.status(201).json({ success: true, data: qrCode });
//   } catch (error) {
//     console.error("addTable error:", error);

//     if (error.code === 11000) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Table already exists on this floor" 
//       });
//     }

//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// Get all QR codes (with optional filters)
exports.getQrs = async (req, res) => {
  try {
    const { restaurantId, floorId } = req.query;
    // console.log("yes requested")
    let filter = {};
    if (restaurantId) filter.restaurantId = restaurantId;
    if (floorId) filter.floorId = floorId;
    // console.log("restaurant ID ye hai :",filter)

    const qrs = await QrCode.find(filter).populate("floorId");
    // console.log("the qrs according to floor",qrs)

    res.status(200).json({ success: true, data: qrs });
  } catch (error) {
    console.log("getQrs error:", error);
    console.error("getQrs error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get QR by ID
exports.getQrById = async (req, res) => {
  try {
    const qr = await QrCode.findById(req.params.id).populate("floorId");
    if (!qr) {
      return res.status(404).json({ success: false, message: "QR not found" });
    }
    res.status(200).json({ success: true, data: qr });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete QR
exports.deleteQr = async (req, res) => {
  console.log("DELETE QR ID:", req.params.id); // debug
  try {
    const qr = await QrCode.findByIdAndDelete(req.params.id);
    if (!qr) {
      return res.status(404).json({ success: false, message: "QR not found" });
    }
    res.status(200).json({ success: true, message: "QR deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get tables by floor
exports.getTablesByFloor = async (req, res) => {
  try {
    const { floorId } = req.params;
    const tables = await QrCode.find({ floorId }).populate("floorId");
    res.status(200).json({ success: true, data: tables });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Count tables per floor (per restaurant)
exports.countTablesPerFloor = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const stats = await QrCode.aggregate([
      { $match: { restaurantId: require("mongoose").Types.ObjectId(restaurantId) } },
      { $group: { _id: "$floorId", totalTables: { $sum: 1 } } },
    ]);

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
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
