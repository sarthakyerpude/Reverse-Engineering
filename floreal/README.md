# Floreal Platform — Standalone Full-Stack E-Commerce Architecture

A custom-engineered, independent D2C e-commerce platform for **Floreal** (`https://floreal.in/`), India's premier handcrafted crochet and forever flowers brand featured on **Shark Tank India Season 5**.

---

## 📂 Repository Structure

The codebase is split into **Frontend** and **Backend**:

```text
floreal/
├── frontend/                        # Complete client-side application & 15 views
│   ├── index.html                   # Home Page
│   ├── collections.html             # Collections Hub & Category Catalog
│   ├── product.html                 # Product Detail Page (PDP)
│   ├── cart.html                    # Standalone Shopping Bag Page
│   ├── checkout.html                # 2-Step Indian Checkout Page
│   ├── order-success.html           # Order Confirmation & Receipt
│   ├── track-order.html             # Self-Service Order Tracking Portal
│   ├── wishlist.html                # Saved Forever Blooms
│   ├── account.html                 # Customer Portal & Order History
│   ├── admin.html                   # Artisan & Store Admin Dashboard
│   ├── about.html                   # Our Story & Shark Tank Mission
│   ├── contact.html                 # Contact Us & WhatsApp Hotline
│   ├── shipping-policy.html         # Shipping & Delivery Terms
│   ├── returns-policy.html          # Replacement Guarantee
│   ├── care-guide.html              # Forever Flower Care Guide
│   ├── README.md                    # Frontend documentation
│   └── assets/
│       ├── css/                     # Design tokens, layouts, components & pages
│       ├── data/                    # 131 products across 25 collections
│       └── js/                      # Cart, Wishlist, Checkout, Tracking, Admin, Search
│
└── backend/                         # REST API server & database storage
    ├── server.js                    # Express API server entry point
    ├── package.json                 # Backend dependencies & npm scripts
    ├── .env.example                 # Secrets & configuration template
    ├── README.md                    # Backend setup instructions
    ├── routes/                      # Modular API route controllers
    │   ├── products.js              # /api/products & /api/collections
    │   ├── orders.js                # /api/orders & /api/orders/create
    │   ├── tracking.js              # /api/orders/track
    │   ├── pincode.js               # /api/pincode/:pincode
    │   └── payment.js               # /api/payment/verify
    └── data/                        # Persistent JSON database models
        ├── products.json            # 131 product records
        ├── collections.json         # 25 collection records
        └── orders.json              # Active orders & tracking logs
```

---

## 🚀 How to Run

### 1. Run the Frontend Storefront
Directly open `frontend/index.html` in Google Chrome or any browser, or use a local HTTP server:
```bash
cd frontend
npm start
# Or using: npx serve .
```
Visit `http://localhost:3000`.

### 2. Run the Backend API Server
```bash
cd backend
npm install
npm start
```
The API server will listen on `http://localhost:5000`.

### 3. Run Backend Test Suite
```bash
cd backend
npm test
```
*Result*: 19/19 tests pass (100%).

---

## 🌸 Key E-Commerce Features Implemented

1. **Catalog of 131 Handcrafted SKUs & 25 Collections**: Pre-loaded with authentic titles, images, and prices.
2. **Dynamic ₹999 Free Shipping Progress Bar**: Real-time threshold calculation with celebratory unlocked state.
3. **Dual-Channel Checkout**: 2-Step Indian checkout with simulated Razorpay UPI / Cards, COD, and instant 1-click WhatsApp order generation.
4. **5-Stage Order Tracking Portal**: Interactive shipment tracking with sample test orders (`#FLO-84920`, `#FLO-51042`).
5. **Artisan Admin Operations Desk**: 1-click order stage advancement and catalog inventory switches.
