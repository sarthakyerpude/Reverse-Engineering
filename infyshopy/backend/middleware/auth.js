const { findSessionByToken } = require('../db/database');

function authMiddleware(req, res, next) {
  // Read session cookie or Authorization header
  const token = req.cookies?.infy_auth_session || req.headers['authorization']?.replace(/^Bearer\s+/i, '');

  if (!token) {
    req.user = null;
    return next();
  }

  const session = findSessionByToken(token);
  if (!session) {
    req.user = null;
    return next();
  }

  req.user = {
    id: session.user_id,
    email: session.email,
    fullName: session.full_name,
    role: session.role,
    balance: session.balance_credits,
    sellerCode: session.seller_code,
    phone: session.phone,
    countryCode: session.country_code
  };
  req.sessionToken = token;
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ authenticated: false, error: 'Authentication required' });
  }
  next();
}

module.exports = {
  authMiddleware,
  requireAuth
};

