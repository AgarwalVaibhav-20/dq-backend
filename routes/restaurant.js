const express = require('express');
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const upload = require('../middleware/upload');

const {
    getAllRestaurants,
    getRestaurantById,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    updateRestaurantStatus,
    getRestaurantsByCity,
    getRestaurantsByCuisine,
    searchRestaurants,
    toggleRestaurantStatus,
    getRestaurantStats
} = require('../controllers/RestaurantController');

// Restaurant statistics
router.get('/stats', authMiddleware, getRestaurantStats);

// Search, filter
router.get('/search/:searchTerm', authMiddleware, searchRestaurants);
router.get('/city/:city', authMiddleware, getRestaurantsByCity);
router.get('/cuisine/:cuisine', authMiddleware, getRestaurantsByCuisine);

// CRUD operations
router.get('/all/restaurants', authMiddleware, getAllRestaurants);
router.get('/:id', authMiddleware, getRestaurantById);
router.post('/create/restaurants/', authMiddleware, upload.single('restaurantImage'), createRestaurant);
router.put('/:id', authMiddleware, upload.single('restaurantImage'), updateRestaurant);
router.delete('/:id', authMiddleware, deleteRestaurant);

// Status updates
router.patch('/:id/status', authMiddleware, updateRestaurantStatus);
router.patch('/:id/toggle-status', authMiddleware, toggleRestaurantStatus);

module.exports = router;
