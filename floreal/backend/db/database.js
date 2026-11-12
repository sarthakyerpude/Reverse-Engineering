/**
 * SQLite Database Module for Floreal E-Commerce
 * Full persistent schema with Users, Addresses, Cart, Orders, Wishlist, Reviews
 */

const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, 'floreal.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for high concurrency & foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address_line1 TEXT NOT NULL,
      address_line2 TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      variant_id TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, product_id, variant_id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      user_id TEXT,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      items_json TEXT NOT NULL,
      subtotal REAL NOT NULL,
      shipping_fee REAL NOT NULL DEFAULT 0,
      discount REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL,
      shipping_address_json TEXT NOT NULL,
      payment_method TEXT DEFAULT 'cod',
      payment_status TEXT DEFAULT 'pending',
      order_status TEXT DEFAULT 'confirmed',
      tracking_number TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      user_id TEXT,
      user_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      title TEXT,
      comment TEXT NOT NULL,
      verified_purchase INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Helper table for tracking order sequence
    CREATE TABLE IF NOT EXISTS order_sequence (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      last_order_num INTEGER NOT NULL DEFAULT 1000
    );

    INSERT OR IGNORE INTO order_sequence (id, last_order_num) VALUES (1, 1000);
  `);

  // Seed default admin and demo user if not present
  const checkUser = db.prepare('SELECT id FROM users WHERE email = ?');
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, phone, role)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const admin = checkUser.get('admin@floreal.in');
  if (!admin) {
    const adminHash = bcrypt.hashSync('admin123', 10);
    insertUser.run(uuidv4(), 'Floreal Admin', 'admin@floreal.in', adminHash, '+919876543210', 'admin');
    console.log('🌱 Seeded Admin user: admin@floreal.in / admin123');
  }

  const demo = checkUser.get('demo@floreal.in');
  if (!demo) {
    const demoHash = bcrypt.hashSync('demo123', 10);
    const demoId = uuidv4();
    insertUser.run(demoId, 'Demo Customer', 'demo@floreal.in', demoHash, '+919876543211', 'customer');

    // Add a default address for demo user
    db.prepare(`
      INSERT INTO addresses (id, user_id, full_name, phone, address_line1, address_line2, city, state, pincode, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      uuidv4(),
      demoId,
      'Demo Customer',
      '+919876543211',
      'Flat 402, Lotus Bloom Residency, MG Road',
      'Near Brigade Towers',
      'Bengaluru',
      'Karnataka',
      '560001'
    );
    console.log('🌱 Seeded Demo user: demo@floreal.in / demo123 with sample address');
  }
}

// Generate next order number like FLR-1001, FLR-1002, etc.
function getNextOrderNumber() {
  const update = db.prepare(`
    UPDATE order_sequence 
    SET last_order_num = last_order_num + 1 
    WHERE id = 1 
    RETURNING last_order_num
  `);
  const row = update.get();
  return `FLR-${row.last_order_num}`;
}

initSchema();

module.exports = {
  db,
  getNextOrderNumber
};

