const mongoose = require('mongoose');

let mongoServer = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    // If using localhost URI and in development, try MongoMemoryServer as fallback
    if (process.env.NODE_ENV === 'development' && 
        (uri.includes('localhost') || uri.includes('127.0.0.1'))) {
      try {
        // Try connecting to local MongoDB first
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
        console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
        return;
      } catch (localErr) {
        console.log('⚠️  Local MongoDB not found. Starting in-memory MongoDB...');
        try {
          const { MongoMemoryServer } = require('mongodb-memory-server');
          mongoServer = await MongoMemoryServer.create();
          uri = mongoServer.getUri();
          console.log('🔧 Using MongoDB Memory Server (dev mode - data resets on restart)');
        } catch (memErr) {
          // mongodb-memory-server not installed, re-throw original error
          throw localErr;
        }
      }
    }

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('💡 Fix: Install MongoDB locally OR update MONGO_URI in .env with MongoDB Atlas URI');
    process.exit(1);
  }
};

module.exports = connectDB;
module.exports.getMongoServer = () => mongoServer;
