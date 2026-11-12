import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Truck, Package, MapPin } from 'lucide-react';
import type { Order } from '../types';

export const OrderSuccessPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderNumber}`);
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error('Fetch order error', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-[#4A5844] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-[#716D68]">Retrieving order confirmation...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-8">
      {/* Success Badge */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-[#E8E5DF] text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#4A5844] block">
          ORDER CONFIRMED &amp; SCHEDULED
        </span>

        <h1 className="font-serif text-2xl sm:text-4xl text-[#2C2A29] font-light">
          Thank you for choosing handmade!
        </h1>

        <p className="text-xs sm:text-sm text-[#716D68] max-w-lg mx-auto leading-relaxed">
          Your order <strong className="text-[#2C2A29] font-bold">#{orderNumber}</strong> has been logged in our studio database. Our master women artisans in Faridabad are preparing your pieces with mindful care.
        </p>

        <div className="pt-4 flex flex-wrap justify-center gap-3">
          <Link
            to={`/track?ref=${orderNumber}`}
            className="bg-[#4A5844] hover:bg-[#374233] text-white px-6 py-3 rounded-lg text-xs font-semibold tracking-wider uppercase flex items-center gap-2 shadow-xs transition-colors"
          >
            <Truck className="w-4 h-4" /> Track Live Shipment
          </Link>
          <Link
            to="/collections"
            className="bg-[#FAF8F5] hover:bg-[#EFECE6] text-[#2C2A29] border border-[#E8E5DF] px-6 py-3 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors"
          >
            Continue Exploring
          </Link>
        </div>
      </div>

      {/* Order Details & Summary Card */}
      {order && (
        <div className="bg-white rounded-2xl border border-[#E8E5DF] overflow-hidden shadow-xs divide-y divide-[#E8E5DF]">
          {/* Header Row */}
          <div className="p-6 bg-[#FAF8F5] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[#716D68] block">Order Reference:</span>
              <span className="font-bold text-[#2C2A29] text-sm">{order.order_number}</span>
            </div>
            <div>
              <span className="text-[#716D68] block">Date Placed:</span>
              <span className="font-medium text-[#2C2A29]">
                {new Date(order.created_at).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div>
              <span className="text-[#716D68] block">Total Amount:</span>
              <span className="font-bold text-[#2C2A29] text-sm">₹{order.total}</span>
            </div>
          </div>

          {/* Delivery & Payment Columns */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-[#716D68]">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-[#2C2A29]">
                <MapPin className="w-4 h-4 text-[#C47D68]" />
                <span>Delivery Destination</span>
              </div>
              <p className="font-medium text-[#2C2A29]">{order.shipping_address?.full_name}</p>
              <p>{order.shipping_address?.street_address}</p>
              <p>{order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}</p>
              <p>Phone: {order.shipping_address?.phone}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-[#2C2A29]">
                <Package className="w-4 h-4 text-[#4A5844]" />
                <span>Payment &amp; Courier</span>
              </div>
              <p>
                Payment Method:{' '}
                <strong className="text-[#2C2A29] uppercase">{order.payment_method}</strong> ({order.payment_status})
              </p>
              <p>
                Waybill Tracking:{' '}
                <strong className="text-[#4A5844]">{order.tracking_code}</strong>
              </p>
              <p className="text-[11px] text-[#716D68]">
                Dispatches from Faridabad Central Hub within 24-48 business hours.
              </p>
            </div>
          </div>

          {/* Items breakdown */}
          <div className="p-6 space-y-4">
            <h3 className="font-semibold text-xs text-[#2C2A29] uppercase tracking-wider">
              Ordered Creations ({order.items.length})
            </h3>
            <div className="divide-y divide-[#FAF8F5]">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs first:pt-0">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image || 'http://localhost:5000/images/dress_cookie_creme_1.jpg'}
                      alt={item.product_name}
                      className="w-12 h-14 object-cover rounded bg-[#FAF8F5] border border-[#E8E5DF]"
                    />
                    <div>
                      <h4 className="font-medium text-[#2C2A29]">{item.product_name}</h4>
                      <div className="text-[11px] text-[#716D68] flex gap-2">
                        {item.selected_size && <span>Size: {item.selected_size}</span>}
                        {item.variant_title && !item.selected_size && <span>{item.variant_title}</span>}
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                  </div>
                  <span className="font-semibold text-[#2C2A29]">₹{item.line_total}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
