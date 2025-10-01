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

// Test the customerAddress functionality
const testCustomerAddress = async () => {
  try {
    console.log('🧪 Testing customerAddress functionality...\n');
    
    // Test 1: Check existing orders
    console.log('📋 Test 1: Checking existing orders...');
    const orders = await Order.find({})
      .populate('customerId', 'name email address')
      .limit(5);
    
    console.log(`Found ${orders.length} orders:`);
    orders.forEach(order => {
      console.log(`   - Order: ${order.orderId}`);
      console.log(`     Customer Name: ${order.customerName}`);
      console.log(`     Customer Address (stored): ${order.customerAddress || 'Not set'}`);
      console.log(`     Customer Address (from customer): ${order.customerId?.address || 'Not available'}`);
      console.log('');
    });
    
    // Test 2: Create a test order with customerId
    console.log('📋 Test 2: Creating test order...');
    const testCustomer = await Customer.findOne({});
    if (testCustomer) {
      const testOrder = new Order({
        customerId: testCustomer._id,
        customerName: testCustomer.name,
        items: [{ itemId: new mongoose.Types.ObjectId(), itemName: 'Test Item', price: 100, quantity: 1, subtotal: 100 }],
        totalAmount: 100,
        subtotal: 100,
        restaurantId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        tableNumber: 'TEST-1'
      });
      
      await testOrder.save();
      console.log(`✅ Created test order: ${testOrder.orderId}`);
      console.log(`   Customer Address: ${testOrder.customerAddress}`);
      
      // Clean up test order
      await Order.findByIdAndDelete(testOrder._id);
      console.log('🧹 Cleaned up test order');
    } else {
      console.log('⚠️ No customers found to test with');
    }
    
  } catch (error) {
    console.error('❌ Error testing customer address:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the test
connectDB().then(() => {
  testCustomerAddress();
});
