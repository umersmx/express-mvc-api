const mongoose = require('mongoose');

/**
 * Connect to MongoDB using Mongoose.
 * Logs success or error and exits process if connection fails.
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/course_management_db';
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // 5s timeout for fast, clear feedback
    });

    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`\n[MongoDB Connection Error] Could not connect to: ${process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/course_management_db'}`);
    console.error(`Reason: ${error.message}`);
    console.error(`\n💡 How to fix:`);
    console.error(`   - Option A (Cloud): Set MONGODB_URI in your .env file to your free MongoDB Atlas connection string.`);
    console.error(`   - Option B (Local): Ensure local MongoDB service is started (e.g. net start MongoDB on Windows).`);
    console.error(`   - See README.md for complete step-by-step guide.\n`);

    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
