import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Package, AlertCircle } from 'lucide-react';
import type { OrderMilestone, Address, OrderItem } from '../types';

interface TrackResult {
  order_number: string;
  tracking_code: string;
  status: string;
  carrier: string;
  estimated_delivery: string;
  shipping_address: Address;
  items: OrderItem[];
  milestones: OrderMilestone[];
}

export const TrackOrderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryRef = searchParams.get('ref') || '';

  const [inputRef, setInputRef] = useState(queryRef);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = async (ref: string) => {
    if (!ref.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(ref.trim())}`);
      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        setResult(null);
        setError(data.error || 'No shipment found for this reference code.');
      }
    } catch {
      setError('Network error while querying shipment status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryRef) {
      fetchTracking(queryRef);
    }
  }, [queryRef]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(inputRef);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-10">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#4A5844]">
          LIVE SHIPMENT RADAR
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#2C2A29] font-light">
          Track Your Order
        </h1>
        <p className="text-xs text-[#716D68]">
          Enter your Rare You Order Number (e.g. <strong className="text-[#2C2A29]">RY-1001</strong>) or your BlueDart tracking waybill to view real-time artisan crafting and transit milestones.
        </p>
      </div>

      {/* Search Input Form */}
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white p-2 rounded-xl border border-[#E8E5DF] shadow-sm flex items-center gap-2">
        <Search className="w-5 h-5 text-[#716D68] ml-2" />
        <input
          type="text"
          required
          placeholder="e.g. RY-1001 or BLR-RY-123456"
          value={inputRef}
          onChange={(e) => setInputRef(e.target.value)}
          className="w-full text-xs sm:text-sm bg-transparent p-2 text-[#2C2A29] focus:outline-none uppercase"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#4A5844] hover:bg-[#374233] text-white text-xs font-semibold px-6 py-3 rounded-lg tracking-wider uppercase transition-colors shrink-0 disabled:opacity-50"
        >
          {loading ? 'Locating...' : 'Track'}
        </button>
      </form>

      {/* Error state */}
      {error && (
        <div className="max-w-xl mx-auto p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Tracking Result View */}
      {result && (
        <div className="bg-white rounded-2xl border border-[#E8E5DF] overflow-hidden shadow-xs divide-y divide-[#E8E5DF]">
          {/* Header Row */}
          <div className="p-6 bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-[#716D68] block text-[11px]">Order Number</span>
              <span className="font-bold text-[#2C2A29] text-base">{result.order_number}</span>
            </div>

            <div>
              <span className="text-[#716D68] block text-[11px]">Logistics Partner</span>
              <span className="font-semibold text-[#4A5844]">{result.carrier}</span>
            </div>

            <div>
              <span className="text-[#716D68] block text-[11px]">Tracking ID</span>
              <span className="font-mono text-[#2C2A29]">{result.tracking_code}</span>
            </div>

            <div>
              <span className="text-[#716D68] block text-[11px]">Estimated Doorstep Arrival</span>
              <span className="font-bold text-[#C47D68] text-sm">{result.estimated_delivery}</span>
            </div>
          </div>

          {/* 5-Stage Visual Stepper */}
          <div className="p-6 sm:p-10 space-y-6">
            <h3 className="font-semibold text-xs text-[#2C2A29] uppercase tracking-wider">
              Shipment Milestones
            </h3>

            <div className="relative pl-6 sm:pl-8 border-l-2 border-[#E8E5DF] space-y-8">
              {result.milestones.map((milestone) => (
                <div key={milestone.step} className="relative">
                  {/* Indicator Icon */}
                  <div
                    className={`absolute -left-[31px] sm:-left-[39px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      milestone.completed
                        ? 'bg-[#4A5844] text-white ring-4 ring-[#FAF8F5]'
                        : 'bg-white border-2 border-[#D8D3CA] text-[#716D68]'
                    }`}
                  >
                    {milestone.completed ? '✓' : milestone.step}
                  </div>

                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4
                        className={`text-xs sm:text-sm font-semibold ${
                          milestone.completed ? 'text-[#2C2A29]' : 'text-[#716D68]'
                        }`}
                      >
                        {milestone.title}
                      </h4>
                      {milestone.completed && (
                        <span className="text-[10px] text-[#716D68]">
                          {new Date(milestone.timestamp).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#716D68] mt-0.5">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Items Summary */}
          <div className="p-6 bg-[#FAF8F5] grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#716D68]">
            <div className="space-y-1.5">
              <span className="font-semibold text-[#2C2A29] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C47D68]" /> Delivery Destination:
              </span>
              <p className="font-medium text-[#2C2A29]">{result.shipping_address?.full_name}</p>
              <p>{result.shipping_address?.street_address}</p>
              <p>{result.shipping_address?.city}, {result.shipping_address?.state} - {result.shipping_address?.pincode}</p>
            </div>

            <div className="space-y-1.5">
              <span className="font-semibold text-[#2C2A29] flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#4A5844]" /> Items in Parcel ({result.items?.length}):
              </span>
              <div className="space-y-1">
                {result.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.quantity}x {item.product_name}</span>
                    <span className="font-semibold text-[#2C2A29]">₹{item.line_total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
