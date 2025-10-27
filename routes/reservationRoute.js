const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/ReservationController");
const {authMiddleware} = require("../middleware/authMiddleware");

// Create reservation
router.post("/add", authMiddleware, reservationController.createReservation);

router.get("/all", authMiddleware, reservationController.getAllReservations);
router.get("/debug/all", authMiddleware, reservationController.getAllReservations);

// Debug route to get all reservations
// router.get("/debug/all", reservationController.getAllReservationsDebug);

// Get reservations by restaurant
// router.get("/restaurant/:restaurantId", authMiddleware, reservationController.getReservationsByRestaurant);

// Get reservations by user
// router.get("/user/:userId", authMiddleware, reservationController.getReservationsByUser);

// Update reservation
router.put("/:id", authMiddleware, reservationController.updateReservation);

// Cancel reservation
router.delete("/:id", authMiddleware, reservationController.cancelReservation);

module.exports = router;
