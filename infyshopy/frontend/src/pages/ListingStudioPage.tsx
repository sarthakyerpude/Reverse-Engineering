import React, { useState } from 'react';
import {
  Users,
  Cloud,
  CheckCircle2,
  RotateCw,
  Sparkles,
  Download,
  Upload,
  RefreshCw,
  ArrowLeft,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CategoryCard {
  id: string;
  title: string;
  symbol: string;
  status: 'Available' | 'Coming soon';
  description: string;
  isReady: boolean;
}

export const ListingStudioPage: React.FC = () => {
  const { user, refreshSession } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [batchReady, setBatchReady] = useState<boolean>(false);
  const [batchId, setBatchId] = useState<string>('');
  const [downloadingMarket, setDownloadingMarket] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    master_sku: 'INFY-SKU-7730',
    title: 'Handcrafted Banarasi Pure Silk Saree with Embroidered Blouse Piece',
    base_price: 1299,
    mrp: 2999,
    fabric: 'Banarasi Silk',
    color: 'Royal Blue',
    blouse_type: 'Separate Blouse Piece',
    occasion: 'Festive & Wedding',
    saree_length: '5.5',
    blouse_length: '0.8',
    hsn: '5407',
    gst: 5
  });

  // 8 Image slots
  const [images, setImages] = useState<string[]>([
    'https://res.cloudinary.com/infyshopy/image/upload/v1/samples/saree_front.jpg',
    'https://res.cloudinary.com/infyshopy/image/upload/v1/samples/saree_pallu.jpg',
    'https://res.cloudinary.com/infyshopy/image/upload/v1/samples/saree_blouse.jpg',
    '', '', '', '', ''
  ]);
  const [rotations, setRotations] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);

  const rotateImage = (index: number) => {
    setRotations((prev) => {
      const next = [...prev];
      next[index] = (next[index] + 90) % 360;
      return next;
    });
  };

  const categories: CategoryCard[] = [
    {
      id: 'saree',
      title: 'Saree Listing',
      symbol: '◈',
      status: 'Available',
      description: 'Your current six-marketplace listing workspace',
      isReady: true
    },
    {
      id: 'kurti',
      title: 'Kurti Listing',
      symbol: '♧',
      status: 'Available',
      description: 'Six marketplaces · separate Kurti sizes, attributes and originals · separate sizes, attributes and originals',
      isReady: true
    },
    {
      id: 'shoes',
      title: 'Shoes Listing',
      symbol: '↗',
      status: 'Coming soon',
      description: 'Category templates and fields will be added',
      isReady: false
    },
    {
      id: 'wallpaper',
      title: 'Wallpaper Listing',
      symbol: '▦',
      status: 'Coming soon',
      description: 'Category templates and fields will be added',
      isReady: false
    },
    {
      id: 'suits',
      title: 'Suits / Dress Materials',
      symbol: '◈',
      status: 'Coming soon',
      description: 'Category templates and fields will be added',
      isReady: false
    },
    {
      id: 'suiting',
      title: 'Suiting & Shirting Fabrics',
      symbol: '◈',
      status: 'Coming soon',
      description: 'Category templates and fields will be added',
      isReady: false
    },
    {
      id: 'shirts',
      title: 'Shirts Listing',
      symbol: '◈',
      status: 'Coming soon',
      description: 'Category templates and fields will be added',
      isReady: false
    },
    {
      id: 'lowers',
      title: 'Lower / Trousers',
      symbol: '◈',
      status: 'Coming soon',
      description: 'Category templates and fields will be added',
      isReady: false
    }
  ];

  const handleSyncListings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/listings/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          category: selectedCategory || 'saree',
          form: formData,
          selectedMarkets: ['MEESHO', 'FLIPKART', 'AMAZON', 'MYNTRA', 'SNAPDEAL', 'SMARTBIZ']
        })
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setBatchId(data.batchId);
        setBatchReady(true);
      } else {
        alert(data.error || 'Failed to prepare batch');
      }
    } catch (err: any) {
      alert('Error preparing listings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadSheet = async (market: string) => {
    if (!batchId) return;
    setDownloadingMarket(market);

    try {
      const res = await fetch(`/api/download/${market.toLowerCase()}/${batchId}`, {
        credentials: 'include'
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Download failed');
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${market.toLowerCase()}_catalog_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      await refreshSession();
    } catch (err: any) {
      alert('Download error: ' + err.message);
    } finally {
      setDownloadingMarket(null);
    }
  };

  const marketplaces = [
    { id: 'MEESHO', name: 'Meesho Supplier', text: 'text-[#9b2477]', bg: 'bg-[#fbeaf6]', diff: 'Base Saree Price' },
    { id: 'FLIPKART', name: 'Flipkart Fashion', text: 'text-[#2562a4]', bg: 'bg-[#e8f0fd]', diff: '+₹150 Commission Buffer' },
    { id: 'AMAZON', name: 'Amazon Seller Central', text: 'text-[#b8731b]', bg: 'bg-[#fff3df]', diff: '+₹200 Closing Fee' },
    { id: 'MYNTRA', name: 'Myntra Partner Portal', text: 'text-[#bf5c44]', bg: 'bg-[#fff0e7]', diff: '+18% Fashion Markup' },
    { id: 'SNAPDEAL', name: 'Snapdeal Feed', text: 'text-[#c74b57]', bg: 'bg-[#fdebee]', diff: '+10% Catalog Feed' },
    { id: 'SMARTBIZ', name: 'SmartBiz Storefront', text: 'text-[#2f756e]', bg: 'bg-[#e9f8f4]', diff: 'Direct D2C Storefront' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* VIEW 1: START LISTINGS WORKSPACE GRID (EXACT IMAGE 3) */}
      {!selectedCategory ? (
        <div className="space-y-6">
          {/* Main Dark Green Banner Card */}
          <div className="bg-[#143e32] text-white rounded-2xl p-7 shadow-sm border border-[#1b4b3e] relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
              <div className="max-w-2xl">
                <span className="text-[10px] tracking-[2.5px] uppercase font-bold text-[#c6dc9b]">
                  Listing Workspaces
                </span>
                <h1 className="text-2xl font-black text-white mt-1">Start Listings</h1>
                <p className="text-xs text-[#b9cfc3] mt-2 leading-relaxed">
                  Choose the product category you want to list. Each category will have its own Master Data and Brand Fixed Data workspace.
                </p>
              </div>

              {/* Right Side Buttons inside Card */}
              <div className="flex flex-col items-end gap-2.5 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => alert('Referral program: Earn 20 free credits for each seller you invite.')}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#944d22] hover:bg-[#7e401c] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Refer a Friend</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => alert('Drive Backup: Catalog listings are backed up to Google Drive & local storage.')}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#256da6] hover:bg-[#1e5886] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Drive Backup</span>
                  </button>
                </div>

                <div className="px-3 py-1 bg-[#ffffff18] rounded-full text-[11px] font-medium text-[#c6dc9b] border border-[#ffffff15]">
                  Saree workspace available
                </div>
              </div>
            </div>
          </div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => {
                  if (cat.isReady) setSelectedCategory(cat.id);
                  else alert(`${cat.title} templates are currently being prepared and will be available soon.`);
                }}
                className={`rounded-xl border p-5 flex flex-col justify-between transition-all cursor-pointer ${
                  cat.isReady
                    ? cat.id === 'saree'
                      ? 'bg-[#eef6f1] border-[#c0decb] hover:border-[#86c59b] shadow-xs hover:shadow-md'
                      : 'bg-white border-[#dee6df] hover:border-[#86c59b] shadow-xs hover:shadow-md'
                    : 'bg-white border-[#e6ece7] opacity-85 hover:opacity-100 hover:border-gray-300'
                }`}
              >
                <div>
                  {/* Status Badge */}
                  <div className="flex items-center justify-end mb-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        cat.status === 'Available'
                          ? 'bg-[#dcfce7] text-[#15803d]'
                          : 'bg-[#f1f5f9] text-[#64748b]'
                      }`}
                    >
                      {cat.status}
                    </span>
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold mb-3 ${
                      cat.isReady ? 'bg-white text-[#143e32] shadow-xs border border-[#dde7df]' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {cat.symbol}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-bold text-[#143e32] tracking-tight">{cat.title}</h3>
                  <p className="text-[11px] text-[#657970] mt-1.5 leading-relaxed line-clamp-3">
                    {cat.description}
                  </p>
                </div>

                {cat.isReady && (
                  <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] font-bold text-[#143e32]">
                    <span>Enter Workspace</span>
                    <span>→</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* VIEW 2: ACTIVE CATEGORY WORKSPACE (MASTER FORM + 8 PHOTO STUDIO + 6 EXCEL DOWNLOADS) */
        <div className="space-y-6">
          {/* Header Bar with Back Button */}
          <div className="bg-white border border-[#dee6df] rounded-xl p-4 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#f0f6f2] hover:bg-[#e2ece4] text-[#143e32] text-xs font-bold rounded-lg border border-[#cddad1] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Listing Workspaces</span>
              </button>
              <div className="h-4 w-px bg-gray-200" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">Active Workspace:</span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#143e32] text-white">
                  {selectedCategory.toUpperCase()} LISTING
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#143e32] font-semibold">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Universal Cell Coordinate Matrix Active (B3/C3/D3)</span>
            </div>
          </div>

          {/* Master Form */}
          <form onSubmit={handleSyncListings} className="bg-white border border-[#dee6df] rounded-xl shadow-xs overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#143e32]">Master Data Input Form</h2>
                <p className="text-xs text-[#657970] mt-0.5">
                  Fill attributes once. The matrix automatically maps fields into exact Meesho, Flipkart, Amazon, Myntra, Snapdeal, and SmartBiz schemas.
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-[#143e32] hover:bg-[#1a4f40] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#c6dc9b]" />}
                <span>{loading ? 'Compiling Batches…' : 'Compile 6 Marketplace Files'}</span>
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Master SKU */}
              <div>
                <label className="block text-xs font-semibold text-[#243b32] mb-1">Master SKU ID *</label>
                <input
                  type="text"
                  required
                  value={formData.master_sku}
                  onChange={(e) => setFormData({ ...formData, master_sku: e.target.value })}
                  className="w-full px-3 py-2 border border-[#cdd8d2] rounded-lg text-xs font-mono text-[#143e32] focus:outline-none focus:border-[#143e32]"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Unique catalog key for multi-channel sync</span>
              </div>

              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#243b32] mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[#cdd8d2] rounded-lg text-xs text-[#143e32] focus:outline-none focus:border-[#143e32]"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Title adapted per platform character limits</span>
              </div>

              {/* Base Price */}
              <div>
                <label className="block text-xs font-semibold text-[#243b32] mb-1">Base Selling Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-[#cdd8d2] rounded-lg text-xs font-semibold text-[#143e32] focus:outline-none focus:border-[#143e32]"
                />
              </div>

              {/* MRP */}
              <div>
                <label className="block text-xs font-semibold text-[#243b32] mb-1">MRP (₹) *</label>
                <input
                  type="number"
                  required
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-[#cdd8d2] rounded-lg text-xs font-semibold text-[#143e32] focus:outline-none focus:border-[#143e32]"
                />
              </div>

              {/* Fabric */}
              <div>
                <label className="block text-xs font-semibold text-[#243b32] mb-1">Fabric Composition *</label>
                <select
                  value={formData.fabric}
                  onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                  className="w-full px-3 py-2 border border-[#cdd8d2] rounded-lg text-xs text-[#143e32] focus:outline-none focus:border-[#143e32] bg-white"
                >
                  <option value="Banarasi Silk">Banarasi Silk</option>
                  <option value="Pure Silk">Pure Silk</option>
                  <option value="Georgette">Georgette</option>
                  <option value="Chiffon">Chiffon</option>
                  <option value="Cotton">Pure Cotton</option>
                  <option value="Art Silk">Art Silk / Polysilk</option>
                  <option value="Kanjivaram Silk">Kanjivaram Silk</option>
                </select>
              </div>

              {/* Primary Color */}
              <div>
                <label className="block text-xs font-semibold text-[#243b32] mb-1">Primary Color *</label>
                <select
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-3 py-2 border border-[#cdd8d2] rounded-lg text-xs text-[#143e32] focus:outline-none focus:border-[#143e32] bg-white"
                >
                  <option value="Royal Blue">Royal Blue</option>
                  <option value="Crimson Red">Crimson Red</option>
                  <option value="Bottle Green">Bottle Green</option>
                  <option value="Mustard Yellow">Mustard Yellow</option>
                  <option value="Pastel Pink">Pastel Pink</option>
                  <option value="Lavender">Lavender</option>
                  <option value="Black">Classic Black</option>
                </select>
              </div>

              {/* Blouse Type (Common Variable) */}
              <div>
                <label className="block text-xs font-semibold text-[#243b32] mb-1">
                  Blouse Type (Common Variable B3/C3/D3) *
                </label>
                <select
                  value={formData.blouse_type}
                  onChange={(e) => setFormData({ ...formData, blouse_type: e.target.value })}
                  className="w-full px-3 py-2 border border-[#cdd8d2] rounded-lg text-xs text-[#143e32] focus:outline-none focus:border-[#143e32] bg-white"
                >
                  <option value="Separate Blouse Piece">Separate Blouse Piece (Meesho/Unstitched on Flipkart)</option>
                  <option value="Running Blouse">Running Blouse</option>
                  <option value="Stitched Blouse">Stitched Blouse</option>
                  <option value="Semi-Stitched Blouse">Semi-Stitched Blouse</option>
                  <option value="Without Blouse">Without Blouse</option>
                </select>
              </div>

              {/* Occasion */}
              <div>
                <label className="block text-xs font-semibold text-[#243b32] mb-1">Occasion *</label>
                <select
                  value={formData.occasion}
                  onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                  className="w-full px-3 py-2 border border-[#cdd8d2] rounded-lg text-xs text-[#143e32] focus:outline-none focus:border-[#143e32] bg-white"
                >
                  <option value="Festive & Wedding">Festive & Wedding</option>
                  <option value="Party Wear">Party Wear</option>
                  <option value="Daily Casual">Daily Casual</option>
                  <option value="Formal Office">Formal Office</option>
                </select>
              </div>
            </div>

            {/* 8-Angle Product Photography Studio */}
            <div className="p-6 border-t border-gray-100 bg-[#fbfdfc]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-bold text-[#143e32] uppercase tracking-wider">
                    8-Angle Product Photography Studio
                  </h3>
                  <span className="text-[11px] text-gray-500">
                    Live thumbnail preview with 90° rotation. Cloudinary CDN URLs automatically populated into Excel.
                  </span>
                </div>
                <div className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-semibold">
                  ✓ Cloudinary CDN Connected
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-2 bg-white flex flex-col items-center">
                    <div className="w-full h-24 bg-gray-50 rounded border border-dashed border-gray-200 flex items-center justify-center overflow-hidden mb-2 relative">
                      {img ? (
                        <img
                          src={img}
                          alt={`Angle ${i + 1}`}
                          style={{ transform: `rotate(${rotations[i]}deg)` }}
                          className="w-full h-full object-cover transition-transform"
                        />
                      ) : (
                        <Upload className="w-4 h-4 text-gray-300" />
                      )}
                      {img && (
                        <button
                          type="button"
                          onClick={() => rotateImage(i)}
                          className="absolute bottom-1 right-1 p-1 bg-white/90 rounded-md hover:bg-white text-gray-700 shadow-xs cursor-pointer"
                          title="Rotate 90°"
                        >
                          <RotateCw className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">Angle {i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </form>

          {/* 6 Marketplace Compiled Download Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#143e32] uppercase tracking-wider">
                  Ready-to-Upload Marketplace Spreadsheets (6)
                </h3>
                <p className="text-xs text-[#657970] mt-0.5">
                  Click download to get official formatted .xlsx flat files. 1 credit debited per downloaded portal file.
                </p>
              </div>
              {batchReady && (
                <span className="px-3 py-1 bg-[#dcfce7] text-[#15803d] font-bold text-xs rounded-full flex items-center gap-1.5 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All 6 Flat Files Compiled
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketplaces.map((m) => (
                <div
                  key={m.id}
                  className={`bg-white border rounded-xl p-5 shadow-xs transition-all ${
                    batchReady ? 'border-[#8dc5a2] shadow-sm' : 'border-[#dfe7e0]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-1 rounded-md font-bold text-xs ${m.bg} ${m.text}`}>
                      {m.id}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-400">1 Credit</span>
                  </div>

                  <h4 className="text-sm font-bold text-gray-900">{m.name}</h4>
                  <p className="text-[11px] text-gray-500 mt-1 mb-4">{m.diff}</p>

                  <button
                    type="button"
                    onClick={() => downloadSheet(m.id)}
                    disabled={!batchReady || downloadingMarket === m.id || (user?.balance ?? 0) < 1}
                    className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      batchReady
                        ? 'bg-[#143e32] hover:bg-[#1a4f40] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {downloadingMarket === m.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>{downloadingMarket === m.id ? 'Downloading…' : `Download ${m.id} .xlsx`}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
