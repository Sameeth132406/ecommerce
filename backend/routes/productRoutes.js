const express = require('express');
const router = express.Router();
const {
  getProducts, getFeaturedProducts, getCategories,
  getProductById, createProduct, updateProduct, deleteProduct,
  addReview, deleteReview, getProductStats,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/admin/stats', protect, admin, getProductStats);
router.post('/', protect, admin, createProduct);
router.get('/:id', getProductById);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.post('/:id/reviews', protect, addReview);
router.delete('/:id/reviews/:reviewId', protect, deleteReview);

module.exports = router;
