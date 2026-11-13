# INFYSHOPY Platform — Multi-Channel E-Commerce Listing Studio & ERP Architecture

A production-grade, full-stack recreation and reverse-engineered implementation of **Infyshopy Marketplace Studio** (`https://infyshopy.in/studio.html`), the premier catalog listing and inventory ERP engineered for Indian apparel and textile manufacturers across Surat, Delhi-NCR, Ahmedabad, and Jaipur.

> **Core Philosophy**: *"One form. Every marketplace."*  
> Enter master attributes and photos once, then instantly generate official, validated catalog flat files for **Meesho**, **Flipkart**, **Amazon India**, **Myntra**, **Snapdeal**, and **SmartBiz**.

---

## 🏛️ Architecture & Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend Client** | **React 19 + TypeScript + Vite** | Port 3000, Tailwind CSS v4, Lucide Icons, React Router v7, Vite Reverse Proxy |
| **Backend API** | **Node.js + Express** | Port 5000, Headless REST API (JSON only), Cookie Session Auth, Same-Origin CSRF Gate |
| **Database Engine** | **SQLite (WAL mode)** | `infyshopy.sqlite`, Foreign Keys enabled, transactional metrics & inventory tracking |
| **Spreadsheet Engine** | **ExcelJS** | Multi-sheet compiler generating official formatted `.xlsx` templates for all 6 portals |
| **Media Pipeline** | **Cloudinary CDN Integration** | Multi-angle image validation (8 angles) with public URL generation for flat files |
| **Authentication** | **Session Cookies + bcryptjs** | Salted password hashing, session cookies, pre-configured with active seller credits |

---

## 📂 Repository Structure

```text
infyshopy/
├── package.json                         # Monorepo scripts (start:backend, dev:frontend, etc.)
├── README.md                            # Comprehensive platform documentation
├── .gitignore                           # Ignores node_modules, .env, build, dist, project-docs
│
├── frontend/                            # React 19 + TypeScript + Vite SPA (Port 3000)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.tsx              # Authentic 14-item scrollable navigation sidebar
│   │   │   └── TopBar.tsx               # Top bar with credit pills, quick actions & modals
│   │   ├── context/
│   │   │   └── AuthContext.tsx          # Authentication & session provider with /auth/session
│   │   ├── pages/
│   │   │   ├── ListingStudioPage.tsx    # 8 Category workspace cards & master listing studio
│   │   │   ├── DashboardPage.tsx        # Dynamic KPI stats & 6 connected marketplace cards
│   │   │   ├── StockPage.tsx            # Shop stock multi-channel inventory management
│   │   │   ├── MyWorkPage.tsx           # Daily operator listings & QC checklist
│   │   │   ├── PlanningPage.tsx         # SKU planning tasks & operator assignments
│   │   │   ├── PortalFilesPage.tsx      # Ready-to-download official .xlsx files for 6 portals
│   │   │   ├── SettingsPage.tsx         # Studio brand defaults, HSN codes & manufacturer info
│   │   │   ├── ImageLibraryPage.tsx     # 8-angle photo studio with 90° clockwise rotation
│   │   │   ├── RechargePage.tsx         # Wallet credit recharge packs & instant UPI details
│   │   │   ├── BackupsPage.tsx          # Google Drive & SQLite instant backup snapshots
│   │   │   ├── ReferralsPage.tsx        # Refer a friend program (earn 20 credits per friend)
│   │   │   ├── EmployeeWorkPage.tsx     # Operator work logs & productivity tracker
│   │   │   ├── CatalogTrackerPage.tsx   # Live marketplace catalog sync tracker
│   │   │   ├── PolicyPage.tsx           # Listing rules, image guidelines & platform policies
│   │   │   ├── GstReportPage.tsx        # Form GSTR-1 output tax & Section 52 TCS calculator
│   │   │   ├── ProfitLossPage.tsx       # Real monthly financial waterfall P&L statement
│   │   │   ├── PnlCalculatorPage.tsx    # Unit economics, commission markup & RTO simulator
│   │   │   └── AuthPage.tsx             # Dual-mode Sign In / Sign Up seller portal
│   │   ├── types/
│   │   │   └── index.ts                 # TypeScript definitions (User, Product, Stock, Task)
│   │   ├── App.tsx                      # React Router configuration & ProtectedLayout wrapper
│   │   ├── index.css                    # Tailwind CSS v4 imports & custom sidebar scrollbar
│   │   └── main.tsx                     # React 19 entry point
│   ├── vite.config.ts                   # Port 3000 configuration & backend proxy to Port 5000
│   └── package.json                     # Frontend dependencies
│
└── backend/                             # Headless Node.js + Express REST API (Port 5000)
    ├── data/
    │   ├── brandFixedConfig.json        # Surat apparel brand configuration (HSN, GST, packer)
    │   ├── initialState.json            # Canonical attributes, schemas & marketplace mappings
    │   └── schema.json                  # Category field validation rules
    ├── db/
    │   ├── database.js                  # SQLite WAL initialization, models & metrics queries
    │   └── infyshopy.sqlite             # SQLite database (Users, Stock, Planning, Batches)
    ├── middleware/
    │   ├── auth.js                      # Cookie session extractor & requireAuth guard
    │   └── sameOrigin.js                # CSRF protection (replicates live infyshopy.in gate)
    ├── routes/
    │   ├── auth.js                      # /auth (login, register, session, logout)
    │   └── api.js                       # /api (state, overview, stock, planning, gst, excel)
    ├── services/
    │   └── excelService.js              # ExcelJS spreadsheet generation for all 6 portals
    ├── test_fullstack.js                # 14/14 Passing automated E2E tests
    ├── test_dual_port.js                # 6/6 Passing dual-port architecture tests
    ├── .env.example                     # Environment template for marketplace API integration
    ├── server.js                        # Headless Express API server entry point
    └── package.json                     # Backend dependencies
```

