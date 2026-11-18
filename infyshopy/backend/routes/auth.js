const express = require('express');
const bcrypt = require('bcryptjs');
const {
  findUserByEmail,
  createUser,
  createSession,
  deleteSession
} = require('../db/database');
const { createSignedToken, revokeToken } = require('../utils/sessionToken');

const router = express.Router();

// Helper to set session cookie matching live infyshopy.in behavior
function setSessionCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
  res.cookie('infy_auth_session', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: process.env.VERCEL ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms (604800s)
    path: '/'
  });
}

// POST /auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = findUserByEmail(email.trim());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email address or password' });
  }

  // Create signed session token (resilient across serverless cold starts)
  const token = createSignedToken(user);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  try {
    createSession(user.id, token, expiresAt);
  } catch (err) {
    console.warn('Session DB persistence warning (using stateless fallback):', err.message);
  }

  setSessionCookie(res, token);
  return res.json({
    ok: true,
    message: 'Signed in successfully',
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      sellerCode: user.seller_code,
      balance: user.balance_credits
    }
  });
});

// POST /auth/register
router.post('/register', (req, res) => {
  const { email, password, name, phone, countryCode, categories } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const existing = findUserByEmail(email.trim());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const newUser = createUser({
    email: email.trim(),
    password,
    fullName: name || '',
    phone: phone || '',
    countryCode: countryCode || '+91',
    categories: Array.isArray(categories) ? categories : ['Sarees']
  });

  const token = createSignedToken(newUser);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  try {
    createSession(newUser.id, token, expiresAt);
  } catch (err) {
    console.warn('Session DB persistence warning (using stateless fallback):', err.message);
  }

  setSessionCookie(res, token);
  return res.json({ ok: true, message: 'Account created successfully' });
});

// GET /auth/session
router.get('/session', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!req.user) {
    return res.status(401).json({ authenticated: false, error: 'Session expired or not found' });
  }
  return res.json({
    authenticated: true,
    user: {
      email: req.user.email,
      fullName: req.user.fullName,
      role: req.user.role,
      balance: req.user.balance,
      sellerCode: req.user.sellerCode
    }
  });
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  if (req.sessionToken) {
    try {
      deleteSession(req.sessionToken);
    } catch {}
    revokeToken(req.sessionToken);
  }
  const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
  res.clearCookie('infy_auth_session', {
    httpOnly: true,
    secure: isProd,
    sameSite: process.env.VERCEL ? 'none' : 'lax',
    path: '/'
  });
  return res.json({ ok: true, message: 'Signed out successfully' });
});

module.exports = router;

