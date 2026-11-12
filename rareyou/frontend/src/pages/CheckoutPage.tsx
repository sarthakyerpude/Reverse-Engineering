import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  CreditCard,
  Banknote,
  MessageCircle,
  Tag,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import type { Address } from '../types';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, refreshCart } = useCart();
  const { user, isAuthenticated, token } = useAuth();

  // Saved addresses for logged-in user
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');

  // Contact & Address Fields
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');

  // Payment & Coupon
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod' | 'whatsapp'>('razorpay');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Load saved addresses if authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      fetch('/api/user/addresses', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => {
          if (data.success && data.addresses && data.addresses.length > 0) {
            setSavedAddresses(data.addresses);
            const defaultAddr = data.addresses.find((a: Address) => a.is_default) || data.addresses[0];
            setSelectedAddressId(defaultAddr.id);
            setFullName(defaultAddr.full_name);
            setPhone(defaultAddr.phone);
            setStreetAddress(defaultAddr.street_address);
            setCity(defaultAddr.city);
            setState(defaultAddr.state);
            setPincode(defaultAddr.pincode);
            setLandmark(defaultAddr.landmark || '');
          }
        })
        .catch(err => console.error('Address fetch error', err));
    }
  }, [isAuthenticated, token]);

  // Handle Saved Address Switch
  const handleAddressSelect = (addrId: string) => {
    setSelectedAddressId(addrId);
    if (addrId === 'new') {
      setStreetAddress('');
      setCity('');
      setState('');
      setPincode('');
      setLandmark('');
    } else {
      const match = savedAddresses.find(a => a.id === addrId);
      if (match) {
        setFullName(match.full_name);
        setPhone(match.phone);
        setStreetAddress(match.street_address);
        setCity(match.city);
        setState(match.state);
        setPincode(match.pincode);
        setLandmark(match.landmark || '');
      }
    }
  };

  // Indian Pincode Auto-Lookup (State & City)
  const handlePincodeChange = async (val: string) => {
    setPincode(val);
    if (val.trim().length === 6 && !isNaN(Number(val))) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const data = await res.json();
        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          setCity(po.District || po.Division || '');
          setState(po.State || '');
        }
      } catch {
        // Silent fallback
      }
    }
  };

  // Apply Promo Coupon
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponCode.trim().toUpperCase();
    if (code === 'RARE10') {
      setAppliedCoupon({ code: 'RARE10', discountPercent: 10 });
    } else if (code === 'SHARKTANK') {
      setAppliedCoupon({ code: 'SHARKTANK', discountPercent: 15 });
    } else {
      setCouponError('Invalid promo code. Try RARE10 or SHARKTANK');
    }
  };

  // Price Calculation
  const subtotal = cart.subtotal;
  let couponDiscount = 0;
  if (appliedCoupon) {
    couponDiscount = Math.round((subtotal * appliedCoupon.discountPercent) / 100);
  }

  const discountedSubtotal = Math.max(0, subtotal - couponDiscount);
  const shippingFee = discountedSubtotal >= 1499 ? 0 : 99;

  let paymentAdjustment = 0;
  if (paymentMethod === 'cod') {
    paymentAdjustment = 49;
  } else if (paymentMethod === 'razorpay') {
    // 5% instant discount for online prepaid
    paymentAdjustment = -Math.round(discountedSubtotal * 0.05);
  }

  const grandTotal = Math.max(0, discountedSubtotal + shippingFee + paymentAdjustment);

  // Submit Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);

    if (cart.items.length === 0) {
      setOrderError('Your shopping bag is empty.');
      return;
    }

    if (!fullName || !email || !phone || !streetAddress || !city || !state || !pincode) {
      setOrderError('Please fill in all required delivery fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const shippingAddressObj: Address = {
        id: selectedAddressId === 'new' ? 'addr_custom' : selectedAddressId,
        full_name: fullName.trim(),
        phone: phone.trim(),
        street_address: streetAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        landmark: landmark ? landmark.trim() : undefined
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          full_name: fullName.trim(),
          shipping_address: shippingAddressObj,
          items: cart.items.map(i => ({
            product_id: i.product_id,
            variant_id: i.variant_id,
            quantity: i.quantity,
            selected_size: i.selected_size,
            custom_measurements: i.custom_measurements
          })),
          payment_method: paymentMethod,
          coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
          session_id: localStorage.getItem('rareyou_session_id') || undefined
        })
      });

      const data = await res.json();
      if (data.success && data.order) {
        await refreshCart();
        navigate(`/order-success/${data.order.order_number}`);
      } else {
        setOrderError(data.error || 'Failed to place order. Please try again.');
      }
    } catch {
      setOrderError('Network error connecting to payment server. Please verify connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen pb-20">
      {/* Top Checkout Header */}
      <div className="bg-white border-b border-[#E8E5DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Back to Cart link */}
          <Link
            to="/cart"
            className="flex items-center gap-2 text-xs font-semibold text-[#4A5844] hover:text-[#C47D68] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>&lt; Return to Bag</span>
          </Link>

          <Link to="/" className="font-serif text-xl tracking-[0.2em] text-[#2C2A29]">
            RARE YOU
          </Link>

          <div className="flex items-center gap-1 text-[11px] font-medium text-[#716D68]">
            <Lock className="w-3.5 h-3.5 text-[#4A5844]" />
            <span className="hidden sm:inline">256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Form: Contact, Address, Payment (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            {orderError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{orderError}</span>
              </div>
            )}

            {/* Step 1: Contact Information */}
            <div className="bg-white p-6 rounded-xl border border-[#E8E5DF] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DF]">
                <h2 className="font-serif text-lg font-medium text-[#2C2A29] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#4A5844] text-white flex items-center justify-center text-xs font-bold">1</span>
                  <span>Contact Information</span>
                </h2>
                {!isAuthenticated && (
                  <span className="text-[11px] text-[#716D68]">
                    Already a member?{' '}
                    <Link to="/cart" className="text-[#4A5844] font-semibold underline">
                      Sign In
                    </Link>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[#2C2A29] font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pooja Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 border border-[#E8E5DF] rounded-lg focus:outline-none focus:border-[#4A5844] text-[#2C2A29]"
                  />
                </div>

                <div>
                  <label className="block text-[#2C2A29] font-medium mb-1">10-Digit Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9811234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 border border-[#E8E5DF] rounded-lg focus:outline-none focus:border-[#4A5844] text-[#2C2A29]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[#2C2A29] font-medium mb-1">Email Address (For Invoicing &amp; Tracking) *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. pooja@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 border border-[#E8E5DF] rounded-lg focus:outline-none focus:border-[#4A5844] text-[#2C2A29]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Destination */}
            <div className="bg-white p-6 rounded-xl border border-[#E8E5DF] shadow-xs space-y-4">
              <h2 className="font-serif text-lg font-medium text-[#2C2A29] flex items-center gap-2 pb-3 border-b border-[#E8E5DF]">
                <span className="w-6 h-6 rounded-full bg-[#4A5844] text-white flex items-center justify-center text-xs font-bold">2</span>
                <span>Delivery Address</span>
              </h2>

              {/* Saved Address Book Selector for Logged In User */}
              {savedAddresses.length > 0 && (
                <div className="space-y-2 pb-2">
                  <label className="block text-xs font-semibold text-[#2C2A29]">
                    Select From Saved Addresses:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {savedAddresses.map(addr => (
                      <div
                        key={addr.id}
                        onClick={() => handleAddressSelect(addr.id)}
                        className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                          selectedAddressId === addr.id
                            ? 'bg-[#FAF8F5] border-[#4A5844] ring-1 ring-[#4A5844]'
                            : 'bg-white border-[#E8E5DF] hover:border-gray-400'
                        }`}
                      >
                        <div className="font-semibold text-[#2C2A29] flex items-center justify-between">
                          <span>{addr.full_name}</span>
                          {addr.is_default === 1 && (
                            <span className="text-[9px] bg-[#4A5844] text-white px-1.5 py-0.2 rounded">Default</span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#716D68] line-clamp-1 mt-0.5">{addr.street_address}</p>
                        <p className="text-[11px] text-[#716D68]">{addr.city}, {addr.state} - {addr.pincode}</p>
                      </div>
                    ))}
                    <div
                      onClick={() => handleAddressSelect('new')}
                      className={`p-3 rounded-lg border text-xs cursor-pointer flex items-center justify-center font-medium ${
                        selectedAddressId === 'new'
                          ? 'bg-[#FAF8F5] border-[#4A5844] text-[#4A5844]'
                          : 'bg-white border-[#E8E5DF] text-[#716D68] hover:border-gray-400'
                      }`}
                    >
                      + Enter A Different Address
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[#2C2A29] font-medium mb-1">6-Digit Indian PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 121001"
                    value={pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    className="w-full p-2.5 border border-[#E8E5DF] rounded-lg focus:outline-none focus:border-[#4A5844] text-[#2C2A29]"
                  />
                </div>

                <div>
                  <label className="block text-[#2C2A29] font-medium mb-1">City / District *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Faridabad"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 border border-[#E8E5DF] rounded-lg focus:outline-none focus:border-[#4A5844] text-[#2C2A29]"
                  />
                </div>

                <div>
                  <label className="block text-[#2C2A29] font-medium mb-1">State *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Haryana"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-2.5 border border-[#E8E5DF] rounded-lg focus:outline-none focus:border-[#4A5844] text-[#2C2A29]"
                  />
                </div>

                <div>
                  <label className="block text-[#2C2A29] font-medium mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Near Metro Station / Park"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full p-2.5 border border-[#E8E5DF] rounded-lg focus:outline-none focus:border-[#4A5844] text-[#2C2A29]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[#2C2A29] font-medium mb-1">Street Address / House No. / Building *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Flat / Floor No., Wing, Apartment, Street name"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="w-full p-2.5 border border-[#E8E5DF] rounded-lg focus:outline-none focus:border-[#4A5844] text-[#2C2A29]"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method Selection */}
            <div className="bg-white p-6 rounded-xl border border-[#E8E5DF] shadow-xs space-y-4">
              <h2 className="font-serif text-lg font-medium text-[#2C2A29] flex items-center gap-2 pb-3 border-b border-[#E8E5DF]">
                <span className="w-6 h-6 rounded-full bg-[#4A5844] text-white flex items-center justify-center text-xs font-bold">3</span>
                <span>Payment Method</span>
              </h2>

              <div className="space-y-3">
                {/* Razorpay Online */}
                <label
                  className={`flex items-start justify-between p-4 rounded-xl border cursor-pointer transition-colors ${
                    paymentMethod === 'razorpay'
                      ? 'bg-[#FAF8F5] border-[#4A5844] ring-1 ring-[#4A5844]'
                      : 'bg-white border-[#E8E5DF]'
                  }`}
                >
                  <div className="flex gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="mt-1 accent-[#4A5844]"
                    />
                    <div>
                      <div className="flex items-center gap-2 font-semibold text-xs text-[#2C2A29]">
                        <CreditCard className="w-4 h-4 text-[#4A5844]" />
                        <span>Online Payment (UPI, Cards, NetBanking)</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                          5% Instant Discount
                        </span>
                      </div>
                      <p className="text-[11px] text-[#716D68] mt-0.5">
                        Instant confirmation. Google Pay, PhonePe, Paytm, Debit/Credit cards.
                      </p>
                    </div>
                  </div>
                </label>

                {/* COD */}
                <label
                  className={`flex items-start justify-between p-4 rounded-xl border cursor-pointer transition-colors ${
                    paymentMethod === 'cod'
                      ? 'bg-[#FAF8F5] border-[#4A5844] ring-1 ring-[#4A5844]'
                      : 'bg-white border-[#E8E5DF]'
                  }`}
                >
                  <div className="flex gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-1 accent-[#4A5844]"
                    />
                    <div>
                      <div className="flex items-center gap-2 font-semibold text-xs text-[#2C2A29]">
                        <Banknote className="w-4 h-4 text-[#C47D68]" />
                        <span>Cash on Delivery (COD)</span>
                        <span className="text-[10px] text-[#716D68]">+₹49 Handling fee</span>
                      </div>
                      <p className="text-[11px] text-[#716D68] mt-0.5">
                        Pay cash to the delivery executive when the parcel reaches your doorstep.
                      </p>
                    </div>
                  </div>
                </label>

                {/* WhatsApp Direct */}
                <label
                  className={`flex items-start justify-between p-4 rounded-xl border cursor-pointer transition-colors ${
                    paymentMethod === 'whatsapp'
                      ? 'bg-[#FAF8F5] border-[#4A5844] ring-1 ring-[#4A5844]'
                      : 'bg-white border-[#E8E5DF]'
                  }`}
                >
                  <div className="flex gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'whatsapp'}
                      onChange={() => setPaymentMethod('whatsapp')}
                      className="mt-1 accent-[#4A5844]"
                    />
                    <div>
                      <div className="flex items-center gap-2 font-semibold text-xs text-[#2C2A29]">
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                        <span>WhatsApp Direct Order</span>
                      </div>
                      <p className="text-[11px] text-[#716D68] mt-0.5">
                        Finalize order directly with our Faridabad studio coordinator on WhatsApp.
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Bottom Navigation & Submit Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <Link
                to="/cart"
                className="text-xs text-[#4A5844] hover:text-[#C47D68] font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Return to shopping bag
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-[#4A5844] hover:bg-[#374233] text-white px-8 py-3.5 rounded-lg text-xs font-semibold tracking-widest uppercase transition-colors shadow-md disabled:opacity-50"
              >
                {isSubmitting ? 'Securing Order...' : `Complete Order • ₹${grandTotal}`}
              </button>
            </div>
          </div>

          {/* Right Column: Order Summary (5 Columns) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-[#E8E5DF] shadow-xs space-y-6 lg:sticky lg:top-24">
            <h2 className="font-serif text-lg font-medium text-[#2C2A29] pb-3 border-b border-[#E8E5DF]">
              Order Summary ({cart.item_count})
            </h2>

            {/* Items list */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 divide-y divide-[#FAF8F5]">
              {cart.items.map(item => (
                <div key={item.id} className="flex gap-3 pt-3 first:pt-0">
                  <img
                    src={item.image || 'http://localhost:5000/images/dress_cookie_creme_1.jpg'}
                    alt={item.product_name}
                    className="w-14 h-16 object-cover rounded bg-[#FAF8F5] border border-[#E8E5DF]"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-xs text-[#2C2A29] line-clamp-1">{item.product_name}</h4>
                    <div className="text-[10px] text-[#716D68] flex gap-2 mt-0.5">
                      {item.selected_size && <span>Size: {item.selected_size}</span>}
                      {item.variant_title && !item.selected_size && <span>{item.variant_title}</span>}
                      <span>Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-semibold text-xs text-[#2C2A29]">
                    ₹{item.line_total}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Code Box */}
            <div className="pt-2 border-t border-[#E8E5DF]">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo Code (RARE10, SHARKTANK)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 text-xs p-2.5 border border-[#E8E5DF] rounded-lg focus:outline-none focus:border-[#4A5844] text-[#2C2A29] uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#E8E5DF] text-xs font-semibold px-4 rounded-lg text-[#2C2A29] transition-colors"
                >
                  Apply
                </button>
              </div>

              {couponError && (
                <p className="text-[11px] text-red-600 mt-1">{couponError}</p>
              )}

              {appliedCoupon && (
                <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1 font-semibold">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    Coupon '{appliedCoupon.code}' Applied ({appliedCoupon.discountPercent}% Off)
                  </span>
                  <button
                    type="button"
                    onClick={() => setAppliedCoupon(null)}
                    className="text-emerald-700 hover:underline text-[10px]"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-2 text-xs text-[#716D68] pt-2 border-t border-[#E8E5DF]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#2C2A29]">₹{subtotal}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-[#C47D68]">
                  <span>Promo Discount ({appliedCoupon?.code})</span>
                  <span>-₹{couponDiscount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Express Courier Shipping</span>
                <span>
                  {shippingFee === 0 ? (
                    <strong className="text-[#4A5844]">FREE</strong>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>

              {paymentAdjustment !== 0 && (
                <div className="flex justify-between">
                  <span>{paymentMethod === 'razorpay' ? 'Prepaid Instant Discount (5%)' : 'COD Handling Fee'}</span>
                  <span className={paymentAdjustment < 0 ? 'text-[#4A5844] font-semibold' : 'text-[#2C2A29]'}>
                    {paymentAdjustment < 0 ? `-₹${Math.abs(paymentAdjustment)}` : `+₹${paymentAdjustment}`}
                  </span>
                </div>
              )}

              <div className="flex justify-between pt-3 border-t border-[#E8E5DF] text-base font-bold text-[#2C2A29]">
                <span>Total Amount</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            {/* Trust Footer */}
            <div className="bg-[#FAF8F5] p-3.5 rounded-lg border border-[#E8E5DF] text-[11px] text-[#716D68] space-y-1">
              <p className="flex items-center gap-1.5 font-medium text-[#4A5844]">
                <ShieldCheck className="w-4 h-4 text-[#4A5844]" />
                <span>Damage-free transit replacement guarantee</span>
              </p>
              <p className="pl-5 text-[10px]">
                Please record an unboxing video upon parcel delivery for instant claim approval.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
