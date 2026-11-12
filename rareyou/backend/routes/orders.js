const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { db, getNextOrderNumber } = require('../db/database');
const { optionalToken, authenticateToken } = require('../middleware/auth');

function getProducts() {
  const raw = fs.readFileSync(path.join(__dirname, '../data/products.json'), 'utf8');
  return JSON.parse(raw);
}

const FREE_SHIPPING_THRESHOLD = 1499;
const STANDARD_SHIPPING_FEE = 99;

// POST /api/orders/create
router.post('/create', optionalToken, (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const {
      email,
      phone,
      full_name,
      shipping_address,
      items,
      payment_method = 'razorpay',
      notes,
      coupon_code,
      session_id
    } = req.body;

    if (!email || !phone || !shipping_address || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Missing required checkout information.' });
    }

    const productsData = getProducts();
    let subtotal = 0;
    const frozenItems = [];

    for (const reqItem of items) {
      const product = productsData.find(p => String(p.id) === String(reqItem.product_id) || p.handle === reqItem.product_id);
      if (!product) continue;

      const variant = product.variants ? product.variants.find(v => String(v.id) === String(reqItem.variant_id)) : null;
      const unitPrice = variant && variant.price ? variant.price : product.price;
      const qty = Math.max(1, Number(reqItem.quantity) || 1);
      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;

      const mainImg = product.localImage || (product.images && product.images[0]) || product.image || '/images/prod-bumble-in-blue.png';

      frozenItems.push({
        product_id: product.id,
        product_name: product.title || product.name,
        product_handle: product.handle,
        product_category: product.category,
        variant_id: variant ? variant.id : (product.variantId || 'default'),
        variant_title: variant ? variant.title : null,
        selected_size: reqItem.selected_size || null,
        custom_measurements: reqItem.custom_measurements || null,
        unit_price: unitPrice,
        quantity: qty,
        line_total: lineTotal,
        image: mainImg
      });
    }

    if (frozenItems.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid products found in order.' });
    }

    // Calculate discounts & shipping
    let discount = 0;
    if (coupon_code && coupon_code.toUpperCase() === 'RARE10') {
      discount = Math.round(subtotal * 0.10);
    }

    const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
    const shippingFee = isFreeShipping ? 0 : STANDARD_SHIPPING_FEE;
    const total = Math.max(0, subtotal - discount + shippingFee);

    const orderId = uuidv4();
    const orderNumber = getNextOrderNumber();
    const now = new Date().toISOString();
    const trackingCode = `RYTRK${Math.floor(100000 + Math.random() * 900000)}`;

    const insertOrder = db.transaction(() => {
      // 1. Insert order record
      db.prepare(`
        INSERT INTO orders (
          id, order_number, user_id, email, phone, status,
          subtotal, discount, shipping_fee, total,
          payment_method, payment_status,
          shipping_address, items, notes, tracking_code, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        orderId,
        orderNumber,
        userId,
        email,
        phone,
        'confirmed',
        subtotal,
        discount,
        shippingFee,
        total,
        payment_method,
        payment_method === 'cod' ? 'pending' : 'paid',
        JSON.stringify(shipping_address),
        JSON.stringify(frozenItems),
        notes || null,
        trackingCode,
        now,
        now
      );

      // 2. Insert line items
      const insertItemStmt = db.prepare(`
        INSERT INTO order_items (
          id, order_id, product_id, product_name, product_handle, product_category,
          variant_id, variant_title, selected_size, custom_measurements,
          unit_price, quantity, line_total, image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const item of frozenItems) {
        insertItemStmt.run(
          uuidv4(),
          orderId,
          item.product_id,
          item.product_name,
          item.product_handle,
          item.product_category,
          item.variant_id,
          item.variant_title,
          item.selected_size,
          item.custom_measurements,
          item.unit_price,
          item.quantity,
          item.line_total,
          item.image
        );
      }

      // 3. Clear user's or session's cart items
      if (userId) {
        db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);
      } else if (session_id) {
        db.prepare('DELETE FROM cart_items WHERE session_id = ?').run(session_id);
      }
    });

    insertOrder();

    res.status(201).json({
      success: true,
      order: {
        id: orderId,
        order_number: orderNumber,
        tracking_code: trackingCode,
        total,
        subtotal,
        discount,
        shipping_fee: shippingFee,
        status: 'confirmed',
        created_at: now,
        items: frozenItems
      }
    });
  } catch (error) {
    console.error('Order creation failure:', error);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
});

// GET /api/orders (user orders history)
router.get('/', authenticateToken, (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    const enriched = orders.map(ord => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(ord.id);
      return {
        ...ord,
        shipping_address: JSON.parse(ord.shipping_address),
        items
      };
    });
    res.json({ success: true, orders: enriched });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:orderNumber
router.get('/:orderNumber', optionalToken, (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(req.params.orderNumber);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    res.json({
      success: true,
      order: {
        ...order,
        shipping_address: JSON.parse(order.shipping_address),
        items
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch order details' });
  }
});

// GET /api/orders/track/:orderNumberOrCode
router.get('/track/:query', (req, res) => {
  try {
    const q = req.params.query;
    const order = db.prepare('SELECT * FROM orders WHERE order_number = ? OR tracking_code = ?').get(q, q);
    if (!order) {
      return res.status(404).json({ success: false, error: 'No shipment found matching tracking criteria' });
    }

    const milestones = [
      { step: 1, title: 'Order Confirmed', description: 'Order verified and scheduled at Faridabad studio', completed: true, timestamp: order.created_at },
      { step: 2, title: 'Artisan Handcrafting', description: 'Women artisans knitting and assembling your blooms', completed: ['artisan_handcrafting', 'quality_inspection', 'shipped', 'out_for_delivery', 'delivered'].includes(order.status), timestamp: order.created_at },
      { step: 3, title: 'Quality & Safe Packaging', description: 'Visual inspection and protective gift-box packing', completed: ['quality_inspection', 'shipped', 'out_for_delivery', 'delivered'].includes(order.status), timestamp: null },
      { step: 4, title: 'Dispatched via Express Courier', description: 'Handed over to logistics partner (Delhi NCR / Pan-India)', completed: ['shipped', 'out_for_delivery', 'delivered'].includes(order.status), timestamp: null },
      { step: 5, title: 'Delivered', description: 'Handcrafted piece delivered to your doorstep', completed: order.status === 'delivered', timestamp: null }
    ];

    res.json({
      success: true,
      tracking: {
        order_number: order.order_number,
        tracking_code: order.tracking_code,
        status: order.status,
        created_at: order.created_at
      },
      milestones
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Tracking lookup failed' });
  }
});

module.exports = router;
