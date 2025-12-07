// Middleware to validate incoming requests using express-validator
const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  // Check for validation errors from previous validators
  const errors = validationResult(req);

  // If validation errors exist, respond with 400 and error details
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Proceed to the next middleware or route handler if no errors
  next();
};

module.exports = validateRequest;
