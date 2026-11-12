const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'rareyou_artisan_jwt_secret_2026_super_secure';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required. Please sign in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Session expired or invalid token.' });
    }
    req.user = user;
    next();
  });
}

function optionalToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err && user) {
      req.user = user;
    } else {
      req.user = null;
    }
    next();
  });
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Administrator access required.' });
  }
  next();
}

module.exports = {
  authenticateToken,
  optionalToken,
  requireAdmin,
  JWT_SECRET
};

