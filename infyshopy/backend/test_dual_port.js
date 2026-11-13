const assert = require('assert');
const path = require('path');
const { app: backendApp } = require('./server');

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:5000';
let sessionCookie = '';

async function testArchitecture() {
  console.log('🧪 Testing Full Dual-Port Architecture:');
  console.log('   - Port 5000: Pure Backend REST API (JSON only, no UI)');
  console.log('   - Port 3000: Vite React 19 Frontend + Reverse Proxy\n');
  let passed = 0;
  let failed = 0;
  let localBackend = null;

  // Ensure backend is listening
  try {
    const isBackendUp = await fetch(BACKEND_URL).then(() => true).catch(() => false);
    if (!isBackendUp) {
      localBackend = backendApp.listen(5000);
      await new Promise(r => setTimeout(r, 300));
      console.log('  ⚡ Started backend on http://localhost:5000\n');
    } else {
      console.log('  ⚡ Connected to active backend on http://localhost:5000\n');
    }
  } catch (err) {
    console.error('  ❌ Failed to verify backend:', err.message);
  }

  // Start Vite dev server on port 3000 if not already running
  let viteServer;
  try {
    const isAlreadyRunning = await fetch(FRONTEND_URL).then(() => true).catch(() => false);
    if (!isAlreadyRunning) {
      const vitePath = path.resolve(__dirname, '../frontend/node_modules/vite/dist/node/index.js');
      const { createServer } = await import(`file://${vitePath}`);
      viteServer = await createServer({
        root: path.resolve(__dirname, '../frontend'),
        server: {
          port: 3000,
          strictPort: true
        }
      });
      await viteServer.listen();
      console.log('  ⚡ Vite dev server listening on http://localhost:3000\n');
    } else {
      console.log('  ⚡ Connected to active frontend server on http://localhost:3000\n');
    }
  } catch (err) {
    console.error('  ❌ Failed to start Vite:', err.message);
    process.exit(1);
  }

  async function check(name, fn) {
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

  // 1. Port 5000 is strictly Backend API (Returns JSON, NOT HTML)
  await check('Port 5000 (Backend) returns pure API Status JSON on /', async () => {
    const res = await fetch(`${BACKEND_URL}/`);
    assert.strictEqual(res.status, 200);
    const contentType = res.headers.get('content-type') || '';
    assert.ok(contentType.includes('application/json'), `Expected JSON, got ${contentType}`);
    const data = await res.json();
    assert.strictEqual(data.service, 'Infyshopy Backend REST API Engine');
    assert.strictEqual(data.port, 5000);
  });

  // 2. Port 5000 returns 404 JSON on UI routes like /planning
  await check('Port 5000 returns 404 JSON on UI routes like /planning', async () => {
    const res = await fetch(`${BACKEND_URL}/planning`);
    assert.strictEqual(res.status, 404);
    const data = await res.json();
    assert.ok(data.error.includes('Port 5000'));
    assert.ok(data.message.includes('http://localhost:3000'));
  });

  // 3. Port 3000 serves the React SPA index.html
  await check('Port 3000 (Frontend) serves Vite React 19 SPA index.html', async () => {
    const res = await fetch(`${FRONTEND_URL}/`);
    assert.strictEqual(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes('INFYSHOPY'));
    assert.ok(html.includes('root'));
  });

  // 4. Port 3000 reverse-proxies POST /auth/login to Backend on 5000
  await check('Port 3000 reverse-proxies POST /auth/login to Backend (5000)', async () => {
    const res = await fetch(`${FRONTEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL
      },
      body: JSON.stringify({
        email: 'demo@infyshopy.in',
        password: 'demo12345'
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.ok, true);

    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie && setCookie.includes('infy_auth_session='));
    sessionCookie = setCookie.split(';')[0];
  });

  // 5. Port 3000 reverse-proxies GET /auth/session with cookie
  await check('Port 3000 reverse-proxies GET /auth/session with session cookie', async () => {
    const res = await fetch(`${FRONTEND_URL}/auth/session`, {
      headers: { 'Cookie': sessionCookie }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.authenticated, true);
    assert.strictEqual(data.user.email, 'demo@infyshopy.in');
    assert.ok(typeof data.user.balance === 'number');
  });

  // 6. Port 3000 reverse-proxies GET /api/state to Backend
  await check('Port 3000 reverse-proxies GET /api/state to Backend', async () => {
    const res = await fetch(`${FRONTEND_URL}/api/state`, {
      headers: { 'Cookie': sessionCookie }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.availableMarkets.includes('MEESHO'));
    assert.ok(data.availableMarkets.includes('FLIPKART'));
    assert.ok(data.availableMarkets.includes('AMAZON'));
    assert.ok(data.availableMarkets.includes('MYNTRA'));
    assert.ok(data.availableMarkets.includes('SNAPDEAL'));
    assert.ok(data.availableMarkets.includes('SMARTBIZ'));
  });

  console.log(`\n==============================================`);
  console.log(`🏁 Dual-Port Architecture Test: ${passed} Passed, ${failed} Failed`);
  console.log(`==============================================\n`);

  if (viteServer) {
    await viteServer.close();
  }
  if (localBackend) {
    localBackend.close();
  }
  process.exit(failed > 0 ? 1 : 0);
}

testArchitecture();
