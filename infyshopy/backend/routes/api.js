const express = require('express');
const path = require('path');
const fs = require('fs');
const {
  getBrandsByUserId,
  getCategories,
  getPlanningTasks,
  createPlanningTask,
  getStock,
  updateStock,
  updateUserCredits,
  addTransaction,
  getUserById,
  getMetrics
} = require('../db/database');
const { requireAuth } = require('../middleware/auth');
const excelService = require('../services/excelService');

const router = express.Router();

// Load persistent schema and brand config
const dataDir = path.join(__dirname, '..', 'data');
let schemaData = {};
let brandFixedConfig = {};

try {
  schemaData = JSON.parse(fs.readFileSync(path.join(dataDir, 'schema.json'), 'utf8'));
  brandFixedConfig = JSON.parse(fs.readFileSync(path.join(dataDir, 'brandFixedConfig.json'), 'utf8'));
} catch (e) {
  console.error('Warning: could not load schema.json/brandFixedConfig.json', e.message);
}

// In-memory active batches store
const activeBatches = new Map();

// All API endpoints require active authentication
router.use(requireAuth);

// GET /api/state
router.get('/state', (req, res) => {
  const category = (req.headers['x-listing-category'] || req.query.category || 'saree').toLowerCase();
  const brands = getBrandsByUserId(req.user.id);
  const user = getUserById(req.user.id);

  const state = {
    listingCategory: category,
    availableMarkets: ['MEESHO', 'FLIPKART', 'AMAZON', 'MYNTRA', 'SNAPDEAL', 'SMARTBIZ'],
    selectedMarkets: ['MEESHO', 'FLIPKART', 'AMAZON', 'MYNTRA', 'SNAPDEAL', 'SMARTBIZ'],
    portalImageChoices: null,
    amazonBatchChoice: null,
    snapdealRegistrations: [],
    brandFixedConfig: brandFixedConfig,
    schema: schemaData,
    products: [],
    rotations: [],
    batchDownloads: [],
    listingFiles: [],
    draft: null,
    brands: brands.map(b => ({
      id: b.id,
      name: b.brand_name,
      manufacturer: b.manufacturer,
      packer: b.packer,
      hsn: b.hsn_code,
      gst: b.gst_percent
    })),
    templates: {
      MEESHO: null,
      FLIPKART: null,
      AMAZON: null,
      MYNTRA: null,
      SNAPDEAL: null,
      SMARTBIZ: null
    },
    counters: { saree: 0, kurti: 0 },
    totalDownloads: 0,
    form: {},
    wallet: {
      balance: user ? user.balance_credits : req.user.balance,
      trial: false
    },
    preparedDownloads: {},
    wordRemoval: [],
    account: {
      email: req.user.email,
      role: req.user.role,
      sellerCode: req.user.sellerCode || 'INFY-773'
    },
    creditHistory: [],
    payment: { upi: 'infyshopy@icici', qrEnabled: true },
    creditPricing: { ratePerCredit: 10, minRecharge: 100 },
    accessPolicy: { allowMultipleDevices: true },
    accessUsage: { activeSessions: 1 },
    referenceVersion: '2.2.4'
  };

  return res.json(state);
});

// GET /api/overview
router.get('/overview', (req, res) => {
  const user = getUserById(req.user.id);
  const metrics = getMetrics(req.user.id);
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const marketSummary = () => ({
    files: metrics.batchesCount,
    listings: metrics.productsCount,
    pending: 0,
    today: 0,
    planned: metrics.tasksCount,
    done: metrics.productsCount,
    uploaded: 0
  });

  return res.json({
    updated: now.toISOString(),
    today: todayStr,
    timeZone: 'Asia/Kolkata',
    isOwner: req.user.role === 'owner',
    balance: user ? user.balance_credits : req.user.balance,
    allListings: metrics.productsCount,
    files: metrics.batchesCount,
    totalStock: metrics.stockSum,
    creating: 0,
    inProgress: 0,
    issues: 0,
    done: metrics.productsCount,
    doneToday: 0,
    trackerToday: 0,
    trackerTotal: metrics.tasksCount,
    byMarket: {
      MEESHO: marketSummary(),
      FLIPKART: marketSummary(),
      AMAZON: marketSummary(),
      MYNTRA: marketSummary(),
      SNAPDEAL: marketSummary(),
      SMARTBIZ: marketSummary()
    }
  });
});

