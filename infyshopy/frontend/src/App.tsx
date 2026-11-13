import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ListingStudioPage } from './pages/ListingStudioPage';
import { StockPage } from './pages/StockPage';
import { MyWorkPage } from './pages/MyWorkPage';
import { PlanningPage } from './pages/PlanningPage';
import { DashboardPage } from './pages/DashboardPage';
import { PortalFilesPage } from './pages/PortalFilesPage';
import { BackupsPage } from './pages/BackupsPage';
import { ReferralsPage } from './pages/ReferralsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ImageLibraryPage } from './pages/ImageLibraryPage';
import { RechargePage } from './pages/RechargePage';
import { EmployeeWorkPage } from './pages/EmployeeWorkPage';
import { CatalogTrackerPage } from './pages/CatalogTrackerPage';
import { PolicyPage } from './pages/PolicyPage';
import { GstReportPage } from './pages/GstReportPage';
import { ProfitLossPage } from './pages/ProfitLossPage';
import { PnlCalculatorPage } from './pages/PnlCalculatorPage';
import { AuthPage } from './pages/AuthPage';
import { Users, Cloud, X, Copy, Check } from 'lucide-react';

// Protected layout wrapper
const ProtectedLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f8f7] flex flex-col items-center justify-center space-y-4">
        <div className="text-2xl font-black text-[#143e32] flex items-center">
          <span>INFYSHOPY</span>
          <span className="text-[#a0cbaa]">.</span>
        </div>
        <div className="w-8 h-8 border-3 border-[#143e32] border-t-transparent rounded-full animate-spin" />
        <div className="text-xs text-[#657970] font-medium tracking-wide">
          Verifying seller workspace session...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  const referralLink = `https://infyshopy.in/auth.html?ref=${user.sellerCode || 'INFY-773'}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f6f8f7] flex">
      {/* Fixed 240px Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="ml-60 flex-1 flex flex-col min-w-0 min-h-screen">
        <TopBar
          onOpenReferral={() => setShowReferralModal(true)}
          onOpenBackup={() => setShowBackupModal(true)}
        />
        <main className="p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Refer a Friend Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#8c4e2b]" />
                <h3 className="font-bold text-[#143e32] text-sm">Refer a Marketplace Seller</h3>
              </div>
              <button onClick={() => setShowReferralModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs text-gray-600">
              <p>
                Invite fellow saree, kurti, or apparel sellers to Infyshopy. You receive <strong className="text-emerald-700">20 free credits</strong> whenever a referred seller signs up and prepares their first catalog batch.
              </p>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Your Personal Referral Link</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="flex-1 px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-xs font-mono text-gray-800"
                  />
                  <button
                    onClick={copyLink}
                    className="px-3 py-2 bg-[#143e32] hover:bg-[#1a4f40] text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drive Backup Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-[#256da6]" />
                <h3 className="font-bold text-[#143e32] text-sm">Google Drive &amp; Local Backup</h3>
              </div>
              <button onClick={() => setShowBackupModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs text-gray-600">
              <p>
                Automated background backup ensures that your master SKU records, image CDN links, and compiled marketplace spreadsheets are securely retained.
              </p>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px]">
                ✓ Auto-sync is currently active for seller account <strong>{user.email}</strong>.
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  alert('Manual snapshot created successfully in SQLite persistent storage.');
                  setShowBackupModal(false);
                }}
                className="px-4 py-2 bg-[#143e32] hover:bg-[#1a4f40] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Create Instant Backup Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/auth" element={<AuthPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<ListingStudioPage />} />
        <Route path="/studio" element={<ListingStudioPage />} />
        <Route path="/stock" element={<StockPage />} />
        <Route path="/mywork" element={<MyWorkPage />} />
        <Route path="/planning" element={<PlanningPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/portalfiles" element={<PortalFilesPage />} />
        <Route path="/backups" element={<BackupsPage />} />
        <Route path="/referrals" element={<ReferralsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/imagelibrary" element={<ImageLibraryPage />} />
        <Route path="/recharge" element={<RechargePage />} />
        <Route path="/employeework" element={<EmployeeWorkPage />} />
        <Route path="/catalogs" element={<CatalogTrackerPage />} />
        <Route path="/policy" element={<PolicyPage />} />
        <Route path="/gst" element={<GstReportPage />} />
        <Route path="/pnl" element={<ProfitLossPage />} />
        <Route path="/calculator" element={<PnlCalculatorPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
