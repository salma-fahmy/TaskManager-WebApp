const jwt = require('jsonwebtoken');

// Middleware to authenticate requests using JWT
function authenticateToken(req, res, next) {
  // Extract token from Authorization header: "Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // If no token provided, deny access
  if (!token) {
    return res.status(401).json({ error: 'Access denied, token missing!' });
  }

  // Verify and decode JWT token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    // Attach decoded user information to the request object
    req.user = user;

    // Proceed to the next middleware/route handler
    next();
  });
}

module.exports = authenticateToken;