// GET /api/access/status
router.get('/access/status', (req, res) => {
  return res.json({
    ok: true,
    managed: false,
    sellerCode: req.user.sellerCode || 'INFY-773'
  });
});

// GET /api/cloudinary/status
router.get('/cloudinary/status', (req, res) => {
  return res.json({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    configured: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
    verifiedAt: null
  });
});

// GET /api/catalogs
router.get('/catalogs', (req, res) => {
  const brands = getBrandsByUserId(req.user.id).map(b => b.brand_name);
  const defaultList = brands.length > 0 ? brands : ['Madhu Saree', 'Infyshopy', 'Being Stylo', 'Maa Ambey'];

  return res.json({
    catalogs: [],
    targets: {
      MEESHO: defaultList,
      FLIPKART: defaultList,
      AMAZON: defaultList,
      MYNTRA: defaultList,
      SNAPDEAL: defaultList,
      SMARTBIZ: ['Smart Biz', ...defaultList]
    }
  });
});

// GET /api/portal-files
router.get('/portal-files', (req, res) => {
  const category = (req.query.category || 'saree').toLowerCase();
  return res.json({
    category,
    files: [],
    templates: {
      MEESHO: null,
      FLIPKART: null,
      AMAZON: null,
      MYNTRA: null,
      SNAPDEAL: null,
      SMARTBIZ: null
    }
  });
});

// GET /api/planning
router.get('/planning', (req, res) => {
  const brands = getBrandsByUserId(req.user.id);
  const tasks = getPlanningTasks(req.user.id);

  return res.json({
    isOwner: req.user.role === 'owner',
    ownerEmail: req.user.email,
    brandNames: brands.map(b => b.brand_name),
    brandProfiles: brands,
    pricingRules: null,
    tasks: tasks,
    members: [],
    device: null
  });
});

// POST /api/planning/create
router.post('/planning/create', (req, res) => {
  const { master_sku, category, target_price, assigned_to, target_date } = req.body;
  if (!master_sku) {
    return res.status(400).json({ error: 'Master SKU is required' });
  }

  const task = createPlanningTask(req.user.id, {
    master_sku,
    category: category || 'saree',
    target_price: Number(target_price) || 0,
    assigned_to: assigned_to || 'Unassigned',
    target_date: target_date || ''
  });

  return res.json({ ok: true, task });
});

// GET /api/stock
router.get('/stock', (req, res) => {
  const items = getStock(req.user.id);
  return res.json({ ok: true, stock: items });
});

// POST /api/stock/update
router.post('/stock/update', (req, res) => {
  const { master_sku, quantity } = req.body;
  if (!master_sku || quantity === undefined) {
    return res.status(400).json({ error: 'Master SKU and quantity are required' });
  }

  updateStock(req.user.id, master_sku, Number(quantity));
  return res.json({ ok: true, message: 'Stock updated successfully', quantity: Number(quantity) });
});

// POST /api/listings/sync - Universal Listing Preparation
router.post('/listings/sync', async (req, res) => {
  const { category = 'saree', form = {}, products = [], selectedMarkets } = req.body;
  const markets = selectedMarkets || ['MEESHO', 'FLIPKART', 'AMAZON', 'MYNTRA', 'SNAPDEAL', 'SMARTBIZ'];
  const batchId = 'BATCH-' + Date.now();

  const transfers = {};
  for (const m of markets) {
    transfers[m] = {
      status: 'ready',
      error: null,
      downloadUrl: `/api/download/${m.toLowerCase()}/${batchId}`
    };
  }

  // Store batch in-memory for download streaming
  activeBatches.set(batchId, {
    category,
    form,
    products,
    markets,
    createdAt: new Date()
  });

  return res.json({
    ok: true,
    batchId,
    count: products.length,
    ready: markets.length,
    transfers,
    message: `All ${markets.length} listing files are ready. Next: Download Listing File.`
  });
});

