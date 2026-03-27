/**
 * Async Handler Utility
 * Wraps async route handlers to catch errors and pass them to Express error middleware
 * Eliminates need for try-catch blocks in every controller function
 */

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

module.exports = asyncHandler;
