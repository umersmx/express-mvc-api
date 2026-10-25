/**
 * Consistent API response helper functions
 */

/**
 * Send a standardized success JSON response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (200, 201, etc.)
 * @param {string} message - Human-readable success message
 * @param {any} data - Payload data to return
 * @param {Object} [meta] - Optional pagination or metadata
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, meta = undefined) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (meta !== undefined) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a standardized error JSON response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (400, 401, 403, 404, 409, 500)
 * @param {string} message - Human-readable error message
 * @param {any} [errors] - Specific field validation errors or details
 */
const sendError = (res, statusCode = 500, message = 'An unexpected error occurred', errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors !== null && errors !== undefined) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendError,
};
