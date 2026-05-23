const asyncHandler = require('express-async-handler');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc  Create payment intent
// @route POST /api/payments/create-payment-intent
// @access Private
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount, currency = 'inr' } = req.body;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error('Invalid payment amount');
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to paise/cents
    currency,
    metadata: { userId: req.user._id.toString() },
    automatic_payment_methods: { enabled: true },
  });

  res.json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  });
});

// @desc  Get Stripe publishable key
// @route GET /api/payments/config
// @access Public
const getStripeConfig = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

module.exports = { createPaymentIntent, getStripeConfig };
