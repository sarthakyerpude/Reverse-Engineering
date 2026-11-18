const { findSessionByToken, findUserByEmail, getUserById } = require('../db/database');
const { verifySignedToken } = require('../utils/sessionToken');

function authMiddleware(req, res, next) {
  // Read session cookie or Authorization header
  const token = req.cookies?.infy_auth_session || req.headers['authorization']?.replace(/^Bearer\s+/i, '');

  if (!token) {
    req.user = null;
    return next();
  }

  const session = findSessionByToken(token);
  if (session) {
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
    return next();
  }

  // Serverless fallback: verify stateless HMAC-signed session token across ephemeral /tmp instances
  const payload = verifySignedToken(token);
  if (!payload) {
    req.user = null;
    return next();
  }

  const dbUser = getUserById(payload.uid) || (payload.email ? findUserByEmail(payload.email) : null);
  req.user = dbUser
    ? {
        id: dbUser.id,
        email: dbUser.email,
        fullName: dbUser.full_name,
        role: dbUser.role,
        balance: dbUser.balance_credits,
        sellerCode: dbUser.seller_code,
        phone: dbUser.phone,
        countryCode: dbUser.country_code
      }
    : {
        id: payload.uid,
        email: payload.email,
        fullName: payload.fullName || '',
        role: payload.role || 'owner',
        balance: payload.balance ?? 20,
        sellerCode: payload.sellerCode || '',
        phone: '',
        countryCode: '+91'
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

