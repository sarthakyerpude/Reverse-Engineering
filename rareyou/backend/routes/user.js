const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { db } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/products.json'), 'utf8'));

// All user routes require authentication
router.use(authenticateToken);

// GET /api/user/addresses
router.get('/addresses', (req, res) => {
  try {
    const addresses = db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC').all(req.user.id);
    res.json({ success: true, count: addresses.length, addresses });
  } catch (error) {
    console.error('Fetch addresses error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve addresses' });
  }
});

// POST /api/user/addresses
router.post('/addresses', (req, res) => {
  try {
    const { full_name, phone, street_address, city, state, pincode, landmark, is_default } = req.body;

    if (!full_name || !phone || !street_address || !city || !state || !pincode) {
      return res.status(400).json({ success: false, error: 'All address fields are required.' });
    }

    const id = `addr_${uuidv4()}`;
    const now = new Date().toISOString();

    db.transaction(() => {
      if (is_default) {
        db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
      }
      db.prepare(`
        INSERT INTO addresses (id, user_id, full_name, phone, street_address, city, state, pincode, landmark, is_default, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        req.user.id,
        full_name.trim(),
        phone.trim(),
        street_address.trim(),
        city.trim(),
        state.trim(),
        pincode.trim(),
        landmark ? landmark.trim() : null,
        is_default ? 1 : 0,
        now
      );
    })();

    const updated = db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC').all(req.user.id);
    res.status(201).json({ success: true, message: 'Address saved.', addresses: updated });
  } catch (error) {
    console.error('Save address error:', error);
    res.status(500).json({ success: false, error: 'Failed to save address' });
  }
});

// DELETE /api/user/addresses/:id
router.delete('/addresses/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM addresses WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Address not found.' });
    }

    db.prepare('DELETE FROM addresses WHERE id = ?').run(id);
    const updated = db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC').all(req.user.id);
    res.json({ success: true, message: 'Address deleted.', addresses: updated });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete address' });
  }
});

// PUT /api/user/addresses/:id/default
router.put('/addresses/:id/default', (req, res) => {
  try {
    const { id } = req.params;
    db.transaction(() => {
      db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
      db.prepare('UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?').run(id, req.user.id);
    })();

    const updated = db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC').all(req.user.id);
    res.json({ success: true, message: 'Default address updated.', addresses: updated });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({ success: false, error: 'Failed to update default address' });
  }
});

// GET /api/user/wishlist
router.get('/wishlist', (req, res) => {
  try {
    const rows = db.prepare('SELECT product_id, created_at FROM wishlist WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    const enriched = rows.map(r => {
      const p = productsData.find(prod => prod.id === r.product_id);
      return {
        product_id: r.product_id,
        created_at: r.created_at,
        product: p || null
      };
    }).filter(w => w.product !== null);

    res.json({ success: true, count: enriched.length, wishlist: enriched });
  } catch (error) {
    console.error('Fetch wishlist error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve wishlist' });
  }
});

// POST /api/user/wishlist/:productId
router.post('/wishlist/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    const now = new Date().toISOString();
    const id = `wish_${uuidv4()}`;

    db.prepare(`
      INSERT OR IGNORE INTO wishlist (id, user_id, product_id, created_at)
      VALUES (?, ?, ?, ?)
    `).run(id, req.user.id, productId, now);

    res.json({ success: true, message: 'Item saved to wishlist.' });
  } catch (error) {
    console.error('Add wishlist error:', error);
    res.status(500).json({ success: false, error: 'Failed to add to wishlist' });
  }
});

// DELETE /api/user/wishlist/:productId
router.delete('/wishlist/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    db.prepare('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?').run(req.user.id, productId);
    res.json({ success: true, message: 'Item removed from wishlist.' });
  } catch (error) {
    console.error('Remove wishlist error:', error);
    res.status(500).json({ success: false, error: 'Failed to remove from wishlist' });
  }
});

module.exports = router;

