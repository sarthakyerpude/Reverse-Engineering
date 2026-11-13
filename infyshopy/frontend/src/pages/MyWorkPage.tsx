import React from 'react';
import { CheckSquare, Clock, AlertTriangle, FileSpreadsheet, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MyWorkPage: React.FC = () => {
  const navigate = useNavigate();

  const todayTasks = [
    { sku: 'INFY-SKU-7730', category: 'Saree', title: 'Banarasi Pure Silk Saree', status: 'Completed', qc: '100% Passed', time: '10:45 AM' },
    { sku: 'INFY-SKU-8842', category: 'Kurti', title: 'Anarkali Cotton Printed Kurti', status: 'In Review', qc: 'Image Angle 3 Pending', time: '11:30 AM' },
    { sku: 'INFY-SKU-9901', category: 'Saree', title: 'Kanjivaram Silk Wedding Saree', status: 'Drafting', qc: 'Pricing Matrix Needed', time: '01:15 PM' },
    { sku: 'INFY-SKU-6621', category: 'Saree', title: 'Chiffon Lightweight Party Saree', status: 'Completed', qc: '100% Passed', time: '03:20 PM' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-[#dee6df] rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] tracking-wider uppercase font-bold text-[#63806a]">Daily Operator Log</span>
          <h1 className="text-xl font-bold text-[#143e32] mt-0.5">My Work Today</h1>
          <p className="text-xs text-[#657970] mt-1">
            Track real-time listing throughput, portal quality checks (QC), and today's completed batches.
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#143e32] hover:bg-[#1a4f40] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
        >
          <span>Create New Listing</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Daily Progress Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#dee6df] rounded-xl p-5 shadow-xs">
          <div className="text-xs text-[#7e8e82] font-semibold uppercase tracking-wider">SKUs Completed Today</div>
          <div className="text-3xl font-black text-[#143e32] mt-2">
            18 <span className="text-xs font-normal text-gray-400">/ 25 target</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckSquare className="w-3.5 h-3.5" /> 72% Daily Quota Achieved
          </div>
        </div>

        <div className="bg-white border border-[#dee6df] rounded-xl p-5 shadow-xs">
          <div className="text-xs text-[#7e8e82] font-semibold uppercase tracking-wider">Spreadsheets Generated</div>
          <div className="text-3xl font-black text-[#256da6] mt-2">
            108 <span className="text-xs font-normal text-gray-400">portal files</span>
          </div>
          <div className="text-[11px] text-[#256da6] mt-1 flex items-center gap-1">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Meesho · Flipkart · Amazon
          </div>
        </div>

        <div className="bg-white border border-[#dee6df] rounded-xl p-5 shadow-xs">
          <div className="text-xs text-[#7e8e82] font-semibold uppercase tracking-wider">Quality Check (QC) Rate</div>
          <div className="text-3xl font-black text-emerald-700 mt-2">98.5%</div>
          <div className="text-[11px] text-gray-500 mt-1">0 attribute mismatches detected</div>
        </div>
      </div>

      {/* Today's Tasks Table */}
      <div className="bg-white border border-[#dee6df] rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#143e32]">Today's Activity Feed</h2>
          <span className="text-xs font-mono text-gray-400">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8faf9] text-[#2e4d41] font-semibold border-b border-gray-200">
              <tr>
                <th className="px-5 py-3">Master SKU</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Product Title</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Quality Check</th>
                <th className="px-5 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {todayTasks.map((t, i) => (
                <tr key={i} className="hover:bg-[#fbfcfb]">
                  <td className="px-5 py-3 font-mono font-bold text-[#143e32]">{t.sku}</td>
                  <td className="px-5 py-3 text-gray-600">{t.category}</td>
                  <td className="px-5 py-3 text-gray-800 font-medium">{t.title}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.status === 'Completed'
                        ? 'bg-[#dcfce7] text-[#15803d]'
                        : t.status === 'In Review'
                        ? 'bg-[#fef3c7] text-[#92400e]'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600 flex items-center gap-1.5">
                    {t.status === 'Completed' ? (
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                    <span>{t.qc}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 font-mono text-[11px]">{t.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

