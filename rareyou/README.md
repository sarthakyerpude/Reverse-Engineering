# Rare You Platform — Standalone Full-Stack E-Commerce Architecture

A custom-engineered, independent D2C e-commerce platform for **Rare You** (`https://rareyou.com/`), an artisanal lifestyle atelier based out of Faridabad, Haryana, India.

> **Tagline**: _"Because Handmade is Rare. And Rare is You."_

---

## 🏛️ Architecture & Tech Stack

| Layer               | Technology                       | Details                                                    |
| ------------------- | -------------------------------- | ---------------------------------------------------------- |
| **Frontend Client** | React 19 + TypeScript + Vite     | Port 3000, Tailwind CSS v4, Lucide Icons, React Router DOM |
| **Backend API**     | Node.js + Express                | Port 5000, RESTful endpoints with CORS & express.json      |
| **Database Engine** | SQLite (WAL mode, Foreign Keys)  | `rareyou.sqlite`, transactions, atomic order sequencing    |
| **Media Pipeline**  | Local Static Asset Storage       | 120+ authentic high-resolution photographs served offline  |
| **Authentication**  | JWT (JSON Web Tokens) + bcryptjs | Secure password hashing, guest session & user auth         |

---

## 📂 Repository Structure

```text
rareyou/
├── frontend/                        # React 19 + TypeScript SPA Client
│   ├── src/
│   │   ├── components/              # Header, Footer, ProductCard, CartDrawer, AuthModal, WhatsAppWidget
│   │   ├── pages/                   # HomePage, CollectionsPage, ProductPage, CartPage, CheckoutPage, etc.
│   │   ├── context/                 # AuthContext, CartContext
│   │   └── types/                   # TypeScript interfaces (Product, Collection, Order, Review, etc.)
│   ├── public/                      # Static assets & 120+ downloaded product photos
│   ├── vite.config.ts               # Proxy configuration to Port 5000
│   └── package.json                 # Frontend dependencies & npm scripts
│
└── backend/                         # Express REST API Server
    ├── db/                          # SQLite WAL database & schema migrations
    ├── routes/                      # Modular API routes (products, collections, cart, orders, reviews, user)
    ├── middleware/                  # JWT auth middleware
    ├── public/images/               # Local image CDN (logo, hero banners, product photography)
    ├── data/                        # 121 authentic products, collections metadata
    ├── test_fullstack.js            # Automated test suite (18/18 tests passed)
    └── server.js                    # Express API server entry point
```

---

## ✨ Key Features & Capabilities

1. **Exact Visual Clone of Rare You**:
   - **Announcement Bar**: Soft blush pink (`#FCEAE6`) with Blinkit delivery announcement: `< Also available on Blinkit in Delhi NCR >`.
   - **Header & Logo**: Authentic `RARE ❤ YOU` brand logo with heart wordmark.
   - **5 Primary Collections**:
     - `Forever Flowers` (`/collections/forever-flower`) — 36 handcrafted forever blooming bouquets.
     - `Home Decor` (`/collections/home-decor`) — 36 tapestries, mirrors & curtain tiebacks.
     - `Accessories` (`/collections/accessories`) — 21 crochet tote bags, keychains & clutches.
     - `Clothing` (`/collections/clothing`) — 14 pure cotton & linen artisanal dresses.
     - `Kids & Swings` (`/collections/swings`) — 14 macrame baby swings & nursery companions.
   - **Collections Hub**: Dropdown filters (`Availability ∨`, `Price ∨`, `Color ∨`), sort selector (`Sort by: Featured ∨`), and dynamic product count badge.
   - **4-Column Product Grid**: Clean rounded cards with live INR pricing, `Sale` pill badges, and star ratings.
   - **Floating WhatsApp Widget**: Green WhatsApp button with speech bubble tooltip: _"Hey, how can we help you? ✕"_.

2. **Full-Stack E-Commerce Engine**:
   - **Persistent Cart Drawer**: Real-time quantity stepper, slide-in drawer, and free express shipping progress bar (threshold: ₹1,499).
   - **2-Step Express Checkout**: Includes `< Return to Bag` navigation, delivery address fields, coupon validation (`RARE10`), and multiple payment methods (UPI, NetBanking, COD).
   - **Sequential Order Generation**: Atomic sequential order numbers (`RY-1001`, `RY-1002`, ...).
   - **Shipment Tracking Portal**: 5-step milestone tracking with live status lookup (`/track`).
   - **Customer Reviews System**: 5-star rating submission with verified buyer badges.

---

## 🚀 Running the Project Locally

### 1. Backend Server (Port 5000)

```powershell
cd backend
npm install
npm start
```

_Health Check_: `http://localhost:5000/health`  
_API Root_: `http://localhost:5000/`

### 2. Frontend Client (Port 3000)

```powershell
cd frontend
npm install
npm run dev
```

_Web Application_: `http://localhost:3000/`

### 3. Running Backend Tests

```powershell
cd backend
npm test
```

_Result_: 18/18 tests pass (100%).
