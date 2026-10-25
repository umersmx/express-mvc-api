const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for an authenticated user
 * @param {string|Object} payload - User ID or payload object
 * @returns {string} signed JWT token
 */
const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  let tokenPayload;
  if (payload && typeof payload === 'object' && payload.constructor === Object) {
    tokenPayload = payload;
  } else {
    tokenPayload = { id: payload ? payload.toString() : '' };
  }

  return jwt.sign(tokenPayload, secret, { expiresIn });
};

module.exports = generateToken;
