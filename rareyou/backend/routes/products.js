const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

function getProducts() {
  const raw = fs.readFileSync(path.join(__dirname, '../data/products.json'), 'utf8');
  const prods = JSON.parse(raw);
  return prods.map(p => {
    const mainImg = p.localImage || p.image || '/images/prod-bumble-in-blue.png';
    return {
      ...p,
      image: mainImg,
      display_image: mainImg,
      images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [mainImg]
    };
  });
}

function getCollections() {
  const raw = fs.readFileSync(path.join(__dirname, '../data/collections.json'), 'utf8');
  return JSON.parse(raw);
}

// GET /api/collections
router.get('/collections', (req, res) => {
  try {
    const productsData = getProducts();
    const collectionsData = getCollections();
    const collectionsWithCount = collectionsData.map(col => {
      const count = productsData.filter(p => 
        p.collection_id === col.id || 
        p.category === col.id ||
        (col.id === 'kids' && (p.category === 'swings' || p.category === 'kids')) ||
        (col.id === 'forever-flower' && (p.category === 'forever-flowers' || p.category === 'forever-flower'))
      ).length;
      return { ...col, product_count: count };
    });
    res.json({ success: true, collections: collectionsWithCount });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch collections' });
  }
});

// GET /api/collections/:id
router.get('/collections/:id', (req, res) => {
  try {
    const productsData = getProducts();
    const collectionsData = getCollections();
    const idParam = req.params.id.toLowerCase();

    const col = collectionsData.find(c => 
      c.id.toLowerCase() === idParam || 
      c.handle.toLowerCase() === idParam ||
      (idParam === 'forever-flowers' && c.id === 'forever-flower') ||
      (idParam === 'swings' && c.id === 'kids')
    );

    const targetId = col ? col.id : idParam;
    const matchingProducts = productsData.filter(p => {
      const pCol = (p.collection_id || '').toLowerCase();
      const pCat = (p.category || '').toLowerCase();
      if (targetId === 'forever-flower' || targetId === 'forever-flowers') {
        return pCol.includes('flower') || pCat.includes('flower');
      }
      if (targetId === 'kids' || targetId === 'swings') {
        return pCol === 'kids' || pCol === 'swings' || pCat === 'kids' || pCat === 'swings';
      }
      return pCol === targetId || pCat === targetId;
    });

    res.json({
      success: true,
      collection: col || { id: idParam, name: idParam, product_count: matchingProducts.length },
      products: matchingProducts
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch collection' });
  }
});

// GET /api/products
router.get('/products', (req, res) => {
  try {
    const productsData = getProducts();
    let results = [...productsData];
    const { category, collection, q, min_price, max_price, sort, featured } = req.query;

    // Filter by collection / category
    const catFilter = (category || collection || '').toLowerCase();
    if (catFilter && catFilter !== 'all') {
      results = results.filter(p => {
        const pCol = (p.collection_id || '').toLowerCase();
        const pCat = (p.category || '').toLowerCase();
        if (catFilter === 'forever-flower' || catFilter === 'forever-flowers') {
          return pCol.includes('flower') || pCat.includes('flower');
        }
        if (catFilter === 'kids' || catFilter === 'swings') {
          return pCol === 'kids' || pCol === 'swings' || pCat === 'kids' || pCat === 'swings';
        }
        return pCol === catFilter || pCat === catFilter;
      });
    }

    // Filter by search query
    if (q && q.trim()) {
      const query = q.toLowerCase().trim();
      results = results.filter(p =>
        (p.name || p.title || '').toLowerCase().includes(query) ||
        (p.description || '').toLowerCase().includes(query) ||
        (p.tags || []).some(t => String(t).toLowerCase().includes(query))
      );
    }

    // Filter by price range
    if (min_price) {
      const min = parseInt(min_price, 10);
      if (!isNaN(min)) results = results.filter(p => p.price >= min);
    }
    if (max_price) {
      const max = parseInt(max_price, 10);
      if (!isNaN(max)) results = results.filter(p => p.price <= max);
    }

    // Filter by featured
    if (featured === 'true') {
      results = results.filter(p => p.featured);
    }

    // Sort
    if (sort === 'price-asc') {
      results.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      results.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      results.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    } else if (sort === 'reviews') {
      results.sort((a, b) => (b.reviews_count || 0) - (a.reviews_count || 0));
    } else {
      // Default: featured first, then review count
      results.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    res.json({
      success: true,
      total: results.length,
      products: results
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
});

// GET /api/products/:handleOrId
router.get('/products/:handleOrId', (req, res) => {
  try {
    const productsData = getProducts();
    const key = req.params.handleOrId.toLowerCase();
    const product = productsData.find(p => 
      String(p.id) === key || 
      (p.handle && p.handle.toLowerCase() === key)
    );
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Related products in same category
    const related = productsData
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);

    res.json({
      success: true,
      product,
      related
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch product details' });
  }
});

module.exports = router;
