const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    images: [
      {
        url: String,
        alt: String,
      },
    ],
    verifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpful: {
      count: {
        type: Number,
        default: 0,
      },
      users: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'spam'],
      default: 'pending',
    },
    moderatorNotes: String,
    reported: {
      count: {
        type: Number,
        default: 0,
      },
      reasons: [
        {
          reason: String,
          reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          reportedAt: Date,
        },
      ],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for one review per product per user
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Index for sorting
reviewSchema.index({ rating: -1, createdAt: -1 });
reviewSchema.index({ 'helpful.count': -1 });

// Pre-save middleware to update product ratings
reviewSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('rating') || this.isModified('status')) {
    const Product = mongoose.model('Product');
    const product = await Product.findById(this.product);

    if (product) {
      const reviews = await this.constructor.find({
        product: this.product,
        status: 'approved',
      });

      const ratings = reviews.map((r) => r.rating);
      const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;

      // Calculate distribution
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      ratings.forEach((rating) => {
        distribution[rating]++;
      });

      product.ratings.average = average;
      product.ratings.count = ratings.length;
      product.ratings.distribution = distribution;

      await product.save();
    }
  }
  next();
});

// Method to mark as helpful
reviewSchema.methods.markHelpful = async function (userId) {
  if (!this.helpful.users.includes(userId)) {
    this.helpful.users.push(userId);
    this.helpful.count++;
    await this.save();
    return true;
  }
  return false;
};

// Method to unmark as helpful
reviewSchema.methods.unmarkHelpful = async function (userId) {
  const index = this.helpful.users.indexOf(userId);
  if (index > -1) {
    this.helpful.users.splice(index, 1);
    this.helpful.count--;
    await this.save();
    return true;
  }
  return false;
};

module.exports = mongoose.model('Review', reviewSchema);
