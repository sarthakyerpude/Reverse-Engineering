# Floreal Backend API Server

REST API server for the Floreal Handcrafted Forever Flowers platform.

## Features
- **Standalone Image Hosting**: Serves 579 authentic high-resolution flower and bouquet images directly via `GET /images/<filename>`.
- **Products Catalog API**: Filter by 25 collections, price range, and sort orders over 131 SKUs (`GET /api/products`).
- **Orders & Checkout API**: Create orders, compute server-side totals and ₹999 free shipping rules (`POST /api/orders/create`).
- **Real-Time Order Tracking**: 5-stage shipment stepper lookup by Order ID or AWB (`POST /api/orders/track`).
- **Pincode Delivery Estimator**: Instant Indian 6-digit postal code validation (`GET /api/pincode/:pincode`).
- **Payment Signature Verification**: Razorpay verification (`POST /api/payment/verify`).
- **Artisan Management**: Advance order status and assign courier AWB tracking numbers (`PATCH /api/orders/:id/status`).

## Quickstart
```bash
cd backend
npm install
npm start
```

Default server port: `http://localhost:5000`
Health check: `http://localhost:5000/api/health`

