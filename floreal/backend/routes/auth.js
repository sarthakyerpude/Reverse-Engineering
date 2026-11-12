/**
 * Authentication REST Endpoints
 * /api/auth/register, /api/auth/login, /api/auth/me, /api/auth/profile, /api/auth/logout
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db/database');
const { generateToken, authenticateToken } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const userId = uuidv4();

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, phone, role)
      VALUES (?, ?, ?, ?, ?, 'customer')
    `).run(userId, name.trim(), cleanEmail, passwordHash, phone ? phone.trim() : null);

    const newUser = db.prepare('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?').get(userId);
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, error: 'Failed to create account.' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      created_at: user.created_at
    };

    const token = generateToken(safeUser);

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Failed to process login.' });
  }
});

// GET /api/auth/me (Protected)
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// PUT /api/auth/profile (Protected)
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { name, phone, password } = req.body;
    const userId = req.user.id;

    if (name) {
      db.prepare('UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(name.trim(), userId);
    }
    if (phone !== undefined) {
      db.prepare('UPDATE users SET phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(phone ? phone.trim() : null, userId);
    }
    if (password && password.length >= 6) {
      const hash = bcrypt.hashSync(password, 10);
      db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(hash, userId);
    }

    const updated = db.prepare('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?').get(userId);
    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updated
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully.'
  });
});

module.exports = router;

