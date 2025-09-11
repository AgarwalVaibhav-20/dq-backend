const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
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
        ref: 'User',
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        default: null
    },
    tableNumber: {
        type: String,
        required: true
    },
    invoiceDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
        default: 'paid'
    },
    pdfPath: {
        type: String,
        default: ''
    },
    emailSent: {
        type: Boolean,
        default: false
    },
    emailSentAt: {
        type: Date,
        default: null
    },
    printedCount: {
        type: Number,
        default: 0
    },
    lastPrintedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Generate unique invoice number before saving
invoiceSchema.pre('save', function (next) {
    if (!this.invoiceNumber) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const timestamp = Date.now().toString().slice(-6);
        this.invoiceNumber = INV${ year }${ month }${ timestamp };
    }
    next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);