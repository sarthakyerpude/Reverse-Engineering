import React, { useState } from 'react';
import { Users, Copy, Check, Gift } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ReferralsPage: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const referralLink = `https://infyshopy.in/auth.html?ref=${user?.sellerCode || 'INFY-773'}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white border border-[#dfe7e0] rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#657970] tracking-wider">Seller Network</span>
          <h1 className="text-xl font-bold text-[#143e32] mt-0.5">Refer a Friend & Earn 20 Credits</h1>
          <p className="text-xs text-[#657970] mt-1">
            Share Infyshopy with fellow textile and apparel sellers in Surat, Delhi, Jaipur, or Ahmedabad.
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#dee6df] rounded-xl p-6 shadow-xs space-y-4 text-xs">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <Gift className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-900">Get 20 Free Spreadsheet Download Credits</div>
            <div className="text-[11px] text-amber-800 mt-0.5">
              Whenever a referred manufacturer registers with your code, 20 credits are added to your wallet automatically upon their first catalog compilation.
            </div>
          </div>
        </div>

        <div>
          <label className="block font-bold text-gray-700 mb-1">Your Personal Referral Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-xs font-mono text-gray-800"
            />
            <button
              onClick={copyLink}
              className="px-4 py-2 bg-[#143e32] hover:bg-[#1a4f40] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

