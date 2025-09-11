const Order = require('../model/Order');

const DashboardService = {
    async fetchOverallReport(restaurantId) {
        const totalSales = await Order.aggregate([
            { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId), status: 'completed' } },
            { $group: { _id: null, sales: { $sum: "$totalAmount" }, orders: { $sum: 1 } } }
        ]);

        return {
            sales: totalSales[0]?.sales || 0,
            orders: totalSales[0]?.orders || 0,
        };
    },

    async fetchPaymentTypeStats({ startDate, endDate, restaurantId }) {
        return await Order.aggregate([
            {
                $match: {
                    restaurantId: new mongoose.Types.ObjectId(restaurantId),
                    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
                },
            },
            { $group: { _id: "$paymentType", total: { $sum: "$totalAmount" } } },
        ]);
    },
};

module.exports = DashboardService
