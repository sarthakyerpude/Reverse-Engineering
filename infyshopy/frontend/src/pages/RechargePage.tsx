import React, { useState } from 'react';
import { CreditCard, QrCode, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RechargePage: React.FC = () => {
  const { user } = useAuth();
  const [selectedPack, setSelectedPack] = useState<number>(50);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white border border-[#dfe7e0] rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#657970] tracking-wider">Wallet Balance</span>
          <h1 className="text-xl font-bold text-[#143e32] mt-0.5">Credits & Wallet Recharge</h1>
          <p className="text-xs text-[#657970] mt-1">
            1 Credit = 1 Official formatted Excel spreadsheet compilation across any marketplace.
          </p>
        </div>
        <div className="px-4 py-2 bg-[#e8f5e9] border border-[#c8e6c9] rounded-xl text-center">
          <div className="text-[10px] text-gray-500 font-medium">Available Balance</div>
          <div className="text-2xl font-black text-[#2e7d32]">{user?.balance ?? 20} Credits</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => setSelectedPack(50)}
          className={`p-5 rounded-xl border transition-all cursor-pointer ${
            selectedPack === 50 ? 'border-[#143e32] bg-[#f0f6f3] shadow-xs' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="text-lg font-black text-[#143e32]">50 Credits Pack</div>
          <div className="text-xs text-[#2e7d32] font-semibold mt-1">₹500 (₹10 / file)</div>
          <p className="text-[11px] text-gray-500 mt-2">
            Perfect for smaller saree or kurti manufacturers releasing 5-8 new design batches monthly.
          </p>
        </div>

        <div
          onClick={() => setSelectedPack(120)}
          className={`p-5 rounded-xl border transition-all cursor-pointer ${
            selectedPack === 120 ? 'border-[#143e32] bg-[#f0f6f3] shadow-xs' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-lg font-black text-[#143e32]">120 Credits Pack</div>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">POPULAR</span>
          </div>
          <div className="text-xs text-[#2e7d32] font-semibold mt-1">₹1,000 (Best Value)</div>
          <p className="text-[11px] text-gray-500 mt-2">
            Recommended for regular cataloging operations across all 6 marketplaces simultaneously.
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#dee6df] rounded-xl p-6 shadow-xs text-xs space-y-4">
        <h3 className="font-bold text-[#143e32] text-sm">Instant UPI Payment Details</h3>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-gray-500 text-[11px]">Direct Official UPI VPA:</div>
            <div className="text-base font-mono font-bold text-[#143e32] mt-0.5">infyshopy.pay@icici</div>
            <div className="text-[11px] text-gray-400 mt-1">
              Accepted via Google Pay, PhonePe, Paytm, or BHIM.
            </div>
          </div>
          <button
            type="button"
            onClick={() => alert('UPI details copied to clipboard: infyshopy.pay@icici')}
            className="px-4 py-2 bg-[#143e32] hover:bg-[#1a4f40] text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            Copy UPI ID
          </button>
        </div>
      </div>
    </div>
  );
};

