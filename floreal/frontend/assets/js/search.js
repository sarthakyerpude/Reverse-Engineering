/**
 * Floreal Predictive Search Module
 * Instant client-side search across all 131 products (predictive-search replica)
 */

(function () {
  class SearchManager {
    constructor() {
      this.modal = document.getElementById('searchModal');
      this.input = document.getElementById('searchInput');
      this.closeBtn = document.getElementById('searchCloseBtn');
      this.resultsContainer = document.getElementById('searchResultsList');
      this.searchTriggers = document.querySelectorAll('[data-search-toggle]');
      this.backdrop = document.getElementById('drawerBackdrop');

      this.bindEvents();
    }

    bindEvents() {
      this.searchTriggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.open();
        });
      });

      if (this.closeBtn) {
        this.closeBtn.addEventListener('click', () => this.close());
      }

      if (this.input) {
        this.input.addEventListener('input', (e) => this.handleSearch(e.target.value));
      }

      // Close on Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
          this.close();
        }
      });
    }

    open() {
      if (this.modal) this.modal.classList.add('active');
      if (this.backdrop) this.backdrop.classList.add('active');
      if (this.input) {
        setTimeout(() => this.input.focus(), 100);
      }
    }

    close() {
      if (this.modal) this.modal.classList.remove('active');
      if (this.backdrop && !document.getElementById('cartDrawer').classList.contains('active')) {
        this.backdrop.classList.remove('active');
      }
      if (this.input) this.input.value = '';
      if (this.resultsContainer) this.resultsContainer.innerHTML = '';
    }

    handleSearch(query) {
      const q = query.trim().toLowerCase();
      if (!this.resultsContainer) return;

      if (!q || q.length < 2) {
        this.resultsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999; font-size: 13px; padding: 20px;">Type at least 2 characters to search forever flowers, bouquets, pots...</p>';
        return;
      }

      const products = window.FLOREAL_CATALOG?.products || [];
      const matches = products.filter(p => {
        return (
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.tags && p.tags.some(t => t.toLowerCase().includes(q))) ||
          p.description.toLowerCase().includes(q)
        );
      }).slice(0, 10);

      if (matches.length === 0) {
        this.resultsContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #777; font-size: 13px; padding: 30px;">No blooms found matching "<strong>${escapeHTML(query)}</strong>". Try searching for "Rose", "Tulip", "Sunflower", or "Pot".</p>`;
        return;
      }

      this.resultsContainer.innerHTML = matches.map(p => `
        <div class="search-result-item" data-product-id="${p.id}">
          <img src="${p.image}" alt="${escapeHTML(p.title)}" class="search-result-thumb" loading="lazy">
          <div class="search-result-info">
            <h5>${escapeHTML(p.title)}</h5>
            <p>₹${p.price.toFixed(2)} ${p.compareAtPrice ? `<span style="text-decoration: line-through; color: #999; font-size: 11px; margin-left: 4px;">₹${p.compareAtPrice.toFixed(2)}</span>` : ''}</p>
          </div>
        </div>
      `).join('');

      // Add click to open quick view
      this.resultsContainer.querySelectorAll('.search-result-item').forEach(el => {
        el.addEventListener('click', () => {
          const id = el.dataset.productId;
          const product = products.find(p => String(p.id) === String(id));
          if (product && window.florealQuickView) {
            this.close();
            window.florealQuickView.open(product);
          }
        });
      });
    }
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
  }

  window.florealSearch = new SearchManager();
})();

