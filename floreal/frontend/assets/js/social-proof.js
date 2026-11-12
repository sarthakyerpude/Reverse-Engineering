/**
 * Floreal Social Proof Notification Module
 * Reconstructs halo-someone-purchase.js ("Someone recently purchased...")
 */

(function () {
  const CITIES = [
    'Mumbai, Maharashtra',
    'Bengaluru, Karnataka',
    'South Delhi',
    'Jaipur, Rajasthan',
    'Pune, Maharashtra',
    'Hyderabad, Telangana',
    'Ahmedabad, Gujarat',
    'Kolkata, West Bengal',
    'Chandigarh',
    'Lucknow, Uttar Pradesh',
    'Indore, Madhya Pradesh',
    'Kochi, Kerala'
  ];

  const TIMES = [
    'just now',
    '2 minutes ago',
    '5 minutes ago',
    '12 minutes ago',
    '24 minutes ago',
    '45 minutes ago'
  ];

  class SocialProofManager {
    constructor() {
      this.toastEl = document.getElementById('socialProofToast');
      this.imgEl = document.getElementById('socialProofImg');
      this.textEl = document.getElementById('socialProofText');
      this.timeEl = document.getElementById('socialProofTime');
      this.closeBtn = document.getElementById('socialProofClose');

      this.timer = null;
      this.isDismissed = false;

      this.bindEvents();
      this.startCycle();
    }

    bindEvents() {
      if (this.closeBtn) {
        this.closeBtn.addEventListener('click', () => {
          this.hide();
          this.isDismissed = true;
          if (this.timer) clearTimeout(this.timer);
        });
      }
    }

    startCycle() {
      // First show after 4 seconds
      setTimeout(() => {
        this.showRandomPurchase();
      }, 4000);
    }

    showRandomPurchase() {
      if (this.isDismissed) return;

      const products = window.FLOREAL_CATALOG?.products || [];
      if (products.length === 0) return;

      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];
      const randomTime = TIMES[Math.floor(Math.random() * TIMES.length)];

      if (this.imgEl) this.imgEl.src = randomProduct.image;
      if (this.textEl) {
        this.textEl.innerHTML = `Someone in <strong>${randomCity}</strong> bought <strong>${randomProduct.title}</strong>`;
      }
      if (this.timeEl) this.timeEl.textContent = randomTime;

      this.show();

      // Auto-hide after 5 seconds, then schedule next
      setTimeout(() => {
        this.hide();
        if (!this.isDismissed) {
          const nextInterval = 9000 + Math.random() * 8000; // 9-17s
          this.timer = setTimeout(() => this.showRandomPurchase(), nextInterval);
        }
      }, 5000);
    }

    show() {
      if (this.toastEl) this.toastEl.classList.add('visible');
    }

    hide() {
      if (this.toastEl) this.toastEl.classList.remove('visible');
    }
  }

  window.florealSocialProof = new SocialProofManager();
})();

