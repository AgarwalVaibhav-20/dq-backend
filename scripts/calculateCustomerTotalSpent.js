const mongoose = require('mongoose');
const Customer = require('../model/Customer');
const Order = require('../model/Order');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resturadent', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Calculate total spent for all customers
const calculateAllCustomerTotalSpent = async () => {
  try {
    console.log('Starting calculation of customer total spent...');
    
    // Get all customers
    const customers = await Customer.find({});
    console.log(`Found ${customers.length} customers to process`);

    let updatedCount = 0;
    let totalCalculated = 0;

    for (const customer of customers) {
      // Calculate total spent from completed/served orders
      const orders = await Order.find({ 
        customerId: customer._id,
        status: { $in: ['completed', 'served'] }
      });

      const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      // Update customer's totalSpent
      await Customer.findByIdAndUpdate(
        customer._id,
        { totalSpent },
        { new: true }
      );

      console.log(`Customer: ${customer.name} - Total Spent: ₹${totalSpent} (${orders.length} orders)`);
      updatedCount++;
      totalCalculated += totalSpent;
    }

    console.log(`\n✅ Successfully updated ${updatedCount} customers`);
    console.log(`💰 Total calculated amount: ₹${totalCalculated}`);
    
  } catch (error) {
    console.error('Error calculating customer total spent:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await calculateAllCustomerTotalSpent();
  await mongoose.connection.close();
  console.log('Database connection closed');
  process.exit(0);
};

// Run the script
main().catch(error => {
  console.error('Script execution error:', error);
  process.exit(1);
});
