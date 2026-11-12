/**
 * Real SQLite Orders & Checkout API
 * Amazon/Shopify-style persistence, tracking timeline, and order status lifecycle
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { db, getNextOrderNumber } = require('../db/database');
const { authenticateToken, optionalAuth, requireAdmin } = require('../middleware/auth');

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

// POST /api/orders/create — Place a real order
router.post('/create', optionalAuth, (req, res) => {
  try {
    const {
      customer,
      items,
      shippingAddress,
      paymentMethod = 'cod',
      paymentId = null,
      notes = ''
    } = req.body;

    // Validate customer info
    const userId = req.user ? req.user.id : null;
    const customerName = (customer && customer.name) || (req.user && req.user.name) || 'Valued Customer';
    const customerEmail = (customer && customer.email) || (req.user && req.user.email) || '';
    const customerPhone = (customer && customer.phone) || (req.user && req.user.phone) || '';

    if (!customerEmail || !customerPhone) {
      return res.status(400).json({ success: false, error: 'Email and phone number are required for order confirmation.' });
    }

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.pincode) {
      return res.status(400).json({ success: false, error: 'Complete shipping address is required.' });
    }

    // Determine items to order
    let orderItems = [];

    if (Array.isArray(items) && items.length > 0) {
      orderItems = items;
    } else if (userId) {
      // Pull items from user's persistent database cart
      const cartRows = db.prepare('SELECT product_id, variant_id, quantity FROM cart_items WHERE user_id = ?').all(userId);
      orderItems = cartRows;
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ success: false, error: 'Your cart is empty. Add items before placing an order.' });
    }

    // Calculate verified totals & build snapshot
    let subtotal = 0;
    const finalItems = orderItems.map(item => {
      const pid = item.product_id || item.id;
      const p = findProductById(pid);
      let unitPrice = 499;
      let title = item.title || 'Forever Handcrafted Bloom';
      let image = item.image || '';

      if (p) {
        title = p.title || title;
        image = typeof p.image === 'string' ? p.image : (p.image?.src || p.images?.[0]?.src || p.images?.[0] || image);
        const variant = (p.variants && p.variants.find(v => String(v.id) === String(item.variant_id))) || p.variants?.[0];
        unitPrice = parseFloat(variant?.price || p.price || unitPrice);
      } else if (item.price) {
        unitPrice = parseFloat(item.price);
      }

      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;

      return {
        product_id: String(pid),
        variant_id: item.variant_id ? String(item.variant_id) : 'default',
        title,
        price: unitPrice,
        quantity: qty,
        image,
        line_total: lineTotal
      };
    });

    const freeShippingThreshold = 999;
    const shippingFee = subtotal >= freeShippingThreshold ? 0 : 99;
    const total = subtotal + shippingFee;

    const orderId = uuidv4();
    const orderNumber = getNextOrderNumber();
    const trackingNumber = `FLR-TRK-${Math.floor(100000000 + Math.random() * 900000000)}`;

    const insertOrder = db.prepare(`
      INSERT INTO orders (
        id, order_number, user_id, customer_name, customer_email, customer_phone,
        items_json, subtotal, shipping_fee, discount, total, shipping_address_json,
        payment_method, payment_status, order_status, tracking_number, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertOrder.run(
      orderId,
      orderNumber,
      userId,
      customerName,
      customerEmail,
      customerPhone,
      JSON.stringify(finalItems),
      subtotal,
      shippingFee,
      0,
      total,
      JSON.stringify(shippingAddress),
      paymentMethod,
      paymentMethod === 'cod' ? 'pending' : 'paid',
      'confirmed',
      trackingNumber,
      notes || ''
    );

    // If user has a database cart, clear it now
    if (userId) {
      db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);
    }

    const createdOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    createdOrder.items = JSON.parse(createdOrder.items_json);
    createdOrder.shipping_address = JSON.parse(createdOrder.shipping_address_json);

    console.log(`📦 Order placed: ${orderNumber} | Customer: ${customerName} | Total: ₹${total}`);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: createdOrder
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ success: false, error: 'Failed to process and place order.' });
  }
});

// GET /api/orders — Retrieve current user's order history
router.get('/', authenticateToken, (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
    `).all(req.user.id);

    const parsed = orders.map(o => ({
      ...o,
      items: JSON.parse(o.items_json || '[]'),
      shipping_address: JSON.parse(o.shipping_address_json || '{}')
    }));

    res.json({ success: true, count: parsed.length, orders: parsed });
  } catch (err) {
    console.error('Fetch user orders error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch orders.' });
  }
});

// GET /api/orders/:id — Retrieve single order by ID or order_number
router.get('/:id', optionalAuth, (req, res) => {
  try {
    const { id } = req.params;
    const order = db.prepare(`
      SELECT * FROM orders WHERE id = ? OR order_number = ?
    `).get(id, id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    const orderData = {
      ...order,
      items: JSON.parse(order.items_json || '[]'),
      shipping_address: JSON.parse(order.shipping_address_json || '{}')
    };

    res.json({ success: true, order: orderData });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch order details.' });
  }
});

// PUT /api/orders/:id/cancel — Cancel an unfulfilled order
router.put('/:id/cancel', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const order = db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?').get(id, id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to cancel this order.' });
    }

    if (['shipped', 'delivered', 'cancelled'].includes(order.order_status)) {
      return res.status(400).json({ success: false, error: `Order cannot be cancelled in '${order.order_status}' status.` });
    }

    db.prepare(`
      UPDATE orders SET order_status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(order.id);

    res.json({ success: true, message: 'Order has been successfully cancelled.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to cancel order.' });
  }
});

// GET /api/orders/track/:orderNumber — Real tracking milestone view
router.get('/track/:orderNumber', (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = db.prepare(`
      SELECT order_number, customer_name, order_status, tracking_number, created_at, total, items_json
      FROM orders
      WHERE order_number = ? OR tracking_number = ?
    `).get(orderNumber, orderNumber);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: `No shipment found for order or tracking reference "${orderNumber}".`
      });
    }

    const orderDate = new Date(order.created_at);
    const estDelivery = new Date(orderDate.getTime() + 4 * 24 * 60 * 60 * 1000);

    const milestones = [
      { step: 'Order Placed', time: order.created_at, completed: true },
      { step: 'Confirmed & Artisan Knitting', time: order.created_at, completed: ['confirmed', 'shipped', 'delivered'].includes(order.order_status) },
      { step: 'Quality Check & Packed', time: null, completed: ['shipped', 'delivered'].includes(order.order_status) },
      { step: 'Out for Delivery (Bluedart/Delhivery)', time: null, completed: ['delivered'].includes(order.order_status) },
      { step: 'Delivered', time: null, completed: order.order_status === 'delivered' }
    ];

    res.json({
      success: true,
      tracking: {
        order_number: order.order_number,
        status: order.order_status,
        tracking_number: order.tracking_number,
        estimated_delivery: estDelivery.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
        milestones,
        items: JSON.parse(order.items_json || '[]')
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to query tracking data.' });
  }
});

// Admin endpoint: List all orders
router.get('/admin/all', authenticateToken, requireAdmin, (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    const parsed = orders.map(o => ({
      ...o,
      items: JSON.parse(o.items_json || '[]'),
      shipping_address: JSON.parse(o.shipping_address_json || '{}')
    }));
    res.json({ success: true, count: parsed.length, orders: parsed });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve admin orders.' });
  }
});

// Admin endpoint: Update status
router.put('/admin/:id/status', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    db.prepare('UPDATE orders SET order_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
    res.json({ success: true, message: `Order status updated to ${status}.` });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update order status.' });
  }
});

module.exports = router;
