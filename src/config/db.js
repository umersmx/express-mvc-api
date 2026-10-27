const mongoose = require('mongoose');

let embeddedServer = null;

/**
 * Connect to MongoDB using Mongoose.
 * If local MongoDB is unavailable, automatically falls back to an embedded
 * in-memory engine so the API works immediately without external installation.
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/course_management_db';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });

    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    if (process.env.NODE_ENV === 'test') {
      throw error;
    }

    console.warn(`\n[MongoDB Notice] Could not connect to external/local MongoDB at: ${mongoURI}`);
    console.warn(`Reason: ${error.message}`);
    console.log(`[MongoDB] Automatically initializing embedded database engine...`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      embeddedServer = await MongoMemoryServer.create({
        binary: { version: '6.0.14' },
        instance: { launchTimeout: 60000 },
      });

      const fallbackUri = embeddedServer.getUri();
      const conn = await mongoose.connect(fallbackUri);

      console.log(`[MongoDB] Successfully connected to embedded database: ${fallbackUri}`);
      console.log(`💡 Note: Database is active in-memory. To persist data to the cloud, configure your MongoDB Atlas URI in .env\n`);
      return conn;
    } catch (fallbackError) {
      console.error(`\n[MongoDB Fatal Error] Could not start embedded database: ${fallbackError.message}`);
      console.error(`💡 How to resolve:`);
      console.error(`   1. Set MONGODB_URI in your .env to a MongoDB Atlas cluster URI.`);
      console.error(`   2. Or install and start local MongoDB (net start MongoDB).\n`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
