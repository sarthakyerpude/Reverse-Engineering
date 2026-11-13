import React, { useState, useEffect } from 'react';
import { Calculator, Percent, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

interface PnlResult {
  sellingPrice: number;
  manufacturingCost: number;
  marketplace: string;
  marketplaceCommission: number;
  packagingCost: number;
  forwardShipping: number;
  rtoLossAllocation: string;
  totalCost: string;
  netProfit: string;
  netMarginPercent: number;
}

export const PnlCalculatorPage: React.FC = () => {
  const [sellingPrice, setSellingPrice] = useState<number>(999);
  const [manufacturingCost, setManufacturingCost] = useState<number>(350);
  const [marketplace, setMarketplace] = useState<string>('FLIPKART');
  const [rtoPercent, setRtoPercent] = useState<number>(15);
  const [result, setResult] = useState<PnlResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const calculate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pnl/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sellingPrice: Number(sellingPrice),
          manufacturingCost: Number(manufacturingCost),
          marketplace,
          rtoPercent: Number(rtoPercent)
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculate();
  }, [sellingPrice, manufacturingCost, marketplace, rtoPercent]);

  const portals = [
    { id: 'MEESHO', name: 'Meesho', comm: '0% Comm', color: '#842A5C' },
    { id: 'FLIPKART', name: 'Flipkart', comm: '12% Comm', color: '#2874F0' },
    { id: 'AMAZON', name: 'Amazon', comm: '14% Comm', color: '#FF9900' },
    { id: 'MYNTRA', name: 'Myntra', comm: '18% Comm', color: '#FF3F6C' },
    { id: 'SNAPDEAL', name: 'Snapdeal', comm: '10% Comm', color: '#E40046' },
    { id: 'SMARTBIZ', name: 'SmartBiz', comm: '5% Comm', color: '#00A8E8' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-[#e2e8e5] rounded-xl p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#eef7f2] border border-[#cbe5d5] flex items-center justify-center text-[#143e32]">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#143e32]">Marketplace Net Margin & RTO Simulator</h1>
            <p className="text-xs text-[#657970] mt-1">
              Simulate real net payouts after marketplace commission, courier shipping fees, packaging, and reverse logistics return losses.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Inputs (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-[#e2e8e5] rounded-xl p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-[#143e32] border-b border-[#e2e8e5] pb-3">
            1. Pricing & Cost Inputs
          </h2>

          {/* Target Portal Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#243b32] mb-2">Target Marketplace</label>
            <div className="grid grid-cols-3 gap-2">
              {portals.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setMarketplace(p.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    marketplace === p.id
                      ? 'border-[#143e32] bg-[#f0f6f3] shadow-xs'
                      : 'border-[#e2e8e5] hover:border-gray-300'
                  }`}
                >
                  <div className="text-xs font-bold" style={{ color: p.color }}>{p.name}</div>
                  <div className="text-[10px] text-gray-500">{p.comm}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Selling Price */}
          <div>
            <label className="block text-xs font-semibold text-[#243b32] mb-1">
              Selling Price on Portal (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-semibold text-gray-400">₹</span>
              <input
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 text-sm font-semibold text-[#143e32] border border-[#cdd8d2] rounded-lg focus:outline-none focus:border-[#143e32]"
              />
            </div>
            <div className="text-[11px] text-gray-400 mt-1">Buyer invoice amount displayed on listing</div>
          </div>

          {/* Sourcing Price */}
          <div>
            <label className="block text-xs font-semibold text-[#243b32] mb-1">
              Product Cost / Sourcing Price (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-semibold text-gray-400">₹</span>
              <input
                type="number"
                value={manufacturingCost}
                onChange={(e) => setManufacturingCost(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 text-sm font-semibold text-[#143e32] border border-[#cdd8d2] rounded-lg focus:outline-none focus:border-[#143e32]"
              />
            </div>
            <div className="text-[11px] text-gray-400 mt-1">Fabric + Dyeing + Stitching + Label cost</div>
          </div>

          {/* RTO Return % Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-[#243b32]">Estimated Return / RTO Rate</label>
              <span className="text-xs font-bold text-[#143e32] font-mono">{rtoPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="1"
              value={rtoPercent}
              onChange={(e) => setRtoPercent(Number(e.target.value))}
              className="w-full accent-[#143e32] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>0% (Nil)</span>
              <span>15% (Typical Saree/Kurti)</span>
              <span>40% (High Risk)</span>
            </div>
          </div>

          <button
            type="button"
            onClick={calculate}
            disabled={loading}
            className="w-full py-2.5 bg-[#143e32] text-white rounded-lg text-xs font-semibold hover:bg-[#1a4f40] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Recalculate Net Margins</span>
          </button>
        </div>

        {/* Right Panel: Results & P&L Statement (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {result && (
            <>
              {/* Result KPI Header */}
              <div className={`p-6 rounded-xl border shadow-xs transition-all ${
                result.netMarginPercent >= 20
                  ? 'bg-[#f4f9f2] border-[#cae5c1]'
                  : result.netMarginPercent > 5
                  ? 'bg-[#fffbeb] border-[#fde68a]'
                  : 'bg-[#fef2f2] border-[#fecaca]'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Estimated Net Profit / Unit</div>
                    <div className="text-3xl font-black mt-1 flex items-baseline gap-1 text-[#143e32]">
                      <span>₹{result.netProfit}</span>
                      <span className="text-sm font-semibold text-gray-500">per delivered order</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Net Margin</div>
                    <div className={`text-2xl font-black mt-1 flex items-center justify-end gap-1 ${
                      result.netMarginPercent >= 20
                        ? 'text-emerald-700'
                        : result.netMarginPercent > 5
                        ? 'text-amber-700'
                        : 'text-red-700'
                    }`}>
                      <Percent className="w-5 h-5" />
                      <span>{result.netMarginPercent}%</span>
                    </div>
                  </div>
                </div>

                {/* Recommendation pill */}
                <div className="mt-4 pt-3 border-t border-black/10 flex items-center gap-2 text-xs">
                  {result.netMarginPercent >= 20 ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-emerald-800 font-medium">
                        <strong>Healthy Margin:</strong> This pricing provides sufficient buffer against return damage and advertising ad-spend.
                      </span>
                    </>
                  ) : result.netMarginPercent > 5 ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="text-amber-800 font-medium">
                        <strong>Moderate Risk:</strong> Margin is thin. Increasing price by ₹50-₹80 will safeguard against higher return rates.
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span className="text-red-800 font-medium">
                        <strong>Loss Alert:</strong> Negative or unviable margins. You will lose money on returns and courier damages at this price.
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Detailed Cost Waterfall Breakdown */}
              <div className="bg-white border border-[#e2e8e5] rounded-xl p-6 shadow-xs">
                <h3 className="text-sm font-bold text-[#143e32] border-b border-[#e2e8e5] pb-3 flex items-center justify-between">
                  <span>Unit Cost Breakdown Waterfall</span>
                  <span className="text-xs font-mono font-medium text-gray-500">{result.marketplace}</span>
                </h3>

                <div className="divide-y divide-gray-100 mt-3 text-xs">
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-[#243b32] font-semibold">1. Customer Selling Price (Gross Revenue)</span>
                    <span className="font-bold text-base text-[#143e32]">₹{result.sellingPrice}</span>
                  </div>

                  <div className="py-2.5 flex justify-between items-center text-gray-600">
                    <span className="pl-3">Less: Product Sourcing / Manufacturing Cost</span>
                    <span className="text-red-600 font-mono">− ₹{result.manufacturingCost}</span>
                  </div>

                  <div className="py-2.5 flex justify-between items-center text-gray-600">
                    <span className="pl-3">Less: Marketplace Commission & Fixed Closing Fee</span>
                    <span className="text-red-600 font-mono">− ₹{result.marketplaceCommission.toFixed(2)}</span>
                  </div>

                  <div className="py-2.5 flex justify-between items-center text-gray-600">
                    <span className="pl-3">Less: Forward Shipping & National Logistics (avg. 500g)</span>
                    <span className="text-red-600 font-mono">− ₹{result.forwardShipping}</span>
                  </div>

                  <div className="py-2.5 flex justify-between items-center text-gray-600">
                    <span className="pl-3">Less: Polybag & Corrugated Box Packaging Cost</span>
                    <span className="text-red-600 font-mono">− ₹{result.packagingCost}</span>
                  </div>

                  <div className="py-2.5 flex justify-between items-center text-gray-600">
                    <span className="pl-3">Less: Return & RTO Logistics Reserve ({rtoPercent}% return rate)</span>
                    <span className="text-red-600 font-mono">− ₹{result.rtoLossAllocation}</span>
                  </div>

                  <div className="py-3 flex justify-between items-center bg-[#f8faf8] px-3 rounded-lg font-bold text-xs text-[#143e32] mt-2">
                    <span>Total Fulfillment & Sourcing Costs</span>
                    <span>₹{result.totalCost}</span>
                  </div>

                  <div className="py-3 flex justify-between items-center bg-[#eff5e7] px-3 rounded-lg font-bold text-sm text-[#3b6329] mt-2">
                    <span>Net Cash in Bank / Profit</span>
                    <span>₹{result.netProfit} ({result.netMarginPercent}%)</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
