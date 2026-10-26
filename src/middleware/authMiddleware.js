const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');

/**
 * Protect routes - verifies JWT in Authorization header (Bearer <token>)
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 401, 'Access denied. No authentication token provided.');
    }

    const secret = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return sendError(res, 401, 'User belonging to this token no longer exists.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Authentication token has expired. Please log in again.');
    }
    return sendError(res, 401, 'Invalid authentication token.', error.message);
  }
};

module.exports = {
  protect,
};
