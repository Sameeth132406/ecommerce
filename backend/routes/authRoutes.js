const express = require('express');
const router = express.Router();
const {
  register, login, logout, getMe, updateMe, changePassword,
  addAddress, deleteAddress, forgotPassword, resetPassword, toggleWishlist,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/change-password', protect, changePassword);
router.post('/addresses', protect, addAddress);
router.delete('/addresses/:id', protect, deleteAddress);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/wishlist/:productId', protect, toggleWishlist);

module.exports = router;