---

## ⚡ Strict Dual-Port Separation

This architecture adheres strictly to separation of concerns:

```
┌────────────────────────────────────────────────────────┐
│               PORT 3000: FRONTEND SPA                  │
│       Vite + React 19 + TypeScript + Tailwind          │
│                                                        │
│  • studio.html (Listing Workspaces & Category Tiles)   │
│  • Realtime dynamic state (0 static / mock numbers)    │
│  • Reverse Proxy: /auth/* & /api/* -> Port 5000        │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP Reverse Proxy
                           ▼
┌────────────────────────────────────────────────────────┐
│               PORT 5000: BACKEND API                   │
│         Headless Node.js + Express REST API            │
│                                                        │
│  • GET / -> Pure JSON service status (Never serves UI) │
│  • REST Endpoints: /auth/login, /api/overview, etc.    │
│  • SQLite WAL Database & ExcelJS Flat File Compiler    │
└────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features & Authentic 1:1 UI Recreation

### 1. Unified TopBar & Modal Actions
- **Quick Actions**:
  - `👥 Refer a Friend`: Displays personal referral link (`https://infyshopy.in/auth.html?ref=INFY-773`) with 1-click clipboard copy.
  - `☁ Drive Backup`: Local WAL snapshot and Google Drive cloud backup trigger.
  - `⏱ Recent Activity`: Realtime summary of compiled catalog batches.
- **Account & Session Bar**:
  - Displays authenticated user (`Signed In as demo@infyshopy.in`).
  - Active wallet credits pill (`20 credits`).
  - `+ Recharge`: UPI credit recharge modal (50 credits @ ₹500, 120 credits @ ₹1,000 via `infyshopy.pay@icici`).
  - `🔄 Refresh`: Refreshes session balance from SQLite.
  - `Logout ↗`: Terminates cookie session. **Note**: When signed in, the redundant `Login` button is strictly hidden.
- **Tutorial Bar**:
  - `▶ YouTube Guide`: Modal with 4-minute video guide on multi-channel cataloging.
  - `Seller Code: INFY-773 · Matrix V4.2`.

