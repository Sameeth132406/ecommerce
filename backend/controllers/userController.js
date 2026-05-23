const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Order = require('../models/Order');

// @desc  Get all users (admin)
// @route GET /api/users
// @access Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = {};
  if (search) query.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];
  if (role) query.role = role;

  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    User.countDocuments(query),
  ]);

  res.json({
    success: true,
    users,
    pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
  });
});

// @desc  Get user by ID (admin)
// @route GET /api/users/:id
// @access Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  const orders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 }).limit(5);
  res.json({ success: true, user, recentOrders: orders });
});

// @desc  Update user role / active status (admin)
// @route PUT /api/users/:id
// @access Admin
const updateUser = asyncHandler(async (req, res) => {
  const { role, isActive } = req.body;

  if (req.params.id === req.user._id.toString()) {
    res.status(400);
    throw new Error('Cannot modify your own admin account');
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role, isActive },
    { new: true }
  );

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({ success: true, user });
});

// @desc  Delete user (admin)
// @route DELETE /api/users/:id
// @access Admin
const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    res.status(400);
    throw new Error('Cannot delete your own account');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await user.deleteOne();
  res.json({ success: true, message: 'User deleted successfully' });
});

// @desc  Get user stats (admin)
// @route GET /api/users/admin/stats
// @access Admin
const getUserStats = asyncHandler(async (req, res) => {
  const [total, admins, customers, newThisMonth] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(1)) },
    }),
  ]);

  res.json({ success: true, total, admins, customers, newThisMonth });
});

module.exports = { getAllUsers, getUserById, updateUser, deleteUser, getUserStats };
