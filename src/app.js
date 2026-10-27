const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const courseRoutes = require('./routes/courseRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { sendSuccess } = require('./utils/apiResponse');

const app = express();

// Standard middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP logger (disabled in test environment for clean test output)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Root welcome route
app.get('/', (req, res) => {
  return sendSuccess(res, 200, 'Welcome to the Course Management REST API', {
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      categories: '/api/categories',
      courses: '/api/courses',
      health: '/api/health',
    },
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  return sendSuccess(res, 200, 'API service is running and healthy', {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/courses', courseRoutes);

// Catch-all 404 handler for unknown URLs
app.use(notFoundHandler);

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;
