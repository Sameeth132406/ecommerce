const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc  Get all products (with filtering, search, pagination)
// @route GET /api/products
// @access Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    keyword, category, minPrice, maxPrice, rating,
    sort, page = 1, limit = 12, brand, inStock,
  } = req.query;

  const query = {};

  if (keyword) {
    query.$text = { $search: keyword };
  }
  if (category) query.category = category;
  if (brand) query.brand = { $regex: brand, $options: 'i' };
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (rating) query.ratings = { $gte: Number(rating) };
  if (inStock === 'true') query.stock = { $gt: 0 };

  // Sorting
  let sortObj = {};
  switch (sort) {
    case 'price_asc': sortObj = { price: 1 }; break;
    case 'price_desc': sortObj = { price: -1 }; break;
    case 'rating': sortObj = { ratings: -1 }; break;
    case 'newest': sortObj = { createdAt: -1 }; break;
    case 'popular': sortObj = { numReviews: -1 }; break;
    default: sortObj = { createdAt: -1 };
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query).sort(sortObj).skip(skip).limit(limitNum),
    Product.countDocuments(query),
  ]);

  res.json({
    success: true,
    products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

// @desc  Get featured products
// @route GET /api/products/featured
// @access Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true }).limit(8);
  res.json({ success: true, products });
});

// @desc  Get product categories
// @route GET /api/products/categories
// @access Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  res.json({ success: true, categories });
});

// @desc  Get single product
// @route GET /api/products/:id
// @access Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('reviews.user', 'name avatar');
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, product });
});

// @desc  Create product
// @route POST /api/products
// @access Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({ ...req.body, seller: req.user._id });
  res.status(201).json({ success: true, product });
});

// @desc  Update product
// @route PUT /api/products/:id
// @access Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, product });
});

// @desc  Delete product
// @route DELETE /api/products/:id
// @access Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted' });
});

// @desc  Add review
// @route POST /api/products/:id/reviews
// @access Private
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString());
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  });

  product.updateRatings();
  await product.save();

  res.status(201).json({ success: true, message: 'Review added', reviews: product.reviews });
});

// @desc  Delete review
// @route DELETE /api/products/:id/reviews/:reviewId
// @access Private
const deleteReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const review = product.reviews.id(req.params.reviewId);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Only review author or admin can delete
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  product.reviews.pull(req.params.reviewId);
  product.updateRatings();
  await product.save();

  res.json({ success: true, message: 'Review deleted' });
});

// @desc  Get admin stats for products
// @route GET /api/products/admin/stats
// @access Admin
const getProductStats = asyncHandler(async (req, res) => {
  const [total, lowStock, outOfStock, byCategory] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ stock: { $gt: 0, $lte: 10 } }),
    Product.countDocuments({ stock: 0 }),
    Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
      { $sort: { count: -1 } },
    ]),
  ]);
  res.json({ success: true, total, lowStock, outOfStock, byCategory });
});

module.exports = {
  getProducts, getFeaturedProducts, getCategories,
  getProductById, createProduct, updateProduct, deleteProduct,
  addReview, deleteReview, getProductStats,
};
