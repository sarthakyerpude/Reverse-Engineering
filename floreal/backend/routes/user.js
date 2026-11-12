/**
 * User Account, Saved Addresses & Wishlist Endpoints
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const productsFilePath = path.join(__dirname, '../data/products.json');

function findProductById(productId) {
  try {
    const raw = fs.readFileSync(productsFilePath, 'utf8');
    const data = JSON.parse(raw);
    const products = data.products || data;
    return products.find(p => String(p.id) === String(productId));
  } catch (err) {
    return null;
  }
}

// ─── ADDRESS MANAGEMENT ───

// GET /api/user/addresses
router.get('/addresses', authenticateToken, (req, res) => {
  try {
    const addresses = db.prepare(`
      SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC
    `).all(req.user.id);
    res.json({ success: true, addresses });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve addresses.' });
  }
});

// POST /api/user/addresses
router.post('/addresses', authenticateToken, (req, res) => {
  try {
    const { full_name, phone, address_line1, address_line2, city, state, pincode, is_default } = req.body;

    if (!full_name || !phone || !address_line1 || !city || !state || !pincode) {
      return res.status(400).json({ success: false, error: 'Please provide all required address fields.' });
    }

    const userId = req.user.id;
    const addressId = uuidv4();

    if (is_default) {
      db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(userId);
    }

    // Check if this is the first address, make default automatically
    const count = db.prepare('SELECT count(*) as c FROM addresses WHERE user_id = ?').get(userId);
    const makeDefault = is_default || count.c === 0 ? 1 : 0;

    db.prepare(`
      INSERT INTO addresses (id, user_id, full_name, phone, address_line1, address_line2, city, state, pincode, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(addressId, userId, full_name.trim(), phone.trim(), address_line1.trim(), address_line2 ? address_line2.trim() : '', city.trim(), state.trim(), pincode.trim(), makeDefault);

    const created = db.prepare('SELECT * FROM addresses WHERE id = ?').get(addressId);
    res.status(201).json({ success: true, message: 'Address saved successfully!', address: created });
  } catch (err) {
    console.error('Save address error:', err);
    res.status(500).json({ success: false, error: 'Failed to save address.' });
  }
});

// PUT /api/user/addresses/:id
router.put('/addresses/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, address_line1, address_line2, city, state, pincode, is_default } = req.body;
    const userId = req.user.id;

    if (is_default) {
      db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(userId);
    }

    db.prepare(`
      UPDATE addresses SET
        full_name = COALESCE(?, full_name),
        phone = COALESCE(?, phone),
        address_line1 = COALESCE(?, address_line1),
        address_line2 = COALESCE(?, address_line2),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        pincode = COALESCE(?, pincode),
        is_default = COALESCE(?, is_default)
      WHERE id = ? AND user_id = ?
    `).run(full_name, phone, address_line1, address_line2, city, state, pincode, is_default !== undefined ? (is_default ? 1 : 0) : null, id, userId);

    const updated = db.prepare('SELECT * FROM addresses WHERE id = ?').get(id);
    res.json({ success: true, message: 'Address updated successfully.', address: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update address.' });
  }
});

// DELETE /api/user/addresses/:id
router.delete('/addresses/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM addresses WHERE id = ? AND user_id = ?').run(id, req.user.id);
    res.json({ success: true, message: 'Address deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete address.' });
  }
});

// ─── WISHLIST MANAGEMENT ───

// GET /api/user/wishlist
router.get('/wishlist', authenticateToken, (req, res) => {
  try {
    const rows = db.prepare('SELECT id, product_id, created_at FROM wishlist WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    const enriched = rows.map(item => {
      const p = findProductById(item.product_id);
      return {
        id: item.id,
        product_id: item.product_id,
        created_at: item.created_at,
        product: p ? {
          id: p.id,
          title: p.title,
          handle: p.handle,
          price: parseFloat(p.variants?.[0]?.price || p.price || 0),
          compare_at_price: p.variants?.[0]?.compare_at_price ? parseFloat(p.variants[0].compare_at_price) : null,
          image: typeof p.image === 'string' ? p.image : (p.image?.src || p.images?.[0]?.src || p.images?.[0] || ''),
          category: p.product_type || p.category || ''
        } : null
      };
    }).filter(i => i.product !== null);

    res.json({ success: true, wishlist: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch wishlist.' });
  }
});

// POST /api/user/wishlist
router.post('/wishlist', authenticateToken, (req, res) => {
  try {
    const { product_id } = req.body;
    if (!product_id) {
      return res.status(400).json({ success: false, error: 'product_id is required.' });
    }

    db.prepare(`
      INSERT OR IGNORE INTO wishlist (id, user_id, product_id)
      VALUES (?, ?, ?)
    `).run(uuidv4(), req.user.id, String(product_id));

    res.json({ success: true, message: 'Product added to your wishlist!' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to add to wishlist.' });
  }
});

// DELETE /api/user/wishlist/:productId
router.delete('/wishlist/:productId', authenticateToken, (req, res) => {
  try {
    const { productId } = req.params;
    db.prepare('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?').run(req.user.id, String(productId));
    res.json({ success: true, message: 'Removed from wishlist.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to remove from wishlist.' });
  }
});

module.exports = router;

