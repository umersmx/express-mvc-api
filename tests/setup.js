process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_jwt_key_super_secure_32char';
process.env.JWT_EXPIRES_IN = '1d';
jest.setTimeout(120000);

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

/**
 * Setup in-memory MongoDB instance before all tests
 */
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    binary: { version: '6.0.14' },
    instance: { launchTimeout: 60000 },
  });
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

/**
 * Clear all collections between individual tests to ensure isolation
 */
afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

/**
 * Teardown and disconnect after all tests complete
 */
afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});
