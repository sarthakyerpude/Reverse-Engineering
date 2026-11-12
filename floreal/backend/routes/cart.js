/**
 * Server-Side Cart Management API
 * Backed by SQLite database with automatic product catalog resolution
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const productsFilePath = path.join(__dirname, '../data/products.json');

// Helper to look up product metadata
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

// Build enriched cart response for a user
function buildEnrichedCart(userId) {
  const rows = db.prepare(`
    SELECT id, product_id, variant_id, quantity, created_at, updated_at
    FROM cart_items
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(userId);

  let subtotal = 0;
  let totalQuantity = 0;

  const enrichedItems = rows.map(item => {
    const p = findProductById(item.product_id);
    let price = 0;
    let compareAtPrice = null;
    let title = 'Floreal Bouquet';
    let image = '';
    let handle = '';

    if (p) {
      title = p.title || title;
      handle = p.handle || '';
      const variant = (p.variants && p.variants.find(v => String(v.id) === String(item.variant_id))) || p.variants?.[0];
      price = parseFloat(variant?.price || p.price || 0);
      compareAtPrice = variant?.compare_at_price ? parseFloat(variant.compare_at_price) : null;
      image = typeof p.image === 'string' ? p.image : (p.image?.src || p.images?.[0]?.src || p.images?.[0] || '');
    }

    const lineTotal = price * item.quantity;
    subtotal += lineTotal;
    totalQuantity += item.quantity;

    return {
      id: item.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      title,
      handle,
      price,
      compare_at_price: compareAtPrice,
      image,
      line_total: lineTotal
    };
  });

  const freeShippingThreshold = 999;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 99;
  const total = subtotal + shippingFee;

  return {
    items: enrichedItems,
    item_count: totalQuantity,
    subtotal,
    free_shipping_threshold: freeShippingThreshold,
    shipping_fee: shippingFee,
    total
  };
}

// GET /api/cart — Fetch current user's persistent cart
router.get('/', authenticateToken, (req, res) => {
  try {
    const cart = buildEnrichedCart(req.user.id);
    res.json({ success: true, cart });
  } catch (err) {
    console.error('Fetch cart error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve cart.' });
  }
});

// POST /api/cart/add — Add or increment item in user's DB cart
router.post('/add', authenticateToken, (req, res) => {
  try {
    const { product_id, variant_id, quantity = 1 } = req.body;
    const userId = req.user.id;

    if (!product_id) {
      return res.status(400).json({ success: false, error: 'product_id is required.' });
    }

    const cleanVariantId = variant_id ? String(variant_id) : 'default';
    const cleanQty = Math.max(1, parseInt(quantity, 10) || 1);

    // Upsert into cart_items table
    const existing = db.prepare(`
      SELECT id, quantity FROM cart_items 
      WHERE user_id = ? AND product_id = ? AND variant_id = ?
    `).get(userId, String(product_id), cleanVariantId);

    if (existing) {
      db.prepare(`
        UPDATE cart_items 
        SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(cleanQty, existing.id);
    } else {
      db.prepare(`
        INSERT INTO cart_items (id, user_id, product_id, variant_id, quantity)
        VALUES (?, ?, ?, ?, ?)
      `).run(uuidv4(), userId, String(product_id), cleanVariantId, cleanQty);
    }

    const cart = buildEnrichedCart(userId);
    res.json({
      success: true,
      message: 'Item added to your cart!',
      cart
    });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ success: false, error: 'Failed to add item to cart.' });
  }
});

// PUT /api/cart/:itemId — Update quantity of an item
router.put('/:itemId', authenticateToken, (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    const newQty = parseInt(quantity, 10);

    if (isNaN(newQty) || newQty <= 0) {
      // Remove item if quantity is zero or negative
      db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(itemId, userId);
    } else {
      db.prepare(`
        UPDATE cart_items 
        SET quantity = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? AND user_id = ?
      `).run(newQty, itemId, userId);
    }

    const cart = buildEnrichedCart(userId);
    res.json({ success: true, cart });
  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ success: false, error: 'Failed to update item quantity.' });
  }
});

// DELETE /api/cart/:itemId — Remove item from cart
router.delete('/:itemId', authenticateToken, (req, res) => {
  try {
    const { itemId } = req.params;
    db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(itemId, req.user.id);
    const cart = buildEnrichedCart(req.user.id);
    res.json({ success: true, message: 'Item removed from cart.', cart });
  } catch (err) {
    console.error('Delete cart item error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete cart item.' });
  }
});

// DELETE /api/cart — Clear entire cart
router.delete('/', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
    const cart = buildEnrichedCart(req.user.id);
    res.json({ success: true, message: 'Cart cleared successfully.', cart });
  } catch (err) {
    console.error('Clear cart error:', err);
    res.status(500).json({ success: false, error: 'Failed to clear cart.' });
  }
});

// POST /api/cart/merge — Merge guest localStorage cart into user's DB cart upon login
router.post('/merge', authenticateToken, (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.id;

    if (Array.isArray(items) && items.length > 0) {
      const upsert = db.prepare(`
        INSERT INTO cart_items (id, user_id, product_id, variant_id, quantity)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(user_id, product_id, variant_id) DO UPDATE SET
          quantity = quantity + excluded.quantity,
          updated_at = CURRENT_TIMESTAMP
      `);

      const mergeMany = db.transaction((guestItems) => {
        for (const it of guestItems) {
          if (!it.product_id && !it.id) continue;
          const pid = String(it.product_id || it.id);
          const vid = it.variant_id ? String(it.variant_id) : 'default';
          const qty = Math.max(1, parseInt(it.quantity, 10) || 1);
          upsert.run(uuidv4(), userId, pid, vid, qty);
        }
      });

      mergeMany(items);
    }

    const cart = buildEnrichedCart(userId);
    res.json({
      success: true,
      message: 'Cart synchronized with your account.',
      cart
    });
  } catch (err) {
    console.error('Merge cart error:', err);
    res.status(500).json({ success: false, error: 'Failed to merge cart.' });
  }
});

module.exports = router;

