import React, { useState, useEffect } from 'react';
import { FolderArchive, Download, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PortalFilesPage: React.FC = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchBatches = async () => {
    try {
      const res = await fetch('/api/portal-files', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setBatches(data.files || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const portals = [
    { id: 'MEESHO', name: 'Meesho', ext: '.xlsx', sheet: 'Single / Bulk Catalog Format' },
    { id: 'FLIPKART', name: 'Flipkart', ext: '.xlsx', sheet: 'Vertical Catalog Template' },
    { id: 'AMAZON', name: 'Amazon India', ext: '.xlsx', sheet: 'Inventory Loader Flat File' },
    { id: 'MYNTRA', name: 'Myntra', ext: '.xlsx', sheet: 'Partner Portal Master' },
    { id: 'SNAPDEAL', name: 'Snapdeal', ext: '.xlsx', sheet: 'Apparel Bulk Feed' },
    { id: 'SMARTBIZ', name: 'SmartBiz', ext: '.xlsx', sheet: 'D2C Storefront Catalog' }
  ];

  const handleDownload = (market: string) => {
    window.open(`/api/download/${market.toLowerCase()}/batch_latest`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white border border-[#dfe7e0] rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#657970] tracking-wider">Spreadsheet Compilations</span>
          <h1 className="text-xl font-bold text-[#143e32] mt-0.5">Marketplace Portal Files</h1>
          <p className="text-xs text-[#657970] mt-1">
            Download pre-formatted, validated Excel flat files ready for upload on Meesho, Flipkart, Amazon, Myntra, Snapdeal, and SmartBiz.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {portals.map((p) => (
          <div key={p.id} className="bg-white border border-[#dee6df] rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-[#a8c9b6] transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#eef7f2] border border-[#cbe5d5] flex items-center justify-center text-[#143e32]">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#143e32]">{p.name}</h3>
                    <div className="text-[10px] text-gray-500 font-mono">{p.ext} format</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#edf5eb] text-[#3d8055] border border-[#d2e4cb]">
                  Ready
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-4">{p.sheet}</p>
            </div>

            <button
              type="button"
              onClick={() => handleDownload(p.id)}
              className="w-full py-2 px-3 bg-[#143e32] hover:bg-[#1a4f40] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {p.name} Sheet</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

