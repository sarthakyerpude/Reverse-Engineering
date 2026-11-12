import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const { cart, isCartOpen, closeCart, updateQuantity, removeFromCart } = useCart();

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-slide-in">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-black stroke-[1.5]" />
              <h2 className="text-base font-normal text-[#121212]">
                Your Bag ({cart.item_count})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 text-gray-500 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Free Shipping Progress Meter */}
          <div className="bg-[#FAF8F5] px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2 text-xs font-normal text-[#121212] mb-1.5">
              <Truck className="w-4 h-4 text-gray-700" />
              {cart.is_free_shipping ? (
                <span className="text-emerald-700 font-medium">
                  🎉 Congratulations! You have unlocked <strong>FREE Express Shipping</strong>
                </span>
              ) : (
                <span>
                  Add <strong>Rs. {cart.free_shipping_remaining.toLocaleString('en-IN')}.00</strong> more for FREE Shipping
                </span>
              )}
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-black h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${cart.free_shipping_progress}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                  <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-normal text-[#121212] mb-1">Your bag is empty</h3>
                <p className="text-xs text-gray-500 max-w-xs mb-6">
                  Explore our handcrafted forever flowers, macrame swings, and artisanal accents.
                </p>
                <button
                  onClick={() => {
                    closeCart();
                    navigate('/collections/forever-flower');
                  }}
                  className="bg-black hover:bg-gray-800 text-white text-xs font-medium px-6 py-2.5 rounded-full tracking-wider uppercase transition-colors"
                >
                  Explore Forever Flowers
                </button>
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-white rounded-xl border border-gray-100 shadow-xs relative"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.image || '/images/prod-bumble-in-blue.png'}
                    alt={item.product_name}
                    className="w-20 h-20 object-cover rounded-lg bg-[#FAF8F5] shrink-0 border border-gray-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/prod-bumble-in-blue.png';
                    }}
                  />

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          to={`/products/${item.product_handle}`}
                          onClick={closeCart}
                          className="font-normal text-sm text-[#121212] hover:underline line-clamp-1"
                        >
                          {item.product_name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-600 p-1 -mt-1 -mr-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Variant & Sizing Pills */}
                      <div className="flex flex-wrap gap-1.5 mt-1 text-[11px] text-gray-500">
                        {item.selected_size && (
                          <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] text-gray-700">
                            Size: {item.selected_size}
                          </span>
                        )}
                        {item.variant_title && !item.selected_size && (
                          <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] text-gray-700">
                            {item.variant_title}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Stepper & Price */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-gray-300 rounded-full bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-0.5 hover:bg-gray-100 text-gray-600 transition-colors text-xs"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-medium text-[#121212]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-0.5 hover:bg-gray-100 text-gray-600 transition-colors text-xs"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-normal text-xs text-[#121212]">
                          Rs. {item.line_total.toLocaleString('en-IN')}.00
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cart.items.length > 0 && (
            <div className="p-4 sm:p-5 bg-white border-t border-gray-100 space-y-3">
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#121212]">
                    Rs. {cart.subtotal.toLocaleString('en-IN')}.00
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {cart.shipping_fee === 0 ? (
                      <strong className="text-emerald-700">FREE</strong>
                    ) : (
                      `Rs. ${cart.shipping_fee.toLocaleString('en-IN')}.00`
                    )}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100 text-sm font-semibold text-[#121212]">
                  <span>Total</span>
                  <span>Rs. {cart.total.toLocaleString('en-IN')}.00</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={handleCheckoutClick}
                  className="w-full bg-black hover:bg-gray-800 text-white py-3.5 rounded-full text-xs font-medium tracking-wide uppercase flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
                <div className="text-center">
                  <Link
                    to="/cart"
                    onClick={closeCart}
                    className="text-xs text-gray-500 hover:text-black underline font-normal"
                  >
                    View detailed bag &amp; add gift card note
                  </Link>
                </div>
              </div>

              <p className="text-[10px] text-center text-gray-400 pt-1">
                Taxes included. Handcrafted with love in Faridabad.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default CartDrawer;
