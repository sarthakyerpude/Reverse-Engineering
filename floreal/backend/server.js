/**
 * Floreal E-Commerce API Server
 * Complete Full-Stack REST API & Media Server
 * Features: SQLite DB, JWT Auth, Server Cart, Orders Lifecycle, Reviews, Wishlist, Pincode & Payment
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Initialize database schema on boot
require('./db/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Root endpoint ───
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'Floreal Full-Stack E-Commerce API & Media Server',
    port: PORT,
    database: 'SQLite (WAL Mode)',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        profile: 'PUT /api/auth/profile'
      },
      cart: {
        get: 'GET /api/cart',
        add: 'POST /api/cart/add',
        update: 'PUT /api/cart/:itemId',
        delete: 'DELETE /api/cart/:itemId',
        merge: 'POST /api/cart/merge'
      },
      orders: {
        create: 'POST /api/orders/create',
        list: 'GET /api/orders',
        get: 'GET /api/orders/:id',
        track: 'GET /api/orders/track/:orderNumber',
        cancel: 'PUT /api/orders/:id/cancel'
      },
      user: {
        addresses: '/api/user/addresses',
        wishlist: '/api/user/wishlist'
      },
      reviews: '/api/reviews/:productId',
      products: '/api/products',
      images: '/images'
    },
    message: 'Backend server running with persistent database! Frontend UI at http://localhost:3000'
  });
});

// ─── Image gallery browser ───
app.get('/images', (req, res) => {
  const imgDir = path.join(__dirname, 'public/images');
  fs.readdir(imgDir, (err, files) => {
    if (err) return res.status(500).send('Error reading images directory');
    const imgFiles = files.filter(f => /\.(webp|png|jpe?g|svg)$/i.test(f));
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Floreal Local Image Store</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fdfaf9; margin: 0; padding: 24px; color: #333; }
          .header { max-width: 1200px; margin: 0 auto 24px auto; }
          h1 { margin: 0 0 8px 0; color: #2d3748; font-size: 24px; }
          p { margin: 0; color: #718096; font-size: 14px; }
          .gallery { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
          .card { background: white; border: 1px solid #edf2f7; border-radius: 8px; padding: 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
          .card img { width: 100%; height: 140px; object-fit: cover; border-radius: 6px; }
          .card a { display: block; margin-top: 8px; font-size: 11px; color: #4a5568; text-decoration: none; word-break: break-all; }
          .card a:hover { color: #f472b6; text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌸 Floreal Local Images (${imgFiles.length} files)</h1>
          <p>Images hosted locally on backend server. Click any image to view full resolution.</p>
        </div>
        <div class="gallery">
          ${imgFiles.map(f => `
            <div class="card">
              <a href="/images/${f}" target="_blank">
                <img src="/images/${f}" alt="${f}" loading="lazy">
                <span>${f}</span>
              </a>
            </div>
          `).join('')}
        </div>
      </body>
      </html>
    `);
  });
});

// Serve static images
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// ─── API Routes ───
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/user', require('./routes/user'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/products', require('./routes/products'));
app.use('/api/pincode', require('./routes/pincode'));
app.use('/api/payment', require('./routes/payment'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    brand: 'Floreal Handcrafted Forever Flowers',
    sharkTankSeason: 5,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🌸 Floreal Full-Stack API Server running at http://localhost:${PORT}`);
  console.log(`📦 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🛍️ Products Endpoint: http://localhost:${PORT}/api/products`);
  console.log(`🔐 Auth Endpoints: http://localhost:${PORT}/api/auth/login`);
  console.log(`🛒 Cart Endpoints: http://localhost:${PORT}/api/cart`);
  console.log(`📦 Orders Endpoints: http://localhost:${PORT}/api/orders`);
  console.log(`🖼️ Local Images Hosted at: http://localhost:${PORT}/images/<filename>`);
});
