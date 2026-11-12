/**
 * Floreal E-Commerce Authentication & User Session Module
 * Full-stack auth integration with JWT, session persistence, login/register modals,
 * and header state synchronization.
 */

(function () {
  const API_BASE = 'http://localhost:5000/api';
  const TOKEN_KEY = 'floreal_token';
  const USER_KEY = 'floreal_user';

  class AuthManager {
    constructor() {
      this.token = localStorage.getItem(TOKEN_KEY) || null;
      this.user = this.loadUser();
      this.init();
    }

    loadUser() {
      try {
        const u = localStorage.getItem(USER_KEY);
        return u ? JSON.parse(u) : null;
      } catch (e) {
        return null;
      }
    }

    isLoggedIn() {
      return !!(this.token && this.user);
    }

    getToken() {
      return this.token;
    }

    getUser() {
      return this.user;
    }

    async init() {
      // Validate session with backend if token exists
      if (this.token) {
        this.verifySession();
      }

      // Inject Auth Modal & Dropdown Styles into DOM
      this.injectStyles();
      this.injectModal();
      this.bindHeaderActions();
      this.updateHeaderUI();
    }

    async verifySession() {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.user) {
            this.user = data.user;
            localStorage.setItem(USER_KEY, JSON.stringify(this.user));
            this.updateHeaderUI();
          }
        } else {
          // Token expired or invalid
          this.logout(false);
        }
      } catch (err) {
        // Backend offline or network error, keep offline token for now
      }
    }

    async authFetch(url, options = {}) {
      const headers = Object.assign({}, options.headers || {});
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
      return fetch(url, Object.assign({}, options, { headers }));
    }

    // ─── LOGIN & REGISTER API ───

    async login(email, password) {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to sign in.');
        }

        this.token = data.token;
        this.user = data.user;
        localStorage.setItem(TOKEN_KEY, this.token);
        localStorage.setItem(USER_KEY, JSON.stringify(this.user));

        this.closeModal();
        this.updateHeaderUI();
        this.showToast(`Welcome back, ${this.user.name}! 🌸`);

        // Trigger cart merge if CartManager is active
        if (window.florealCart && typeof window.florealCart.mergeGuestCart === 'function') {
          window.florealCart.mergeGuestCart();
        }

        window.dispatchEvent(new CustomEvent('floreal:auth-change', { detail: { isLoggedIn: true, user: this.user } }));
        return { success: true, user: this.user };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    async register(name, email, password, phone) {
      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, phone })
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Registration failed.');
        }

        this.token = data.token;
        this.user = data.user;
        localStorage.setItem(TOKEN_KEY, this.token);
        localStorage.setItem(USER_KEY, JSON.stringify(this.user));

        this.closeModal();
        this.updateHeaderUI();
        this.showToast(`Welcome to Floreal, ${this.user.name}! ✨`);

        if (window.florealCart && typeof window.florealCart.mergeGuestCart === 'function') {
          window.florealCart.mergeGuestCart();
        }

        window.dispatchEvent(new CustomEvent('floreal:auth-change', { detail: { isLoggedIn: true, user: this.user } }));
        return { success: true, user: this.user };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    logout(showNotice = true) {
      this.token = null;
      this.user = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      this.updateHeaderUI();

      if (showNotice) {
        this.showToast('You have been signed out.');
      }

      window.dispatchEvent(new CustomEvent('floreal:auth-change', { detail: { isLoggedIn: false } }));

      // If currently on protected page, redirect to home
      if (window.location.pathname.includes('account.html')) {
        window.location.href = 'index.html';
      }
    }

    // ─── UI & MODAL MANAGEMENT ───

    injectStyles() {
      if (document.getElementById('florealAuthStyles')) return;
      const style = document.createElement('style');
      style.id = 'florealAuthStyles';
      style.textContent = `
        /* Auth Modal Overlay */
        .auth-modal-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(4px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          visibility: hidden;
          transition: all 0.25s ease;
        }
        .auth-modal-backdrop.active {
          opacity: 1;
          visibility: visible;
        }
        .auth-modal-box {
          background: #ffffff;
          width: 92%;
          max-width: 440px;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          overflow: hidden;
          transform: translateY(20px) scale(0.96);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }
        .auth-modal-backdrop.active .auth-modal-box {
          transform: translateY(0) scale(1);
        }
        .auth-modal-header {
          padding: 24px 24px 16px 24px;
          position: relative;
          text-align: center;
          border-bottom: 1px solid #f1f3f5;
        }
        .auth-modal-close {
          position: absolute;
          top: 18px; right: 18px;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 20px;
          color: #a0aec0;
          transition: color 0.15s;
        }
        .auth-modal-close:hover { color: #2d3748; }
        .auth-modal-tabs {
          display: flex;
          gap: 8px;
          margin-top: 14px;
          background: #f8fafc;
          padding: 4px;
          border-radius: 10px;
        }
        .auth-tab-btn {
          flex: 1;
          padding: 8px 12px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          background: transparent;
          color: #718096;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .auth-tab-btn.active {
          background: #ffffff;
          color: #2d3748;
          box-shadow: 0 2px 4px rgba(0,0,0,0.06);
        }
        .auth-modal-body {
          padding: 24px;
        }
        .auth-field {
          margin-bottom: 14px;
          text-align: left;
        }
        .auth-field label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #4a5568;
          margin-bottom: 6px;
        }
        .auth-field input {
          width: 100%;
          padding: 10px 14px;
          font-size: 14px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
          font-family: inherit;
        }
        .auth-field input:focus {
          border-color: #f472b6;
          box-shadow: 0 0 0 3px rgba(244, 114, 182, 0.15);
        }
        .auth-btn-submit {
          width: 100%;
          padding: 12px;
          background: #2d3748;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 6px;
          transition: background 0.2s;
        }
        .auth-btn-submit:hover {
          background: #1a202c;
        }
        .auth-alert-box {
          background: #fff5f5;
          color: #e53e3e;
          border: 1px solid #feb2b2;
          padding: 10px;
          border-radius: 8px;
          font-size: 12px;
          margin-bottom: 14px;
          display: none;
        }
        .auth-demo-shortcut {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px dashed #e2e8f0;
          text-align: center;
        }
        .auth-btn-demo {
          background: #fdf2f8;
          color: #db2777;
          border: 1px solid #fbcfe8;
          padding: 8px 14px;
          font-size: 12px;
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .auth-btn-demo:hover {
          background: #fce7f3;
        }
        /* User Dropdown in Header */
        .header-user-wrapper {
          position: relative;
          display: inline-block;
        }
        .header-user-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 20px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          color: #2d3748;
          transition: all 0.2s;
        }
        .header-user-btn:hover {
          border-color: #cbd5e1;
          background: #f1f5f9;
        }
        .header-user-avatar {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #f472b6;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
        }
        .user-dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 200px;
          background: #ffffff;
          border: 1px solid #edf2f7;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          padding: 8px 0;
          z-index: 9999;
          display: none;
        }
        .header-user-wrapper.open .user-dropdown-menu {
          display: block;
        }
        .user-dropdown-header {
          padding: 8px 16px 10px 16px;
          border-bottom: 1px solid #f1f5f9;
        }
        .user-dropdown-header .name { font-size: 13px; font-weight: 700; color: #1e293b; }
        .user-dropdown-header .email { font-size: 11px; color: #64748b; }
        .user-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          color: #334155;
          text-decoration: none;
          font-size: 13px;
          transition: background 0.15s;
          cursor: pointer;
        }
        .user-dropdown-item:hover {
          background: #f8fafc;
          color: #0f172a;
        }
        .user-dropdown-item.logout {
          color: #ef4444;
          border-top: 1px solid #f1f5f9;
          margin-top: 4px;
        }
      `;
      document.head.appendChild(style);
    }

    injectModal() {
      if (document.getElementById('florealAuthModal')) return;

      const modalHtml = `
        <div class="auth-modal-backdrop" id="florealAuthModal">
          <div class="auth-modal-box">
            <div class="auth-modal-header">
              <button type="button" class="auth-modal-close" id="authModalCloseBtn" aria-label="Close modal">✕</button>
              <h3 style="margin: 0; font-size: 18px; color: #1e293b;">Floreal Forever Blooms</h3>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Sign in to sync your cart, orders & addresses</p>
              
              <div class="auth-modal-tabs">
                <button type="button" class="auth-tab-btn active" id="tabSignInBtn">Sign In</button>
                <button type="button" class="auth-tab-btn" id="tabSignUpBtn">Create Account</button>
              </div>
            </div>

            <div class="auth-modal-body">
              <div class="auth-alert-box" id="authAlertBox"></div>

              <!-- SIGN IN FORM -->
              <form id="signInForm">
                <div class="auth-field">
                  <label for="loginEmail">Email Address</label>
                  <input type="email" id="loginEmail" placeholder="you@example.com" required autocomplete="email">
                </div>
                <div class="auth-field">
                  <label for="loginPassword">Password</label>
                  <input type="password" id="loginPassword" placeholder="••••••••" required autocomplete="current-password">
                </div>
                <button type="submit" class="auth-btn-submit" id="loginSubmitBtn">Sign In to Account</button>

                <div class="auth-demo-shortcut">
                  <p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0;">Testing the site? ⚡</p>
                  <button type="button" class="auth-btn-demo" id="quickDemoLoginBtn">Instant Login as Demo Customer (demo@floreal.in)</button>
                </div>
              </form>

              <!-- SIGN UP FORM -->
              <form id="signUpForm" style="display: none;">
                <div class="auth-field">
                  <label for="regName">Full Name</label>
                  <input type="text" id="regName" placeholder="Priya Sharma" required autocomplete="name">
                </div>
                <div class="auth-field">
                  <label for="regEmail">Email Address</label>
                  <input type="email" id="regEmail" placeholder="priya@example.com" required autocomplete="email">
                </div>
                <div class="auth-field">
                  <label for="regPhone">Phone (for order updates)</label>
                  <input type="tel" id="regPhone" placeholder="+91 98765 43210" autocomplete="tel">
                </div>
                <div class="auth-field">
                  <label for="regPassword">Create Password (min 6 chars)</label>
                  <input type="password" id="regPassword" placeholder="••••••••" required minlength="6" autocomplete="new-password">
                </div>
                <button type="submit" class="auth-btn-submit" id="registerSubmitBtn">Create My Account</button>
              </form>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalHtml);

      // Bind modal interactions
      const backdrop = document.getElementById('florealAuthModal');
      const closeBtn = document.getElementById('authModalCloseBtn');
      const tabSignIn = document.getElementById('tabSignInBtn');
      const tabSignUp = document.getElementById('tabSignUpBtn');
      const signInForm = document.getElementById('signInForm');
      const signUpForm = document.getElementById('signUpForm');
      const alertBox = document.getElementById('authAlertBox');
      const quickDemoBtn = document.getElementById('quickDemoLoginBtn');

      closeBtn.addEventListener('click', () => this.closeModal());
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) this.closeModal();
      });

      // Tab switching
      tabSignIn.addEventListener('click', () => {
        tabSignIn.classList.add('active');
        tabSignUp.classList.remove('active');
        signInForm.style.display = 'block';
        signUpForm.style.display = 'none';
        alertBox.style.display = 'none';
      });

      tabSignUp.addEventListener('click', () => {
        tabSignUp.classList.add('active');
        tabSignIn.classList.remove('active');
        signInForm.style.display = 'none';
        signUpForm.style.display = 'block';
        alertBox.style.display = 'none';
      });

      // Sign In Submission
      signInForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        alertBox.style.display = 'none';
        const submitBtn = document.getElementById('loginSubmitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing in...';

        const email = document.getElementById('loginEmail').value.trim();
        const pass = document.getElementById('loginPassword').value;

        const result = await this.login(email, pass);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In to Account';

        if (!result.success) {
          alertBox.textContent = result.error;
          alertBox.style.display = 'block';
        }
      });

      // Sign Up Submission
      signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        alertBox.style.display = 'none';
        const submitBtn = document.getElementById('registerSubmitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account...';

        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const pass = document.getElementById('regPassword').value;

        const result = await this.register(name, email, pass, phone);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create My Account';

        if (!result.success) {
          alertBox.textContent = result.error;
          alertBox.style.display = 'block';
        }
      });

      // Quick 1-click Demo Customer button
      if (quickDemoBtn) {
        quickDemoBtn.addEventListener('click', async () => {
          document.getElementById('loginEmail').value = 'demo@floreal.in';
          document.getElementById('loginPassword').value = 'demo123';
          quickDemoBtn.textContent = 'Logging in as Demo Customer...';
          await this.login('demo@floreal.in', 'demo123');
          quickDemoBtn.textContent = 'Instant Login as Demo Customer (demo@floreal.in)';
        });
      }
    }

    openModal(mode = 'login') {
      const modal = document.getElementById('florealAuthModal');
      if (!modal) return;
      modal.classList.add('active');

      const tabSignIn = document.getElementById('tabSignInBtn');
      const tabSignUp = document.getElementById('tabSignUpBtn');
      if (mode === 'signup') {
        tabSignUp.click();
      } else {
        tabSignIn.click();
      }
    }

    closeModal() {
      const modal = document.getElementById('florealAuthModal');
      if (modal) modal.classList.remove('active');
    }

    bindHeaderActions() {
      // Find all account buttons in the header
      const accountBtns = document.querySelectorAll('a[href*="account"], [aria-label*="Account"], [data-auth-trigger]');
      accountBtns.forEach(btn => {
        // If it's inside user dropdown, ignore
        if (btn.closest('.user-dropdown-menu')) return;

        btn.addEventListener('click', (e) => {
          if (!this.isLoggedIn()) {
            e.preventDefault();
            this.openModal('login');
          } else {
            // If already on account.html, let link work; otherwise toggle menu if wrapper exists
            const wrapper = btn.closest('.header-user-wrapper');
            if (wrapper) {
              e.preventDefault();
              wrapper.classList.toggle('open');
            }
          }
        });
      });

      // Close dropdown if clicked outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.header-user-wrapper')) {
          document.querySelectorAll('.header-user-wrapper.open').forEach(w => w.classList.remove('open'));
        }
      });
    }

    updateHeaderUI() {
      const accountLinks = document.querySelectorAll('a[href*="account.html"], [aria-label="Customer Account"]');
      
      accountLinks.forEach(link => {
        if (link.closest('.user-dropdown-menu')) return;

        if (this.isLoggedIn()) {
          const firstName = this.user.name ? this.user.name.split(' ')[0] : 'Account';
          const initial = this.user.name ? this.user.name.charAt(0).toUpperCase() : 'U';

          // Wrap in dropdown container if not already
          let wrapper = link.closest('.header-user-wrapper');
          if (!wrapper) {
            wrapper = document.createElement('div');
            wrapper.className = 'header-user-wrapper';
            link.parentNode.insertBefore(wrapper, link);
            wrapper.appendChild(link);
          }

          link.innerHTML = `
            <div class="header-user-btn" title="Logged in as ${this.user.name}">
              <div class="header-user-avatar">${initial}</div>
              <span>${firstName}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          `;
          link.href = '#';

          // Add dropdown menu if not exists
          let menu = wrapper.querySelector('.user-dropdown-menu');
          if (!menu) {
            menu = document.createElement('div');
            menu.className = 'user-dropdown-menu';
            wrapper.appendChild(menu);
          }

          menu.innerHTML = `
            <div class="user-dropdown-header">
              <div class="name">${this.user.name}</div>
              <div class="email">${this.user.email}</div>
            </div>
            <a href="account.html" class="user-dropdown-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              My Account
            </a>
            <a href="account.html#orders" class="user-dropdown-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
              My Orders
            </a>
            <a href="account.html#addresses" class="user-dropdown-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              Saved Addresses
            </a>
            <a href="wishlist.html" class="user-dropdown-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              Wishlist
            </a>
            <div class="user-dropdown-item logout" id="dropdownLogoutBtn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Sign Out
            </div>
          `;

          const logoutBtn = menu.querySelector('#dropdownLogoutBtn');
          if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              this.logout();
            });
          }
        } else {
          // Logged out: Restore standard account icon
          link.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          `;
          link.href = '#';
          link.title = 'Sign In to Account';
        }
      });
    }

    showToast(message) {
      let toast = document.getElementById('toastNotice');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastNotice';
        toast.className = 'toast-notice';
        document.body.appendChild(toast);
      }
      toast.textContent = message;
      toast.classList.add('active');
      setTimeout(() => toast.classList.remove('active'), 3500);
    }
  }

  window.FlorealAuth = new AuthManager();
})();

