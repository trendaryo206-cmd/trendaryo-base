const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: String,
        price: Number,
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        image: String,
        sku: String,
        variant: {
          type: String,
          default: null,
        },
      },
    ],
    shippingAddress: {
      type: {
        type: String,
        enum: ['home', 'work', 'other'],
        default: 'home',
      },
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
      contactName: String,
      contactPhone: String,
    },
    billingAddress: {
      sameAsShipping: {
        type: Boolean,
        default: true,
      },
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountCode: String,
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'paypal', 'stripe', 'apple_pay', 'google_pay'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending',
    },
    paymentDetails: {
      transactionId: String,
      paymentIntentId: String,
      receiptUrl: String,
      paidAt: Date,
    },
    shippingMethod: {
      carrier: String,
      service: String,
      estimatedDelivery: Date,
      trackingNumber: String,
      trackingUrl: String,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'processing',
        'ready_for_shipment',
        'shipped',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'returned',
        'refunded',
      ],
      default: 'pending',
    },
    statusHistory: [
      {
        status: String,
        note: String,
        changedAt: {
          type: Date,
          default: Date.now,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    notes: {
      customer: String,
      admin: String,
    },
    metadata: mongoose.Schema.Types.Mixed,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    cancelledAt: Date,
    shippedAt: Date,
    deliveredAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Generate order number before saving
orderSchema.pre('save', function (next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');

    this.orderNumber = `TR${year}${month}${day}${random}`;
  }

  // Update status history
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
    });
  }

  next();
});

// Update timestamp
orderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for order status text
orderSchema.virtual('statusText').get(function () {
  const statusMap = {
    pending: 'Order Placed',
    confirmed: 'Order Confirmed',
    processing: 'Processing',
    ready_for_shipment: 'Ready for Shipment',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    returned: 'Returned',
    refunded: 'Refunded',
  };

  return statusMap[this.status] || this.status;
});

// Virtual for estimated delivery
orderSchema.virtual('estimatedDeliveryDate').get(function () {
  if (this.shippingMethod?.estimatedDelivery) {
    return this.shippingMethod.estimatedDelivery;
  }

  // Default: 5-7 business days
  const deliveryDate = new Date(this.createdAt);
  deliveryDate.setDate(deliveryDate.getDate() + 7);
  return deliveryDate;
});

// Method to calculate totals
orderSchema.methods.calculateTotals = function () {
  this.subtotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  this.total = this.subtotal + this.shippingCost + this.tax - this.discount;
  return this.total;
};

// Method to update stock
orderSchema.methods.updateProductStock = async function () {
  for (const item of this.items) {
    const product = await mongoose.model('Product').findById(item.product);
    if (product) {
      await product.updateStock(-item.quantity);
    }
  }
};

// Method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function () {
  const nonCancellableStatuses = [
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'returned',
    'refunded',
  ];
  return !nonCancellableStatuses.includes(this.status);
};

module.exports = mongoose.model('Order', orderSchema);
