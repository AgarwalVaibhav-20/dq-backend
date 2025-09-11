const mongoose = require('mongoose');

const kotSchema = new mongoose.Schema({
kotNumber: {
type: String,
unique: true,
required: true
},
transactionId: {
type: mongoose.Schema.Types.ObjectId,
ref: 'Transaction',
default: null
},
restaurantId: {
type: mongoose.Schema.Types.ObjectId,
ref: 'Restaurant',
required: true
},
tableNumber: {
type: String,
required: true
},
customerId: {
type: mongoose.Schema.Types.ObjectId,
ref: 'Customer',
default: null
},
items: [{
itemId: {
type: mongoose.Schema.Types.ObjectId,
ref: 'MenuItem',
required: true
},
itemName: {
type: String,
required: true
},
quantity: {
type: Number,
required: true
},
selectedSubcategoryId: {
type: mongoose.Schema.Types.ObjectId,
ref: 'SubCategory',
default: null
},
selectedSubcategoryName: {
type: String,
default: ''
},
status: {
type: String,
enum: ['pending', 'preparing', 'ready', 'served'],
default: 'pending'
},
specialInstructions: {
type: String,
default: ''
},
price: {
type: Number,
required: true
}
}],
status: {
type: String,
enum: ['active', 'completed', 'cancelled'],
default: 'active'
},
printedAt: {
type: Date,
default: Date.now
},
completedAt: {
type: Date,
default: null
},
totalItems: {
type: Number,
default: 0
}
}, {
timestamps: true
});

// Generate unique KOT number and calculate totals before saving
kotSchema.pre('save', function(next) {
if (!this.kotNumber) {
const timestamp = Date.now().toString().slice(-6);
const random = Math.random().toString(36).substr(2, 3).toUpperCase();
this.kotNumber = KOT${timestamp}${random};
}

// Calculate total items
this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);

next();
});

module.exports = mongoose.model('KOT', kotSchema);