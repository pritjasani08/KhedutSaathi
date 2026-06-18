/**
 * Utility for formatting consistent API responses.
 */

/**
 * Returns a standardized success response.
 * @param {Response} res - Express response object.
 * @param {string} message - Descriptive success message.
 * @param {any} data - The payload to send back.
 * @param {object} meta - Additional metadata (e.g., pagination info).
 * @param {number} statusCode - HTTP status code (default: 200).
 */
const successResponse = (res, message, data = null, meta = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta
  });
};

/**
 * Returns a standardized error response.
 * @param {Response} res - Express response object.
 * @param {string} message - Descriptive error message.
 * @param {any} errorDetails - Detailed error object or array.
 * @param {number} statusCode - HTTP status code (default: 500).
 */
const errorResponse = (res, message, errorDetails = null, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: errorDetails
  });
};

module.exports = {
  successResponse,
  errorResponse
};