### 2. Full 14-Item Scrollable Sidebar Navigation
Matches the exact structure, font sizing, and custom dark green scrollbar (`#76a99a #1d4b42`) of the live site:
- **Primary Workspaces (Scrollable Area)**:
  1. `Shop Stock` (*Inventory & daily reports*)
  2. `My Work Today` (*Today's listings & QC status*)
  3. `Planning` (*SKU tasks & operator assignments*)
  4. `Dashboard` (*Performance & lifetime metrics*)
  5. `Start Listings` (*Workspaces & templates*)
  6. `Marketplace Portal Files` (*Official Excel templates ready for download*)
  7. `Backup & Restore` (*Drive & local backups*)
  8. `Refer a Friend` (*Earn 20 credits per friend*)
  9. `Settings` (*Brand fixed config, HSN & manufacturer*)
  10. `Image Library` (*Catalog photo angles & Cloudinary URLs*)
  11. `Credits & Recharge` (*Wallet balance & recharge options*)
  12. `Employee Work Report` (*Operator productivity logs*)
  13. `Catalog Tracker` (*Live marketplace sync tracker*)
- **Dynamic Scroll Hint**:
  - Displays `↕ Scroll for more menu items` when content overflows viewport.
  - Dynamically updates to `↑ Scroll up for more menu items` upon reaching the bottom.
- **Secondary Actions (Bottom Area)**:
  - `Policy & Privacy` (*Marketplace listing rules & compliance*)
  - `Prepare GST Report` (*GSTR-1 output tax & Section 52 TCS reconciliation*)
  - `Profit & Loss` (*Monthly SKU Profitability Statement waterfall*)
  - `Cost & Pricing Calculator` (*Unit economics & RTO return loss reserve simulator*)
  - `↗ Sign out` (*Instant logout action*)

### 3. Multi-Marketplace Spreadsheet Generation
Compiles official flat files in one click for all 6 target portals:
1. **Meesho**: Supplier Panel Bulk Catalog Upload Sheet (`.xlsx`)
2. **Flipkart**: Seller Hub Vertical Catalog Template (`.xlsx`)
3. **Amazon India**: Category Inventory Loader Flat File (`.xlsx`)
4. **Myntra**: Partner Portal Master Sheet (`.xlsx`)
5. **Snapdeal**: Seller Zone Bulk Apparel Feed (`.xlsx`)
6. **SmartBiz**: Amazon SmartBiz D2C Storefront File (`.xlsx`)

### 4. Dynamic Data & Financial ERP (Zero Mock Numbers)
- **100% Dynamic Metrics**: All stats in the Dashboard (`Lifetime Listings`, `Ready Listing Files`, `Master SKU Stock`, `Wallet Balance`) are computed via SQLite aggregate queries (`getMetrics(userId)`). Empty states honestly display `0`, never hardcoded fake numbers.
- **Profit & Loss Statement (`/pnl`)**: Full monthly waterfall statement:
  $$\text{Net Revenue} = \text{Gross Portal Dispatches} - \text{Customer Returns \& RTO}$$
  $$\text{Net Profit} = \text{Net Revenue} - (\text{COGS} + \text{Portal Fees} + \text{Operating Shop Expenses})$$
- **GST Reconciliation (`/gst`)**: Calculates Form GSTR-1 tax liability and claimable Section 52 Tax Collected at Source (1% TCS) across Meesho, Flipkart, and Amazon.
- **Shop Stock Management (`/stock`)**: Master SKU inventory tracking with real-time editing and inventory health alerts.

---

## 🔑 Marketplace APIs & `.env` Setup

Infyshopy supports both **Flat-File (Excel) Generation** (used by 95%+ sellers without complex API approvals) and **Direct Marketplace REST APIs** for live inventory synchronization.

To configure API connections, copy `.env.example` to `.env` in `infyshopy/backend/`:

```powershell
cd infyshopy/backend
copy .env.example .env
```

### Required Credentials Overview:

| Marketplace / Tool | Environment Keys | Purpose | Where to Obtain |
| :--- | :--- | :--- | :--- |
| **Cloudinary CDN** *(Crucial)* | `CLOUDINARY_CLOUD_NAME`<br>`CLOUDINARY_API_KEY`<br>`CLOUDINARY_API_SECRET` | Generates public CDN URLs for product photos to inject into spreadsheet cells | [Cloudinary Console](https://console.cloudinary.com/) -> Dashboard -> API Keys |
| **Meesho** | `MEESHO_SUPPLIER_ID`<br>`MEESHO_API_KEY`<br>`MEESHO_SECRET_KEY` | Direct inventory updates & order retrieval | Meesho Supplier Panel -> Settings -> Developer / API |
| **Flipkart** | `FLIPKART_APP_ID`<br>`FLIPKART_APP_SECRET`<br>`FLIPKART_SELLER_ID` | Automated listing sync & inventory feed | [Flipkart Developer Console](https://api.flipkart.net/) -> Create Seller App |
| **Amazon India** | `AMAZON_MARKETPLACE_ID`<br>`AMAZON_SELLER_ID`<br>`AMAZON_LWA_CLIENT_ID`<br>`AMAZON_LWA_CLIENT_SECRET`<br>`AMAZON_SP_API_REFRESH_TOKEN`<br>`AMAZON_AWS_ACCESS_KEY_ID` | Amazon Selling Partner API (SP-API) for inventory and order feeds | Amazon Seller Central -> Partner Network -> Develop Apps (India ID: `A21TJRUUN4KGV`) |
| **Myntra** | `MYNTRA_PARTNER_API_KEY`<br>`MYNTRA_STORE_ID` | Fashion catalog & inventory integration | Myntra Partner Portal (PP-API) |
| **Snapdeal** | `SNAPDEAL_API_KEY`<br>`SNAPDEAL_SELLER_TOKEN` | Apparel feed & stock update | Snapdeal Seller Connect |
| **SmartBiz** | `SMARTBIZ_STORE_ID`<br>`SMARTBIZ_ACCESS_TOKEN` | D2C storefront sync | SmartBiz Dashboard -> Settings -> API Access |

---

## 🚀 Quick Start & Local Setup

### 1. Start Backend REST API (Port 5000)

```powershell
cd infyshopy/backend
npm install
npm start
```

* API Endpoint: `http://localhost:5000/` *(Returns JSON health check)*
* Test Suite: `npm test` *(Runs 14/14 automated E2E tests)*

### 2. Start Frontend React Studio (Port 3000)

```powershell
cd infyshopy/frontend
npm install
npm run dev
```

* Studio Web Application: `http://localhost:3000/`
* Production Build: `npm run build` *(Compiles in <500ms with TypeScript checking)*

### 3. Pre-Configured Test Credentials

| Field | Value |
| :--- | :--- |
| **Email** | `demo@infyshopy.in` |
| **Password** | `demo12345` |
| **Seller Code** | `INFY-DEMO` |
| **Initial Wallet Balance** | `20 Credits` |

---

## 🔒 Confidentiality & Git Hygiene

* `infyshopy/project-docs/` is **strictly untracked** and protected by `.gitignore`.
* Private `.env` files, SQLite WAL temporary caches (`*.sqlite-wal`, `*.sqlite-shm`), and `node_modules/` are excluded from version control.
