/**
 * Floreal Main Application Script
 * Bootstraps catalog rendering, filtering, sorting, and UI controls
 */

document.addEventListener('DOMContentLoaded', async () => {
  const API_URL = 'http://localhost:5000/api';
  let catalog = window.FLOREAL_CATALOG;

  // Dynamically fetch live catalog from Backend Server
  try {
    const res = await fetch(`${API_URL}/products?limit=150`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.products && data.products.length > 0) {
        catalog = {
          storeName: "Floreal",
          currency: "₹",
          freeShippingThreshold: 999,
          announcement: "🦈 As Seen on Shark Tank India Season 5 | FREE Shipping on orders above ₹999",
          products: data.products.map(p => ({
            id: p.id,
            title: p.title,
            handle: p.handle,
            price: parseFloat(p.variants?.[0]?.price || p.price || 0),
            compareAtPrice: p.variants?.[0]?.compare_at_price ? parseFloat(p.variants[0].compare_at_price) : (p.compareAtPrice || null),
            isSale: !!p.isSale || (p.variants?.[0]?.compare_at_price > p.variants?.[0]?.price),
            discountPercent: p.discountPercent || (p.variants?.[0]?.compare_at_price ? Math.round((1 - p.variants[0].price / p.variants[0].compare_at_price) * 100) : 0),
            image: typeof p.image === 'string' ? p.image : (p.image?.src || p.images?.[0]?.src || p.images?.[0] || ''),
            images: Array.isArray(p.images) ? p.images.map(img => typeof img === 'string' ? img : img.src) : [],
            category: p.product_type || p.category || 'Bouquets',
            tags: Array.isArray(p.tags) ? p.tags : (p.tags ? p.tags.split(', ') : []),
            description: p.body_html || p.description || '',
            variants: p.variants || [],
            options: p.options || [],
            collections: Array.isArray(p.collections) ? p.collections : []
          }))
        };
        console.log(`✅ Loaded ${catalog.products.length} products directly from Backend API (http://localhost:5000/api/products)`);
      }
    }
  } catch (err) {
    console.warn('Backend API server unreachable, falling back to local catalog cache:', err.message);
  }

  if (!catalog) {
    console.error('Floreal catalog not loaded.');
    return;
  }

  window.florealCatalog = catalog;

  // DOM Elements
  const storiesContainer = document.getElementById('storiesCarousel');
  const productsGrid = document.getElementById('productsGrid');
  const filterPills = document.querySelectorAll('.filter-pill');
  const sortSelect = document.getElementById('catalogSortSelect');
  const loadMoreBtn = document.getElementById('loadMoreProductsBtn');
  const siteHeader = document.querySelector('.site-header');
  const mobileMenuTrigger = document.getElementById('mobileMenuTrigger');
  const mainNav = document.getElementById('mainNav');

  // State
  let activeCategory = 'all';
  let activeSort = 'featured';
  let visibleCount = 16;
  const PAGE_CHUNK = 12;

  // 1. Render Circular Stories
  function renderStories() {
    if (!storiesContainer) return;

    const featuredStories = [
      { title: 'Best Sellers', icon: 'http://localhost:5000/images/Biggestpinkbouquet_ea8984fe-0c04-4593-8f10-f0043e141f06_100x.webp', category: 'all' },
      { title: 'Bouquets', icon: 'http://localhost:5000/images/1_11zon_4_100x.webp', category: 'Bouquets' },
      { title: 'Characters', icon: 'http://localhost:5000/images/3spidermanbouquet_100x.webp', category: 'Characters' },
      { title: 'Pots', icon: 'http://localhost:5000/images/47_11zon_5_100x.webp', category: 'pots' },
      { title: 'Plushies', icon: 'http://localhost:5000/images/4_11zon_2_100x.webp', category: 'plushie' },
      { title: 'Gift Boxes', icon: 'http://localhost:5000/images/Untitled_design_1__11zon_100x.webp', category: 'gift box' },
      { title: 'Baskets', icon: 'http://localhost:5000/images/BASKET_2.webp', category: 'basket' },
      { title: 'Shark Tank Pick', icon: 'http://localhost:5000/images/60_2_11zon_100x.webp', category: 'all' }
    ];

    storiesContainer.innerHTML = featuredStories.map(s => `
      <div class="story-item" data-category="${s.category}">
        <div class="story-img-wrapper">
          <img src="${s.icon}" alt="${s.title}" loading="lazy">
        </div>
        <span class="story-title">${s.title}</span>
      </div>
    `).join('');

    storiesContainer.querySelectorAll('.story-item').forEach(el => {
      el.addEventListener('click', () => {
        const cat = el.dataset.category;
        setCategory(cat);
      });
    });
  }

  // 2. Filter & Sort Products
  function getFilteredProducts() {
    let list = [...catalog.products];

    // Filter by category
    if (activeCategory !== 'all') {
      const catLower = activeCategory.toLowerCase();
      list = list.filter(p => {
        if (Array.isArray(p.collections) && (p.collections.includes(catLower) || p.collections.includes(catLower.replace(/-/g, ' ')))) return true;
        const pType = (p.category || '').toLowerCase();
        const pTitle = (p.title || '').toLowerCase();
        return pType.includes(catLower) || pTitle.includes(catLower);
      });
    }

    // Sort
    if (activeSort === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (activeSort === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (activeSort === 'discount') {
      list.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
    }

    return list;
  }

  // 3. Render Product Cards Grid
  function renderProducts() {
    if (!productsGrid) return;

    const filtered = getFilteredProducts();
    const toShow = filtered.slice(0, visibleCount);

    if (toShow.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
          <h3 style="font-size: 18px; margin-bottom: 8px;">No products found in this category</h3>
          <p style="color: #777; font-size: 13px;">Try selecting another category or resetting your filter.</p>
        </div>
      `;
      if (loadMoreBtn) loadMoreBtn.style.display = 'none';
      return;
    }

    productsGrid.innerHTML = toShow.map(p => {
      const isWishlisted = window.florealWishlist && window.florealWishlist.has(p.id);

      return `
        <div class="product-card" data-product-id="${p.id}">
          <div class="product-image-container">
            ${p.isSale ? `
              <div class="product-badge-group">
                <span class="badge-tag sale">${p.discountPercent}% OFF</span>
              </div>
            ` : ''}
            <a href="product.html?id=${p.id}">
              <img src="${p.image}" alt="${escapeHTML(p.title)}" loading="lazy">
            </a>
            <button type="button" class="product-wishlist-btn ${isWishlisted ? 'active' : ''}" data-product-id="${p.id}" aria-label="Add to Wishlist">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
            <div class="card-action-overlay">
              <button type="button" class="btn-card-quickadd" data-product-id="${p.id}">+ Quick Add</button>
              <button type="button" class="btn-card-quickview" data-product-id="${p.id}" aria-label="Quick View">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>
          <div class="product-info">
            <span class="product-type">${escapeHTML(p.category || 'Floreal Bloom')}</span>
            <h3 class="product-title" title="${escapeHTML(p.title)}">
              <a href="product.html?id=${p.id}">${escapeHTML(p.title)}</a>
            </h3>
            <div class="product-price-row">
              <span class="price-current">₹${p.price.toFixed(2)}</span>
              ${p.compareAtPrice && p.compareAtPrice > p.price ? `
                <span class="price-compare">₹${p.compareAtPrice.toFixed(2)}</span>
                <span class="discount-pill">SAVE ${p.discountPercent}%</span>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Toggle Load More button
    if (loadMoreBtn) {
      loadMoreBtn.style.display = visibleCount < filtered.length ? 'inline-block' : 'none';
    }
  }

  function setCategory(category) {
    activeCategory = category;
    visibleCount = 16;

    filterPills.forEach(pill => {
      pill.classList.toggle('active', pill.dataset.category.toLowerCase() === category.toLowerCase());
    });

    renderProducts();

    // Scroll smoothly to catalog header
    const catalogHeader = document.querySelector('.catalog-section');
    if (catalogHeader) {
      catalogHeader.scrollIntoView({ behavior: 'smooth' });
    }
  }

  window.setCategory = setCategory;

  // 4. Bind Events
  // Category filter pills
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      setCategory(pill.dataset.category);
    });
  });

  // Sort dropdown
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      renderProducts();
    });
  }

  // Load more button
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      visibleCount += PAGE_CHUNK;
      renderProducts();
    });
  }

  // Product card delegation (Quick Add & Quick View)
  if (productsGrid) {
    productsGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card');
      if (!card) return;

      const productId = card.dataset.productId;
      const product = catalog.products.find(p => String(p.id) === String(productId));
      if (!product) return;

      if (e.target.closest('.btn-card-quickadd')) {
        e.preventDefault();
        e.stopPropagation();
        if (window.florealCart) {
          window.florealCart.addItem(product, 1);
        }
      } else if (e.target.closest('.btn-card-quickview')) {
        e.preventDefault();
        e.stopPropagation();
        if (window.florealQuickView) {
          window.florealQuickView.open(product);
        }
      }
    });
  }

  // Sticky Header Scroll Listener
  window.addEventListener('scroll', () => {
    if (!siteHeader) return;
    if (window.scrollY > 40) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile Menu Toggle
  if (mobileMenuTrigger && mainNav) {
    mobileMenuTrigger.addEventListener('click', () => {
      const isVisible = mainNav.style.display === 'flex';
      mainNav.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) {
        mainNav.style.flexDirection = 'column';
        mainNav.style.position = 'absolute';
        mainNav.style.top = '100%';
        mainNav.style.left = '0';
        mainNav.style.right = '0';
        mainNav.style.backgroundColor = '#ffffff';
        mainNav.style.padding = '20px';
        mainNav.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
        mainNav.style.zIndex = '150';
      }
    });
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
  }

  // Initial Run
  renderStories();
  renderProducts();
});
