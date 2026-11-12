/**
 * Floreal Quick View Modal Module
 * Reconstructs quickview modal for inspecting product details & adding to cart
 */

(function () {
  class QuickViewManager {
    constructor() {
      this.modal = document.getElementById('quickViewModal');
      this.closeBtn = document.getElementById('quickViewCloseBtn');
      this.backdrop = document.getElementById('drawerBackdrop');

      this.currentProduct = null;
      this.quantity = 1;

      this.initElements();
      this.bindEvents();
    }

    initElements() {
      this.imgEl = document.getElementById('quickViewImg');
      this.categoryEl = document.getElementById('quickViewCategory');
      this.titleEl = document.getElementById('quickViewTitle');
      this.priceEl = document.getElementById('quickViewPrice');
      this.compareEl = document.getElementById('quickViewCompare');
      this.descEl = document.getElementById('quickViewDesc');
      this.qtyMinus = document.getElementById('quickViewMinus');
      this.qtyPlus = document.getElementById('quickViewPlus');
      this.qtyVal = document.getElementById('quickViewQty');
      this.addBtn = document.getElementById('quickViewAddBtn');
    }

    bindEvents() {
      if (this.closeBtn) {
        this.closeBtn.addEventListener('click', () => this.close());
      }

      if (this.backdrop) {
        this.backdrop.addEventListener('click', () => this.close());
      }

      if (this.qtyMinus) {
        this.qtyMinus.addEventListener('click', () => {
          if (this.quantity > 1) {
            this.quantity--;
            if (this.qtyVal) this.qtyVal.textContent = this.quantity;
          }
        });
      }

      if (this.qtyPlus) {
        this.qtyPlus.addEventListener('click', () => {
          this.quantity++;
          if (this.qtyVal) this.qtyVal.textContent = this.quantity;
        });
      }

      if (this.addBtn) {
        this.addBtn.addEventListener('click', () => {
          if (this.currentProduct && window.florealCart) {
            window.florealCart.addItem(this.currentProduct, this.quantity);
            this.close();
          }
        });
      }

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
          this.close();
        }
      });
    }

    open(product) {
      this.currentProduct = product;
      this.quantity = 1;
      if (this.qtyVal) this.qtyVal.textContent = '1';

      if (this.imgEl) {
        this.imgEl.src = product.image;
        this.imgEl.alt = product.title;
      }

      if (this.categoryEl) {
        this.categoryEl.textContent = product.category || 'Floreal Bloom';
      }

      if (this.titleEl) {
        this.titleEl.textContent = product.title;
      }

      if (this.priceEl) {
        this.priceEl.textContent = `₹${product.price.toFixed(2)}`;
      }

      if (this.compareEl) {
        if (product.compareAtPrice && product.compareAtPrice > product.price) {
          this.compareEl.textContent = `₹${product.compareAtPrice.toFixed(2)}`;
          this.compareEl.style.display = 'inline';
        } else {
          this.compareEl.style.display = 'none';
        }
      }

      if (this.descEl) {
        this.descEl.textContent = product.description || 'Handcrafted eternal crochet floral arrangement. Designed to bring lasting warmth, beauty, and love to any space without wilting.';
      }

      if (this.modal) this.modal.classList.add('active');
      if (this.backdrop) this.backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    close() {
      if (this.modal) this.modal.classList.remove('active');
      if (this.backdrop && !document.getElementById('cartDrawer').classList.contains('active')) {
        this.backdrop.classList.remove('active');
      }
      document.body.style.overflow = '';
      this.currentProduct = null;
    }
  }

  window.florealQuickView = new QuickViewManager();
})();