// GET /api/download/:market/:batchId - Streams genuine marketplace Excel file
router.get('/download/:market/:batchId', async (req, res) => {
  const { market, batchId } = req.params;
  const user = getUserById(req.user.id);

  if (!user || user.balance_credits < 1) {
    return res.status(402).json({ error: 'Insufficient credits. Please recharge your wallet.' });
  }

  const batch = activeBatches.get(batchId) || {
    category: 'saree',
    form: {
      master_sku: 'INFY-SKU-' + Date.now().toString().slice(-4),
      title: 'Handcrafted Designer Pure Silk Saree with Blouse Piece',
      base_price: 1299,
      mrp: 2999,
      fabric: 'Pure Silk',
      color: 'Royal Blue',
      blouse_type: 'Separate Blouse Piece'
    }
  };

  try {
    const workbook = await excelService.generateMarketplaceWorkbook(market.toUpperCase(), batch.category, batch.form);
    
    // Debit 1 credit
    const newBalance = user.balance_credits - 1;
    updateUserCredits(user.id, newBalance);
    addTransaction(user.id, {
      type: 'debit',
      amount: 1,
      description: `Downloaded ${market.toUpperCase()} listing sheet`,
      reference_id: batchId
    });

    const filename = `${market.toLowerCase()}_${batch.category}_catalog_${Date.now()}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Excel compilation error:', err);
    return res.status(500).json({ error: 'Failed to compile marketplace spreadsheet: ' + err.message });
  }
});

// GET /api/gst/summary - Indian E-Commerce GST Engine
router.get('/gst/summary', (req, res) => {
  const taxableSupplies = req.query.turnover !== undefined ? Number(req.query.turnover) : 50000;
  const gstRate = 0.05; // 5% apparel GST
  const cgst = taxableSupplies * 0.025;
  const sgst = taxableSupplies * 0.025;
  const totalGstLiability = cgst + sgst;

  // 1% TCS Section 52 deduction across marketplaces
  const meeshoTcs = taxableSupplies > 0 ? (taxableSupplies * 0.4 * 0.01) : 0;
  const flipkartTcs = taxableSupplies > 0 ? (taxableSupplies * 0.35 * 0.01) : 0;
  const amazonTcs = taxableSupplies > 0 ? (taxableSupplies * 0.25 * 0.01) : 0;
  const totalTcsClaimable = meeshoTcs + flipkartTcs + amazonTcs;
  const netPayableTax = Math.max(0, totalGstLiability - totalTcsClaimable);

  return res.json({
    period: 'Current Financial Year',
    hasSales: taxableSupplies > 0,
    outputTax: {
      taxableSupplies,
      cgst,
      sgst,
      igst: 0,
      totalGstLiability
    },
    tcsUnderSection52: {
      meeshoTcs,
      flipkartTcs,
      amazonTcs,
      totalTcsClaimable
    },
    netPayableTax
  });
});

// POST /api/pnl/calculate - Net Margin & Pricing Calculator
router.post('/pnl/calculate', (req, res) => {
  const { sellingPrice = 999, manufacturingCost = 350, marketplace = 'FLIPKART', rtoPercent = 15 } = req.body;

  // Commission matrix
  const commissions = {
    MEESHO: 0.0,
    FLIPKART: 0.12,
    AMAZON: 0.14,
    MYNTRA: 0.18,
    SNAPDEAL: 0.10,
    SMARTBIZ: 0.05
  };

  const commRate = commissions[marketplace.toUpperCase()] || 0.12;
  const marketplaceCommission = sellingPrice * commRate;
  const packagingCost = 25;
  const forwardShipping = 65;
  const rtoReturnLoss = (forwardShipping * 1.5) * (rtoPercent / 100);

  const totalCost = manufacturingCost + packagingCost + marketplaceCommission + forwardShipping + rtoReturnLoss;
  const netProfit = sellingPrice - totalCost;
  const netMarginPercent = ((netProfit / sellingPrice) * 100).toFixed(1);

  return res.json({
    sellingPrice,
    manufacturingCost,
    marketplace,
    marketplaceCommission,
    packagingCost,
    forwardShipping,
    rtoLossAllocation: rtoReturnLoss.toFixed(2),
    totalCost: totalCost.toFixed(2),
    netProfit: netProfit.toFixed(2),
    netMarginPercent: Number(netMarginPercent)
  });
});

module.exports = router;

