import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, ArrowRight, Trash2, Plus, Minus, Truck, Gift } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart } = useCart();
  const [giftNote, setGiftNote] = useState('');

  if (cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-[#EFECE6] flex items-center justify-center text-[#716D68] mx-auto mb-4">
          <ShoppingBag className="w-10 h-10 opacity-50" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl text-[#2C2A29]">Your Bag is Empty</h1>
        <p className="text-xs text-[#716D68] max-w-sm mx-auto">
          You have not added any artisanal pieces yet. Discover our handcrafted apparel, nursery swings, and permanent blooms.
        </p>
        <Link
          to="/collections"
          className="inline-flex items-center gap-2 bg-[#4A5844] hover:bg-[#374233] text-white text-xs font-semibold px-8 py-3.5 rounded tracking-widest uppercase transition-colors shadow-sm"
        >
          Explore Collections <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E5DF]">
        <div>
          <h1 className="font-serif text-2xl sm:text-4xl text-[#2C2A29] font-light">
            Your Shopping Bag
          </h1>
          <p className="text-xs text-[#716D68] mt-1">
            {cart.item_count} handcrafted items reserved
          </p>
        </div>

        <Link
          to="/collections"
          className="inline-flex items-center gap-1.5 text-xs text-[#4A5844] hover:text-[#C47D68] font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Continue Exploring
        </Link>
      </div>

      {/* Free Shipping Alert Bar */}
      <div className="bg-[#EFECE6] p-4 rounded-xl border border-[#E8E5DF] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-xs text-[#4A5844]">
          <Truck className="w-5 h-5 text-[#C47D68]" />
          {cart.is_free_shipping ? (
            <span>
              <strong>Free Express Shipping Unlocked!</strong> You saved ₹99 on courier delivery.
            </span>
          ) : (
            <span>
              Add <strong>₹{cart.free_shipping_remaining}</strong> more to your bag to enjoy <strong>Free Express Shipping</strong>!
            </span>
          )}
        </div>
        <div className="w-full sm:w-48 bg-[#D8D3CA] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#4A5844] h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${cart.free_shipping_progress}%` }}
          />
        </div>
      </div>

      {/* Main Bag Table & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-[#E8E5DF] overflow-hidden divide-y divide-[#E8E5DF]">
            {cart.items.map((item) => (
              <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={item.image || 'http://localhost:5000/images/dress_cookie_creme_1.jpg'}
                    alt={item.product_name}
                    className="w-20 h-24 object-cover rounded-lg border border-[#E8E5DF] bg-[#FAF8F5]"
                  />
                  <div className="space-y-1">
                    <Link
                      to={`/product/${item.product_handle}`}
                      className="font-medium text-xs sm:text-sm text-[#2C2A29] hover:text-[#C47D68] transition-colors"
                    >
                      {item.product_name}
                    </Link>
                    <div className="flex flex-wrap gap-2 text-[11px] text-[#716D68]">
                      {item.selected_size && (
                        <span className="bg-[#FAF8F5] border border-[#E8E5DF] px-2 py-0.5 rounded text-[#4A5844] font-medium">
                          Size: {item.selected_size}
                        </span>
                      )}
                      {item.variant_title && !item.selected_size && (
                        <span className="bg-[#FAF8F5] border border-[#E8E5DF] px-2 py-0.5 rounded">
                          {item.variant_title}
                        </span>
                      )}
                      {item.custom_measurements && (
                        <span className="bg-[#C47D68]/10 text-[#C47D68] border border-[#C47D68]/30 px-2 py-0.5 rounded font-medium">
                          Custom Fit: {item.custom_measurements}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#716D68]">
                      ₹{item.unit_price} each
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6 pt-2 sm:pt-0 border-t sm:border-0 border-[#FAF8F5]">
                  {/* Stepper */}
                  <div className="flex items-center border border-[#E8E5DF] rounded-lg bg-[#FAF8F5]">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 hover:bg-[#EFECE6] text-[#716D68]"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-[#2C2A29]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 hover:bg-[#EFECE6] text-[#716D68]"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="font-semibold text-sm text-[#2C2A29] min-w-16 text-right">
                    ₹{item.line_total}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-[#716D68] hover:text-red-500 p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Gift Message Input */}
          <div className="bg-white p-5 rounded-xl border border-[#E8E5DF] space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#2C2A29]">
              <Gift className="w-4 h-4 text-[#C47D68]" />
              <span>Complimentary Handwritten Gift Note / Artisan Instructions</span>
            </div>
            <textarea
              rows={2}
              placeholder="e.g. Wishing you a very Happy Birthday! Please wrap with extra golden ribbon."
              value={giftNote}
              onChange={(e) => setGiftNote(e.target.value)}
              className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#E8E5DF] rounded-lg focus:outline-none focus:border-[#4A5844] text-[#2C2A29]"
            />
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-white p-6 rounded-xl border border-[#E8E5DF] shadow-xs space-y-6">
          <h2 className="font-serif text-lg text-[#2C2A29] pb-3 border-b border-[#E8E5DF]">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs text-[#716D68]">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-semibold text-[#2C2A29]">₹{cart.subtotal}</span>
            </div>

            <div className="flex justify-between">
              <span>Express Delivery</span>
              <span>
                {cart.shipping_fee === 0 ? (
                  <strong className="text-[#4A5844]">FREE</strong>
                ) : (
                  `₹${cart.shipping_fee}`
                )}
              </span>
            </div>

            <div className="flex justify-between pt-3 border-t border-[#E8E5DF] text-base font-bold text-[#2C2A29]">
              <span>Estimated Total</span>
              <span>₹{cart.total}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-[#4A5844] hover:bg-[#374233] text-white py-3.5 rounded-lg text-xs font-semibold tracking-widest uppercase flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-[11px] text-[#716D68] space-y-1.5 pt-2 text-center">
            <p>✓ All payments encrypted with 256-bit SSL</p>
            <p>✓ UPI, Cards, NetBanking &amp; Cash on Delivery accepted</p>
          </div>
        </div>
      </div>
    </div>
  );
};
