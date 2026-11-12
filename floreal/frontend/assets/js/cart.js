/**
 * Floreal E-Commerce Universal Cart Module
 * Seamlessly connects to SQLite Server Database via REST API (/api/cart)
 * Supports Guest Mode (localStorage) with automatic Server Merging upon login
 * Powers both Slide-Out Bag Drawer & Full Bag Page (cart.html)
 */

(function () {
  const API_BASE = 'http://localhost:5000/api';
  const GUEST_STORAGE_KEY = 'floreal_guest_cart';
  const FREE_SHIPPING_THRESHOLD = 999;

  class CartManager {
    constructor() {
      this.items = [];
      this.serverCart = null;
      this.init();
    }

    async init() {
      this.initDOMElements();
      this.bindEvents();
      await this.refreshCart();

      // Listen for auth changes to sync cart with account
      window.addEventListener('floreal:auth-change', async (e) => {
        await this.refreshCart();
      });
    }

    isLoggedIn() {
      return !!(window.FlorealAuth && window.FlorealAuth.isLoggedIn());
    }

    getAuthToken() {
      return window.FlorealAuth ? window.FlorealAuth.getToken() : null;
    }

    loadGuestCart() {
      try {
        const stored = localStorage.getItem(GUEST_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    }

    saveGuestCart(items) {
      try {
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {}
    }

    async refreshCart() {
      if (this.isLoggedIn()) {
        try {
          const res = await fetch(`${API_BASE}/cart`, {
            headers: { 'Authorization': `Bearer ${this.getAuthToken()}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.cart) {
              this.serverCart = data.cart;
              this.items = data.cart.items.map(i => ({
                id: i.product_id,
                cart_item_id: i.id,
                title: i.title,
                price: i.price,
                compareAtPrice: i.compare_at_price,
                image: i.image,
                quantity: i.quantity,
                lineTotal: i.line_total
              }));
              this.render();
              return;
            }
          }
        } catch (err) {
          console.warn('Backend cart fetch failed, using fallback:', err.message);
        }
      }

      // Guest / Offline fallback
      this.items = this.loadGuestCart();
      this.render();
    }

    async mergeGuestCart() {
      const guestItems = this.loadGuestCart();
      if (!guestItems || guestItems.length === 0) return;

      if (this.isLoggedIn()) {
        try {
          const res = await fetch(`${API_BASE}/cart/merge`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.getAuthToken()}`
            },
            body: JSON.stringify({
              items: guestItems.map(i => ({
                product_id: i.id,
                variant_id: i.variant_id || 'default',
                quantity: i.quantity
              }))
            })
          });

          if (res.ok) {
            const data = await res.json();
            localStorage.removeItem(GUEST_STORAGE_KEY);
            if (data && data.cart) {
              this.serverCart = data.cart;
              this.items = data.cart.items.map(i => ({
                id: i.product_id,
                cart_item_id: i.id,
                title: i.title,
                price: i.price,
                compareAtPrice: i.compare_at_price,
                image: i.image,
                quantity: i.quantity,
                lineTotal: i.line_total
              }));
              this.render();
              this.showToast('Your guest bag has been merged with your account! 🛍️');
            }
          }
        } catch (err) {
          console.error('Failed to merge guest cart:', err);
        }
      }
    }

    initDOMElements() {
      this.drawer = document.getElementById('cartDrawer');
      this.backdrop = document.getElementById('drawerBackdrop');
      this.cartToggleBtns = document.querySelectorAll('[data-cart-toggle]');
      this.cartCloseBtn = document.getElementById('cartDrawerClose');
      this.cartCountBadges = document.querySelectorAll('.cart-count-badge');
      this.cartItemsList = document.getElementById('cartItemsList');
      this.cartEmptyView = document.getElementById('cartEmptyView');
      this.cartSubtotal = document.getElementById('cartSubtotalValue');
      this.freeShippingText = document.getElementById('freeShippingText');
      this.freeShippingFill = document.getElementById('freeShippingFill');
      this.checkoutBtn = document.getElementById('cartCheckoutBtn');
      this.whatsappBtn = document.getElementById('cartWhatsappBtn');

      // Cart Page Elements (cart.html)
      this.cartPageItemsList = document.getElementById('cartPageItemsList');
      this.cartPageEmpty = document.getElementById('cartPageEmpty');
      this.cartPageContent = document.getElementById('cartPageContent');
      this.cartPageSubtotal = document.getElementById('cartPageSubtotal');
      this.cartPageShippingFee = document.getElementById('cartPageShippingFee');
      this.cartPageTotal = document.getElementById('cartPageTotal');
      this.cartPageShippingText = document.getElementById('cartPageShippingText');
      this.cartPageShippingFill = document.getElementById('cartPageShippingFill');
      this.cartPageCheckoutBtn = document.getElementById('cartPageCheckoutBtn');
    }

    bindEvents() {
      // Toggle Cart Drawer
      this.cartToggleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.open();
        });
      });

      if (this.cartCloseBtn) {
        this.cartCloseBtn.addEventListener('click', () => this.close());
      }

      if (this.backdrop) {
        this.backdrop.addEventListener('click', () => this.close());
      }

      // Quantity adjustments and removal via delegation (Drawer)
      if (this.cartItemsList) {
        this.cartItemsList.addEventListener('click', (e) => {
          const target = e.target.closest('button, a');
          if (!target) return;

          const productId = target.dataset.productId;
          const cartItemId = target.dataset.cartItemId;
          if (!productId) return;

          if (target.matches('.qty-minus')) {
            this.changeQuantity(productId, -1, cartItemId);
          } else if (target.matches('.qty-plus')) {
            this.changeQuantity(productId, 1, cartItemId);
          } else if (target.matches('.cart-item-remove')) {
            e.preventDefault();
            this.removeItem(productId, cartItemId);
          }
        });
      }

      // Quantity adjustments and removal via delegation (Cart Page)
      if (this.cartPageItemsList) {
        this.cartPageItemsList.addEventListener('click', (e) => {
          const target = e.target.closest('button, a');
          if (!target) return;

          const productId = target.dataset.productId;
          const cartItemId = target.dataset.cartItemId;
          if (!productId) return;

          if (target.matches('.qty-minus')) {
            this.changeQuantity(productId, -1, cartItemId);
          } else if (target.matches('.qty-plus')) {
            this.changeQuantity(productId, 1, cartItemId);
          } else if (target.matches('.cart-item-remove')) {
            e.preventDefault();
            this.removeItem(productId, cartItemId);
          }
        });
      }

      if (this.checkoutBtn) {
        this.checkoutBtn.addEventListener('click', () => this.handleCheckout());
      }

      if (this.cartPageCheckoutBtn) {
        this.cartPageCheckoutBtn.addEventListener('click', () => this.handleCheckout());
      }

      if (this.whatsappBtn) {
        this.whatsappBtn.addEventListener('click', () => this.handleWhatsAppCheckout());
      }
    }

    open() {
      if (this.drawer) this.drawer.classList.add('active');
      if (this.backdrop) this.backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    close() {
      if (this.drawer) this.drawer.classList.remove('active');
      if (this.backdrop) this.backdrop.classList.remove('active');
      document.body.style.overflow = '';
    }

    async addItem(product, quantity = 1) {
      const cleanQty = Math.max(1, parseInt(quantity, 10) || 1);

      if (this.isLoggedIn()) {
        try {
          const res = await fetch(`${API_BASE}/cart/add`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.getAuthToken()}`
            },
            body: JSON.stringify({
              product_id: product.id,
              variant_id: product.variant_id || 'default',
              quantity: cleanQty
            })
          });

          if (res.ok) {
            const data = await res.json();
            if (data && data.cart) {
              this.serverCart = data.cart;
              this.items = data.cart.items.map(i => ({
                id: i.product_id,
                cart_item_id: i.id,
                title: i.title,
                price: i.price,
                compareAtPrice: i.compare_at_price,
                image: i.image,
                quantity: i.quantity,
                lineTotal: i.line_total
              }));
              this.render();
              this.open();
              this.showToast(`Added "${product.title}" to your bag! 🌸`);
              return;
            }
          }
        } catch (err) {
          console.error('Server cart add failed, saving locally:', err);
        }
      }

      // Guest / LocalStorage Mode
      const existing = this.items.find(i => String(i.id) === String(product.id));
      if (existing) {
        existing.quantity += cleanQty;
      } else {
        this.items.push({
          id: product.id,
          title: product.title,
          price: parseFloat(product.price || 499),
          compareAtPrice: product.compareAtPrice ? parseFloat(product.compareAtPrice) : null,
          image: product.image,
          quantity: cleanQty
        });
      }

      this.saveGuestCart(this.items);
      this.render();
      this.open();
      this.showToast(`Added "${product.title}" to your bag! 🌸`);
    }

    async changeQuantity(productId, delta, cartItemId) {
      const item = this.items.find(i => String(i.id) === String(productId));
      if (!item) return;

      const newQty = item.quantity + delta;

      if (this.isLoggedIn()) {
        const targetId = cartItemId || item.cart_item_id;
        try {
          const res = await fetch(`${API_BASE}/cart/${targetId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.getAuthToken()}`
            },
            body: JSON.stringify({ quantity: newQty })
          });

          if (res.ok) {
            const data = await res.json();
            if (data && data.cart) {
              this.serverCart = data.cart;
              this.items = data.cart.items.map(i => ({
                id: i.product_id,
                cart_item_id: i.id,
                title: i.title,
                price: i.price,
                compareAtPrice: i.compare_at_price,
                image: i.image,
                quantity: i.quantity,
                lineTotal: i.line_total
              }));
              this.render();
              return;
            }
          }
        } catch (err) {
          console.error('Server cart quantity update error:', err);
        }
      }

      // Guest Mode
      if (newQty <= 0) {
        this.removeItem(productId);
      } else {
        item.quantity = newQty;
        this.saveGuestCart(this.items);
        this.render();
      }
    }

    async removeItem(productId, cartItemId) {
      if (this.isLoggedIn()) {
        const item = this.items.find(i => String(i.id) === String(productId));
        const targetId = cartItemId || (item && item.cart_item_id);
        if (targetId) {
          try {
            const res = await fetch(`${API_BASE}/cart/${targetId}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${this.getAuthToken()}` }
            });
            if (res.ok) {
              const data = await res.json();
              if (data && data.cart) {
                this.serverCart = data.cart;
                this.items = data.cart.items.map(i => ({
                  id: i.product_id,
                  cart_item_id: i.id,
                  title: i.title,
                  price: i.price,
                  compareAtPrice: i.compare_at_price,
                  image: i.image,
                  quantity: i.quantity,
                  lineTotal: i.line_total
                }));
                this.render();
                return;
              }
            }
          } catch (err) {
            console.error('Server cart remove error:', err);
          }
        }
      }

      // Guest Mode
      this.items = this.items.filter(i => String(i.id) !== String(productId));
      this.saveGuestCart(this.items);
      this.render();
    }

    async clearCart() {
      if (this.isLoggedIn()) {
        try {
          await fetch(`${API_BASE}/cart`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${this.getAuthToken()}` }
          });
        } catch (err) {}
      }
      this.items = [];
      localStorage.removeItem(GUEST_STORAGE_KEY);
      this.render();
    }

    getTotal() {
      return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    getCount() {
      return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    render() {
      const total = this.getTotal();
      const count = this.getCount();
      const shippingFee = total >= FREE_SHIPPING_THRESHOLD || total === 0 ? 0 : 99;
      const grandTotal = total + shippingFee;

      // 1. Update Badges
      this.cartCountBadges.forEach(badge => {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
      });

      // 2. Update Drawer Subtotal
      if (this.cartSubtotal) {
        this.cartSubtotal.textContent = `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      }

      // 3. Update Drawer Free Shipping Meter
      this.updateFreeShippingMeter(total, this.freeShippingText, this.freeShippingFill);

      // 4. Render Drawer Items
      if (this.cartItemsList && this.cartEmptyView) {
        if (this.items.length === 0) {
          this.cartItemsList.style.display = 'none';
          this.cartEmptyView.style.display = 'block';
          if (this.checkoutBtn) this.checkoutBtn.disabled = true;
        } else {
          this.cartEmptyView.style.display = 'none';
          this.cartItemsList.style.display = 'block';
          if (this.checkoutBtn) this.checkoutBtn.disabled = false;

          this.cartItemsList.innerHTML = this.items.map(item => `
            <div class="cart-item">
              <img src="${item.image}" alt="${item.title}" class="cart-item-img" loading="lazy">
              <div class="cart-item-details">
                <h4 class="cart-item-title"><a href="product.html?id=${item.id}">${item.title}</a></h4>
                <div class="cart-item-price">₹${item.price.toFixed(2)}</div>
                <div class="cart-item-controls">
                  <div class="qty-stepper">
                    <button type="button" class="qty-btn qty-minus" data-product-id="${item.id}" data-cart-item-id="${item.cart_item_id || ''}">-</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button type="button" class="qty-btn qty-plus" data-product-id="${item.id}" data-cart-item-id="${item.cart_item_id || ''}">+</button>
                  </div>
                  <a href="#" class="cart-item-remove" data-product-id="${item.id}" data-cart-item-id="${item.cart_item_id || ''}">Remove</a>
                </div>
              </div>
            </div>
          `).join('');
        }
      }

      // 5. Render Full Cart Page (if present on cart.html)
      if (this.cartPageItemsList && this.cartPageEmpty) {
        if (this.items.length === 0) {
          this.cartPageItemsList.style.display = 'none';
          this.cartPageEmpty.style.display = 'block';
          if (this.cartPageContent) this.cartPageContent.style.display = 'none';
        } else {
          this.cartPageEmpty.style.display = 'none';
          this.cartPageItemsList.style.display = 'block';
          if (this.cartPageContent) this.cartPageContent.style.display = 'grid';

          this.cartPageItemsList.innerHTML = this.items.map(item => `
            <div class="cart-page-item" style="display: flex; gap: 16px; padding: 16px 0; border-bottom: 1px solid #edf2f7; align-items: center;">
              <img src="${item.image}" alt="${item.title}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
              <div style="flex: 1;">
                <h4 style="margin: 0 0 6px 0; font-size: 15px;"><a href="product.html?id=${item.id}" style="color: inherit; text-decoration: none;">${item.title}</a></h4>
                <div style="font-weight: 700; color: #db2777; font-size: 14px;">₹${item.price.toFixed(2)} each</div>
              </div>
              <div class="qty-stepper" style="display: flex; align-items: center; border: 1px solid #e2e8f0; border-radius: 6px;">
                <button type="button" class="qty-btn qty-minus" data-product-id="${item.id}" data-cart-item-id="${item.cart_item_id || ''}" style="padding: 6px 12px; background: none; border: none; cursor: pointer;">-</button>
                <span class="qty-value" style="padding: 0 8px; font-weight: 600;">${item.quantity}</span>
                <button type="button" class="qty-btn qty-plus" data-product-id="${item.id}" data-cart-item-id="${item.cart_item_id || ''}" style="padding: 6px 12px; background: none; border: none; cursor: pointer;">+</button>
              </div>
              <div style="font-weight: 700; min-width: 90px; text-align: right;">
                ₹${(item.price * item.quantity).toFixed(2)}
              </div>
              <button type="button" class="cart-item-remove" data-product-id="${item.id}" data-cart-item-id="${item.cart_item_id || ''}" style="background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px;" title="Remove">✕</button>
            </div>
          `).join('');

          if (this.cartPageSubtotal) this.cartPageSubtotal.textContent = `₹${total.toFixed(2)}`;
          if (this.cartPageShippingFee) this.cartPageShippingFee.textContent = shippingFee === 0 ? 'FREE' : `₹${shippingFee.toFixed(2)}`;
          if (this.cartPageTotal) this.cartPageTotal.textContent = `₹${grandTotal.toFixed(2)}`;
          this.updateFreeShippingMeter(total, this.cartPageShippingText, this.cartPageShippingFill);
        }
      }

      window.dispatchEvent(new CustomEvent('cart:updated', {
        detail: { items: this.items, total, count, shippingFee, grandTotal }
      }));
    }

    updateFreeShippingMeter(total, textEl, fillEl) {
      if (!textEl || !fillEl) return;
      const remaining = FREE_SHIPPING_THRESHOLD - total;
      const percent = Math.min(100, Math.round((total / FREE_SHIPPING_THRESHOLD) * 100));

      fillEl.style.width = `${percent}%`;

      if (remaining <= 0) {
        fillEl.classList.add('unlocked');
        textEl.innerHTML = `🎉 Congratulations! You've unlocked <strong>FREE Shipping</strong>!`;
      } else {
        fillEl.classList.remove('unlocked');
        textEl.innerHTML = `Add <strong>₹${remaining.toFixed(2)}</strong> more to get <strong>FREE Shipping</strong>!`;
      }
    }

    handleCheckout() {
      if (this.items.length === 0) {
        this.showToast('Your bag is empty! Add a handcrafted bloom first.');
        return;
      }
      window.location.href = 'checkout.html';
    }

    handleWhatsAppCheckout() {
      if (this.items.length === 0) return;
      const lines = this.items.map(i => `• ${i.title} x${i.quantity} (₹${(i.price * i.quantity).toFixed(2)})`);
      const msg = encodeURIComponent(`Hello Floreal! 🌸 I would like to order:\n\n${lines.join('\n')}\n\nTotal: ₹${this.getTotal().toFixed(2)}\nPlease confirm availability!`);
      window.open(`https://wa.me/919999999999?text=${msg}`, '_blank');
    }

    showToast(msg) {
      if (window.FlorealAuth && typeof window.FlorealAuth.showToast === 'function') {
        window.FlorealAuth.showToast(msg);
      }
    }
  }

  window.florealCart = new CartManager();
  window.FlorealCart = window.florealCart;
})();
