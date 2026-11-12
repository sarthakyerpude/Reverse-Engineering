const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/user');
const reviewRoutes = require('./routes/reviews');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend development
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id']
}));

app.use(express.json());

// Serve static product and collection images
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// API Root Status Handler (Prevents raw "Cannot GET /" seen in earlier versions)
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'Rare You E-Commerce REST API',
    version: '1.0.0',
    tagline: 'Because Handmade is Rare. And Rare is You.',
    studio: 'Faridabad, Haryana, India',
    endpoints: {
      health: '/health',
      collections: '/api/collections',
      products: '/api/products',
      cart: '/api/cart',
      orders: '/api/orders',
      auth: '/api/auth',
      user: '/api/user',
      reviews: '/api/reviews/:productId'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', productRoutes); // serves /api/products & /api/collections
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user', userRoutes);
app.use('/api/reviews', reviewRoutes);

// 404 Handler for undefined API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found on Rare You API Server`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ success: false, error: 'Internal server error occurred.' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Rare You API Server listening on http://localhost:${PORT}`);
  });
}

module.exports = app;

