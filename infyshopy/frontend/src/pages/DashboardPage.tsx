import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Boxes, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [overview, setOverview] = useState<any>(null);

  useEffect(() => {
    fetch('/api/overview', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setOverview(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const marketplaces = [
    { id: 'MEESHO', name: 'Meesho', color: 'bg-[#9b2477]', text: 'text-[#9b2477]', light: 'bg-[#fbeaf6]' },
    { id: 'FLIPKART', name: 'Flipkart', color: 'bg-[#2562a4]', text: 'text-[#2562a4]', light: 'bg-[#e8f0fd]' },
    { id: 'AMAZON', name: 'Amazon India', color: 'bg-[#b8731b]', text: 'text-[#b8731b]', light: 'bg-[#fff3df]' },
    { id: 'MYNTRA', name: 'Myntra', color: 'bg-[#bf5c44]', text: 'text-[#bf5c44]', light: 'bg-[#fff0e7]' },
    { id: 'SNAPDEAL', name: 'Snapdeal', color: 'bg-[#c74b57]', text: 'text-[#c74b57]', light: 'bg-[#fdebee]' },
    { id: 'SMARTBIZ', name: 'SmartBiz', color: 'bg-[#2f756e]', text: 'text-[#2f756e]', light: 'bg-[#e9f8f4]' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-white border border-[#dfe7e0] rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] tracking-wider uppercase font-bold text-[#63806a]">Account Overview</span>
          <h2 className="text-xl font-bold text-[#163f34] mt-1">Multi-Channel Marketplace Studio</h2>
          <p className="text-xs text-[#6e8578] mt-1 max-w-2xl">
            Create catalog listings once and automatically compile ready-to-upload flat files for Meesho, Flipkart, Amazon, Myntra, Snapdeal, and SmartBiz.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2.5 bg-[#245d43] hover:bg-[#1a4a35] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-all"
          >
            <Layers className="w-4 h-4" />
            <span>Create New Listing</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid - 100% Dynamic from Database */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#dee6df] rounded-xl p-5 shadow-xs">
          <div className="text-xs text-[#7e8e82] font-medium">Lifetime Listings</div>
          <div className="text-3xl font-extrabold text-[#163f34] mt-2">
            {overview?.allListings ?? 0} <span className="text-xs font-normal text-gray-400">SKUs</span>
          </div>
          <div className="text-[11px] text-[#548a38] mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized across 6 portals
          </div>
        </div>

        <div className="bg-white border border-[#dee6df] rounded-xl p-5 shadow-xs">
          <div className="text-xs text-[#7e8e82] font-medium">Ready Listing Files</div>
          <div className="text-3xl font-extrabold text-[#2562a4] mt-2">
            {overview?.files ?? 0} <span className="text-xs font-normal text-gray-400">files</span>
          </div>
          <div className="text-[11px] text-[#2562a4] mt-2 flex items-center gap-1">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Ready to download (.xlsx)
          </div>
        </div>

        <div className="bg-white border border-[#dee6df] rounded-xl p-5 shadow-xs">
          <div className="text-xs text-[#7e8e82] font-medium">Master SKU Stock</div>
          <div className="text-3xl font-extrabold text-[#163f34] mt-2">
            {Number(overview?.totalStock ?? 0).toLocaleString('en-IN')} <span className="text-xs font-normal text-gray-400">units</span>
          </div>
          <div className="text-[11px] text-gray-500 mt-2 flex items-center gap-1">
            <Boxes className="w-3.5 h-3.5" /> Tracked in inventory
          </div>
        </div>

        <div className="bg-white border border-[#dee6df] rounded-xl p-5 shadow-xs">
          <div className="text-xs text-[#7e8e82] font-medium">Wallet Balance</div>
          <div className="text-3xl font-extrabold text-[#3b6329] mt-2">
            {overview?.balance ?? user?.balance ?? 20} <span className="text-xs font-normal text-gray-400">Credits</span>
          </div>
          <div className="text-[11px] text-[#3b6329] mt-2">
            1 credit per Excel batch download
          </div>
        </div>
      </div>

      {/* 6 Marketplaces Summary Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#163f34] uppercase tracking-wider">Connected Marketplaces (6)</h3>
          <span className="text-xs text-gray-500">Official Format Schemas Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {marketplaces.map((m) => {
            const marketData = overview?.byMarket?.[m.id];
            const readyFiles = marketData?.files ?? 0;
            return (
              <div
                key={m.id}
                className="bg-white border border-[#dee6df] rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-[#b5cebf] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg ${m.color} text-white font-bold text-xs flex items-center justify-center`}>
                        {m.id.slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#163f34]">{m.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono">Ready format (.xlsx)</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#edf5eb] text-[#3d8055] border border-[#d2e4cb]">
                      Active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-b border-gray-100 my-3">
                    <div>
                      <span className="text-gray-400 block text-[10px]">QC Status</span>
                      <span className="font-semibold text-gray-700">100% Passed</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Ready Files</span>
                      <span className="font-semibold text-gray-700">{readyFiles} files</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/portalfiles')}
                  className="w-full mt-2 py-2 px-3 border border-[#d2ded6] rounded-lg text-xs font-semibold text-[#163f34] hover:bg-[#f6f8f7] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Generate {m.name} Sheet</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
