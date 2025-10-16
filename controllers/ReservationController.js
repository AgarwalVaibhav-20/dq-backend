// const Reservation = require("../model/Reservation");
// // 📌 Create Reservation
// exports.createReservation = async (req, res) => {
//   try {
//     const { restaurantId,
//       customerId,
//       startTime,
//       endTime,
//       customerName,
//       tableNumber,
//       advance,
//       payment,
//       notes, } = req.body;

//     const reservation = new Reservation({
//       restaurantId,
//       customerId,
//       customerName,
//       startTime,
//       endTime,
//       tableNumber,
//       advance,
//       payment,
//       notes,
//     });

//     await reservation.save();
//     res.status(201).json({ message: "Reservation created successfully", reservation });
//   } catch (err) {
//     console.log("Error", err)
//     res.status(500).json({ message: "Error creating reservation", error: err.message });
//   }
// };

// // 📌 Get all reservations (Admin/Manager)
// exports.getAllReservations = async (req, res) => {
//   try {
//     const restaurantId = req.query.restaurantId || req.userId;

//     console.log("🔍 Searching for reservations with restaurantId:", restaurantId);

//     // Populate customer data if you have a reference
//     const reservations = await Reservation.find({ restaurantId })
//       .populate('customerId', 'name phoneNumber address') // Adjust field names as per your Customer model
//       .exec();

//     console.log("📊 Found reservations:", reservations.length);

//     // Transform data to match frontend expectations
//     const transformedReservations = reservations.map(reservation => ({
//       _id: reservation._id,
//       id: reservation._id,
//       startTime: reservation.startTime,
//       endTime: reservation.endTime,
//       payment: reservation.payment,
//       advance: reservation.advance,
//       notes: reservation.notes,
//       tableNumber: reservation.tableNumber,
//       customerId: reservation.customerId?._id || reservation.customerId,
//       customerName: reservation.customerId?.name || reservation.customerName || 'N/A',
//       customerPhoneNumber: reservation.customerId?.phoneNumber || 'N/A',
//       customerAddress: reservation.customerId?.address || 'N/A',
//       createdAt: reservation.createdAt,
//       updatedAt: reservation.updatedAt
//     }));

//     res.json(transformedReservations);
//   } catch (err) {
//     console.log(err, "reservation err");
//     res.status(500).json({
//       message: "Error fetching reservations",
//       error: err.message,
//     });
//   }
// };

// // 📌 Get ALL reservations (for debugging)
// // exports.getAllReservationsDebug = async (req, res) => {
// //   try {
// //     const restaurantId = req.query.restaurantId || req.userId;

// //     console.log("🔍 Searching for reservations with restaurantId:", restaurantId);

// //     // Populate customer data if you have a reference
// //     const reservations = await Reservation.find({ restaurantId })
// //       .populate('customerId', 'name phoneNumber address')
// //       .exec();

// //     console.log("📊 Total reservations in database:", allReservations.length);

// //     // Group by restaurantId to see distribution
// //     const groupedByRestaurant = {};
// //     allReservations.forEach(reservation => {
// //       const restaurantId = reservation.restaurantId;
// //       if (!groupedByRestaurant[restaurantId]) {
// //         groupedByRestaurant[restaurantId] = [];
// //       }
// //       groupedByRestaurant[restaurantId].push(reservation);
// //     });

// //     console.log("📊 Reservations grouped by restaurantId:", Object.keys(groupedByRestaurant).map(id => ({
// //       restaurantId: id,
// //       count: groupedByRestaurant[id].length
// //     })));

// //     // Transform data to match frontend expectations
// //     const transformedReservations = allReservations.map(reservation => ({
// //       _id: reservation._id,
// //       id: reservation._id,
// //       restaurantId: reservation.restaurantId, // Include restaurantId for debugging
// //       startTime: reservation.startTime,
// //       endTime: reservation.endTime,
// //       payment: reservation.payment,
// //       advance: reservation.advance,
// //       notes: reservation.notes,
// //       tableNumber: reservation.tableNumber,
// //       customerId: reservation.customerId?._id || reservation.customerId,
// //       customerName: reservation.customerId?.name || reservation.customerName || 'N/A',
// //       customerPhoneNumber: reservation.customerId?.phoneNumber || 'N/A',
// //       customerAddress: reservation.customerId?.address || 'N/A',
// //       createdAt: reservation.createdAt,
// //       updatedAt: reservation.updatedAt
// //     }));

