/**
 * Authentication Middleware
 * Handles JWT verification, optional auth for guests, and role-based permissions
 */

const jwt = require('jsonwebtoken');
const { db } = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'floreal-super-secret-jwt-key-2025';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'customer'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required. Please sign in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid or expired session. Please log in again.' });
    }

    const user = db.prepare('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?').get(decoded.id);
    if (!user) {
      return res.status(403).json({ success: false, error: 'User account not found.' });
    }

    req.user = user;
    next();
  });
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (!err && decoded) {
      const user = db.prepare('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?').get(decoded.id);
      if (user) {
        req.user = user;
      }
    }
    next();
  });
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Administrator privileges required.' });
  }
  next();
}

module.exports = {
  JWT_SECRET,
  generateToken,
  authenticateToken,
  optionalAuth,
  requireAdmin
};

