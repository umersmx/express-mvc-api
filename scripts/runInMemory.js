/**
 * In-Memory Development Server Runner
 *
 * Starts an in-memory MongoDB instance and launches the Express API server.
 * Ideal for immediate demonstration and Postman testing without requiring
 * a local MongoDB installation or external Atlas cluster setup.
 */

require('dotenv').config();
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Course = require('../src/models/Course');

(async () => {
  try {
    console.log('[In-Memory Runner] Initializing embedded MongoDB engine...');
    const mongoServer = await MongoMemoryServer.create({
      binary: { version: '6.0.14' },
      instance: { launchTimeout: 60000 },
    });
    const uri = mongoServer.getUri();

    process.env.MONGODB_URI = uri;
    console.log(`[In-Memory Runner] Embedded MongoDB active at: ${uri}`);

    // Import and start server
    const app = require('../src/app');
    const connectDB = require('../src/config/db');

    await connectDB();

    // Seed helpful demo data for instant testing
    console.log('[In-Memory Runner] Seeding initial test data...');
    const demoUser = await User.create({
      name: 'Jane Doe',
      email: 'jane.doe@university.edu',
      password: 'password123',
      role: 'admin',
    });

    const demoCategory = await Category.create({
      name: 'Computer Science',
      description: 'Core computing concepts, algorithms, and software engineering.',
      createdBy: demoUser._id,
    });

    const demoCourse = await Course.create({
      title: 'Data Structures and Algorithms Masterclass',
      description: 'Comprehensive deep dive into trees, graphs, sorting, and dynamic programming.',
      category: demoCategory._id,
      price: 49.99,
      instructor: 'Dr. Alan Turing',
      createdBy: demoUser._id,
    });

    console.log('\n======================================================');
    console.log('  Course Management API (In-Memory Mode)');
    console.log('======================================================');
    console.log(`  Local URL:        http://localhost:${process.env.PORT || 5000}`);
    console.log(`  Health Check:     http://localhost:${process.env.PORT || 5000}/api/health`);
    console.log('  Seeded Demo Credentials:');
    console.log('    - Email:        jane.doe@university.edu');
    console.log('    - Password:     password123');
    console.log(`    - Category ID:  ${demoCategory._id}`);
    console.log(`    - Course ID:    ${demoCourse._id}`);
    console.log('======================================================\n');

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`[Server] Live on http://localhost:${PORT}. Ready for Postman requests!`);
    });

    const cleanup = async () => {
      console.log('\n[In-Memory Runner] Shutting down...');
      server.close();
      await mongoose.disconnect();
      await mongoServer.stop();
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  } catch (error) {
    console.error('[In-Memory Runner Error]', error);
    process.exit(1);
  }
})();