// //     res.json({
// //       totalCount: transformedReservations.length,
// //       groupedByRestaurant: Object.keys(groupedByRestaurant).map(id => ({
// //         restaurantId: id,
// //         count: groupedByRestaurant[id].length
// //       })),
// //       reservations: transformedReservations
// //     });
// //   } catch (err) {
// //     console.log(err, "reservation debug err");
// //     res.status(500).json({
// //       message: "Error fetching all reservations",
// //       error: err.message,
// //     });
// //   }
// // };
// // 📌 Get reservations by Restaurant
// exports.getReservationsByRestaurant = async (req, res) => {
//   try {
//     const { restaurantId } = req.params;
//     const reservations = await Reservation.findById({ restaurantId })

//     res.json(reservations);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching restaurant reservations", error: err.message });
//   }
// };

// // 📌 Get reservations by User
// exports.getReservationsByUser = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const reservations = await Reservation.find({ userId })
//       .populate("restaurantId", "restName");

//     res.json(reservations);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching user reservations", error: err.message });
//   }
// };

// // 📌 Update reservation (change date/time/guests)
// exports.updateReservation = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;

//     // Remove undefined values and convert dates properly
//     const cleanUpdateData = {};
//     Object.keys(updateData).forEach(key => {
//       if (updateData[key] !== undefined && updateData[key] !== null) {
//         cleanUpdateData[key] = updateData[key];
//       }
//     });

//     const reservation = await Reservation.findByIdAndUpdate(
//       id,
//       cleanUpdateData,
//       { new: true, runValidators: true }
//     );

//     if (!reservation) {
//       return res.status(404).json({
//         success: false,
//         message: "Reservation not found"
//       });
//     }

//     res.json({
//       success: true,
//       message: "Reservation updated successfully",
//       reservation
//     });
//   } catch (err) {
//     console.error("Update reservation error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Error updating reservation",
//       error: err.message
//     });
//   }
// };

// // 📌 Cancel reservation
// exports.cancelReservation = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const reservation = await Reservation.findByIdAndDelete(id);

//     if (!reservation) {
//       return res.status(404).json({
//         success: false,
//         message: "Reservation not found"
//       });
//     }

//     res.json({
//       success: true,
//       message: "Reservation cancelled successfully"
//     });
//   } catch (err) {
//     console.error("Delete reservation error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Error cancelling reservation",
//       error: err.message
//     });
//   }
// };

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
      notes, } = req.body;

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
    console.log("Error", err)
    res.status(500).json({ message: "Error creating reservation", error: err.message });
  }
};

// 📌 Get all reservations (Admin/Manager)
exports.getAllReservations = async (req, res) => {
  try {
    // 🔥 ALWAYS use req.userId (which is user.restaurantId from user collection)
    const restaurantId = req.userId;

    console.log("🔍 Searching for reservations with restaurantId:", restaurantId);

    // Populate customer data if you have a reference
    const reservations = await Reservation.find({ restaurantId })
      .populate('customerId', 'name phoneNumber address') // Adjust field names as per your Customer model
      .exec();

    console.log("📊 Found reservations:", reservations.length);

    // Transform data to match frontend expectations
    const transformedReservations = reservations.map(reservation => ({
      _id: reservation._id,
      id: reservation._id,
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      payment: reservation.payment,
      advance: reservation.advance,
      notes: reservation.notes,
      tableNumber: reservation.tableNumber,
      customerId: reservation.customerId?._id || reservation.customerId,
      customerName: reservation.customerId?.name || reservation.customerName || 'N/A',
      customerPhoneNumber: reservation.customerId?.phoneNumber || 'N/A',
      customerAddress: reservation.customerId?.address || 'N/A',
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt
    }));

    // Return data wrapped in a 'reservations' object to match frontend expectations
    res.json({ reservations: transformedReservations });
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
    const updateData = req.body;

    // Remove undefined values and convert dates properly
    const cleanUpdateData = {};
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && updateData[key] !== null) {
        cleanUpdateData[key] = updateData[key];
      }
    });

    const reservation = await Reservation.findByIdAndUpdate(
      id,
      cleanUpdateData,
      { new: true, runValidators: true }
    );

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found"
      });
    }

    res.json({
      success: true,
      message: "Reservation updated successfully",
      reservation
    });
  } catch (err) {
    console.error("Update reservation error:", err);
    res.status(500).json({
      success: false,
      message: "Error updating reservation",
      error: err.message
    });
  }
};

// 📌 Cancel reservation
exports.cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findByIdAndDelete(id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found"
      });
    }

    res.json({
      success: true,
      message: "Reservation cancelled successfully"
    });
  } catch (err) {
    console.error("Delete reservation error:", err);
    res.status(500).json({
      success: false,
      message: "Error cancelling reservation",
      error: err.message
    });
  }
};