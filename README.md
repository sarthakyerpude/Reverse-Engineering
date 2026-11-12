# 🌸 Reverse Engineering: Full-Stack E-Commerce Platforms

A repository showcasing reverse-engineered, standalone full-stack D2C e-commerce implementations of premier Indian handcrafted lifestyle brands. Both platforms have been custom-engineered with decoupled frontends, RESTful backend APIs, database persistence, payment workflows, order tracking, and authentic visual design.

---

## 📦 Projects in This Repository

| Project | Brand & URL | Tech Stack | Status | Key Highlights |
|---|---|---|---|---|
| **[Floreal](./floreal)** | [floreal.in](https://floreal.in/) *(Shark Tank India S5)* | Vanilla HTML5/CSS3/ES6+ Client + Express REST API + JSON Model DB | ✅ Verified | 131 Products, 25 Collections, Dual-Channel Checkout, 19/19 Tests |
| **[Rare You](./rareyou)** | [rareyou.com](https://rareyou.com/) *(Faridabad Artisanal Atelier)* | React 19 + TypeScript + Vite + Tailwind CSS + Express + SQLite WAL | ✅ Verified | 121 Products, 120+ Offline Photos, Shopify Dawn Clone, 18/18 Tests |

---

## 1. Floreal Platform (`/floreal`)

> Handcrafted crochet forever flowers that never fade. Designed for high performance, mobile ergonomics, and fast customer checkout.

- **Frontend**: Lightweight, high-speed HTML5 / CSS3 / ES6+ architecture with custom design tokens, quick view modals, floating WhatsApp chat, and 2-step express checkout.
- **Backend**: Express REST API on Port 5000 with endpoints for products, collections, order placement, shipment tracking, and pincode delivery validation.
- **Key Modules**:
  - 131 products across 25 curated collections.
  - Multi-step checkout with `< Return to Bag` navigation and address validation.
  - 5-step milestone shipment tracker.
  - Automated test suite with 19/19 passing tests.

### Quick Start (Floreal)
```powershell
# Backend (Port 5000)
cd floreal/backend
npm install
npm start

# Frontend (Port 3000)
cd floreal/frontend
npm start
```

---

## 2. Rare You Platform (`/rareyou`)

> Modern artisanal lifestyle atelier featuring forever flowers, hand-knotted macrame swings, bespoke apparel, and nursery companions.

- **Frontend**: Modern Single-Page Application (SPA) built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS v4** on Port 3000.
- **Backend**: Robust Node.js + Express REST API on Port 5000 with **SQLite** database running in high-concurrency WAL mode.
- **Exact Visual Realignment**:
  - Soft blush pink announcement bar (`#FCEAE6`): `< Also available on Blinkit in Delhi NCR >`.
  - Authentic `RARE ❤ YOU` brand logo wordmark with heart icon.
  - Exact 5 collection navigation links: `Forever Flowers` | `Home Decor` | `Accessories` | `Clothing` | `Kids`.
  - Filter & Sort bar: `Availability ∨`, `Price ∨`, `Color ∨`, and `Sort by: Featured ∨`.
  - 4-column product grid with 120+ authentic high-resolution photos downloaded from Shopify CDN.
  - Floating WhatsApp support button with interactive chat bubble: *"Hey, how can we help you? ✕"*.
- **Full-Stack Modules**:
  - Cart drawer with live threshold meter for free express shipping (₹1,499 threshold).
  - 2-step checkout with `< Return to Bag` navigation, address book, coupon engine (`RARE10`), and order snapshotting.
  - JWT authentication for guest and registered customer portals.
  - Automated test suite with 18/18 passing tests (100% pass rate).

### Quick Start (Rare You)
```powershell
# Backend (Port 5000)
cd rareyou/backend
npm install
npm start

# Frontend (Port 3000)
cd rareyou/frontend
npm install
npm run dev
```

---

## 🛠️ Repository Setup & Verification

Both projects have been independently tested and verified for production readiness:
- **Floreal Backend Tests**: `npm test` in `floreal/backend` (19/19 passed)
- **Rare You Backend Tests**: `npm test` in `rareyou/backend` (18/18 passed)
- **Rare You Frontend Build**: `npm run build` in `rareyou/frontend` (`tsc -b && vite build` built with 0 errors)

---

## 📄 License
This repository is created for educational and reverse-engineering research purposes.
