/**
 * Floreal E-Commerce Checkout Engine
 * Full-stack integration with SQLite Order Placement, Address Book Auto-Fill,
 * Coupon Calculations, and Razorpay/COD workflows.
 */

(function () {
  const API_BASE = 'http://localhost:5000/api';

  const PINCODE_DATABASE = {
    '110001': { city: 'New Delhi', state: 'Delhi' },
    '400001': { city: 'Mumbai', state: 'Maharashtra' },
    '560001': { city: 'Bengaluru', state: 'Karnataka' },
    '700001': { city: 'Kolkata', state: 'West Bengal' },
    '600001': { city: 'Chennai', state: 'Tamil Nadu' },
    '500001': { city: 'Hyderabad', state: 'Telangana' },
    '411001': { city: 'Pune', state: 'Maharashtra' },
    '380001': { city: 'Ahmedabad', state: 'Gujarat' },
    '302001': { city: 'Jaipur', state: 'Rajasthan' },
    '226001': { city: 'Lucknow', state: 'Uttar Pradesh' },
    '682001': { city: 'Kochi', state: 'Kerala' },
    '452001': { city: 'Indore', state: 'Madhya Pradesh' },
    '160017': { city: 'Chandigarh', state: 'Punjab' },
    '800001': { city: 'Patna', state: 'Bihar' },
    '781001': { city: 'Guwahati', state: 'Assam' }
  };

  const COUPONS = {
    'SHARKTANK10': { type: 'percent', value: 0.10, desc: '10% Shark Tank Special Discount' },
    'FLOREAL50': { type: 'flat', value: 50, desc: '₹50 Flat Off' },
    'WELCOME100': { type: 'flat', value: 100, min: 999, desc: '₹100 Off on orders above ₹999' }
  };

  class CheckoutManager {
    constructor() {
      this.cart = this.loadCart();
      this.appliedCoupon = null;
      this.currentStep = 1;
      this.shippingMethod = 'standard';
      this.paymentMethod = 'razorpay';
      this.savedAddresses = [];

      this.initElements();
      this.bindEvents();
      this.autoFillUserData();
      this.renderSummary();
    }

    loadCart() {
      if (window.florealCart && Array.isArray(window.florealCart.items) && window.florealCart.items.length > 0) {
        return window.florealCart.items;
      }
      try {
        const stored = localStorage.getItem('floreal_guest_cart') || localStorage.getItem('floreal_cart_items');
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    }

    async autoFillUserData() {
      if (!window.FlorealAuth || !window.FlorealAuth.isLoggedIn()) return;
      const user = window.FlorealAuth.getUser();

      const nameInput = document.getElementById('customerName');
      const emailInput = document.getElementById('customerEmail');
      const phoneInput = document.getElementById('customerPhone');

      if (nameInput && !nameInput.value && user.name) nameInput.value = user.name;
      if (emailInput && !emailInput.value && user.email) emailInput.value = user.email;
      if (phoneInput && !phoneInput.value && user.phone) phoneInput.value = user.phone;

      // Fetch saved addresses
      try {
        const res = await window.FlorealAuth.authFetch(`${API_BASE}/user/addresses`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.addresses && data.addresses.length > 0) {
            this.savedAddresses = data.addresses;
            this.renderSavedAddressPicker();
          }
        }
      } catch (err) {}
    }

    renderSavedAddressPicker() {
      const addressForm = document.getElementById('checkoutAddressForm');
      if (!addressForm || this.savedAddresses.length === 0) return;

      let pickerBox = document.getElementById('savedAddressPickerBox');
      if (!pickerBox) {
        pickerBox = document.createElement('div');
        pickerBox.id = 'savedAddressPickerBox';
        pickerBox.style.cssText = 'background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 8px; padding: 12px; margin-bottom: 16px;';
        addressForm.insertBefore(pickerBox, addressForm.firstChild);
      }

      pickerBox.innerHTML = `
        <div style="font-size: 13px; font-weight: 700; color: #db2777; margin-bottom: 8px;">
          📍 Choose from your Saved Addresses:
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${this.savedAddresses.map((addr, idx) => `
            <label style="display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: #374151; cursor: pointer; background: #ffffff; padding: 8px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <input type="radio" name="selectedSavedAddress" value="${addr.id}" ${idx === 0 ? 'checked' : ''} style="margin-top: 2px;">
              <div>
                <strong>${addr.full_name}</strong> (${addr.phone})<br>
                ${addr.address_line1}, ${addr.city}, ${addr.state} - ${addr.pincode}
              </div>
            </label>
          `).join('')}
        </div>
      `;

      // Fill with first saved address immediately
      this.fillWithSavedAddress(this.savedAddresses[0]);

      pickerBox.querySelectorAll('input[name="selectedSavedAddress"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
          const selected = this.savedAddresses.find(a => a.id === e.target.value);
          if (selected) this.fillWithSavedAddress(selected);
        });
      });
    }

    fillWithSavedAddress(addr) {
      if (!addr) return;
      if (document.getElementById('customerName')) document.getElementById('customerName').value = addr.full_name;
      if (document.getElementById('customerPhone')) document.getElementById('customerPhone').value = addr.phone;
      if (document.getElementById('shippingAddress')) document.getElementById('shippingAddress').value = addr.address_line1 + (addr.address_line2 ? ', ' + addr.address_line2 : '');
      if (document.getElementById('shippingCity')) document.getElementById('shippingCity').value = addr.city;
      if (document.getElementById('shippingState')) document.getElementById('shippingState').value = addr.state;
      if (document.getElementById('shippingPincode')) document.getElementById('shippingPincode').value = addr.pincode;
    }

    initElements() {
      this.summaryItems = document.getElementById('checkoutSummaryItems');
      this.subtotalEl = document.getElementById('summarySubtotal');
      this.shippingEl = document.getElementById('summaryShipping');
      this.discountEl = document.getElementById('summaryDiscount');
      this.discountRow = document.getElementById('summaryDiscountRow');
      this.totalEl = document.getElementById('summaryTotal');
      this.couponInput = document.getElementById('couponCodeInput');
      this.couponBtn = document.getElementById('applyCouponBtn');
      this.couponMsg = document.getElementById('couponMessage');

      this.step1 = document.getElementById('checkoutStep1');
      this.step2 = document.getElementById('checkoutStep2');
      this.toStep2Btn = document.getElementById('continueToStep2Btn');
      this.backToStep1Btn = document.getElementById('backToStep1Btn');
      this.placeOrderBtn = document.getElementById('placeOrderBtn');

      this.pincodeInput = document.getElementById('shippingPincode');
      this.cityInput = document.getElementById('shippingCity');
      this.stateInput = document.getElementById('shippingState');

      this.paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    }

    bindEvents() {
      if (this.pincodeInput) {
        this.pincodeInput.addEventListener('input', (e) => {
          const pin = e.target.value.trim();
          if (pin.length === 6) {
            this.lookupPincode(pin);
          }
        });
      }

      if (this.toStep2Btn) {
        this.toStep2Btn.addEventListener('click', (e) => {
          e.preventDefault();
          if (this.validateStep1()) {
            this.goToStep(2);
          }
        });
      }

      if (this.backToStep1Btn) {
        this.backToStep1Btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.goToStep(1);
        });
      }

      if (this.couponBtn && this.couponInput) {
        this.couponBtn.addEventListener('click', () => {
          this.applyCoupon(this.couponInput.value.trim().toUpperCase());
        });
      }

      this.paymentRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
          this.paymentMethod = e.target.value;
          this.renderSummary();
        });
      });

      if (this.placeOrderBtn) {
        this.placeOrderBtn.addEventListener('click', () => this.handlePlaceOrder());
      }
    }

    lookupPincode(pin) {
      if (PINCODE_DATABASE[pin]) {
        const info = PINCODE_DATABASE[pin];
        if (this.cityInput) this.cityInput.value = info.city;
        if (this.stateInput) this.stateInput.value = info.state;
      }
    }

    validateStep1() {
      const name = document.getElementById('customerName')?.value.trim();
      const phone = document.getElementById('customerPhone')?.value.trim();
      const email = document.getElementById('customerEmail')?.value.trim();
      const address = document.getElementById('shippingAddress')?.value.trim();
      const pincode = document.getElementById('shippingPincode')?.value.trim();
      const city = document.getElementById('shippingCity')?.value.trim();
      const state = document.getElementById('shippingState')?.value.trim();

      if (!name) { alert('Please enter your full name.'); return false; }
      if (!phone || phone.length < 10) { alert('Please enter a valid 10-digit mobile number.'); return false; }
      if (!email || !email.includes('@')) { alert('Please enter a valid email address.'); return false; }
      if (!pincode || pincode.length !== 6) { alert('Please enter a valid 6-digit Indian PIN code.'); return false; }
      if (!address) { alert('Please enter your complete street address.'); return false; }
      if (!city || !state) { alert('Please enter your city and state.'); return false; }

      return true;
    }

    goToStep(step) {
      this.currentStep = step;
      if (step === 2) {
        this.step1.classList.remove('active');
        this.step1.classList.add('completed');
        this.step2.classList.remove('disabled');
        this.step2.classList.add('active');
      } else {
        this.step1.classList.remove('completed');
        this.step1.classList.add('active');
        this.step2.classList.remove('active');
        this.step2.classList.add('disabled');
      }
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }

    applyCoupon(code) {
      if (!code) return;
      const subtotal = this.getSubtotal();

      if (!COUPONS[code]) {
        this.couponMsg.textContent = 'Invalid promo code. Try SHARKTANK10 or FLOREAL50.';
        this.couponMsg.className = 'coupon-message error';
        return;
      }

      const coupon = COUPONS[code];
      if (coupon.min && subtotal < coupon.min) {
        this.couponMsg.textContent = `Coupon ${code} requires minimum order of ₹${coupon.min}`;
        this.couponMsg.className = 'coupon-message error';
        return;
      }

      this.appliedCoupon = { code, ...coupon };
      this.couponMsg.textContent = `Applied: ${coupon.desc}`;
      this.couponMsg.className = 'coupon-message success';
      this.renderSummary();
    }

    getSubtotal() {
      return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    getDiscount(subtotal) {
      if (!this.appliedCoupon) return 0;
      if (this.appliedCoupon.type === 'percent') {
        return subtotal * this.appliedCoupon.value;
      }
      return this.appliedCoupon.value;
    }

    getShipping(subtotal) {
      return subtotal >= 999 ? 0 : 99;
    }

    getCodFee() {
      return this.paymentMethod === 'cod' ? 49 : 0;
    }

    renderSummary() {
      if (!this.summaryItems) return;

      if (this.cart.length === 0) {
        this.summaryItems.innerHTML = '<div class="empty-cart-msg">Your bag is empty. <a href="collections.html">Browse Forever Flowers</a></div>';
        if (this.placeOrderBtn) this.placeOrderBtn.disabled = true;
        return;
      }

      this.summaryItems.innerHTML = this.cart.map(item => `
        <div class="checkout-item-row">
          <div class="checkout-item-thumb-wrap">
            <img src="${item.image}" alt="${item.title}" class="checkout-item-thumb">
            <span class="checkout-item-qty-badge">${item.quantity}</span>
          </div>
          <div class="checkout-item-meta">
            <h5 class="checkout-item-title">${item.title}</h5>
            <span class="checkout-item-variant">Handcrafted Forever Bloom</span>
          </div>
          <div class="checkout-item-price">₹${(item.price * item.quantity).toFixed(2)}</div>
        </div>
      `).join('');

      const subtotal = this.getSubtotal();
      const discount = this.getDiscount(subtotal);
      const shipping = this.getShipping(subtotal);
      const codFee = this.getCodFee();
      const grandTotal = Math.max(0, subtotal - discount + shipping + codFee);

      if (this.subtotalEl) this.subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
      if (this.shippingEl) {
        this.shippingEl.innerHTML = shipping === 0 ? '<span class="text-success font-semibold">FREE (Above ₹999)</span>' : `₹${shipping.toFixed(2)}`;
      }

      if (this.discountRow && this.discountEl) {
        if (discount > 0) {
          this.discountRow.style.display = 'flex';
          this.discountEl.textContent = `-₹${discount.toFixed(2)}`;
        } else {
          this.discountRow.style.display = 'none';
        }
      }

      let codFeeRow = document.getElementById('summaryCodFeeRow');
      if (codFee > 0) {
        if (!codFeeRow) {
          codFeeRow = document.createElement('div');
          codFeeRow.id = 'summaryCodFeeRow';
          codFeeRow.className = 'summary-row';
          codFeeRow.innerHTML = `<span>COD Verification Fee</span><span id="summaryCodFee">₹49.00</span>`;
          this.totalEl.closest('.summary-totals').insertBefore(codFeeRow, this.totalEl.closest('.summary-row'));
        }
        codFeeRow.style.display = 'flex';
      } else if (codFeeRow) {
        codFeeRow.style.display = 'none';
      }

      if (this.totalEl) this.totalEl.textContent = `₹${grandTotal.toFixed(2)}`;
    }

    async handlePlaceOrder() {
      if (this.cart.length === 0) return;

      this.placeOrderBtn.disabled = true;
      this.placeOrderBtn.textContent = 'Processing your order... 🔒';

      const customer = {
        name: document.getElementById('customerName')?.value.trim() || 'Valued Customer',
        email: document.getElementById('customerEmail')?.value.trim() || '',
        phone: document.getElementById('customerPhone')?.value.trim() || ''
      };

      const shippingAddress = {
        address: document.getElementById('shippingAddress')?.value.trim() || '',
        city: document.getElementById('shippingCity')?.value.trim() || '',
        state: document.getElementById('shippingState')?.value.trim() || '',
        pincode: document.getElementById('shippingPincode')?.value.trim() || '',
        landmark: document.getElementById('shippingLandmark')?.value.trim() || ''
      };

      const notes = document.getElementById('giftMessageInput')?.value.trim() || '';

      const payload = {
        customer,
        shippingAddress,
        items: this.cart.map(i => ({
          product_id: i.id,
          variant_id: i.variant_id || 'default',
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          image: i.image
        })),
        paymentMethod: this.paymentMethod,
        notes
      };

      try {
        const headers = { 'Content-Type': 'application/json' };
        if (window.FlorealAuth && window.FlorealAuth.isLoggedIn()) {
          headers['Authorization'] = `Bearer ${window.FlorealAuth.getToken()}`;
        }

        const res = await fetch(`${API_BASE}/orders/create`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to place order.');
        }

        const orderNumber = data.order.order_number;

        // Clear cart
        if (window.florealCart) {
          await window.florealCart.clearCart();
        }

        // WhatsApp redirect handling
        if (this.paymentMethod === 'whatsapp') {
          const itemsList = this.cart.map(i => `• ${i.title} (x${i.quantity})`).join('\n');
          const msg = encodeURIComponent(`🌸 NEW ORDER: #${orderNumber}\nCustomer: ${customer.name} (${customer.phone})\nItems:\n${itemsList}\nTotal: ₹${data.order.total}`);
          window.open(`https://wa.me/919876543210?text=${msg}`, '_blank');
        }

        window.location.href = `order-success.html?orderId=${orderNumber}`;
      } catch (err) {
        alert('Order submission error: ' + err.message);
        this.placeOrderBtn.disabled = false;
        this.placeOrderBtn.textContent = 'Place Order Now 🔒';
      }
    }
  }

  window.FlorealCheckout = new CheckoutManager();
})();
