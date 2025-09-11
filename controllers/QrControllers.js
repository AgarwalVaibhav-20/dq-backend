const QRCode = require("qrcode");
const Qr = require("../model/QrCode");

// Generate QR Code for a URL/Text
exports.generateQr = async (req, res) => {
  try {
    const { tableNumber, restaurantId, qrCodeUrl } = req.body;

    if (!tableNumber || !restaurantId) {
      return res.status(400).json({ message: "Table number and restaurant ID are required" });
    }

    const qrContent = qrCodeUrl || `${tableNumber}`;
    const qrImage = await QRCode.toDataURL(qrContent);

    // ✅ use Qr (the imported model), not QrCode
    const qrCode = await Qr.create({
      restaurantId,
      tableNumber,
      qrImage,
      qrCodeUrl: qrCodeUrl || null,
    });

    res.status(201).json(qrCode);
  } catch (error) {
    console.error("QR generation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all QR Codes
exports.getQrs = async (req, res) => {
  try {
    const qrs = await Qr.find();
    res.json({ data: qrs });
  } catch (err) {
    res.status(500).json({ message: "Error fetching QR codes", error: err.message });
  }
};


// Get QR Code by ID
exports.getQrById = async (req, res) => {
  try {
    const qr = await Qr.findById(req.params.id);
    if (!qr) return res.status(404).json({ message: "QR Code not found" });
    res.json({ data: qr });
  } catch (err) {
    res.status(500).json({ message: "Error fetching QR code", error: err.message });
  }
};

// Delete QR Code
exports.deleteQr = async (req, res) => {
  try {
    const qr = await Qr.findByIdAndDelete(req.params.id);
    if (!qr) return res.status(404).json({ message: "QR Code not found" });
    res.json({ message: "QR Code deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting QR code", error: err.message });
  }
};
