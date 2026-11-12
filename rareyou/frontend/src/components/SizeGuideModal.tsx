import React from 'react';
import { X, Ruler, Scissors, Sparkles } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="w-full max-w-lg transform overflow-hidden rounded-xl bg-white text-left align-middle shadow-2xl transition-all border border-[#E8E5DF] relative p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-[#716D68] hover:text-[#2C2A29] rounded-full hover:bg-[#FAF8F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <Ruler className="w-5 h-5 text-[#C47D68]" />
            <h3 className="font-serif text-lg font-medium text-[#2C2A29]">
              Handcrafted Apparel Size Guide
            </h3>
          </div>
          <p className="text-xs text-[#716D68] mb-6">
            All garments are relaxed, breathable fits crafted in pure hand-loomed cotton. Measurements shown are body dimensions in inches.
          </p>

          {/* Sizing Table */}
          <div className="overflow-x-auto border border-[#E8E5DF] rounded-lg mb-6">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF8F5] text-[#4A5844] font-semibold border-b border-[#E8E5DF]">
                <tr>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Bust (in)</th>
                  <th className="py-2.5 px-3">Waist (in)</th>
                  <th className="py-2.5 px-3">Hips (in)</th>
                  <th className="py-2.5 px-3">Dress Length (in)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DF] text-[#2C2A29]">
                <tr className="hover:bg-[#FAF8F5]/50">
                  <td className="py-2 px-3 font-bold text-[#4A5844]">XS</td>
                  <td className="py-2 px-3">32"</td>
                  <td className="py-2 px-3">26"</td>
                  <td className="py-2 px-3">36"</td>
                  <td className="py-2 px-3">44"</td>
                </tr>
                <tr className="hover:bg-[#FAF8F5]/50">
                  <td className="py-2 px-3 font-bold text-[#4A5844]">S</td>
                  <td className="py-2 px-3">34"</td>
                  <td className="py-2 px-3">28"</td>
                  <td className="py-2 px-3">38"</td>
                  <td className="py-2 px-3">45"</td>
                </tr>
                <tr className="hover:bg-[#FAF8F5]/50 bg-[#FAF8F5]/20">
                  <td className="py-2 px-3 font-bold text-[#4A5844]">M</td>
                  <td className="py-2 px-3">36"</td>
                  <td className="py-2 px-3">30"</td>
                  <td className="py-2 px-3">40"</td>
                  <td className="py-2 px-3">46"</td>
                </tr>
                <tr className="hover:bg-[#FAF8F5]/50">
                  <td className="py-2 px-3 font-bold text-[#4A5844]">L</td>
                  <td className="py-2 px-3">38"</td>
                  <td className="py-2 px-3">32"</td>
                  <td className="py-2 px-3">42"</td>
                  <td className="py-2 px-3">46"</td>
                </tr>
                <tr className="hover:bg-[#FAF8F5]/50">
                  <td className="py-2 px-3 font-bold text-[#4A5844]">XL</td>
                  <td className="py-2 px-3">40"</td>
                  <td className="py-2 px-3">34"</td>
                  <td className="py-2 px-3">44"</td>
                  <td className="py-2 px-3">47"</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bespoke Custom Sizing Callout */}
          <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#E8E5DF] flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#EFECE6] flex items-center justify-center shrink-0 text-[#C47D68] mt-0.5">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1 font-semibold text-xs text-[#2C2A29]">
                <Sparkles className="w-3.5 h-3.5 text-[#C47D68]" />
                <span>Need Custom Bespoke Measurements?</span>
              </div>
              <p className="text-[11px] text-[#716D68] mt-1 leading-relaxed">
                Because every body is unique, our Faridabad women artisans can handcraft your dress to your exact bust, waist, and height specifications at <strong>zero extra charge</strong>. Simply choose your closest size and enter your measurements in the bespoke notes box on the product page!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

