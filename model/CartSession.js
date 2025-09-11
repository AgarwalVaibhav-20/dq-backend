const mongoose = require('mongoose');

const cartSessionSchema = new mongoose.Schema({
    tableNumber: {
        type: String,
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
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        selectedSubcategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SubCategory',
            default: null
        },
        selectedSubcategoryName: {
            type: String,
            default: ''
        }
    }],
    startTime: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    tax: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    roundOff: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Update lastUpdated on save
cartSessionSchema.pre('save', function (next) {
    this.lastUpdated = new Date();
    next();
});

// Compound index for restaurant and table
cartSessionSchema.index({ restaurantId: 1, tableNumber: 1 });

module.exports = mongoose.model('CartSession', cartSessionSchema);
