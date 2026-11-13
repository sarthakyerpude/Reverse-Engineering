const http = require('http');
const assert = require('assert');
const { app } = require('./server');

const BASE_URL = 'http://localhost:5000';
let sessionCookie = '';
let testBatchId = '';

async function isPort5000Up() {
  try {
    const res = await fetch(`${BASE_URL}/`);
    return res.ok;
  } catch {
    return false;
  }
}

async function runTests() {
  console.log('🧪 Starting Full-Stack End-to-End Test Suite for Infyshopy...\n');
  let passed = 0;
  let failed = 0;
  let localServer = null;

  const isUp = await isPort5000Up();
  if (!isUp) {
    localServer = app.listen(5000);
    await new Promise(r => setTimeout(r, 300));
  }

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Backend Service Status
  await test('Backend API status endpoint (Port 5000) returns service health JSON', async () => {
    const res = await fetch(`${BASE_URL}/`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'online');
    assert.strictEqual(data.port, 5000);
    assert.ok(data.service.includes('Infyshopy'));
  });

  // 2. Authentication: User Session Verification
  await test('POST /auth/login with pre-seeded seller credentials authenticates successfully', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'origin': 'http://localhost:5000'
      },
      body: JSON.stringify({
        email: 'demo@infyshopy.in',
        password: 'demo12345'
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.user.email, 'demo@infyshopy.in');
    assert.strictEqual(data.user.sellerCode, 'INFY-DEMO');

    // Extract cookie
    const rawCookie = res.headers.get('set-cookie');
    assert.ok(rawCookie, 'Expected set-cookie header');
    sessionCookie = rawCookie.split(';')[0];
  });

  // 3. Authenticated Session Check
  await test('GET /auth/session with cookie returns authenticated seller payload', async () => {
    const res = await fetch(`${BASE_URL}/auth/session`, {
      headers: { cookie: sessionCookie }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.authenticated, true);
    assert.strictEqual(data.user.email, 'demo@infyshopy.in');
    assert.ok(data.user.balance >= 0);
  });

  // 4. Initial State Endpoint
  await test('GET /api/state returns multi-marketplace schemas & brand configurations', async () => {
    const res = await fetch(`${BASE_URL}/api/state?category=saree`, {
      headers: { cookie: sessionCookie }
    });
    assert.strictEqual(res.status, 200);
    const state = await res.json();
    assert.strictEqual(state.listingCategory, 'saree');
    assert.strictEqual(state.availableMarkets.length, 6);
    assert.ok(state.availableMarkets.includes('MEESHO'));
    assert.ok(state.availableMarkets.includes('FLIPKART'));
    assert.ok(state.availableMarkets.includes('AMAZON'));
    assert.ok(state.brands.length > 0);
  });

  // 5. Account Overview Metrics
  await test('GET /api/overview returns multi-channel operational metrics', async () => {
    const res = await fetch(`${BASE_URL}/api/overview`, {
      headers: { cookie: sessionCookie }
    });
    assert.strictEqual(res.status, 200);
    const overview = await res.json();
    assert.strictEqual(overview.isOwner, true);
    assert.ok(overview.byMarket.MEESHO !== undefined);
    assert.ok(overview.byMarket.FLIPKART !== undefined);
  });

  // 6. Shop Stock Inventory Retrieval
  await test('GET /api/stock returns master SKU inventory list', async () => {
    const res = await fetch(`${BASE_URL}/api/stock`, {
      headers: { cookie: sessionCookie }
    });
    assert.strictEqual(res.status, 200);
    const stockData = await res.json();
    assert.ok(Array.isArray(stockData.stock));
  });

  // 7. Stock Update
  await test('POST /api/stock/update modifies master SKU quantity', async () => {
    const res = await fetch(`${BASE_URL}/api/stock/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'origin': 'http://localhost:5000',
        cookie: sessionCookie
      },
      body: JSON.stringify({
        master_sku: 'INFY-SKU-TEST',
        quantity: 150
      })
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.ok, true);
    assert.strictEqual(json.quantity, 150);
  });

  // 8. Planning Tasks
  await test('GET /api/planning and POST /api/planning/create handles SKU tasks', async () => {
    const createRes = await fetch(`${BASE_URL}/api/planning/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'origin': 'http://localhost:5000',
        cookie: sessionCookie
      },
      body: JSON.stringify({
        master_sku: 'TEST-SKU-9901',
        category: 'saree',
        target_price: 1499,
        assigned_to: 'Operator 1'
      })
    });
    assert.strictEqual(createRes.status, 200);

    const getRes = await fetch(`${BASE_URL}/api/planning`, {
      headers: { cookie: sessionCookie }
    });
    assert.strictEqual(getRes.status, 200);
    const tasks = await getRes.json();
    assert.ok(tasks.tasks.length > 0);
  });

  // 9. Multi-Marketplace Excel Spreadsheet Sync
  await test('POST /api/listings/sync creates batch download across 6 marketplaces', async () => {
    const res = await fetch(`${BASE_URL}/api/listings/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'origin': 'http://localhost:5000',
        cookie: sessionCookie
      },
      body: JSON.stringify({
        category: 'saree',
        markets: ['MEESHO', 'FLIPKART', 'AMAZON', 'MYNTRA', 'SNAPDEAL', 'SMARTBIZ'],
        products: [
          {
            masterSku: 'RADHE-SR-101',
            title: 'Pure Banarasi Soft Silk Zari Border Saree',
            color: 'Wine Purple',
            fabric: 'Silk Blend',
            price: 1299,
            mrp: 3999,
            description: 'Handcrafted premium Banarasi silk saree with contrast zari pallu.',
            images: {
              front: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c'
            }
          }
        ]
      })
    });
    assert.strictEqual(res.status, 200);
    const batch = await res.json();
    assert.strictEqual(batch.ok, true);
    assert.strictEqual(batch.count, 1);
    assert.ok(batch.batchId);
    testBatchId = batch.batchId;
  });

  // 10. Excel Sheet Generation Verification
  await test('GET /api/download/meesho/:batchId returns valid Excel spreadsheet binary', async () => {
    const res = await fetch(`${BASE_URL}/api/download/meesho/${testBatchId}`, {
      headers: { cookie: sessionCookie }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('content-type'), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const buffer = await res.arrayBuffer();
    assert.ok(buffer.byteLength > 1000, 'Excel file size must exceed 1KB');
  });

  // 11. Flipkart Sheet Generation
  await test('GET /api/download/flipkart/:batchId returns valid Flipkart catalog sheet', async () => {
    const res = await fetch(`${BASE_URL}/api/download/flipkart/${testBatchId}`, {
      headers: { cookie: sessionCookie }
    });
    assert.strictEqual(res.status, 200);
    const buffer = await res.arrayBuffer();
    assert.ok(buffer.byteLength > 1000);
  });

  // 12. Amazon Sheet Generation
  await test('GET /api/download/amazon/:batchId returns valid Amazon flat file', async () => {
    const res = await fetch(`${BASE_URL}/api/download/amazon/${testBatchId}`, {
      headers: { cookie: sessionCookie }
    });
    assert.strictEqual(res.status, 200);
    const buffer = await res.arrayBuffer();
    assert.ok(buffer.byteLength > 1000);
  });

  // 13. GST & TCS Calculation
  await test('GET /api/gst/summary calculates live Section 52 TCS & GSTR-1 output tax', async () => {
    const res = await fetch(`${BASE_URL}/api/gst/summary?turnover=500000`, {
      headers: { cookie: sessionCookie }
    });
    assert.strictEqual(res.status, 200);
    const gst = await res.json();
    assert.strictEqual(gst.hasSales, true);
    assert.strictEqual(gst.outputTax.taxableSupplies, 500000);
    assert.strictEqual(gst.outputTax.totalGstLiability, 25000); // 5% GST
    assert.strictEqual(gst.tcsUnderSection52.totalTcsClaimable, 5000); // 1% TCS
  });

  // 14. P&L Margin Simulator
  await test('POST /api/pnl/calculate computes real net margin waterfall', async () => {
    const res = await fetch(`${BASE_URL}/api/pnl/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'origin': 'http://localhost:5000',
        cookie: sessionCookie
      },
      body: JSON.stringify({
        sellingPrice: 999,
        manufacturingCost: 350,
        marketplace: 'FLIPKART',
        rtoPercent: 15
      })
    });
    assert.strictEqual(res.status, 200);
    const pnl = await res.json();
    assert.strictEqual(pnl.marketplace, 'FLIPKART');
    assert.ok(pnl.netProfit > 0);
  });

  console.log(`\n==============================================`);
  console.log(`🏁 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`==============================================`);

  if (localServer) {
    localServer.close(() => {
      process.exit(failed > 0 ? 1 : 0);
    });
  } else {
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
