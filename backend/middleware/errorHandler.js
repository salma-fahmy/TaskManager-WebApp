// Global error-handling middleware
function errorHandler(err, req, res, next) {
  // Log the full error stack for debugging
  console.error(err.stack);

  // Send a structured error response
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
  });
}

module.exports = errorHandler;
