import React from 'react';
import { Image, Upload, RotateCw, CheckCircle2 } from 'lucide-react';

export const ImageLibraryPage: React.FC = () => {
  const angles = [
    { name: 'Front Main', desc: 'White background, full product front view' },
    { name: 'Back Angle', desc: 'Clean back details and stitching' },
    { name: 'Pallu / Chest Zoom', desc: 'Fabric texture and embroidery close-up' },
    { name: 'Border Detail', desc: 'Zari / lace border precision shot' },
    { name: 'Blouse Piece', desc: 'Unstitched/stitched blouse cut' },
    { name: 'Model / Drape View', desc: 'Full height wearing shot' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white border border-[#dfe7e0] rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#657970] tracking-wider">Catalog Asset Studio</span>
          <h1 className="text-xl font-bold text-[#143e32] mt-0.5">Image Library & Angle Studio</h1>
          <p className="text-xs text-[#657970] mt-1">
            Validate all 8 marketplace photo angles, rotate 90° clockwise, and auto-upload to Cloudinary CDN for spreadsheet URL embedding.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {angles.map((a, i) => (
          <div key={i} className="bg-white border border-[#dee6df] rounded-xl p-5 shadow-xs space-y-3">
            <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 p-4 text-center hover:border-[#143e32] transition-colors cursor-pointer">
              <Upload className="w-8 h-8 mb-2 text-gray-400" />
              <div className="font-semibold text-xs text-gray-700">Drop {a.name} Photo</div>
              <div className="text-[10px] text-gray-400 mt-1">{a.desc}</div>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="font-bold text-[#143e32]">{a.name}</span>
              <button
                type="button"
                onClick={() => alert(`Rotated ${a.name} 90° clockwise.`)}
                className="p-1.5 hover:bg-gray-100 rounded text-gray-600 flex items-center gap-1 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span className="text-[11px]">Rotate 90°</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

