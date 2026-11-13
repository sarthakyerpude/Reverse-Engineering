import React from 'react';
import { ShieldCheck, Lock, FileText, CheckCircle2 } from 'lucide-react';

export const PolicyPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white border border-[#dee6df] rounded-xl p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#eef7f2] border border-[#cbe5d5] flex items-center justify-center text-[#143e32]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#143e32]">Marketplace Policies & Security Guidelines</h1>
            <p className="text-xs text-[#657970] mt-1">
              Standards, terms of use, and catalog compliance requirements across Meesho, Flipkart, Amazon, Myntra, Snapdeal, and SmartBiz.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#dee6df] rounded-xl p-6 shadow-xs space-y-3 text-xs leading-relaxed text-gray-700">
          <div className="flex items-center gap-2 text-sm font-bold text-[#143e32]">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Data Security & Same-Origin Verification</span>
          </div>
          <p>
            Infyshopy utilizes strict Same-Origin request gating and HttpOnly session cookies. Your master catalog attributes, pricing configurations, and Cloudinary API credentials are never exposed to external scripts or unauthorized portals.
          </p>
          <div className="pt-2 flex items-center gap-2 text-emerald-700 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>256-Bit SSL/TLS Encryption Active</span>
          </div>
        </div>

        <div className="bg-white border border-[#dee6df] rounded-xl p-6 shadow-xs space-y-3 text-xs leading-relaxed text-gray-700">
          <div className="flex items-center gap-2 text-sm font-bold text-[#143e32]">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Catalog Quality Compliance (QC)</span>
          </div>
          <p>
            Each generated spreadsheet conforms to current OpenXML specifications and portal cell validation dropdowns. Sellers are responsible for ensuring that uploaded imagery meets brand trademark ownership and resolution thresholds (minimum 1000x1000px).
          </p>
          <div className="pt-2 flex items-center gap-2 text-emerald-700 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Official Portal Schema Templates Supported</span>
          </div>
        </div>
      </div>
    </div>
  );
};

