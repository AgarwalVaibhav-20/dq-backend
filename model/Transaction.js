const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      index: true,
    },

    // Who created the transaction (e.g., staff user)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // If transaction belongs to a registered customer
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },

    // Restaurant where transaction happened
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },

    // Table info (if dine-in)
    tableNumber: {
      type: String,
      required: true,
    },

    // Transaction status
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },

    // Items purchased
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Menu',
          required: true,
        },
        itemName: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        selectedSubcategoryId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'SubCategory',
          default: null,
        },
        subtotal: {
          type: Number,
          required: true,
        },
      },
    ],

    // Bill details
    sub_total: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0, // percentage
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0, // percentage
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    roundOff: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },

    // Payment details
    type: {
      type: String,
      enum: ['Cash', 'Online', 'Card', 'Split'],
      required: true,
    },

    // Additional notes
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

// 🔹 Pre-save hook
transactionSchema.pre('save', function (next) {
  // Generate unique transaction ID if missing
  if (!this.transactionId) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.transactionId = `TXN${timestamp}${random}`;
  }

  // Recalculate item subtotals
  this.items.forEach((item) => {
    item.subtotal = item.price * item.quantity;
  });

  // Calculate sub_total
  this.sub_total = this.items.reduce((sum, item) => sum + item.subtotal, 0);

  // Tax & Discount amounts
  this.taxAmount = (this.sub_total * this.tax) / 100;
  this.discountAmount = (this.sub_total * this.discount) / 100;

  // Final total
  this.total =
    this.sub_total + this.taxAmount - this.discountAmount + this.roundOff;

  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);


// const mongoose = require('mongoose');

// const transactionSchema = new mongoose.Schema({
//   transactionId: {
//     type: String,
//     unique: true,
//     index: true
//   },
//   userId: {
//     type: String
//   },
//   username: {
//     type: String
//   },
//   customerId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Customer',
//     default: null
//   },
//   restaurantId: {
//     type: String
//   },
//   tableNumber: {
//     type: String,
//     required: true
//   },
//   items: [{
//     itemId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Menu',
//       required: true
//     },
//     itemName: {
//       type: String,
//       required: true
//     },
//     price: {
//       type: Number,
//       required: true
//     },
//     quantity: {
//       type: Number,
//       required: true,
//       min: 1
//     },
//     selectedSubcategoryId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'SubCategory',
//       default: null
//     },
//     subtotal: {
//       type: Number,
//       required: true
//     }
//   }],
//   sub_total: {
//     type: Number,
//     required: true
//   },
//   tax: {
//     type: Number,
//     default: 0
//   },
//   taxAmount: {
//     type: Number,
//     default: 0
//   },
//   discount: {
//     type: Number,
//     default: 0
//   },
//   discountAmount: {
//     type: Number,
//     default: 0
//   },
//   roundOff: {
//     type: Number,
//     default: 0
//   },
//   total: {
//     type: Number,
//     required: true
//   },
//   type: {
//     type: String,
//     enum: ['Cash', 'Online', 'Card', 'split'],
//     required: true
//   },
//   notes: {
//     type: String,
//     default: ''
//   }
// }, {
//   timestamps: true
// });

// // Generate unique transaction ID before saving
// transactionSchema.pre('save', function (next) {
//   if (!this.transactionId) {
//     const timestamp = Date.now().toString().slice(-8);
//     const random = Math.random().toString(36).substr(2, 4).toUpperCase();
//     this.transactionId = `TXN${timestamp}${random}`;
//   }

//   // Calculate item subtotals
//   this.items.forEach(item => {
//     item.subtotal = item.price * item.quantity;
//   });

//   // Calculate tax and discount amounts
//   this.taxAmount = (this.sub_total * this.tax) / 100;
//   this.discountAmount = (this.sub_total * this.discount) / 100;

//   next();
// });

// module.exports = mongoose.model('Transaction', transactionSchema);
