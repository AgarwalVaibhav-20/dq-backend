const Restaurant = require('../model/Restaurants');
const { validationResult } = require('express-validator');

// Helper to handle validation errors
const handleValidationErrors = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ success: false, message: 'Validation Error', errors: errors.array() });
        return true;
    }
    return false;
};

// Helper to check ownership or admin
const checkOwnership = (restaurant, user) => {
    return restaurant.restaurantId.toString() === user._id.toString() || user.role === 'admin';
};

// @desc Get all restaurants
const getAllRestaurants = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, city, cuisine, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const filter = {};

        filter.restaurantId = req.userId

        if (status) filter.status = status;
        if (city) filter.city = new RegExp(city, 'i');
        if (cuisine) filter.cuisine = new RegExp(cuisine, 'i');
        if (search) {
            filter.$or = [
                { restaurantName: new RegExp(search, 'i') },
                { ownerName: new RegExp(search, 'i') },
                { cuisine: new RegExp(search, 'i') },
                { city: new RegExp(search, 'i') },
                { features: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        const restaurants = await Restaurant.find(filter)
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit);
            // .populate('restaurantId', 'name email')

        const total = await Restaurant.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: restaurants.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            restaurants
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc Get restaurant by ID
const getRestaurantById = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id)
        // .populate('restaurantId', 'name email');
        if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
        res.status(200).json({ success: true, restaurant });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc Create or Update restaurant common logic
const parseRestaurantData = (data, file) => {
    const restaurantData = { ...data };
    if (file) restaurantData.restaurantImage = file.path;

    if (typeof restaurantData.features === 'string') {
        try { restaurantData.features = JSON.parse(restaurantData.features); } catch { restaurantData.features = []; }
    }
    if (typeof restaurantData.operatingHours === 'string') {
        try { restaurantData.operatingHours = JSON.parse(restaurantData.operatingHours); } catch { restaurantData.operatingHours = {}; }
    }
    return restaurantData;
};

// @desc Create new restaurant
const createRestaurant = async (req, res) => {
    try {
        if (handleValidationErrors(req, res)) return;

        const restaurantData = parseRestaurantData(req.body, req.file);
        restaurantData.restaurantId = req.user._id;

        const restaurant = new Restaurant(restaurantData);
        await restaurant.save();
        // await restaurant.populate('restaurantId', 'name email');
        res.status(201).json({
            success: true,
            message: 'Restaurant created successfully',
            restaurant: {
                ...restaurant.toObject(),
                restaurantId: restaurantData.restaurantId.toString() // Only send ID as a string
            }
        });
        // res.status(201).json({ success: true, message: 'Restaurant created successfully', restaurant });
    } catch (error) {
        // if (error.code === 11000) {
        //     const field = Object.keys(error.keyPattern)[0];
        //     return res.status(400).json({ success: false, message: field === 'email' ? 'Email already registered' : `${field} already exists` });
        // }
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc Update restaurant
const updateRestaurant = async (req, res) => {
    try {
        if (handleValidationErrors(req, res)) return;

        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

        if (!checkOwnership(restaurant, req.user)) return res.status(403).json({ success: false, message: 'Not authorized' });

        const updateData = parseRestaurantData(req.body, req.file);

        const updatedRestaurant = await Restaurant.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
            // .populate('restaurantId', 'name email');

        res.status(200).json({ success: true, message: 'Restaurant updated successfully', restaurant: updatedRestaurant });
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ success: false, message: field === 'email' ? 'Email already registered' : `${field} already exists` });
        }
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc Delete restaurant
const deleteRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

        if (!checkOwnership(restaurant, req.user)) return res.status(403).json({ success: false, message: 'Not authorized' });

        await Restaurant.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Restaurant deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc Update restaurant status
const updateRestaurantStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['active', 'inactive', 'pending', 'suspended'];
        if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

        const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true })
            // .populate('restaurantId', 'name email');

        if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

        res.status(200).json({ success: true, message: 'Restaurant status updated', restaurant });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc Get restaurants by city or cuisine or search
const getRestaurantsByField = async (req, res, field) => {
    try {
        const value = req.params[field];
        const method = field === 'city' ? 'getRestaurantsByCity' : field === 'cuisine' ? 'getRestaurantsByCuisine' : 'searchRestaurants';
        const restaurants = await Restaurant[method](value)
        // .populate('restaurantId', 'name email');

        res.status(200).json({ success: true, count: restaurants.length, restaurants });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc Toggle restaurant status
const toggleRestaurantStatus = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
        if (!checkOwnership(restaurant, req.user)) return res.status(403).json({ success: false, message: 'Not authorized' });

        await restaurant.toggleStatus();
        // await restaurant.populate('restaurantId', 'name email');

        res.status(200).json({ success: true, message: 'Restaurant status toggled', restaurant });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc Get restaurant statistics
const getRestaurantStats = async (req, res) => {
    try {
        const total = await Restaurant.countDocuments();
        const statusCounts = await Restaurant.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const topCuisines = await Restaurant.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: '$cuisine', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        const topCities = await Restaurant.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: '$city', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.status(200).json({
            success: true,
            stats: { total, statusCounts, cuisineStats: topCuisines, cityStats: topCities }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getAllRestaurants,
    getRestaurantById,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    updateRestaurantStatus,
    toggleRestaurantStatus,
    getRestaurantStats,
    getRestaurantsByCity: (req, res) => getRestaurantsByField(req, res, 'city'),
    getRestaurantsByCuisine: (req, res) => getRestaurantsByField(req, res, 'cuisine'),
    searchRestaurants: (req, res) => getRestaurantsByField(req, res, 'searchTerm')
};
