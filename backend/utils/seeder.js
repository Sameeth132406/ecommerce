const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const connectDB = require('../config/db');

const users = [
  {
    name: 'Admin User',
    email: 'sameethsamit@gmail.com',
    password: 'sam12345',
    role: 'admin',
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'customer',
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'customer',
  },
];

const products = [
  {
    name: 'Apple AirPods Pro (2nd Generation)',
    description: 'Active Noise Cancellation, Transparency Mode, Personalized Spatial Audio with dynamic head tracking. Up to 6 hours of listening time with ANC enabled.',
    price: 24999,
    originalPrice: 29999,
    category: 'Electronics',
    brand: 'Apple',
    images: [
      'https://images.unsplash.com/photo-1606741965509-717a5a44edfc?w=600',
      'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=600',
    ],
    stock: 45,
    ratings: 4.8,
    numReviews: 256,
    isFeatured: true,
    tags: ['airpods', 'wireless', 'earbuds', 'apple', 'anc'],
  },
  {
    name: 'Samsung 65" QLED 4K Smart TV',
    description: 'Quantum Dot technology for stunning color. Neo Quantum Processor 4K. Dolby Atmos & Object Tracking Sound. Motion Xcelerator Turbo+.',
    price: 89999,
    originalPrice: 119999,
    category: 'Electronics',
    brand: 'Samsung',
    images: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f4834a?w=600',
    ],
    stock: 12,
    ratings: 4.6,
    numReviews: 89,
    isFeatured: true,
    tags: ['tv', 'smart tv', '4k', 'qled', 'samsung'],
  },
  {
    name: 'Nike Air Max 270 React',
    description: 'The Nike Air Max 270 React combines two of our most innovative cushioning technologies—Air Max 270 and Nike React—for a soft, cushioned feel.',
    price: 12999,
    originalPrice: 15999,
    category: 'Fashion',
    brand: 'Nike',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600',
    ],
    stock: 78,
    ratings: 4.5,
    numReviews: 342,
    isFeatured: true,
    tags: ['shoes', 'running', 'nike', 'air max', 'sneakers'],
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Industry-leading noise canceling with Auto NC Optimizer. Crystal clear hands-free calling. Up to 30-hour battery life with quick charging.',
    price: 28990,
    originalPrice: 34990,
    category: 'Electronics',
    brand: 'Sony',
    images: [
      'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600',
    ],
    stock: 34,
    ratings: 4.9,
    numReviews: 478,
    isFeatured: true,
    tags: ['headphones', 'sony', 'anc', 'wireless', 'audiophile'],
  },
  {
    name: 'MacBook Pro 14" M3 Chip',
    description: 'Apple M3 chip with 8-core CPU and 10-core GPU. 18 hours battery life. Liquid Retina XDR display. 16GB unified memory. 512GB SSD.',
    price: 168999,
    originalPrice: 178999,
    category: 'Electronics',
    brand: 'Apple',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600',
    ],
    stock: 8,
    ratings: 4.9,
    numReviews: 124,
    isFeatured: true,
    tags: ['macbook', 'laptop', 'apple', 'm3', 'portable'],
  },
  {
    name: 'Adidas Ultraboost 22 Running Shoes',
    description: 'Made for long runs. Continental Rubber outsole for exceptional grip. BOOST midsole for incredible energy return and comfort.',
    price: 14999,
    originalPrice: 17999,
    category: 'Sports',
    brand: 'Adidas',
    images: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600',
    ],
    stock: 56,
    ratings: 4.4,
    numReviews: 198,
    isFeatured: false,
    tags: ['shoes', 'running', 'adidas', 'ultraboost', 'sports'],
  },
  {
    name: 'IKEA POÄNG Armchair',
    description: 'Comfortable armchair with a layer-glued bent birch frame, combining flexibility and durability. Easy to complement with coordinated footstool.',
    price: 7999,
    originalPrice: 9999,
    category: 'Home & Garden',
    brand: 'IKEA',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
    ],
    stock: 23,
    ratings: 4.3,
    numReviews: 67,
    isFeatured: false,
    tags: ['chair', 'armchair', 'ikea', 'furniture', 'living room'],
  },
  {
    name: 'Canon EOS R50 Mirrorless Camera',
    description: '24.2 MP APS-C CMOS Sensor. Dual Pixel CMOS AF II. 4K video recording. Built-in Wi-Fi & Bluetooth. Lightweight compact design.',
    price: 67999,
    originalPrice: 74999,
    category: 'Electronics',
    brand: 'Canon',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600',
    ],
    stock: 15,
    ratings: 4.7,
    numReviews: 93,
    isFeatured: false,
    tags: ['camera', 'canon', 'mirrorless', 'photography', 'eos'],
  },
  {
    name: 'The Lean Startup',
    description: 'How Today\'s Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses. By Eric Ries.',
    price: 499,
    originalPrice: 699,
    category: 'Books',
    brand: 'Crown Business',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
    ],
    stock: 200,
    ratings: 4.6,
    numReviews: 1203,
    isFeatured: false,
    tags: ['book', 'startup', 'business', 'entrepreneurship'],
  },
  {
    name: 'boAt Airdopes 141 TWS Earbuds',
    description: 'BEAST™ Mode for Gaming. ENx™ Technology for clear calls. IPX4 Water Resistance. Up to 42 hours total playback. Bluetooth 5.1.',
    price: 1299,
    originalPrice: 2999,
    category: 'Electronics',
    brand: 'boAt',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',
    ],
    stock: 150,
    ratings: 4.2,
    numReviews: 892,
    isFeatured: false,
    tags: ['earbuds', 'tws', 'boat', 'wireless', 'affordable'],
  },
  {
    name: 'Levi\'s 511 Slim Fit Jeans',
    description: 'The 511 is the go-to slim for Levi\'s. It sits below the waist with a slim leg from hip to ankle. Made with stretch denim for comfort.',
    price: 3499,
    originalPrice: 4999,
    category: 'Fashion',
    brand: "Levi's",
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600',
    ],
    stock: 89,
    ratings: 4.4,
    numReviews: 234,
    isFeatured: false,
    tags: ['jeans', "levi's", 'denim', 'fashion', 'slim fit'],
  },
  {
    name: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker',
    description: '7-in-1 functionality: Pressure Cooker, Slow Cooker, Rice Cooker, Steamer, Sauté Pan, Yogurt Maker and Warmer. 6 Qt capacity.',
    price: 6499,
    originalPrice: 8999,
    category: 'Home & Garden',
    brand: 'Instant Pot',
    images: [
      'https://images.unsplash.com/photo-1574669847344-f8e7e0bb15c3?w=600',
    ],
    stock: 42,
    ratings: 4.7,
    numReviews: 567,
    isFeatured: false,
    tags: ['kitchen', 'cooker', 'instant pot', 'appliance', 'cooking'],
  },
];

const importData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    // Create users (password hashing done via model pre-save hook)
    const createdUsers = await User.create(users);
    const adminUser = createdUsers[0];

    const productData = products.map(p => ({ ...p, seller: adminUser._id }));
    await Product.create(productData);

    console.log('✅ Data Imported Successfully!');
    console.log('\n📧 Admin credentials:');
    console.log('   Email: sameethsamit@gmail.com');
    console.log('   Password: sam12345');
    console.log('\n📧 Customer credentials:');
    console.log('   Email: john@example.com');
    console.log('   Password: password123');
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    console.log('✅ Data Destroyed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
};

if (require.main === module) {
  if (process.argv[2] === '-d') {
    destroyData().then(() => process.exit());
  } else {
    importData().then(() => process.exit());
  }
}

module.exports = { importData, destroyData };
