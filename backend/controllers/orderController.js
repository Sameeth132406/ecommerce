const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc  Create order
// @route POST /api/orders
// @access Private
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentInfo, coupon } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Validate stock and calculate prices
  let itemsPrice = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.product}`);
    }
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0] || '',
      price: product.price,
      quantity: item.quantity,
    });

    itemsPrice += product.price * item.quantity;

    // Deduct stock
    product.stock -= item.quantity;
    await product.save();
  }

  const shippingPrice = itemsPrice > 999 ? 0 : 49;
  const taxPrice = Math.round(itemsPrice * 0.18 * 100) / 100;
  let totalPrice = itemsPrice + shippingPrice + taxPrice;

  // Apply coupon
  let couponData = null;
  if (coupon && coupon.code === 'SMART10') {
    const discount = Math.round(totalPrice * 0.1 * 100) / 100;
    totalPrice -= discount;
    couponData = { code: coupon.code, discount };
  }

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentInfo,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice: Math.round(totalPrice * 100) / 100,
    coupon: couponData,
    isPaid: paymentInfo?.status === 'succeeded',
    orderStatus: paymentInfo?.status === 'succeeded' ? 'processing' : 'pending',
    statusHistory: [{ status: paymentInfo?.status === 'succeeded' ? 'processing' : 'pending', note: 'Order placed' }],
    estimatedDelivery,
  });

  res.status(201).json({ success: true, order });
});

// @desc  Get my orders
// @route GET /api/orders/my-orders
// @access Private
const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Order.countDocuments({ user: req.user._id }),
  ]);

  res.json({
    success: true,
    orders,
    pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
  });
});

// @desc  Get order by ID
// @route GET /api/orders/:id
// @access Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Ensure user can only see their own orders (unless admin)
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  res.json({ success: true, order });
});

// @desc  Get all orders (admin)
// @route GET /api/orders
// @access Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = {};
  if (status) query.orderStatus = status;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Order.countDocuments(query),
  ]);

  res.json({
    success: true,
    orders,
    pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
  });
});

// @desc  Update order status (admin)
// @route PUT /api/orders/:id/status
// @access Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.orderStatus = status;
  order.statusHistory.push({ status, note: note || `Status updated to ${status}` });

  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }

  await order.save();
  res.json({ success: true, order });
});

// @desc  Get dashboard analytics (admin)
// @route GET /api/orders/admin/stats
// @access Admin
const getOrderStats = asyncHandler(async (req, res) => {
  const [
    totalOrders,
    totalRevenue,
    ordersByStatus,
    revenueByMonth,
    recentOrders,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
    Order.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]),
    Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5),
  ]);

  res.json({
    success: true,
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    ordersByStatus,
    revenueByMonth: revenueByMonth.reverse(),
    recentOrders,
  });
});

// @desc  Cancel order
// @route PUT /api/orders/:id/cancel
// @access Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (['shipped', 'delivered'].includes(order.orderStatus)) {
    res.status(400);
    throw new Error('Cannot cancel a shipped or delivered order');
  }

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }

  order.orderStatus = 'cancelled';
  order.statusHistory.push({ status: 'cancelled', note: 'Order cancelled by user' });
  await order.save();

  res.json({ success: true, order });
});

module.exports = {
  createOrder, getMyOrders, getOrderById,
  getAllOrders, updateOrderStatus, getOrderStats, cancelOrder,
};
