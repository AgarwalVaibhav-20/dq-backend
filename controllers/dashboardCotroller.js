const DashboardService = require('../services/DashboardServices');
const Order = require("../model/Order");
const mongoose = require('mongoose')
// ✅ Overall report
const getOverallReport = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        const stats = await Order.aggregate([
            {
                $match: {
                    restaurantId: new mongoose.Types.ObjectId(restaurantId),
                    status: "completed",
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" },
                    totalOrders: { $sum: 1 },
                    uniqueCustomers: { $addToSet: "$customerId" },
                },
            },
            {
                $project: {
                    _id: 0,
                    totalRevenue: 1,
                    totalOrders: 1,
                    totalCustomers: { $size: "$uniqueCustomers" },
                },
            },
        ]);

        console.log("📊 Stats:", stats);
        res.json(stats[0] || { totalRevenue: 0, totalOrders: 0, totalCustomers: 0 });
    } catch (error) {
        console.error("Error in getOverallReport:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};
// ✅ Chart data
const getChartData = async (req, res) => {
    try {
        const { year, restaurantId } = req.query;

        if (!restaurantId) {
            return res.status(400).json({ message: "Restaurant ID is required" });
        }

        const data = await DashboardService.fetchChartData({ year, restaurantId });
        res.json(data);
    } catch (err) {
        console.error("Error in getChartData:", err.message);
        res.status(500).json({ message: err.message || 'Failed to fetch chart data' });
    }
};


// ✅ Weekly chart data
const getWeeklyChartData = async (req, res) => {
    try {
        const { customerId } = req.params;
        const { year, restaurantId } = req.query;
        const data = await DashboardService.fetchWeeklyChartData({ year, restaurantId, customerId });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to fetch weekly chart data' });
    }
};

// ✅ Payment type statistics
const getPaymentTypeStats = async (req, res) => {
    try {
        const { startDate, endDate, restaurantId } = req.body;
        const data = await DashboardService.fetchPaymentTypeStats({ startDate, endDate, restaurantId });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to fetch payment type statistics' });
    }
};

// ✅ Dashboard stats
const getDashboardStats = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { period } = req.query;
        const data = await DashboardService.fetchDashboardStats({ restaurantId, period });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to fetch dashboard stats' });
    }
};

module.exports = {
    getOverallReport,
    getChartData,
    getWeeklyChartData,
    getPaymentTypeStats,
    getDashboardStats,
};
