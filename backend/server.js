const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Load env
dotenv.config();

// Connect to DB and auto-seed if empty
connectDB().then(async () => {
  if (process.env.NODE_ENV === 'development') {
    const User = require('./models/User');
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('🌱 Database is empty. Running seeder...');
      const { importData } = require('./utils/seeder');
      await importData();
    }
  }
});

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'SmartCart API is running', timestamp: new Date().toISOString() });
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 SmartCart Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📦 API: http://localhost:${PORT}/api`);
});
