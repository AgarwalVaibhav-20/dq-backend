const Reservation = require("../model/Reservation");
// 📌 Create Reservation
exports.createReservation = async (req, res) => {
  try {
    const { restaurantId,
      customerId,
      startTime,
      endTime,
      customerName,
      tableNumber,
      advance,
      payment,
      notes,} = req.body;

    const reservation = new Reservation({
      restaurantId,
      customerId,
      customerName,
      startTime,
      endTime,
      tableNumber,
      advance,
      payment,
      notes,
    });

    await reservation.save();
    res.status(201).json({ message: "Reservation created successfully", reservation });
  } catch (err) {
    console.log("Error" , err)
    res.status(500).json({ message: "Error creating reservation", error: err.message });
  }
};

// 📌 Get all reservations (Admin/Manager)
exports.getAllReservations = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Populate customer data if you have a reference
    const reservations = await Reservation.find({ restaurantId })
      .populate('customerId', 'name phoneNumber address') // Adjust field names as per your Customer model
      .exec();

    // Transform data to match frontend expectations
    const transformedReservations = reservations.map(reservation => ({
      reservationDetails: {
        id: reservation._id, // or use a numeric ID if you have one
        _id: reservation._id,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        payment: reservation.payment,
        advance: reservation.advance,
        notes: reservation.notes,
        tableNumber: reservation.tableNumber,
        customerId: reservation.customerId?._id || reservation.customerId
      },
      customerName: reservation.customerId?.name || 'N/A',
      customerPhoneNumber: reservation.customerId?.phoneNumber || 'N/A',
      customerAddress: reservation.customerId?.address || 'N/A'
    }));

    res.json(transformedReservations);
  } catch (err) {
    console.log(err, "reservation err");
    res.status(500).json({
      message: "Error fetching reservations",
      error: err.message,
    });
  }
};
// 📌 Get reservations by Restaurant
exports.getReservationsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const reservations = await Reservation.findById({ restaurantId })

    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: "Error fetching restaurant reservations", error: err.message });
  }
};

// 📌 Get reservations by User
exports.getReservationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const reservations = await Reservation.find({ userId })
      .populate("restaurantId", "restName");

    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user reservations", error: err.message });
  }
};

// 📌 Update reservation (change date/time/guests)
exports.updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findByIdAndUpdate(id, req.body, { new: true });

    if (!reservation) return res.status(404).json({ message: "Reservation not found" });

    res.json({ message: "Reservation updated successfully", reservation });
  } catch (err) {
    res.status(500).json({ message: "Error updating reservation", error: err.message });
  }
};

// 📌 Cancel reservation
exports.cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findByIdAndDelete(id);

    if (!reservation) return res.status(404).json({ message: "Reservation not found" });

    res.json({ message: "Reservation cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error cancelling reservation", error: err.message });
  }
};
