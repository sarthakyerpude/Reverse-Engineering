const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const uuidv4 = () => crypto.randomUUID();

const bundledDbPath = path.join(__dirname, 'infyshopy.sqlite');
const dbPath = process.env.VERCEL
  ? path.join('/tmp', 'infyshopy.sqlite')
  : bundledDbPath;

if (process.env.VERCEL && !fs.existsSync(dbPath) && fs.existsSync(bundledDbPath)) {
  fs.copyFileSync(bundledDbPath, dbPath);
}

const db = new Database(dbPath);

// Enable WAL mode & foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      phone TEXT,
      country_code TEXT DEFAULT '+91',
      role TEXT DEFAULT 'owner',
      balance_credits INTEGER DEFAULT 20,
      seller_code TEXT DEFAULT '',
      categories_json TEXT DEFAULT '["Sarees"]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      brand_name TEXT NOT NULL,
      manufacturer TEXT DEFAULT 'Faridabad Artisanal Atelier',
      packer TEXT DEFAULT 'Faridabad Artisanal Atelier',
      importer TEXT DEFAULT '',
      country_of_origin TEXT DEFAULT 'India',
      hsn_code TEXT DEFAULT '5407',
      gst_percent REAL DEFAULT 5.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      handle TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      symbol TEXT NOT NULL,
      is_ready INTEGER DEFAULT 0,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS master_products (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      master_sku TEXT NOT NULL,
      title TEXT NOT NULL,
      base_price REAL NOT NULL,
      mrp REAL NOT NULL,
      attributes_json TEXT,
      image_urls_json TEXT,
      status TEXT DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS listing_batches (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      batch_name TEXT NOT NULL,
      selected_markets_json TEXT,
      products_count INTEGER DEFAULT 1,
      credits_debited INTEGER DEFAULT 1,
      output_files_json TEXT,
      status TEXT DEFAULT 'ready',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS planning_tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      assigned_to TEXT DEFAULT 'Unassigned',
      master_sku TEXT NOT NULL,
      category TEXT DEFAULT 'saree',
      status TEXT DEFAULT 'planned',
      target_price REAL,
      target_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS inventory_stock (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      master_sku TEXT NOT NULL,
      stock_quantity INTEGER DEFAULT 100,
      reserved_quantity INTEGER DEFAULT 0,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      description TEXT,
      reference_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Seed default categories
  const categoriesCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
  if (categoriesCount === 0) {
    const insertCat = db.prepare('INSERT INTO categories (id, handle, name, symbol, is_ready, description) VALUES (?, ?, ?, ?, ?, ?)');
    const initialCategories = [
      ['saree', 'saree', 'Saree Listing', '◈', 1, 'Your current six-marketplace listing workspace'],
      ['kurti', 'kurti', 'Kurti Listing', '♧', 1, 'Six marketplaces · separate Kurti sizes, attributes and originals'],
      ['shoes', 'shoes', 'Shoes Listing', '↗', 0, 'Coming soon'],
      ['wallpaper', 'wallpaper', 'Wallpaper Listing', '▥', 0, 'Coming soon'],
      ['home', 'home', 'Home & Kitchen', '⌂', 0, 'Coming soon'],
      ['shirts', 'shirts', 'Shirts Listing', '▣', 0, 'Coming soon'],
      ['suits', 'suits', 'Suit Listing', '▧', 0, 'Coming soon'],
      ['suiting', 'suiting', 'Suiting Listing', '◇', 0, 'Coming soon'],
      ['lowers', 'lowers', 'Lower / Trousers', 'Ⅱ', 0, 'Coming soon']
    ];
    for (const cat of initialCategories) {
      insertCat.run(...cat);
    }
  }

  // Clean up any non-demo legacy users
  db.prepare('DELETE FROM users WHERE email != ?').run('demo@infyshopy.in');

  // Seed default demo user: demo@infyshopy.in / demo12345
  const demoUser = db.prepare('SELECT * FROM users WHERE email = ?').get('demo@infyshopy.in');
  if (!demoUser) {
    const userId = uuidv4();
    const hash = bcrypt.hashSync('demo12345', 10);
    db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, phone, country_code, role, balance_credits, seller_code, categories_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, 'demo@infyshopy.in', hash, 'Demo Seller', '9876543210', '+91', 'owner', 20, 'INFY-DEMO', JSON.stringify(['Sarees', 'Kurtis']));

    // Seed initial brands for this user
    const insertBrand = db.prepare('INSERT INTO brands (id, user_id, brand_name, manufacturer, packer, hsn_code, gst_percent) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const defaultBrands = ['Madhu Saree', 'Infyshopy', 'Being Stylo', 'Maa Ambey', 'Smart Biz'];
    for (const b of defaultBrands) {
      insertBrand.run(uuidv4(), userId, b, 'Textile Atelier Surat / Delhi', 'Textile Atelier Surat / Delhi', '5407', 5.0);
    }

    // Seed initial welcome transaction
    db.prepare(`
      INSERT INTO wallet_transactions (id, user_id, type, amount, description, reference_id)
      VALUES (?, ?, 'credit', 20, 'Initial trial credits granted', 'SYS-WELCOME-20')
    `).run(uuidv4(), userId);
  }
}

// User Helpers
function findUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email);
}

function getUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function createUser({ email, password, fullName = '', phone = '', countryCode = '+91', categories = [] }) {
  const id = uuidv4();
  const hash = bcrypt.hashSync(password, 10);
  db.prepare(`
    INSERT INTO users (id, email, password_hash, full_name, phone, country_code, role, balance_credits, categories_json)
    VALUES (?, ?, ?, ?, ?, ?, 'owner', 20, ?)
  `).run(id, email, hash, fullName, phone, countryCode, JSON.stringify(categories));
  return getUserById(id);
}

function updateUserCredits(userId, newBalance) {
  db.prepare('UPDATE users SET balance_credits = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newBalance, userId);
}

// Session Helpers
function createSession(userId, token, expiresAt) {
  const id = uuidv4();
  db.prepare('INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)').run(id, userId, token, expiresAt.toISOString());
  return { id, userId, token, expiresAt };
}

function findSessionByToken(token) {
  const session = db.prepare(`
    SELECT s.*, u.email, u.full_name, u.role, u.balance_credits, u.seller_code, u.phone, u.country_code
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND datetime(s.expires_at) > datetime('now')
  `).get(token);
  return session;
}

function deleteSession(token) {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

// Brand Helpers
function getBrandsByUserId(userId) {
  return db.prepare('SELECT * FROM brands WHERE user_id = ? ORDER BY created_at ASC').all(userId);
}

// Categories Helpers
function getCategories() {
  return db.prepare('SELECT * FROM categories ORDER BY is_ready DESC, name ASC').all();
}

// Tasks Helpers
function getPlanningTasks(userId) {
  return db.prepare('SELECT * FROM planning_tasks WHERE user_id = ? ORDER BY created_at DESC').all(userId);
}

function createPlanningTask(userId, { master_sku, category = 'saree', target_price = 0, assigned_to = 'Unassigned', target_date = '' }) {
  const id = uuidv4();
  db.prepare(`
    INSERT INTO planning_tasks (id, user_id, assigned_to, master_sku, category, target_price, target_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, assigned_to, master_sku, category, target_price, target_date);
  return db.prepare('SELECT * FROM planning_tasks WHERE id = ?').get(id);
}

// Stock Helpers
function getStock(userId) {
  return db.prepare('SELECT * FROM inventory_stock WHERE user_id = ? ORDER BY last_updated DESC').all(userId);
}

function getMetrics(userId) {
  const productsCount = db.prepare('SELECT COUNT(*) as count FROM master_products WHERE user_id = ?').get(userId)?.count || 0;
  const batchesCount = db.prepare('SELECT COUNT(*) as count FROM listing_batches WHERE user_id = ?').get(userId)?.count || 0;
  const stockSum = db.prepare('SELECT SUM(stock_quantity) as total FROM inventory_stock WHERE user_id = ?').get(userId)?.total || 0;
  const tasksCount = db.prepare('SELECT COUNT(*) as count FROM planning_tasks WHERE user_id = ?').get(userId)?.count || 0;
  return {
    productsCount,
    batchesCount,
    stockSum: Number(stockSum) || 0,
    tasksCount
  };
}

function updateStock(userId, master_sku, quantity) {
  const existing = db.prepare('SELECT * FROM inventory_stock WHERE user_id = ? AND master_sku = ?').get(userId, master_sku);
  if (existing) {
    db.prepare('UPDATE inventory_stock SET stock_quantity = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?').run(quantity, existing.id);
  } else {
    db.prepare(`
      INSERT INTO inventory_stock (id, user_id, master_sku, stock_quantity)
      VALUES (?, ?, ?, ?)
    `).run(uuidv4(), userId, master_sku, quantity);
  }
}

// Transactions
function getTransactions(userId) {
  return db.prepare('SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC').all(userId);
}

function addTransaction(userId, { type, amount, description, reference_id }) {
  const id = uuidv4();
  db.prepare(`
    INSERT INTO wallet_transactions (id, user_id, type, amount, description, reference_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, userId, type, amount, description, reference_id || uuidv4());
}

// Initialize tables and seeds on load
initDb();

module.exports = {
  db,
  initDb,
  findUserByEmail,
  getUserById,
  createUser,
  updateUserCredits,
  createSession,
  findSessionByToken,
  deleteSession,
  getBrandsByUserId,
  getCategories,
  getPlanningTasks,
  createPlanningTask,
  getStock,
  updateStock,
  getMetrics,
  getTransactions,
  addTransaction
};

