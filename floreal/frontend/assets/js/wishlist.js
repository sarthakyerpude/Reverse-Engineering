/**
 * Floreal E-Commerce Universal Wishlist Module
 * Supports persistent SQLite storage via /api/user/wishlist when logged in,
 * with seamless guest fallback via localStorage.
 */

(function () {
  const API_BASE = 'http://localhost:5000/api';
  const WISHLIST_STORAGE_KEY = 'floreal_wishlist_items';

  class WishlistManager {
    constructor() {
      this.items = this.loadLocalWishlist();
      this.init();
    }

    async init() {
      this.initDOMElements();
      this.bindEvents();
      await this.refreshWishlist();

      window.addEventListener('floreal:auth-change', async () => {
        await this.refreshWishlist();
      });
    }

    isLoggedIn() {
      return !!(window.FlorealAuth && window.FlorealAuth.isLoggedIn());
    }

    getAuthToken() {
      return window.FlorealAuth ? window.FlorealAuth.getToken() : null;
    }

    loadLocalWishlist() {
      try {
        const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    }

    saveLocalWishlist() {
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(this.items));
      } catch (e) {}
    }

    async refreshWishlist() {
      if (this.isLoggedIn()) {
        try {
          const res = await fetch(`${API_BASE}/user/wishlist`, {
            headers: { 'Authorization': `Bearer ${this.getAuthToken()}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.wishlist) {
              this.items = data.wishlist.map(w => w.product).filter(Boolean);
              this.render();
              return;
            }
          }
        } catch (err) {}
      }

      this.items = this.loadLocalWishlist();
      this.render();
    }

    initDOMElements() {
      this.badges = document.querySelectorAll('.wishlist-count-badge');
      this.container = document.getElementById('wishlistGrid');
      this.emptyView = document.getElementById('wishlistEmptyView');
    }

    bindEvents() {
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-wishlist-toggle], .product-wishlist-btn');
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();

        const productId = btn.dataset.productId;
        if (!productId) return;

        let product = null;
        if (window.florealCatalog && window.florealCatalog.products) {
          product = window.florealCatalog.products.find(p => String(p.id) === String(productId));
        }

        if (!product) {
          const card = btn.closest('.product-card');
          if (card) {
            product = {
              id: productId,
              title: card.querySelector('.product-card-title')?.textContent?.trim() || 'Forever Bloom',
              price: parseFloat(card.querySelector('.price-current')?.textContent?.replace(/[^0-9.]/g, '') || '299'),
              compareAtPrice: parseFloat(card.querySelector('.price-compare')?.textContent?.replace(/[^0-9.]/g, '') || '499'),
              image: card.querySelector('img')?.src || '',
              category: card.querySelector('.product-card-category')?.textContent?.trim() || 'Bouquet'
            };
          }
        }

        if (product) {
          this.toggle(product, btn);
        }
      });
    }

    has(productId) {
      return this.items.some(i => String(i.id) === String(productId));
    }

    async toggle(product, triggerBtn = null) {
      const exists = this.has(product.id);

      if (this.isLoggedIn()) {
        try {
          if (exists) {
            await fetch(`${API_BASE}/user/wishlist/${product.id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${this.getAuthToken()}` }
            });
          } else {
            await fetch(`${API_BASE}/user/wishlist`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
              },
              body: JSON.stringify({ product_id: product.id })
            });
          }
        } catch (err) {}
      }

      if (exists) {
        this.items = this.items.filter(i => String(i.id) !== String(product.id));
        this.showToast(`Removed "${product.title}" from Wishlist`);
      } else {
        this.items.push(product);
        this.showToast(`Saved "${product.title}" to Wishlist ❤️`);
      }

      this.saveLocalWishlist();
      this.render();

      if (triggerBtn) {
        triggerBtn.classList.toggle('active', !exists);
      }
    }

    render() {
      const count = this.items.length;
      this.badges.forEach(badge => {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-flex' : 'none';
      });

      if (!this.container || !this.emptyView) return;

      if (count === 0) {
        this.container.style.display = 'none';
        this.emptyView.style.display = 'block';
      } else {
        this.emptyView.style.display = 'none';
        this.container.style.display = 'grid';

        this.container.innerHTML = this.items.map(p => `
          <div class="product-card" data-product-id="${p.id}">
            <div class="product-image-container">
              <a href="product.html?id=${p.id}"><img src="${p.image}" alt="${p.title}" loading="lazy"></a>
              <button type="button" class="product-wishlist-btn active" data-product-id="${p.id}" aria-label="Remove from Wishlist">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>
            <div class="product-info">
              <span class="product-category">${p.category || 'Forever Bloom'}</span>
              <h3 class="product-title"><a href="product.html?id=${p.id}">${p.title}</a></h3>
              <div class="product-price">
                <span class="price-current">₹${parseFloat(p.price).toFixed(2)}</span>
                ${p.compareAtPrice ? `<span class="price-compare">₹${parseFloat(p.compareAtPrice).toFixed(2)}</span>` : ''}
              </div>
              <button type="button" class="btn btn-primary btn-sm btn-full" style="margin-top: 10px;" onclick="window.florealCart && window.florealCart.addItem({id: '${p.id}', title: '${p.title.replace(/'/g, "\\'")}', price: ${p.price}, image: '${p.image}'})">
                Move to Bag 🛍️
              </button>
            </div>
          </div>
        `).join('');
      }
    }

    showToast(msg) {
      if (window.FlorealAuth && typeof window.FlorealAuth.showToast === 'function') {
        window.FlorealAuth.showToast(msg);
      }
    }
  }

  window.florealWishlist = new WishlistManager();
  window.FlorealWishlist = window.florealWishlist;
})();
