const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/User');
const { generateTokens, setTokenCookies } = require('../utils/generateToken');

// @desc  Register user
// @route POST /api/auth/register
// @access Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const user = await User.create({ name, email, password });

  const { accessToken, refreshToken } = generateTokens(user._id);
  setTokenCookies(res, accessToken, refreshToken);

  res.status(201).json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
    accessToken,
  });
});

// @desc  Login user
// @route POST /api/auth/login
// @access Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(401);
    throw new Error('Your account has been deactivated');
  }

  const { accessToken, refreshToken } = generateTokens(user._id);
  setTokenCookies(res, accessToken, refreshToken);

  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
    },
    accessToken,
  });
});

// @desc  Logout user
// @route POST /api/auth/logout
// @access Private
const logout = asyncHandler(async (req, res) => {
  res.cookie('accessToken', '', { httpOnly: true, expires: new Date(0) });
  res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0) });
  res.json({ success: true, message: 'Logged out successfully' });
});

// @desc  Get current user
// @route GET /api/auth/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name price images ratings');
  res.json({ success: true, user });
});

// @desc  Update profile
// @route PUT /api/auth/me
// @access Private
const updateMe = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, avatar },
    { new: true, runValidators: true }
  );

  res.json({ success: true, user });
});

// @desc  Change password
// @route PUT /api/auth/change-password
// @access Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password changed successfully' });
});

// @desc  Add / update address
// @route POST /api/auth/addresses
// @access Private
const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { isDefault, ...addressData } = req.body;

  if (isDefault) {
    user.addresses.forEach(a => (a.isDefault = false));
  }

  if (user.addresses.length === 0) addressData.isDefault = true;
  user.addresses.push({ ...addressData, isDefault: isDefault || user.addresses.length === 0 });
  await user.save();

  res.status(201).json({ success: true, addresses: user.addresses });
});

// @desc  Delete address
// @route DELETE /api/auth/addresses/:id
// @access Private
const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.id);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

// @desc  Forgot password
// @route POST /api/auth/forgot-password
// @access Public
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(404);
    throw new Error('User not found with this email');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save({ validateBeforeSave: false });

  res.json({ success: true, message: 'Password reset link sent to email', resetToken }); // In prod, send via email
});

// @desc  Reset password
// @route POST /api/auth/reset-password/:token
// @access Public
const resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const { accessToken, refreshToken } = generateTokens(user._id);
  setTokenCookies(res, accessToken, refreshToken);

  res.json({ success: true, message: 'Password reset successful', accessToken });
});

// @desc  Toggle wishlist
// @route POST /api/auth/wishlist/:productId
// @access Private
const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const productId = req.params.productId;
  const idx = user.wishlist.indexOf(productId);

  if (idx === -1) {
    user.wishlist.push(productId);
  } else {
    user.wishlist.splice(idx, 1);
  }

  await user.save();
  res.json({ success: true, wishlist: user.wishlist, added: idx === -1 });
});

module.exports = {
  register, login, logout, getMe, updateMe, changePassword,
  addAddress, deleteAddress, forgotPassword, resetPassword, toggleWishlist,
};
