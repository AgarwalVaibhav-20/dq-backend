const mongoose = require('mongoose');
const Order = require('../model/Order');
const Customer = require('../model/Customer');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database-name');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Update all orders with customer addresses
const updateAllOrderAddresses = async () => {
  try {
    console.log('🔄 Starting to update all order addresses...');
    
    // Find all orders that have customerId but no customerAddress
    const orders = await Order.find({
      customerId: { $exists: true, $ne: null },
      $or: [
        { customerAddress: { $exists: false } },
        { customerAddress: null },
        { customerAddress: '' }
      ]
    }).populate('customerId', 'name email address');

    console.log(`📊 Found ${orders.length} orders to update`);

    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const order of orders) {
      if (order.customerId && order.customerId.address) {
        order.customerAddress = order.customerId.address;
        await order.save();
        updatedCount++;
        console.log(`✅ Updated order ${order.orderId} with address: ${order.customerId.address}`);
      } else {
        skippedCount++;
        console.log(`⚠️ Skipped order ${order.orderId} - no customer address available`);
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`   - Orders updated: ${updatedCount}`);
    console.log(`   - Orders skipped: ${skippedCount}`);
    console.log(`   - Total processed: ${orders.length}`);
    
  } catch (error) {
    console.error('❌ Error updating order addresses:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the update
connectDB().then(() => {
  updateAllOrderAddresses();
});
