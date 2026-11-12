const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'rareyou.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for high concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize Tables
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'customer',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      street_address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      landmark TEXT,
      is_default INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      session_id TEXT,
      product_id TEXT NOT NULL,
      variant_id TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      selected_size TEXT,
      custom_measurements TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      user_id TEXT,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      status TEXT DEFAULT 'confirmed',
      subtotal INTEGER NOT NULL,
      discount INTEGER DEFAULT 0,
      shipping_fee INTEGER DEFAULT 0,
      total INTEGER NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT DEFAULT 'pending',
      shipping_address TEXT NOT NULL,
      items TEXT NOT NULL,
      notes TEXT,
      tracking_code TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      product_handle TEXT,
      product_category TEXT,
      variant_id TEXT,
      variant_title TEXT,
      selected_size TEXT,
      custom_measurements TEXT,
      unit_price INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      line_total INTEGER NOT NULL,
      image TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      user_id TEXT,
      user_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      headline TEXT,
      review_text TEXT NOT NULL,
      verified_purchase INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_sequence (
      name TEXT PRIMARY KEY,
      current_val INTEGER NOT NULL
    );
  `);

  // Initialize order sequence if not exists
  const seq = db.prepare("SELECT current_val FROM order_sequence WHERE name = 'order_number'").get();
  if (!seq) {
    db.prepare("INSERT INTO order_sequence (name, current_val) VALUES ('order_number', 1000)").run();
  }

  // Seed default admin and demo user
  const adminExists = db.prepare("SELECT id FROM users WHERE email = 'admin@rareyou.com'").get();
  if (!adminExists) {
    const adminHash = bcrypt.hashSync('admin123', 10);
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, phone, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run('user_admin_01', 'admin@rareyou.com', adminHash, 'Studio Director', '+91 98765 00001', 'admin', now, now);
  }

  const demoExists = db.prepare("SELECT id FROM users WHERE email = 'demo@rareyou.com'").get();
  if (!demoExists) {
    const demoHash = bcrypt.hashSync('demo123', 10);
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, phone, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run('user_demo_01', 'demo@rareyou.com', demoHash, 'Pooja Sharma', '+91 98112 34567', 'customer', now, now);

    // Seed sample address for demo user
    db.prepare(`
      INSERT INTO addresses (id, user_id, full_name, phone, street_address, city, state, pincode, landmark, is_default, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'addr_demo_01',
      'user_demo_01',
      'Pooja Sharma',
      '+91 98112 34567',
      'B-402, Green Valley Apartments, Sector 21-C',
      'Faridabad',
      'Haryana',
      '121001',
      'Near Metro Station',
      1,
      now
    );
  }

  // Seed sample initial reviews if reviews table is empty
  const reviewCount = db.prepare('SELECT count(*) as count FROM reviews').get();
  if (reviewCount.count === 0) {
    const seedReviews = [
      {
        id: 'rev_01',
        product_id: 'prod_cloth_01',
        user_name: 'Ananya Deshmukh',
        rating: 5,
        headline: 'Absolute perfection in fitting!',
        review_text: 'The Cookie & Creme dress is so soft and comfortable. I provided my custom waist measurements and it fits like a glove. Received so many compliments at our Sunday gathering!',
        created_at: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        id: 'rev_02',
        product_id: 'prod_swing_01',
        user_name: 'Rohan Mehra',
        rating: 5,
        headline: "Jasmine's Swing is pure magic on our balcony",
        review_text: 'The craftsmanship on the macrame rope is stellar. Very sturdy and feels completely secure when sitting. The included ceiling kit made installation breeze.',
        created_at: new Date(Date.now() - 86400000 * 5).toISOString()
      },
      {
        id: 'rev_03',
        product_id: 'prod_decor_01',
        user_name: 'Sneha Patel',
        rating: 5,
        headline: 'Cutest curtain ties ever',
        review_text: 'These pink sunflowers brought our nursery drapes to life! So well-knitted and the wooden beads add such an authentic handmade touch.',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'rev_04',
        product_id: 'prod_flwr_01',
        user_name: 'Vikram Joshi',
        rating: 5,
        headline: 'The fairy lights look enchanting at night',
        review_text: 'Gifted this to my wife for our anniversary. The crochet flowers will never wither and the gentle warm glow creates the best night ambiance.',
        created_at: new Date(Date.now() - 86400000 * 4).toISOString()
      },
      {
        id: 'rev_05',
        product_id: 'prod_plush_01',
        user_name: 'Kavita Rao',
        rating: 5,
        headline: 'Millie the Duck is our baby’s new best friend',
        review_text: 'Zero harsh synthetic smell, pure soft organic cotton. Safe embroidered eyes mean no fear of loose buttons. Truly rare quality!',
        created_at: new Date(Date.now() - 86400000 * 1).toISOString()
      }
    ];

    const insertRev = db.prepare(`
      INSERT INTO reviews (id, product_id, user_name, rating, headline, review_text, verified_purchase, created_at)
      VALUES (@id, @product_id, @user_name, @rating, @headline, @review_text, 1, @created_at)
    `);

    for (const rev of seedReviews) {
      insertRev.run(rev);
    }
  }
}

initSchema();

// Atomic Next Order Number Generator: RY-1001, RY-1002, ...
function getNextOrderNumber() {
  const nextVal = db.transaction(() => {
    db.prepare("UPDATE order_sequence SET current_val = current_val + 1 WHERE name = 'order_number'").run();
    const row = db.prepare("SELECT current_val FROM order_sequence WHERE name = 'order_number'").get();
    return row.current_val;
  })();
  return `RY-${nextVal}`;
}

module.exports = {
  db,
  getNextOrderNumber
};

