import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Cloud, Clock, RefreshCw, Play, X, ExternalLink } from 'lucide-react';

interface TopBarProps {
  onOpenReferral?: () => void;
  onOpenBackup?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenReferral, onOpenBackup }) => {
  const { user, refreshSession, logout } = useAuth();
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshSession();
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <>
      <header className="bg-[#e7eee8] border-b border-[#d2ded6] px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs select-none sticky top-0 z-20 shadow-xs">
        {/* Left Side Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Refer a Friend */}
          <button
            type="button"
            onClick={onOpenReferral}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8c4e2b] hover:bg-[#783e20] text-white font-medium rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Refer a Friend</span>
          </button>

          {/* Drive Backup */}
          <button
            type="button"
            onClick={onOpenBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#256da6] hover:bg-[#1e5886] text-white font-medium rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Drive Backup</span>
          </button>

          {/* Recent Activity */}
          <button
            type="button"
            onClick={() => alert('Recent Activity: All catalog templates ready for batch downloads.')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-[#2b4437] border border-[#cbd8cf] font-medium rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-gray-500" />
            <span>Recent Activity</span>
          </button>
        </div>

        {/* Right Side Account & Session Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Signed In Pill */}
          {user ? (
            <div className="px-3 py-1 bg-white border border-[#cbd8cf] rounded-md flex items-center gap-1 text-[11px] shadow-xs">
              <span className="text-gray-500">Signed In as</span>
              <span className="font-semibold text-[#143e32]">{user.email}</span>
            </div>
          ) : (
            <div className="px-3 py-1 bg-white border border-[#cbd8cf] rounded-md text-[11px] text-gray-500">
              Not Signed In
            </div>
          )}

          {/* Credits Balance Pill */}
          <div className="px-3 py-1 bg-[#e8f5e9] border border-[#c8e6c9] rounded-md font-bold text-[#2e7d32] text-xs shadow-xs">
            <span>{user?.balance ?? 20} credits</span>
          </div>

          {/* Recharge Button */}
          <button
            type="button"
            onClick={() => setShowRechargeModal(true)}
            className="px-2.5 py-1 bg-white hover:bg-gray-50 text-[#2b4437] border border-[#cbd8cf] font-medium rounded-md shadow-xs transition-colors cursor-pointer"
          >
            + Recharge
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            className="px-2.5 py-1 bg-white hover:bg-gray-50 text-[#2b4437] border border-[#cbd8cf] font-medium rounded-md shadow-xs transition-colors cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Login or Logout Button - NEVER BOTH */}
          {user ? (
            <button
              type="button"
              onClick={() => logout()}
              className="px-3 py-1 bg-[#143e32] hover:bg-[#0e2c24] text-white font-semibold rounded-md shadow-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Logout</span>
              <span className="text-[10px]">↗</span>
            </button>
          ) : (
            <a
              href="/auth"
              className="px-3 py-1 bg-[#143e32] hover:bg-[#0e2c24] text-white font-semibold rounded-md shadow-xs transition-colors"
            >
              Login
            </a>
          )}
        </div>
      </header>

      {/* Tutorial Bar */}
      <div className="bg-[#f0f5f1] border-b border-[#dce7e0] px-6 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowVideoModal(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#cc181e] hover:bg-[#b01318] text-white font-bold rounded-sm text-[11px] shadow-xs cursor-pointer"
          >
            <Play className="w-3 h-3 fill-white" />
            <span>YouTube Guide</span>
          </button>
          <button
            type="button"
            onClick={() => setShowVideoModal(true)}
            className="text-[11px] text-[#24543d] hover:underline cursor-pointer"
          >
            Learn this page
          </button>
        </div>
        <div className="text-[10px] text-gray-500 font-mono">
          Seller Code: {user?.sellerCode || 'INFY-773'} · Matrix V4.2
        </div>
      </div>

      {/* Recharge Modal */}
      {showRechargeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-[#143e32] text-sm">Wallet Credit Recharge</h3>
              <button onClick={() => setShowRechargeModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs">
              <p className="text-gray-600">
                1 Credit = 1 Spreadsheet flat file compilation across any marketplace. Select your recharge pack:
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="border border-emerald-500 bg-emerald-50/50 p-3 rounded-lg text-center cursor-pointer hover:border-emerald-600">
                  <div className="font-bold text-lg text-emerald-800">50 Credits</div>
                  <div className="text-xs text-emerald-600 font-semibold">₹500 (₹10/file)</div>
                </div>
                <div className="border border-gray-200 p-3 rounded-lg text-center cursor-pointer hover:border-emerald-500">
                  <div className="font-bold text-lg text-gray-800">120 Credits</div>
                  <div className="text-xs text-emerald-600 font-semibold">₹1,000 (Popular)</div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-100">
                <div className="text-[11px] text-gray-500 mb-1">Instant UPI Scan & Pay:</div>
                <div className="font-mono text-xs font-bold text-[#143e32]">infyshopy.pay@icici</div>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  alert('Recharge request submitted. Balance will be updated automatically upon UPI confirmation.');
                  setShowRechargeModal(false);
                }}
                className="px-4 py-2 bg-[#143e32] text-white rounded-md text-xs font-bold hover:bg-[#1a4f40] cursor-pointer"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YouTube Guide Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <h3 className="font-bold text-[#143e32] text-sm">Infyshopy Listing Studio Video Tutorial</h3>
              </div>
              <button onClick={() => setShowVideoModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs text-gray-600">
              <div className="aspect-video bg-gray-900 rounded-lg flex flex-col items-center justify-center text-white p-4 text-center">
                <Play className="w-10 h-10 text-red-500 mb-2" />
                <p className="font-semibold text-sm">How to List 100+ SKUs across Meesho, Flipkart & Amazon in 5 Minutes</p>
                <span className="text-[10px] text-gray-400 mt-1">Video Guide · 4 mins</span>
              </div>
              <p className="leading-relaxed">
                Learn how to enter master attributes once, check image angles with 90° rotation, and compile official formatted spreadsheets for all 6 target portals in one click.
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="px-4 py-2 bg-[#143e32] text-white rounded-md text-xs font-bold hover:bg-[#1a4f40] cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
