import React, { useState, useEffect } from 'react';
import { TrendingUp, FileText, Upload, Plus, Download, AlertCircle, CheckCircle2, IndianRupee } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ExpenseItem {
  id: string;
  category: string;
  description: string;
  amount: number;
}

export const ProfitLossPage: React.FC = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState<string>(new Date().toISOString().slice(0, 7)); // e.g. "2026-11"
  const [gstin, setGstin] = useState<string>('24AABCU9603R1ZM');
  const [grossSales, setGrossSales] = useState<number>(0);
  const [returnsValue, setReturnsValue] = useState<number>(0);
  const [cogs, setCogs] = useState<number>(0);
  const [portalFees, setPortalFees] = useState<number>(0);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [newExpCategory, setNewExpCategory] = useState<string>('Packaging');
  const [newExpDesc, setNewExpDesc] = useState<string>('');
  const [newExpAmount, setNewExpAmount] = useState<number>(0);
  const [showAddExpense, setShowAddExpense] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<string>('');

  // Calculations
  const netRevenue = Math.max(0, grossSales - returnsValue);
  const totalShopExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalCosts = cogs + portalFees + totalShopExpenses;
  const netProfit = netRevenue - totalCosts;
  const netMarginPercent = netRevenue > 0 ? ((netProfit / netRevenue) * 100).toFixed(1) : '0.0';

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExpAmount <= 0) return;
    const item: ExpenseItem = {
      id: Date.now().toString(),
      category: newExpCategory,
      description: newExpDesc || newExpCategory,
      amount: newExpAmount
    };
    setExpenses([...expenses, item]);
    setNewExpDesc('');
    setNewExpAmount(0);
    setShowAddExpense(false);
  };

  const handleRemoveExpense = (id: string) => {
    setExpenses(expenses.filter(x => x.id !== id));
  };

  const handleSave = () => {
    setSavedNotice(`✓ Profit & Loss statement for ${period} saved successfully.`);
    setTimeout(() => setSavedNotice(''), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-[#dee6df] rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#eef7f2] border border-[#cbe5d5] flex items-center justify-center text-[#143e32]">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#657970]">SKU Profitability</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#eff5e7] text-[#3b6329] border border-[#d5e3c7]">
                Live Statement
              </span>
            </div>
            <h1 className="text-xl font-bold text-[#143e32] mt-0.5">Profit & Loss Statement</h1>
            <p className="text-xs text-[#657970] mt-1">
              Portal sales, returns & settlements combined with your actual product costs and separate shop expenses.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-[#143e32] hover:bg-[#1a4f40] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Save P&L Statement
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3 bg-[#edf5eb] border border-[#d2e4cb] rounded-lg text-xs font-semibold text-[#3d8055] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Filter / Period Controls */}
      <div className="bg-white border border-[#dee6df] rounded-xl p-5 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Report Month</label>
          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono font-bold text-[#143e32]"
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">GST Account</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-800">
            <option>{user?.email || 'Primary Account'} (INFY-773)</option>
            <option>Secondary Brand Account</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">GSTIN</label>
          <input
            type="text"
            maxLength={15}
            value={gstin}
            onChange={(e) => setGstin(e.target.value.toUpperCase())}
            placeholder="15-character GSTIN"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-800 uppercase"
          />
        </div>
      </div>

      {/* Main Statement & Input Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-[#dee6df] rounded-xl p-6 shadow-xs space-y-5">
          <h2 className="text-xs font-bold text-[#143e32] uppercase tracking-wider border-b border-gray-100 pb-3">
            Real Sales & Cost Entries
          </h2>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Gross Portal Sales Dispatched (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-semibold text-gray-400">₹</span>
              <input
                type="number"
                min="0"
                value={grossSales}
                onChange={(e) => setGrossSales(Math.max(0, Number(e.target.value)))}
                placeholder="0"
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#143e32]"
              />
            </div>
            <div className="text-[10px] text-gray-400 mt-1">Total invoice value across Meesho, Flipkart & Amazon</div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Customer Returns & RTO Cancellations (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-semibold text-gray-400">₹</span>
              <input
                type="number"
                min="0"
                value={returnsValue}
                onChange={(e) => setReturnsValue(Math.max(0, Number(e.target.value)))}
                placeholder="0"
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#143e32]"
              />
            </div>
            <div className="text-[10px] text-gray-400 mt-1">Returned order value deducted from settlement</div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Cost of Goods Sold / Product Sourcing (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-semibold text-gray-400">₹</span>
              <input
                type="number"
                min="0"
                value={cogs}
                onChange={(e) => setCogs(Math.max(0, Number(e.target.value)))}
                placeholder="0"
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#143e32]"
              />
            </div>
            <div className="text-[10px] text-gray-400 mt-1">Direct manufacturing/fabric/dyeing cost of dispatched items</div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Marketplace Deductions & Fees (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-semibold text-gray-400">₹</span>
              <input
                type="number"
                min="0"
                value={portalFees}
                onChange={(e) => setPortalFees(Math.max(0, Number(e.target.value)))}
                placeholder="0"
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#143e32]"
              />
            </div>
            <div className="text-[10px] text-gray-400 mt-1">Commissions, shipping fees, reverse shipping & closing charges</div>
          </div>

          {/* Shop Expenses Section */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Separate Shop Expenses</label>
              <button
                type="button"
                onClick={() => setShowAddExpense(!showAddExpense)}
                className="text-[11px] font-bold text-[#143e32] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Expense</span>
              </button>
            </div>

            {showAddExpense && (
              <form onSubmit={handleAddExpense} className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2 mb-3">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newExpCategory}
                    onChange={(e) => setNewExpCategory(e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 rounded text-xs bg-white"
                  >
                    <option value="Packaging">Packaging Boxes/Bags</option>
                    <option value="Electricity">Electricity / Shop Power</option>
                    <option value="Salaries">Worker Salaries</option>
                    <option value="Rent">Shop / Warehouse Rent</option>
                    <option value="Advertising">Catalog Ad Spend</option>
                    <option value="Other">Other Expenses</option>
                  </select>
                  <input
                    type="number"
                    min="1"
                    placeholder="Amount (₹)"
                    value={newExpAmount || ''}
                    onChange={(e) => setNewExpAmount(Number(e.target.value))}
                    className="px-2 py-1.5 border border-gray-300 rounded text-xs bg-white"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Notes / description (optional)"
                  value={newExpDesc}
                  onChange={(e) => setNewExpDesc(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddExpense(false)}
                    className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-[#143e32] text-white text-xs font-semibold rounded"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}

            {expenses.length === 0 ? (
              <div className="p-3 bg-gray-50 rounded-lg text-center text-xs text-gray-400">
                No extra shop expenses added for this month.
              </div>
            ) : (
              <div className="space-y-1.5">
                {expenses.map((exp) => (
                  <div key={exp.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                    <div>
                      <span className="font-semibold text-gray-800">{exp.category}</span>
                      {exp.description && <span className="text-gray-500 text-[11px] ml-1">({exp.description})</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-gray-800">₹{exp.amount.toLocaleString('en-IN')}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExpense(exp.id)}
                        className="text-red-500 hover:text-red-700 text-xs px-1"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between text-xs font-bold text-gray-700 pt-1 px-1">
                  <span>Total Shop Expenses:</span>
                  <span>₹{totalShopExpenses.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right P&L Statement (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Summary KPI Card */}
          <div className={`p-6 rounded-xl border shadow-xs transition-all ${
            grossSales === 0
              ? 'bg-[#f9fbf9] border-[#dbe6dc]'
              : netProfit >= 0
              ? 'bg-[#f4f9f2] border-[#cae5c1]'
              : 'bg-[#fef2f2] border-[#fecaca]'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Net Realized Profit / Loss
                </div>
                <div className={`text-3xl font-black mt-1 flex items-baseline gap-1 ${
                  grossSales === 0 ? 'text-gray-400' : netProfit >= 0 ? 'text-[#143e32]' : 'text-red-600'
                }`}>
                  <span>{netProfit < 0 ? '− ₹' : '₹'}{Math.abs(netProfit).toLocaleString('en-IN')}</span>
                  <span className="text-xs font-normal text-gray-500">for {period}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Margin</div>
                <div className={`text-2xl font-black mt-1 ${
                  grossSales === 0 ? 'text-gray-400' : Number(netMarginPercent) >= 15 ? 'text-emerald-700' : Number(netMarginPercent) > 0 ? 'text-amber-700' : 'text-red-600'
                }`}>
                  {netMarginPercent}%
                </div>
              </div>
            </div>

            {grossSales === 0 ? (
              <div className="mt-4 pt-3 border-t border-black/5 text-xs text-gray-500">
                Enter your monthly marketplace sales and product sourcing costs to calculate your actual realized profit.
              </div>
            ) : (
              <div className="mt-4 pt-3 border-t border-black/10 flex items-center gap-2 text-xs">
                {netProfit >= 0 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-emerald-800 font-medium">
                      <strong>Profitable Month:</strong> Net in-hand payout after product manufacturing and all portal deductions.
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span className="text-red-800 font-medium">
                      <strong>Net Loss Detected:</strong> Marketplace deductions, return losses, and shop expenses exceed realized revenue.
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Itemized P&L Waterfall Table */}
          <div className="bg-white border border-[#dee6df] rounded-xl p-6 shadow-xs">
            <h3 className="text-xs font-bold text-[#143e32] uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center justify-between">
              <span>Financial Statement Waterfall ({period})</span>
              <span className="text-[11px] font-mono text-gray-500">{gstin}</span>
            </h3>

            <div className="divide-y divide-gray-100 text-xs mt-3">
              <div className="py-2.5 flex justify-between items-center">
                <span className="font-semibold text-gray-800">1. Gross Marketplace Dispatches (Revenue)</span>
                <span className="font-mono font-bold text-gray-900">₹{grossSales.toLocaleString('en-IN')}</span>
              </div>

              <div className="py-2.5 flex justify-between items-center text-gray-600">
                <span className="pl-3">Less: Returns & Customer RTO Losses</span>
                <span className="font-mono text-red-600">− ₹{returnsValue.toLocaleString('en-IN')}</span>
              </div>

              <div className="py-2.5 flex justify-between items-center bg-[#f8faf8] px-3 rounded font-semibold text-[#143e32]">
                <span>Net Recognized Portal Revenue</span>
                <span className="font-mono">₹{netRevenue.toLocaleString('en-IN')}</span>
              </div>

              <div className="py-2.5 flex justify-between items-center text-gray-600">
                <span className="pl-3">Less: Cost of Goods Sold (Fabric + Stitching + Dyeing)</span>
                <span className="font-mono text-red-600">− ₹{cogs.toLocaleString('en-IN')}</span>
              </div>

              <div className="py-2.5 flex justify-between items-center text-gray-600">
                <span className="pl-3">Less: Marketplace Commission & Shipping Deductions</span>
                <span className="font-mono text-red-600">− ₹{portalFees.toLocaleString('en-IN')}</span>
              </div>

              <div className="py-2.5 flex justify-between items-center text-gray-600">
                <span className="pl-3">Less: Operating Shop Expenses ({expenses.length} items)</span>
                <span className="font-mono text-red-600">− ₹{totalShopExpenses.toLocaleString('en-IN')}</span>
              </div>

              <div className={`py-3 flex justify-between items-center px-3 rounded-lg font-bold text-sm mt-2 ${
                netProfit >= 0 ? 'bg-[#eff5e7] text-[#3b6329]' : 'bg-[#fef2f2] text-red-700'
              }`}>
                <span>Net Bottom-Line Profit / (Loss)</span>
                <span className="font-mono">
                  {netProfit < 0 ? '− ₹' : '₹'}{Math.abs(netProfit).toLocaleString('en-IN')} ({netMarginPercent}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

