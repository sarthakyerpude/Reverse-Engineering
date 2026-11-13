require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const sameOriginCheck = require('./middleware/sameOrigin');
const { authMiddleware } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with credentials for Port 3000 frontend
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5000',
    'https://infyshopy.in'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Apply global authentication extractor
app.use(authMiddleware);

// Same-Origin CSRF Gate (matching live infyshopy.in protection)
app.use(sameOriginCheck);

// Mount API and Auth routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// Root route - Pure Backend API Status (NO frontend HTML rendering on Port 5000)
app.get('/', (req, res) => {
  res.json({
    service: 'Infyshopy Backend REST API Engine',
    version: '1.0.0',
    port: Number(PORT),
    status: 'online',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: ['/auth/login', '/auth/register', '/auth/session', '/auth/logout'],
      api: [
        '/api/state',
        '/api/overview',
        '/api/catalogs',
        '/api/portal-files',
        '/api/planning',
        '/api/planning/create',
        '/api/stock',
        '/api/stock/update',
        '/api/listings/sync',
        '/api/download/:market/:batchId',
        '/api/gst/summary',
        '/api/pnl/calculate'
      ]
    },
    message: 'Backend API is running. The Studio Frontend UI runs on Port 3000 (http://localhost:3000).'
  });
});

// Any other non-API route returns clear JSON guidance
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found on Backend API (Port 5000).',
    requestedPath: req.path,
    message: 'Port 5000 is dedicated to REST API endpoints (/api/* and /auth/*). To access the Frontend UI, please navigate to http://localhost:3000'
  });
});

// Start Express Server
let server = null;
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 INFYSHOPY Backend REST API Server running on port ${PORT}`);
    console.log(`⚙️ Backend API:   http://localhost:${PORT}`);
    console.log(`🌐 Frontend UI:    http://localhost:3000`);
    console.log(`====================================================`);
  });
}

module.exports = { app, server };
