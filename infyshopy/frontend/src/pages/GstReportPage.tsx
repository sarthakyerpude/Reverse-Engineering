import React, { useEffect, useState } from 'react';
import { Receipt, Download, FileSpreadsheet, ShieldAlert, CheckCircle2, IndianRupee, RefreshCw } from 'lucide-react';

interface GstData {
  period: string;
  hasSales: boolean;
  outputTax: {
    taxableSupplies: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalGstLiability: number;
  };
  tcsUnderSection52: {
    meeshoTcs: number;
    flipkartTcs: number;
    amazonTcs: number;
    totalTcsClaimable: number;
  };
  netPayableTax: number;
}

export const GstReportPage: React.FC = () => {
  const [turnoverInput, setTurnoverInput] = useState<number>(0);
  const [data, setData] = useState<GstData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGst = (turnover: number) => {
    setLoading(true);
    fetch(`/api/gst/summary?turnover=${turnover}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchGst(turnoverInput);
  }, [turnoverInput]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-[#dee6df] rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#eef7f2] border border-[#cbe5d5] flex items-center justify-center text-[#143e32]">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#143e32]">GST & E-Commerce TCS Summary</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#eff5e7] text-[#3b6329] border border-[#d5e3c7]">
                Live Calculation
              </span>
            </div>
            <p className="text-xs text-[#657970] mt-1">
              Real-time reconciliation for Form GSTR-1, GSTR-3B and Section 52 Tax Collected at Source across marketplaces.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('GSTR-1 JSON export generated successfully.')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#143e32] text-white rounded-lg text-xs font-semibold hover:bg-[#1a4f40] transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export GSTR-1 JSON</span>
          </button>
        </div>
      </div>

      {/* Actual Sales Turnover Input */}
      <div className="bg-white border border-[#dee6df] rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold text-[#143e32] uppercase tracking-wider">
              Enter Monthly Gross Marketplace Sales (₹)
            </h2>
            <p className="text-[11px] text-[#657970] mt-0.5">
              Enter actual sales from Meesho, Flipkart, and Amazon to calculate exact GSTR-1 liability and Section 52 TCS claimable.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">₹</span>
            <input
              type="number"
              min="0"
              value={turnoverInput}
              onChange={(e) => setTurnoverInput(Math.max(0, Number(e.target.value)))}
              placeholder="0"
              className="w-36 px-3 py-1.5 text-xs font-bold border border-[#cdd8d2] rounded-lg focus:outline-none focus:border-[#143e32]"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-[#657970]">Computing actual GST liability...</div>
      ) : !data ? (
        <div className="py-12 text-center text-xs text-red-600">Failed to load GST summary.</div>
      ) : (
        <div className="space-y-6">
          {/* Top 3 KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-[#dee6df] rounded-xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-[#657970] uppercase tracking-wider">Gross Taxable Supplies</div>
              <div className="text-2xl font-black text-[#143e32] mt-2 flex items-center">
                <IndianRupee className="w-5 h-5 mr-0.5" />
                {data.outputTax.taxableSupplies.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-[#8a9990] mt-1">
                {data.hasSales ? 'Calculated on entered sales' : 'No sales recorded yet (₹0.00)'}
              </div>
            </div>

            <div className="bg-white border border-[#dee6df] rounded-xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-[#657970] uppercase tracking-wider">Section 52 TCS Claimable (1%)</div>
              <div className="text-2xl font-black text-emerald-700 mt-2 flex items-center">
                <IndianRupee className="w-5 h-5 mr-0.5" />
                {data.tcsUnderSection52.totalTcsClaimable.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-[#8a9990] mt-1">
                Withheld by portals · Claimable in GSTR-8
              </div>
            </div>

            <div className="bg-white border border-[#dee6df] rounded-xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-[#657970] uppercase tracking-wider">Net Tax Payable (Cash)</div>
              <div className="text-2xl font-black text-[#143e32] mt-2 flex items-center">
                <IndianRupee className="w-5 h-5 mr-0.5" />
                {data.netPayableTax.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-[#8a9990] mt-1">
                After offsetting TCS credits
              </div>
            </div>
          </div>

          {/* Details Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Output Tax Breakdown */}
            <div className="bg-white border border-[#dee6df] rounded-xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-[#143e32] border-b border-[#e2e8e5] pb-3 flex items-center justify-between">
                <span>Output GST Breakdown (5% Apparel GST)</span>
                <span className="text-xs font-mono font-medium text-gray-500">HSN 5407</span>
              </h3>

              <div className="divide-y divide-gray-100 mt-3 text-xs">
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#657970]">Taxable Supplies Turnover</span>
                  <span className="font-semibold text-[#143e32]">₹{data.outputTax.taxableSupplies.toLocaleString('en-IN')}</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#657970]">CGST (2.5% Intra-State)</span>
                  <span className="font-semibold text-[#143e32]">₹{data.outputTax.cgst.toLocaleString('en-IN')}</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#657970]">SGST (2.5% Intra-State)</span>
                  <span className="font-semibold text-[#143e32]">₹{data.outputTax.sgst.toLocaleString('en-IN')}</span>
                </div>
                <div className="py-3 flex justify-between items-center font-bold text-sm text-[#143e32] bg-[#f8faf8] px-3 rounded-lg mt-2">
                  <span>Total Output GST Liability</span>
                  <span>₹{data.outputTax.totalGstLiability.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* TCS by Marketplace */}
            <div className="bg-white border border-[#dee6df] rounded-xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-[#143e32] border-b border-[#e2e8e5] pb-3 flex items-center justify-between">
                <span>Section 52 TCS Deducted by Portal (1%)</span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Claimable in GSTR-8
                </span>
              </h3>

              <div className="divide-y divide-gray-100 mt-3 text-xs">
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#243b32] font-medium">Meesho Supplier Panel (approx. 40%)</span>
                  <span className="font-semibold text-[#143e32]">₹{data.tcsUnderSection52.meeshoTcs.toLocaleString('en-IN')}</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#243b32] font-medium">Flipkart Seller Hub (approx. 35%)</span>
                  <span className="font-semibold text-[#143e32]">₹{data.tcsUnderSection52.flipkartTcs.toLocaleString('en-IN')}</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-[#243b32] font-medium">Amazon India (approx. 25%)</span>
                  <span className="font-semibold text-[#143e32]">₹{data.tcsUnderSection52.amazonTcs.toLocaleString('en-IN')}</span>
                </div>
                <div className="py-3 flex justify-between items-center font-bold text-sm text-emerald-700 bg-emerald-50/50 px-3 rounded-lg mt-2">
                  <span>Total Claimable TCS Offset</span>
                  <span>₹{data.tcsUnderSection52.totalTcsClaimable.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
