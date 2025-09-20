const express = require('express');
const router = express.Router();
const {authMiddleware} = require('../middleware/authMiddleware');
const {
  getFloors,
  createFloor,
  updateFloor,
  deleteFloor,
  addTableToFloor,
  removeTableFromFloor,
} = require('../controllers/floorController');

// All routes require authentication
router.use(authMiddleware);

// Get all floors for a restaurant
router.get('/restaurants/:restaurantId/floors', authMiddleware, getFloors);

// Create a new floor
router.post('/restaurants/:restaurantId/floors', authMiddleware, createFloor);

// Update floor
router.put('/restaurants/:restaurantId/floors/:id', authMiddleware, updateFloor);

// Delete floor
router.delete('/restaurants/:restaurantId/floors/:id', authMiddleware, deleteFloor);

// Add table to floor
router.post('/restaurants/:restaurantId/floors/:id/add-table', authMiddleware, addTableToFloor);

// Remove table from floor
router.post('/restaurants/:restaurantId/floors/:id/remove-table', authMiddleware, removeTableFromFloor);

module.exports = router;