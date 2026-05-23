const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  originalPrice: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Beauty', 'Automotive', 'Food', 'Other'],
  },
  brand: {
    type: String,
    default: 'Generic',
  },
  images: [{ type: String }],
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  ratings: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  reviews: [reviewSchema],
  isFeatured: {
    type: Boolean,
    default: false,
  },
  tags: [{ type: String }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Index for search
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });

// Update ratings when a review is added
productSchema.methods.updateRatings = function () {
  if (this.reviews.length === 0) {
    this.ratings = 0;
    this.numReviews = 0;
  } else {
    this.numReviews = this.reviews.length;
    this.ratings = this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length;
  }
};

module.exports = mongoose.model('Product', productSchema);
