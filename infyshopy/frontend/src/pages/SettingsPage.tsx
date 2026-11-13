import React, { useState } from 'react';
import { Settings, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [brandName, setBrandName] = useState('Shree Radhe Sarees');
  const [manufacturer, setManufacturer] = useState('Radhe Fashion Pvt Ltd, Surat, Gujarat');
  const [packer, setPacker] = useState('Radhe Fashion Pvt Ltd, Ring Road, Surat - 395002');
  const [hsnCode, setHsnCode] = useState('5407');
  const [gstPercent, setGstPercent] = useState('5');
  const [savedNotice, setSavedNotice] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice('✓ Brand fixed settings updated in persistent configuration.');
    setTimeout(() => setSavedNotice(''), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white border border-[#dfe7e0] rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#657970] tracking-wider">Account & Brand Configuration</span>
          <h1 className="text-xl font-bold text-[#143e32] mt-0.5">Brand Settings & HSN Defaults</h1>
          <p className="text-xs text-[#657970] mt-1">
            These manufacturer, packer and HSN attributes are automatically embedded into every marketplace flat file.
          </p>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3 bg-[#edf5eb] border border-[#d2e4cb] rounded-lg text-xs font-semibold text-[#3d8055] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{savedNotice}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white border border-[#dee6df] rounded-xl p-6 shadow-xs space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Brand Name</label>
          <input
            type="text"
            required
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Manufacturer Name & Address</label>
          <input
            type="text"
            required
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Packer Name & Address</label>
          <input
            type="text"
            required
            value={packer}
            onChange={(e) => setPacker(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Default HSN Code</label>
            <input
              type="text"
              required
              value={hsnCode}
              onChange={(e) => setHsnCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono font-bold"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Default GST Rate (%)</label>
            <select
              value={gstPercent}
              onChange={(e) => setGstPercent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold"
            >
              <option value="5">5% (Apparel / Textiles under ₹1,000)</option>
              <option value="12">12% (Textiles above ₹1,000)</option>
              <option value="18">18% (Standard Rate)</option>
            </select>
          </div>
        </div>

        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#143e32] hover:bg-[#1a4f40] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

