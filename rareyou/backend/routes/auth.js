const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db/database');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { email, password, full_name, phone } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ success: false, error: 'Email, password, and full name are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check existing
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    const id = `user_${uuidv4()}`;
    const password_hash = bcrypt.hashSync(password, 10);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, phone, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'customer', ?, ?)
    `).run(id, cleanEmail, password_hash, full_name.trim(), phone ? phone.trim() : null, now, now);

    const user = { id, email: cleanEmail, full_name: full_name.trim(), phone: phone || null, role: 'customer' };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const payload = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: payload
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Internal server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, full_name, phone, role, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { full_name, phone } = req.body;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE users 
      SET full_name = COALESCE(?, full_name),
          phone = COALESCE(?, phone),
          updated_at = ?
      WHERE id = ?
    `).run(full_name ? full_name.trim() : null, phone ? phone.trim() : null, now, req.user.id);

    const updated = db.prepare('SELECT id, email, full_name, phone, role FROM users WHERE id = ?').get(req.user.id);
    res.json({ success: true, message: 'Profile updated.', user: updated });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

module.exports = router;

