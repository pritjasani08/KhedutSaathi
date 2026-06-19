const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev_only');
    
    // Attach user info to request
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const requireFarmer = (req, res, next) => {
  requireAuth(req, res, () => {
    if (req.user && req.user.user_type === 'farmer') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Farmers only.' });
    }
  });
};

const requireBuyer = (req, res, next) => {
  requireAuth(req, res, () => {
    if (req.user && req.user.user_type === 'buyer') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Buyers only.' });
    }
  });
};

module.exports = { requireAuth, requireFarmer, requireBuyer };
