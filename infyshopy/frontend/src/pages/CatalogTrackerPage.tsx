import React from 'react';
import { FileText, CheckCircle2, Clock } from 'lucide-react';

export const CatalogTrackerPage: React.FC = () => {
  const markets = [
    { name: 'Meesho', batch: 'Active format', status: 'Synchronized', updated: 'Today' },
    { name: 'Flipkart', batch: 'Vertical format', status: 'Synchronized', updated: 'Today' },
    { name: 'Amazon India', batch: 'Flat file', status: 'Synchronized', updated: 'Today' },
    { name: 'Myntra', batch: 'Partner format', status: 'Synchronized', updated: 'Today' },
    { name: 'Snapdeal', batch: 'Bulk feed', status: 'Synchronized', updated: 'Today' },
    { name: 'SmartBiz', batch: 'Storefront', status: 'Synchronized', updated: 'Today' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white border border-[#dfe7e0] rounded-xl p-6 shadow-xs">
        <span className="text-[10px] uppercase font-bold text-[#657970] tracking-wider">Multi-Channel Sync</span>
        <h1 className="text-xl font-bold text-[#143e32] mt-0.5">Catalog Tracker</h1>
        <p className="text-xs text-[#657970] mt-1">
          Monitor listing status across all 6 connected e-commerce platforms in real time.
        </p>
      </div>

      <div className="bg-white border border-[#dee6df] rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 font-bold text-xs text-[#163f34] uppercase tracking-wider">
          Marketplace Sync Status
        </div>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#f9fbf9] border-b border-gray-200 text-[#55695d]">
              <th className="py-3 px-4 font-semibold">Portal</th>
              <th className="py-3 px-4 font-semibold">Listing Batch Template</th>
              <th className="py-3 px-4 font-semibold">Sync Status</th>
              <th className="py-3 px-4 font-semibold text-right">Last Verified</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {markets.map((m, i) => (
              <tr key={i} className="hover:bg-gray-50/50">
                <td className="py-3 px-4 font-bold text-[#143e32]">{m.name}</td>
                <td className="py-3 px-4 text-gray-600">{m.batch}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#edf5eb] text-[#3d8055] border border-[#d2e4cb] inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {m.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-gray-500">{m.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

