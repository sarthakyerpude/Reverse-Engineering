const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const productsFilePath = path.join(__dirname, '../data/products.json');
const collectionsFilePath = path.join(__dirname, '../data/collections.json');

function getProducts() {
  try {
    const raw = fs.readFileSync(productsFilePath, 'utf8');
    const data = JSON.parse(raw);
    return data.products || data;
  } catch (e) {
    return [];
  }
}

function getCollections() {
  try {
    const raw = fs.readFileSync(collectionsFilePath, 'utf8');
    const data = JSON.parse(raw);
    return data.collections || data;
  } catch (e) {
    return [];
  }
}

// GET /api/products
router.get('/', (req, res) => {
  let products = getProducts();
  const { collection, category, sort, minPrice, maxPrice, limit = 24, page = 1 } = req.query;

  // Filter by collection/category
  if (collection && collection !== 'all') {
    const rawMatch = collection.toLowerCase();
    const match = rawMatch.replace(/-/g, ' ');
    products = products.filter(p => {
      if (Array.isArray(p.collections) && (p.collections.includes(rawMatch) || p.collections.includes(match))) return true;
      const pCat = (p.product_type || p.category || '').toLowerCase();
      const pTitle = (p.title || '').toLowerCase();
      const pTags = Array.isArray(p.tags) ? p.tags.join(' ').toLowerCase() : (p.tags || '').toLowerCase();
      return pCat.includes(match) || pTitle.includes(match) || pTags.includes(match);
    });
  }

  // Filter by price
  if (minPrice) {
    products = products.filter(p => {
      const price = parseFloat(p.variants?.[0]?.price || p.price || 0);
      return price >= parseFloat(minPrice);
    });
  }
  if (maxPrice) {
    products = products.filter(p => {
      const price = parseFloat(p.variants?.[0]?.price || p.price || 0);
      return price <= parseFloat(maxPrice);
    });
  }

  // Sort
  if (sort === 'price-asc') {
    products.sort((a, b) => {
      const pa = parseFloat(a.variants?.[0]?.price || a.price || 0);
      const pb = parseFloat(b.variants?.[0]?.price || b.price || 0);
      return pa - pb;
    });
  } else if (sort === 'price-desc') {
    products.sort((a, b) => {
      const pa = parseFloat(a.variants?.[0]?.price || a.price || 0);
      const pb = parseFloat(b.variants?.[0]?.price || b.price || 0);
      return pb - pa;
    });
  }

  const total = products.length;
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const paginated = products.slice(startIndex, startIndex + parseInt(limit));

  res.json({
    success: true,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    products: paginated
  });
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const products = getProducts();
  const idOrHandle = req.params.id;

  const product = products.find(p => 
    String(p.id) === String(idOrHandle) || 
    p.handle === idOrHandle ||
    (p.title && p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === idOrHandle.toLowerCase())
  );

  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  res.json({ success: true, product });
});

// GET /api/collections
router.get('/meta/collections', (req, res) => {
  const collections = getCollections();
  res.json({ success: true, collections });
});

module.exports = router;

