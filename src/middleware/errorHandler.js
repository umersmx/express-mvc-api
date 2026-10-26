const { sendError } = require('../utils/apiResponse');

/**
 * 404 Not Found handler for undefined routes
 */
const notFoundHandler = (req, res, next) => {
  return sendError(
    res,
    404,
    `Cannot ${req.method} ${req.originalUrl} - Endpoint not found on this server`
  );
};

/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Handle Mongoose CastError (e.g., malformed ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format for field '${err.path}'. Expected a valid 24-character hexadecimal ObjectId.`;
  }

  // Handle Mongoose Schema Validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
  }

  // Handle MongoDB Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    const duplicatedField = Object.keys(err.keyValue || {})[0] || 'field';
    const duplicatedValue = err.keyValue ? err.keyValue[duplicatedField] : '';
    message = `Duplicate key error: '${duplicatedField}' with value '${duplicatedValue}' already exists.`;
  }

  // Handle JSON Syntax Error in request body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON syntax in request body';
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
  }

  // Log server errors during development (skip during test runs for clean test output)
  if (statusCode === 500 && process.env.NODE_ENV !== 'test') {
    console.error('[Error Handler]', err);
  }

  return sendError(res, statusCode, message, errors);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
