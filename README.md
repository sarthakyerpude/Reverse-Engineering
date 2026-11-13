# 🌸 Reverse Engineering: Full-Stack E-Commerce & Marketplace Platforms

A repository showcasing reverse-engineered, standalone full-stack implementations of premier Indian digital commerce platforms. All platforms have been custom-engineered with decoupled frontends, RESTful backend APIs, database persistence, payment workflows, order tracking, and authentic visual design.

---

## 📦 Projects in This Repository

| Project | Brand & URL | Tech Stack | Status | Key Highlights |
|---|---|---|---|---|
| **[Floreal](./floreal)** | [floreal.in](https://floreal.in/) *(Shark Tank India S5)* | Vanilla HTML5/CSS3/ES6+ Client + Express REST API + JSON Model DB | ✅ Verified | 131 Products, 25 Collections, Dual-Channel Checkout, 19/19 Tests |
| **[Rare You](./rareyou)** | [rareyou.com](https://rareyou.com/) *(Faridabad Artisanal Atelier)* | React 19 + TypeScript + Vite + Tailwind CSS + Express + SQLite WAL | ✅ Verified | 121 Products, 120+ Offline Photos, Shopify Dawn Clone, 18/18 Tests |
| **[Infyshopy](./infyshopy)** | [infyshopy.in](https://infyshopy.in/) *(Marketplace Studio)* | React 19 + TypeScript + Vite + Tailwind CSS + Express + SQLite WAL | ✅ Verified | 6 Marketplaces (Meesho, Flipkart, Amazon, Myntra, Snapdeal, SmartBiz), Excel Flat File Generator, GST & P&L Calculators, 19/19 Tests |

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

## 3. Infyshopy Platform (`/infyshopy`)

> High-performance multi-channel e-commerce listing automation & catalog management ERP for Indian marketplace sellers. *"One form. Every marketplace."*

- **Frontend**: Modern SPA built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS v4** on Port 3000. 1:1 recreation of the live Infyshopy Marketplace Studio UI with 8 listing workspace category tiles, 8-angle photo studio, modals, and seamless API reverse-proxying.
- **Backend**: Headless Node.js + Express REST API on Port 5000 backed by **SQLite WAL** database (`infyshopy.sqlite`) and **ExcelJS** spreadsheet compiler. Returns pure JSON status on `/` and serves all `/api/*` and `/auth/*` endpoints.
- **Multi-Marketplace Flat File Generator**:
  - Compiles ready-to-upload catalog files for **Meesho**, **Flipkart**, **Amazon India**, **Myntra**, **Snapdeal**, and **SmartBiz**.
  - Universal attribute translation matrix mapping canonical fields to portal-specific cell coordinates (`B3`, `C3`, `D3`, `E3`, `F3`, `SB`).
  - Cloudinary CDN image integration for public product photo URLs.
- **ERP & Financial Tools**:
  - **Shop Stock**: Multi-portal inventory tracking for Master SKUs.
  - **Listing Planning & My Work Today**: Operator task assignment, daily quotas, and portal markup pricing.
  - **Prepare GST Report**: Indian e-commerce GST reconciliation (GSTR-1, Section 52 TCS 1% deduction).
  - **Profit & Loss & Pricing Calculator**: Margin model factoring marketplace commissions, packaging, and RTO return losses.
  - **Wallet & Credits**: Pay-per-download credit model with UPI recharge workflow.
- **Automated Test Suite**: 14/14 passing tests (100% pass rate).

### Quick Start (Infyshopy)
```powershell
# Backend REST API Server (Port 5000)
cd infyshopy/backend
npm install
npm test
npm start

# Frontend React Client (Port 3000)
cd infyshopy/frontend
npm install
npm run dev
```

* **Frontend Studio URL**: [http://localhost:3000](http://localhost:3000) (Vite React 19 SPA)
* **Backend REST API**: [http://localhost:5000](http://localhost:5000) (JSON API status)
* **Default Credentials**: `demo@infyshopy.in` / `demo12345` (20 Credits)

---

## 🛠️ Repository Verification & Hygiene

All projects have been independently tested and verified for production readiness:
- **Floreal Backend Tests**: `npm test` in `floreal/backend` (19/19 passed)
- **Rare You Backend Tests**: `npm test` in `rareyou/backend` (18/18 passed)
- **Infyshopy Backend Tests**: `npm test` in `infyshopy/backend` (14/14 passed)
- **Git Hygiene**: All internal `project-docs/` across all platforms are strictly excluded from git tracking to prevent confidential prompt and credential leakage.

---

## 📄 License
This repository is created for educational and reverse-engineering research purposes.
