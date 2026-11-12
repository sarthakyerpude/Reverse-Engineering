const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { db } = require('../db/database');
const { optionalToken } = require('../middleware/auth');

function getProducts() {
  const raw = fs.readFileSync(path.join(__dirname, '../data/products.json'), 'utf8');
  return JSON.parse(raw);
}

const FREE_SHIPPING_THRESHOLD = 1499;
const STANDARD_SHIPPING_FEE = 99;

// Helper to resolve user_id or session_id
function getCartOwner(req) {
  const userId = req.user ? req.user.id : null;
  const sessionId = req.headers['x-session-id'] || req.query.session_id || 'guest_default';
  return { userId, sessionId };
}

// Helper to compute cart totals and enrich items
function enrichCart(items) {
  const productsData = getProducts();
  let subtotal = 0;
  const enriched = [];

  for (const item of items) {
    const product = productsData.find(p => String(p.id) === String(item.product_id) || p.handle === item.product_id);
    if (!product) continue;

    const variant = product.variants ? product.variants.find(v => String(v.id) === String(item.variant_id)) : null;
    const price = variant && variant.price ? variant.price : product.price;
    const lineTotal = price * item.quantity;
    subtotal += lineTotal;

    const mainImg = product.localImage || (product.images && product.images[0]) || product.image || '/images/prod-bumble-in-blue.png';

    enriched.push({
      id: item.id,
      product_id: product.id,
      variant_id: item.variant_id || product.variantId || 'default',
      quantity: item.quantity,
      selected_size: item.selected_size,
      custom_measurements: item.custom_measurements,
      product_name: product.title || product.name,
      product_handle: product.handle,
      product_category: product.category,
      variant_title: variant ? variant.title : null,
      unit_price: price,
      line_total: lineTotal,
      image: mainImg
    });
  }

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = subtotal > 0 ? (isFreeShipping ? 0 : STANDARD_SHIPPING_FEE) : 0;
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const grandTotal = subtotal + shippingFee;

  return {
    items: enriched,
    item_count: enriched.reduce((sum, i) => sum + i.quantity, 0),
    subtotal,
    shipping_fee: shippingFee,
    free_shipping_threshold: FREE_SHIPPING_THRESHOLD,
    is_free_shipping: isFreeShipping,
    free_shipping_remaining: freeShippingRemaining,
    free_shipping_progress: freeShippingProgress,
    total: grandTotal
  };
}

// GET /api/cart
router.get('/', optionalToken, (req, res) => {
  try {
    const { userId, sessionId } = getCartOwner(req);
    const rows = userId
      ? db.prepare('SELECT * FROM cart_items WHERE user_id = ?').all(userId)
      : db.prepare('SELECT * FROM cart_items WHERE session_id = ?').all(sessionId);

    res.json({
      success: true,
      cart: enrichCart(rows)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve cart' });
  }
});

// POST /api/cart/add
router.post('/add', optionalToken, (req, res) => {
  try {
    const { userId, sessionId } = getCartOwner(req);
    const { product_id, variant_id, quantity = 1, selected_size, custom_measurements } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, error: 'Product ID is required' });
    }

    const productsData = getProducts();
    const product = productsData.find(p => String(p.id) === String(product_id) || p.handle === product_id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found in catalog' });
    }

    const resolvedVariantId = variant_id || product.variantId || 'default';
    const now = new Date().toISOString();

    // Check if line item with identical configuration already exists in cart
    const existing = userId
      ? db.prepare(`
          SELECT * FROM cart_items 
          WHERE user_id = ? AND product_id = ? AND variant_id = ? 
          AND (selected_size = ? OR (selected_size IS NULL AND ? IS NULL))
          AND (custom_measurements = ? OR (custom_measurements IS NULL AND ? IS NULL))
        `).get(userId, product.id, resolvedVariantId, selected_size || null, selected_size || null, custom_measurements || null, custom_measurements || null)
      : db.prepare(`
          SELECT * FROM cart_items 
          WHERE session_id = ? AND product_id = ? AND variant_id = ? 
          AND (selected_size = ? OR (selected_size IS NULL AND ? IS NULL))
          AND (custom_measurements = ? OR (custom_measurements IS NULL AND ? IS NULL))
        `).get(sessionId, product.id, resolvedVariantId, selected_size || null, selected_size || null, custom_measurements || null, custom_measurements || null);

    if (existing) {
      db.prepare(`
        UPDATE cart_items 
        SET quantity = quantity + ?, updated_at = ? 
        WHERE id = ?
      `).run(quantity, now, existing.id);
    } else {
      const newItemId = uuidv4();
      db.prepare(`
        INSERT INTO cart_items (
          id, user_id, session_id, product_id, variant_id, 
          quantity, selected_size, custom_measurements, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        newItemId,
        userId,
        sessionId,
        product.id,
        resolvedVariantId,
        quantity,
        selected_size || null,
        custom_measurements || null,
        now,
        now
      );
    }

    // Return updated cart
    const rows = userId
      ? db.prepare('SELECT * FROM cart_items WHERE user_id = ?').all(userId)
      : db.prepare('SELECT * FROM cart_items WHERE session_id = ?').all(sessionId);

    res.json({
      success: true,
      message: 'Item added to bag',
      cart: enrichCart(rows)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add item to bag' });
  }
});

// PUT /api/cart/update
router.put('/update', optionalToken, (req, res) => {
  try {
    const { userId, sessionId } = getCartOwner(req);
    const { item_id, quantity } = req.body;

    if (!item_id || quantity === undefined) {
      return res.status(400).json({ success: false, error: 'Item ID and quantity are required' });
    }

    const now = new Date().toISOString();

    if (quantity <= 0) {
      db.prepare('DELETE FROM cart_items WHERE id = ?').run(item_id);
    } else {
      db.prepare('UPDATE cart_items SET quantity = ?, updated_at = ? WHERE id = ?').run(quantity, now, item_id);
    }

    const rows = userId
      ? db.prepare('SELECT * FROM cart_items WHERE user_id = ?').all(userId)
      : db.prepare('SELECT * FROM cart_items WHERE session_id = ?').all(sessionId);

    res.json({
      success: true,
      cart: enrichCart(rows)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update item quantity' });
  }
});

// DELETE /api/cart/remove
router.delete('/remove', optionalToken, (req, res) => {
  try {
    const { userId, sessionId } = getCartOwner(req);
    const { item_id } = req.body;

    if (!item_id) {
      return res.status(400).json({ success: false, error: 'Item ID is required' });
    }

    db.prepare('DELETE FROM cart_items WHERE id = ?').run(item_id);

    const rows = userId
      ? db.prepare('SELECT * FROM cart_items WHERE user_id = ?').all(userId)
      : db.prepare('SELECT * FROM cart_items WHERE session_id = ?').all(sessionId);

    res.json({
      success: true,
      message: 'Item removed from bag',
      cart: enrichCart(rows)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to remove item from bag' });
  }
});

module.exports = router;
