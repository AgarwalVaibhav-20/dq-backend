const DeliveryManagement = require("../model/DeliveryManagement");

// Create new delivery slot
exports.createDelivery = async (req, res) => {
  try {
    const { restaurantId, start_time, end_time, delivery_status } = req.body;

    const delivery = new DeliveryManagement({
      restaurantId,
      start_time,
      end_time,
      delivery_status,
    });

    await delivery.save();
    res.status(201).json({ message: "Delivery slot created", delivery });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all delivery slots
exports.getAllDeliveries = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const deliveries = restaurantId
      ? await DeliveryManagement.find({ restaurantId })
      : await DeliveryManagement.find();              

    res.status(200).json({ deliveries });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get single delivery slot by ID
exports.getDeliveryById = async (req, res) => {
  try {
    const delivery = await DeliveryManagement.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ message: "Delivery slot not found" });
    }
    res.status(200).json({ delivery });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update delivery slot
// controllers/deliveryManagementController.js

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { delivery_status } = req.body; // expect true/false

    const delivery = await DeliveryManagement.findByIdAndUpdate(
      id,
      { delivery_status, updated_at: Date.now() },
      { new: true }
    );

    if (!delivery) {
      return res.status(404).json({ message: "Delivery timing not found" });
    }

    res.status(200).json({
      message: "Delivery status updated successfully",
      delivery,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Delete delivery slot
exports.deleteDelivery = async (req, res) => {
  try {
    const delivery = await DeliveryManagement.findByIdAndDelete(req.params.id);

    if (!delivery) {
      return res.status(404).json({ message: "Delivery slot not found" });
    }

    res.status(200).json({ message: "Delivery slot deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
