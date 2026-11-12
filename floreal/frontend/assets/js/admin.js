/**
 * Floreal Artisan & Store Admin Dashboard Engine
 * Order Status Progression, Inventory Management & Analytics
 */

(function () {
  class AdminManager {
    async initAsync() {
      // Try fetching live orders from Backend SQLite DB
      try {
        const token = window.FlorealAuth ? window.FlorealAuth.getToken() : null;
        const res = await fetch('http://localhost:5000/api/orders/admin/all', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.orders && data.orders.length > 0) {
            this.orders = data.orders.map(o => ({
              id: o.id,
              orderNumber: o.order_number,
              date: o.created_at,
              stage: (o.order_status || 'PLACED').toUpperCase(),
              customer: {
                name: o.customer_name,
                phone: o.customer_phone,
                city: o.shipping_address?.city || 'India',
                address: o.shipping_address?.address || ''
              },
              items: o.items || [],
              total: o.total,
              paymentMethod: o.payment_method,
              paymentStatus: (o.payment_status || 'PENDING').toUpperCase(),
              courier: 'Delhivery Express',
              awb: o.tracking_number
            }));
            this.render();
          }
        }
      } catch (err) {}
    }

    constructor() {
      this.orders = this.loadOrders();
      this.activeTab = 'orders';
      this.initElements();
      this.bindEvents();
      this.render();
      this.initAsync();
    }

    loadOrders() {
      try {
        const stored = JSON.parse(localStorage.getItem('floreal_orders_history') || '[]');
        if (stored.length > 0) return stored;
      } catch (e) {
        console.error('Failed to load orders', e);
      }

      // Default sample orders if storage is empty
      const defaultOrders = [
        {
          orderNumber: 'FLO-84920',
          date: new Date(Date.now() - 3600000 * 24).toISOString(),
          stage: 'DISPATCHED',
          customer: { name: 'Pooja Sharma', phone: '9876543210', city: 'Bangalore', address: '402, Indiranagar' },
          items: [{ title: 'Single Rose Bouquet (Pastel Pink)', quantity: 1, price: 299 }, { title: 'Sunflower Desk Pot', quantity: 1, price: 799 }],
          total: 1098,
          paymentMethod: 'razorpay',
          paymentStatus: 'PAID',
          courier: 'Delhivery Express',
          awb: 'DL893048123IN'
        },
        {
          orderNumber: 'FLO-51042',
          date: new Date(Date.now() - 3600000 * 5).toISOString(),
          stage: 'CRAFTING',
          customer: { name: 'Rahul Verma', phone: '9823456789', city: 'Pune', address: 'B-12, Koregaon Park' },
          items: [{ title: 'Jumbo Lavender Lily Hamper', quantity: 1, price: 1899 }],
          total: 1899,
          paymentMethod: 'whatsapp',
          paymentStatus: 'PAID',
          courier: 'Bluedart Air',
          awb: 'BD492019482'
        },
        {
          orderNumber: 'FLO-29401',
          date: new Date(Date.now() - 3600000 * 2).toISOString(),
          stage: 'PLACED',
          customer: { name: 'Ananya Deshmukh', phone: '9988776655', city: 'Mumbai', address: '14, Bandra West' },
          items: [{ title: 'Single Tulip Bouquet (Red)', quantity: 2, price: 299 }],
          total: 598,
          paymentMethod: 'cod',
          paymentStatus: 'PENDING',
          courier: 'Delhivery Express',
          awb: 'DL pending'
        }
      ];

      localStorage.setItem('floreal_orders_history', JSON.stringify(defaultOrders));
      return defaultOrders;
    }

    saveOrders() {
      try {
        localStorage.setItem('floreal_orders_history', JSON.stringify(this.orders));
      } catch (e) {
        console.error('Failed to save orders', e);
      }
    }

    initElements() {
      this.ordersTableBody = document.getElementById('adminOrdersTableBody');
      this.inventoryTableBody = document.getElementById('adminInventoryTableBody');
      this.totalSalesEl = document.getElementById('metricTotalSales');
      this.totalOrdersEl = document.getElementById('metricTotalOrders');
      this.avgOrderValEl = document.getElementById('metricAvgOrder');
      this.statusFilter = document.getElementById('adminStatusFilter');
      this.inventorySearch = document.getElementById('adminInventorySearch');
      this.navTabs = document.querySelectorAll('.admin-nav-item');
    }

    bindEvents() {
      // Tab switching
      this.navTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
          e.preventDefault();
          this.navTabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          this.activeTab = tab.dataset.tab;

          document.querySelectorAll('.admin-tab-pane').forEach(p => p.classList.remove('active'));
          const targetPane = document.getElementById(`tab-${this.activeTab}`);
          if (targetPane) targetPane.classList.add('active');

          this.render();
        });
      });

      // Filter orders by status
      if (this.statusFilter) {
        this.statusFilter.addEventListener('change', () => this.renderOrders());
      }

      // Filter inventory by keyword
      if (this.inventorySearch) {
        this.inventorySearch.addEventListener('input', () => this.renderInventory());
      }
    }

    advanceOrderStatus(orderNumber) {
      const stages = ['PLACED', 'CRAFTING', 'PACKED', 'DISPATCHED', 'DELIVERED'];
      const order = this.orders.find(o => o.orderNumber === orderNumber);
      if (!order) return;

      const currentIndex = stages.indexOf(order.stage);
      if (currentIndex < stages.length - 1) {
        const nextStage = stages[currentIndex + 1];
        order.stage = nextStage;

        if (nextStage === 'DISPATCHED' && (!order.awb || order.awb.includes('pending'))) {
          order.awb = `DL${Math.floor(100000000 + Math.random() * 900000000)}IN`;
        }

        this.saveOrders();
        this.render();
        alert(`Order #${orderNumber} advanced to "${nextStage}"!`);
      }
    }

    render() {
      this.renderMetrics();
      if (this.activeTab === 'orders') {
        this.renderOrders();
      } else if (this.activeTab === 'inventory') {
        this.renderInventory();
      }
    }

    renderMetrics() {
      const totalSales = this.orders.reduce((sum, o) => sum + (o.total || 0), 0);
      const totalCount = this.orders.length;
      const aov = totalCount > 0 ? (totalSales / totalCount) : 0;

      if (this.totalSalesEl) this.totalSalesEl.textContent = `₹${totalSales.toLocaleString('en-IN')}`;
      if (this.totalOrdersEl) this.totalOrdersEl.textContent = totalCount;
      if (this.avgOrderValEl) this.avgOrderValEl.textContent = `₹${Math.round(aov)}`;
    }

    renderOrders() {
      if (!this.ordersTableBody) return;

      const filterVal = this.statusFilter ? this.statusFilter.value : 'ALL';
      const filtered = filterVal === 'ALL' ? this.orders : this.orders.filter(o => o.stage === filterVal);

      if (filtered.length === 0) {
        this.ordersTableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4">No orders matching status "${filterVal}".</td></tr>`;
        return;
      }

      this.ordersTableBody.innerHTML = filtered.map(order => {
        const dateStr = new Date(order.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        const isDelivered = order.stage === 'DELIVERED';

        return `
          <tr>
            <td>
              <strong>#${order.orderNumber}</strong><br>
              <small class="text-muted">${dateStr}</small>
            </td>
            <td>
              <strong>${order.customer?.name || 'Customer'}</strong><br>
              <small>${order.customer?.phone || ''} • ${order.customer?.city || ''}</small>
            </td>
            <td>
              ${(order.items || []).map(i => `${i.title} (x${i.quantity})`).join(', ')}
            </td>
            <td>
              <strong>₹${(order.total || 0).toFixed(2)}</strong><br>
              <small class="badge ${order.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}">${order.paymentMethod?.toUpperCase()} (${order.paymentStatus})</small>
            </td>
            <td>
              <span class="status-pill status-${order.stage.toLowerCase()}">${order.stage}</span><br>
              <small class="text-muted">${order.awb || ''}</small>
            </td>
            <td>
              ${!isDelivered ? `
                <button type="button" class="btn btn-sm btn-outline advance-btn" data-order="${order.orderNumber}">
                  Advance Stage ➔
                </button>
              ` : '<span class="text-success font-semibold">Completed ✓</span>'}
            </td>
          </tr>
        `;
      }).join('');

      this.ordersTableBody.querySelectorAll('.advance-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.advanceOrderStatus(btn.dataset.order);
        });
      });
    }

    renderInventory() {
      if (!this.inventoryTableBody || !window.florealCatalog) return;

      const query = (this.inventorySearch?.value || '').toLowerCase().trim();
      let products = window.florealCatalog.products || [];

      if (query) {
        products = products.filter(p => p.title.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
      }

      this.inventoryTableBody.innerHTML = products.slice(0, 50).map(p => `
        <tr>
          <td><img src="${p.image}" class="admin-thumb" alt="${p.title}"></td>
          <td>
            <strong>${p.title}</strong><br>
            <small class="text-muted">${p.category}</small>
          </td>
          <td><strong>₹${parseFloat(p.price).toFixed(2)}</strong></td>
          <td>${p.compareAtPrice ? `₹${parseFloat(p.compareAtPrice).toFixed(2)}` : '—'}</td>
          <td>
            <label class="switch">
              <input type="checkbox" checked>
              <span class="slider round"></span>
            </label>
            <span class="status-in-stock">In Stock</span>
          </td>
        </tr>
      `).join('');
    }
  }

  window.florealAdmin = new AdminManager();
})();

