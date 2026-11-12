const http = require('http');
const app = require('./server');

let server;
const PORT = 5555; // Use an isolated test port so no conflict

function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const reqHeaders = {
      ...headers,
      'Content-Type': 'application/json'
    };
    if (payload) reqHeaders['Content-Length'] = Buffer.byteLength(payload);

    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method,
        headers: reqHeaders
      },
      res => {
        let body = '';
        res.on('data', chunk => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve({ status: res.statusCode, data: parsed, raw: body });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTestSuite() {
  console.log('\n========================================================');
  console.log('🧪 Starting Rare You Backend Full-Stack Test Suite');
  console.log('========================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
    }
  }

  try {
    // Start temporary test server
    await new Promise(resolve => {
      server = app.listen(PORT, resolve);
    });

    // Test 1: Root status route
    const rootRes = await makeRequest('GET', '/');
    assert(rootRes.status === 200 && rootRes.data.service.includes('Rare You'), 'Root GET / returns API status');

    // Test 2: Health check
    const healthRes = await makeRequest('GET', '/health');
    assert(healthRes.status === 200 && healthRes.data.status === 'healthy', 'GET /health returns healthy');

    // Test 3: Collections
    const colRes = await makeRequest('GET', '/api/collections');
    assert(colRes.status === 200 && colRes.data.collections.length === 5, 'GET /api/collections returns 5 collections');

    // Test 4: Products catalog
    const prodRes = await makeRequest('GET', '/api/products');
    assert(prodRes.status === 200 && prodRes.data.total >= 100, `GET /api/products returns ${prodRes.data.total} authentic products`);

    // Test 5: Category filter (clothing)
    const clothRes = await makeRequest('GET', '/api/products?category=clothing');
    assert(clothRes.status === 200 && clothRes.data.products.length >= 10, `Category filter ?category=clothing returns ${clothRes.data.products.length} dresses`);

    // Test 6: Forever flower category
    const flowerRes = await makeRequest('GET', '/api/products?category=forever-flower');
    assert(flowerRes.status === 200 && flowerRes.data.products.length >= 30, `Forever flower filter returns ${flowerRes.data.products.length} bouquets`);

    // Test 7: Product search
    const searchRes = await makeRequest('GET', '/api/products?q=sunflower');
    assert(searchRes.status === 200 && searchRes.data.products.length >= 2, 'Search ?q=sunflower returns matching products');

    // Test 8: Login with Demo User
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'demo@rareyou.com',
      password: 'demo123'
    });
    assert(loginRes.status === 200 && loginRes.data.token, 'POST /api/auth/login issues JWT token');
    const token = loginRes.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };

    // Test 9: Profile check
    const meRes = await makeRequest('GET', '/api/auth/me', null, authHeaders);
    assert(meRes.status === 200 && meRes.data.user.email === 'demo@rareyou.com', 'GET /api/auth/me returns authenticated user');

    // Test 10: Address book
    const addrRes = await makeRequest('GET', '/api/user/addresses', null, authHeaders);
    assert(addrRes.status === 200 && addrRes.data.addresses.length >= 1, 'GET /api/user/addresses returns user address');

    // Test 11: Add to Cart with authentic product (Always Glowing, ₹2990)
    const testProduct = prodRes.data.products.find(p => p.handle === 'always-glowing') || prodRes.data.products[0];
    const cartAddRes = await makeRequest('POST', '/api/cart/add', {
      product_id: testProduct.id,
      variant_id: testProduct.variantId || 'default',
      quantity: 1,
      selected_size: 'Standard',
      custom_measurements: 'Warm fairy LED lights included'
    }, authHeaders);
    assert(cartAddRes.status === 200 && cartAddRes.data.cart.items.length >= 1, 'POST /api/cart/add adds authentic piece to cart');

    // Test 12: Cart enrichment & free shipping threshold calculation (₹2,990 >= ₹1,499 -> shipping free!)
    const cartGetRes = await makeRequest('GET', '/api/cart', null, authHeaders);
    assert(
      cartGetRes.status === 200 && 
      cartGetRes.data.cart.is_free_shipping === true && 
      cartGetRes.data.cart.shipping_fee === 0,
      'Cart calculates free shipping for orders over ₹1,499'
    );

    // Test 13: Order creation with atomic cart clear
    const orderCreateRes = await makeRequest('POST', '/api/orders/create', {
      email: 'demo@rareyou.com',
      phone: '+91 98112 34567',
      full_name: 'Pooja Sharma',
      shipping_address: addrRes.data.addresses[0],
      items: [
        {
          product_id: testProduct.id,
          variant_id: testProduct.variantId || 'default',
          quantity: 1
        }
      ],
      payment_method: 'razorpay',
      coupon_code: 'RARE10'
    }, authHeaders);

    assert(
      orderCreateRes.status === 201 && 
      orderCreateRes.data.order && 
      orderCreateRes.data.order.order_number.startsWith('RY-'),
      `POST /api/orders/create generates sequential order ${orderCreateRes.data?.order?.order_number}`
    );

    const createdOrderNumber = orderCreateRes.data.order.order_number;

    // Test 14: Verify cart was atomically cleared
    const cartClearedRes = await makeRequest('GET', '/api/cart', null, authHeaders);
    assert(cartClearedRes.data.cart.items.length === 0, 'Cart is automatically emptied after order placement');

    // Test 15: Shipment tracking milestones
    const trackRes = await makeRequest('GET', `/api/orders/track/${createdOrderNumber}`);
    assert(trackRes.status === 200 && trackRes.data.milestones.length === 5, 'GET /api/orders/track returns 5-step milestone timeline');

    // Test 16: Order history
    const historyRes = await makeRequest('GET', '/api/orders', null, authHeaders);
    assert(historyRes.status === 200 && historyRes.data.orders.length >= 1, 'GET /api/orders lists user orders');

    // Test 17: Reviews endpoint
    const revRes = await makeRequest('GET', `/api/reviews/${testProduct.id}`);
    assert(revRes.status === 200 && revRes.data.success === true, 'GET /api/reviews returns review list');

    // Test 18: Add review
    const addRevRes = await makeRequest('POST', `/api/reviews/${testProduct.id}`, {
      rating: 5,
      headline: 'Absolutely divine blooms!',
      review_text: 'The knitted lavender flowers look surreal under warm lights.',
      user_name: 'Simran K.'
    }, authHeaders);
    assert(addRevRes.status === 201 && addRevRes.data.review.rating === 5, 'POST /api/reviews adds review successfully');

    console.log('\n========================================================');
    console.log(`📊 Test Summary: ${passed}/${total} passed (${Math.round((passed / total) * 100)}%)`);
    console.log('========================================================\n');

  } catch (err) {
    console.error('Fatal test error:', err);
  } finally {
    if (server) {
      server.close();
    }
  }
}

runTestSuite();
