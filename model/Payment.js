const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
paymentId: {
type: String,
unique: true,
required: true
},
transactionId: {
type: mongoose.Schema.Types.ObjectId,
ref: 'Transaction',
required: true
},
restaurantId: {
type: mongoose.Schema.Types.ObjectId,
ref: 'Restaurant',
required: true
},
amount: {
type: Number,
required: true
},
paymentType: {
type: String,
enum: ['cash', 'online', 'card', 'upi', 'netbanking', 'wallet'],
required: true
},
paymentMethod: {
type: String, // e.g., 'Paytm', 'PhonePe', 'Visa Card ending 1234', etc.
default: ''
},
referenceNumber: {
type: String,
default: ''
},
status: {
type: String,
enum: ['pending', 'completed', 'failed', 'refunded'],
default: 'completed'
},
receivedAmount: {
type: Number,
default: 0
},
changeAmount: {
type: Number,
default: 0
},
processedAt: {
type: Date,
default: Date.now
},
processedBy: {
type: mongoose.Schema.Types.ObjectId,
ref: 'User',
required: true
},
notes: {
type: String,
default: ''
}
}, {
timestamps: true
});

// Generate unique payment ID before saving
paymentSchema.pre('save', function(next) {
if (!this.paymentId) {
const timestamp = Date.now().toString().slice(-8);
const random = Math.random().toString(36).substr(2, 4).toUpperCase();
this.paymentId = PAY${timestamp}${random};
}
next();
});

module.exports = mongoose.model('Payment', paymentSchema);