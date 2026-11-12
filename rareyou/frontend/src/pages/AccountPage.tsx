import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  MapPin,
  User as UserIcon,
  Truck,
  Plus,
  Trash2,
  CheckCircle2,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Order, Address } from '../types';

export const AccountPage: React.FC = () => {
  const { user, isAuthenticated, token, openAuthModal, loginDemo, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);

  // Address modal form
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrDefault, setAddrDefault] = useState(false);

  // Profile form
  const [profileName, setProfileName] = useState(user?.full_name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  // Fetch orders and addresses
  const loadAccountData = useCallback(async () => {
    if (!token) return;
    try {
      const [orderRes, addrRes] = await Promise.all([
        fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/user/addresses', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
      ]);

      if (orderRes.success && orderRes.orders) {
        setOrders(orderRes.orders);
      }
      if (addrRes.success && addrRes.addresses) {
        setAddresses(addrRes.addresses);
      }
    } catch (err) {
      console.error('Account data fetch error', err);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAccountData();
    }
  }, [isAuthenticated, loadAccountData]);

  // Cancel order handler
  const handleCancelOrder = async (orderRef: string) => {
    if (!window.confirm(`Are you sure you want to cancel order ${orderRef}?`)) return;

    try {
      const res = await fetch(`/api/orders/${orderRef}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        loadAccountData();
      } else {
        alert(data.error || 'Failed to cancel order');
      }
    } catch (err) {
      console.error('Cancel order error', err);
    }
  };

  // Add Address Handler
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: addrName,
          phone: addrPhone,
          street_address: addrStreet,
          city: addrCity,
          state: addrState,
          pincode: addrPincode,
          landmark: addrLandmark,
          is_default: addrDefault ? 1 : 0
        })
      });
      const data = await res.json();
      if (data.success && data.addresses) {
        setAddresses(data.addresses);
        setIsAddAddressOpen(false);
        // Reset form
        setAddrName('');
        setAddrPhone('');
        setAddrStreet('');
        setAddrCity('');
        setAddrState('');
        setAddrPincode('');
        setAddrLandmark('');
        setAddrDefault(false);
      }
    } catch (err) {
      console.error('Add address error', err);
    }
  };

  // Delete Address Handler
  const handleDeleteAddress = async (addrId: string) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      const res = await fetch(`/api/user/addresses/${addrId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.addresses) {
        setAddresses(data.addresses);
      }
    } catch (err) {
      console.error('Delete address error', err);
    }
  };

  // Set Default Address
  const handleSetDefaultAddress = async (addrId: string) => {
    try {
      const res = await fetch(`/api/user/addresses/${addrId}/default`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.addresses) {
        setAddresses(data.addresses);
      }
    } catch (err) {
      console.error('Set default error', err);
    }
  };

  // Profile Update Handler
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: profileName,
          phone: profilePhone
        })
      });
      const data = await res.json();
      if (data.success && data.user) {
        updateUser(data.user);
        setProfileMessage('Profile details successfully updated.');
        setTimeout(() => setProfileMessage(null), 3000);
      }
    } catch (err) {
      console.error('Profile update error', err);
    }
  };

  // If unauthenticated: Show member login view
  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#EFECE6] text-[#4A5844] flex items-center justify-center mx-auto">
          <UserIcon className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-3xl text-[#2C2A29]">Member Portal</h1>
        <p className="text-xs text-[#716D68] max-w-sm mx-auto">
          Please sign in to view your orders, live shipment statuses, saved addresses, and custom dress measurements.
        </p>

        <div className="pt-2 space-y-3">
          <button
            onClick={loginDemo}
            className="w-full sm:w-auto bg-[#4A5844] hover:bg-[#374233] text-white text-xs font-semibold px-8 py-3.5 rounded-lg tracking-wider uppercase transition-colors shadow-md"
          >
            ⚡ 1-Click Demo Login (Pooja Sharma)
          </button>
          <div>
            <button
              onClick={openAuthModal}
              className="text-xs text-[#716D68] hover:text-[#4A5844] underline font-medium"
            >
              Sign In with Custom Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Account Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E5DF] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#4A5844] text-white font-serif text-xl flex items-center justify-center">
            {user?.full_name?.charAt(0) || 'P'}
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#C47D68] block">
              PATRON PROFILE
            </span>
            <h1 className="font-serif text-xl sm:text-2xl text-[#2C2A29]">
              {user?.full_name}
            </h1>
            <p className="text-xs text-[#716D68]">{user?.email} • {user?.phone || 'No phone set'}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            to="/collections"
            className="bg-[#FAF8F5] hover:bg-[#EFECE6] text-[#2C2A29] border border-[#E8E5DF] text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Explore Catalog
          </Link>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-[#E8E5DF] text-xs font-semibold gap-2 sm:gap-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3.5 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'orders'
              ? 'border-[#4A5844] text-[#4A5844]'
              : 'border-transparent text-[#716D68] hover:text-[#2C2A29]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3.5 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'addresses'
              ? 'border-[#4A5844] text-[#4A5844]'
              : 'border-transparent text-[#716D68] hover:text-[#2C2A29]'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses ({addresses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3.5 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'profile'
              ? 'border-[#4A5844] text-[#4A5844]'
              : 'border-transparent text-[#716D68] hover:text-[#2C2A29]'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Account Settings</span>
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-[#E8E5DF] text-center space-y-3">
              <Package className="w-10 h-10 text-[#716D68] opacity-50 mx-auto" />
              <p className="font-serif text-lg text-[#2C2A29]">No orders placed yet</p>
              <p className="text-xs text-[#716D68]">When you place an order, its live studio progress will appear here.</p>
              <Link
                to="/collections"
                className="inline-block bg-[#4A5844] text-white text-xs font-semibold px-6 py-2.5 rounded tracking-wider uppercase mt-2"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            orders.map(order => (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-[#E8E5DF] overflow-hidden shadow-xs divide-y divide-[#E8E5DF]"
              >
                {/* Order Top Bar */}
                <div className="p-4 sm:p-5 bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="text-[#716D68] block text-[11px]">Order Reference</span>
                    <span className="font-bold text-[#2C2A29] text-sm">{order.order_number}</span>
                  </div>

                  <div>
                    <span className="text-[#716D68] block text-[11px]">Date</span>
                    <span className="font-medium text-[#2C2A29]">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#716D68] block text-[11px]">Total</span>
                    <span className="font-bold text-[#2C2A29]">₹{order.total}</span>
                  </div>

                  <div>
                    <span className="text-[#716D68] block text-[11px]">Status</span>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : order.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/track?ref=${order.order_number}`}
                      className="bg-white hover:bg-[#FAF8F5] border border-[#E8E5DF] text-[#4A5844] font-semibold text-xs px-3 py-1.5 rounded flex items-center gap-1 transition-colors"
                    >
                      <Truck className="w-3.5 h-3.5" /> Track
                    </Link>

                    {order.status !== 'cancelled' &&
                      !['shipped', 'out_for_delivery', 'delivered'].includes(order.status) && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="text-red-600 hover:text-red-800 text-xs font-semibold px-2 py-1.5 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                  </div>
                </div>

                {/* Items */}
                <div className="p-4 sm:p-5 space-y-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || 'http://localhost:5000/images/dress_cookie_creme_1.jpg'}
                          alt={item.product_name}
                          className="w-12 h-14 object-cover rounded bg-[#FAF8F5] border border-[#E8E5DF]"
                        />
                        <div>
                          <Link
                            to={`/product/${item.product_handle}`}
                            className="font-medium text-[#2C2A29] hover:text-[#C47D68]"
                          >
                            {item.product_name}
                          </Link>
                          <div className="text-[11px] text-[#716D68] flex gap-2">
                            {item.selected_size && <span>Size: {item.selected_size}</span>}
                            <span>Qty: {item.quantity}</span>
                          </div>
                        </div>
                      </div>
                      <span className="font-semibold text-[#2C2A29]">₹{item.line_total}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-serif text-lg text-[#2C2A29]">Delivery Addresses</h2>
            <button
              onClick={() => setIsAddAddressOpen(true)}
              className="bg-[#4A5844] hover:bg-[#374233] text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add New Address
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {addresses.map(addr => (
              <div
                key={addr.id}
                className="bg-white p-5 rounded-xl border border-[#E8E5DF] shadow-xs flex flex-col justify-between text-xs space-y-3"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-sm text-[#2C2A29]">{addr.full_name}</h3>
                    {addr.is_default === 1 && (
                      <span className="bg-[#4A5844] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-[#716D68] mt-2 leading-relaxed">
                    {addr.street_address}
                    <br />
                    {addr.city}, {addr.state} - {addr.pincode}
                    {addr.landmark && (
                      <>
                        <br />
                        Landmark: {addr.landmark}
                      </>
                    )}
                    <br />
                    Phone: {addr.phone}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#FAF8F5]">
                  {addr.is_default !== 1 ? (
                    <button
                      onClick={() => handleSetDefaultAddress(addr.id)}
                      className="text-xs text-[#4A5844] hover:underline font-semibold"
                    >
                      Make Default
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-700 font-medium">✓ Default Address</span>
                  )}

                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-[#716D68] hover:text-red-500 p-1 transition-colors"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Address Modal */}
          {isAddAddressOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div
                onClick={() => setIsAddAddressOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              />
              <div className="flex min-h-full items-center justify-center p-4">
                <div className="bg-white rounded-xl border border-[#E8E5DF] max-w-lg w-full p-6 shadow-2xl relative text-xs">
                  <button
                    onClick={() => setIsAddAddressOpen(false)}
                    className="absolute top-4 right-4 p-1.5 text-[#716D68] hover:text-[#2C2A29]"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <h3 className="font-serif text-lg text-[#2C2A29] mb-4">Add Delivery Address</h3>

                  <form onSubmit={handleAddAddress} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#2C2A29] font-medium mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={addrName}
                          onChange={(e) => setAddrName(e.target.value)}
                          className="w-full p-2 border border-[#E8E5DF] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[#2C2A29] font-medium mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={addrPhone}
                          onChange={(e) => setAddrPhone(e.target.value)}
                          className="w-full p-2 border border-[#E8E5DF] rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#2C2A29] font-medium mb-1">Street Address *</label>
                      <textarea
                        rows={2}
                        required
                        value={addrStreet}
                        onChange={(e) => setAddrStreet(e.target.value)}
                        className="w-full p-2 border border-[#E8E5DF] rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[#2C2A29] font-medium mb-1">PIN Code *</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={addrPincode}
                          onChange={(e) => setAddrPincode(e.target.value)}
                          className="w-full p-2 border border-[#E8E5DF] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[#2C2A29] font-medium mb-1">City *</label>
                        <input
                          type="text"
                          required
                          value={addrCity}
                          onChange={(e) => setAddrCity(e.target.value)}
                          className="w-full p-2 border border-[#E8E5DF] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[#2C2A29] font-medium mb-1">State *</label>
                        <input
                          type="text"
                          required
                          value={addrState}
                          onChange={(e) => setAddrState(e.target.value)}
                          className="w-full p-2 border border-[#E8E5DF] rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#2C2A29] font-medium mb-1">Landmark (Optional)</label>
                      <input
                        type="text"
                        value={addrLandmark}
                        onChange={(e) => setAddrLandmark(e.target.value)}
                        className="w-full p-2 border border-[#E8E5DF] rounded-lg"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-[#2C2A29] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addrDefault}
                        onChange={(e) => setAddrDefault(e.target.checked)}
                        className="accent-[#4A5844]"
                      />
                      <span>Set as default delivery destination</span>
                    </label>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddAddressOpen(false)}
                        className="px-4 py-2 border border-[#E8E5DF] rounded-lg text-[#716D68]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-[#4A5844] text-white rounded-lg font-semibold"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Profile Settings */}
      {activeTab === 'profile' && (
        <div className="max-w-xl bg-white p-6 rounded-xl border border-[#E8E5DF] shadow-xs space-y-4">
          <h2 className="font-serif text-lg text-[#2C2A29] pb-3 border-b border-[#E8E5DF]">
            Profile Details
          </h2>

          {profileMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{profileMessage}</span>
            </div>
          )}

          <form onSubmit={handleProfileUpdate} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#2C2A29] font-medium mb-1">Full Name</label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full p-2.5 border border-[#E8E5DF] rounded-lg focus:outline-none focus:border-[#4A5844] text-[#2C2A29]"
              />
            </div>

            <div>
              <label className="block text-[#2C2A29] font-medium mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email}
                className="w-full p-2.5 border border-[#E8E5DF] rounded-lg bg-[#FAF8F5] text-[#716D68] cursor-not-allowed"
              />
              <span className="text-[10px] text-[#716D68] mt-0.5 block">Email cannot be changed directly.</span>
            </div>

            <div>
              <label className="block text-[#2C2A29] font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                className="w-full p-2.5 border border-[#E8E5DF] rounded-lg focus:outline-none focus:border-[#4A5844] text-[#2C2A29]"
              />
            </div>

            <button
              type="submit"
              className="bg-[#4A5844] hover:bg-[#374233] text-white text-xs font-semibold px-6 py-2.5 rounded-lg tracking-wider uppercase transition-colors"
            >
              Save Profile Updates
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
