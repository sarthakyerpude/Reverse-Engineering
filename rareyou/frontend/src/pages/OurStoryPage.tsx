import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, MapPin, Users, Award } from 'lucide-react';

export const OurStoryPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#C47D68]">
          THE RARE YOU SAGA
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#2C2A29] font-light leading-tight">
          Because Handmade is <span className="italic text-[#4A5844]">Rare</span>. And Rare is <span className="italic text-[#C47D68]">You</span>.
        </h1>
        <p className="text-xs sm:text-sm text-[#716D68] leading-relaxed">
          Founded in Faridabad, Haryana, Rare You began with a quiet conviction: that in an era of industrial speed and plastic sameness, items born from human hands possess an irreplaceable soul.
        </p>
      </div>

      {/* Main Story Narrative */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-[#E8E5DF] shadow-xs space-y-8 text-xs sm:text-sm text-[#716D68] leading-relaxed">
        <div className="space-y-4">
          <h2 className="font-serif text-xl sm:text-2xl text-[#2C2A29]">
            The Hands Behind Every Knot &amp; Stitch
          </h2>
          <p>
            Every piece carrying the Rare You label is created in our Faridabad studio and community artisan clusters across Haryana. We partner directly with more than 50 master women artisans — providing dignified fair wages, flexible working schedules that accommodate family needs, and an open platform to showcase generational skills.
          </p>
          <p>
            When you sit on Jasmine’s Swing, you are supported by over 400 meters of unbleached organic cotton cord hand-knotted over 3 days. When you slip into our Cookie &amp; Creme dress, you are experiencing pure, breathable hand-loomed cotton cut and tailored with bespoke millimeter precision.
          </p>
        </div>

        {/* 3 Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[#E8E5DF]">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#FAF8F5] text-[#4A5844] flex items-center justify-center border border-[#E8E5DF]">
              <Users className="w-5 h-5 text-[#4A5844]" />
            </div>
            <h3 className="font-semibold text-xs text-[#2C2A29] uppercase tracking-wider">Female Empowerment</h3>
            <p className="text-[11px]">85% of our workshop artisans are women breadwinners transforming their households through financial independence.</p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#FAF8F5] text-[#4A5844] flex items-center justify-center border border-[#E8E5DF]">
              <Sparkles className="w-5 h-5 text-[#C47D68]" />
            </div>
            <h3 className="font-semibold text-xs text-[#2C2A29] uppercase tracking-wider">Zero Deadstock</h3>
            <p className="text-[11px]">We handcraft strictly in small mindful batches and bespoke orders, ensuring zero wasteful landfill accumulation.</p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#FAF8F5] text-[#4A5844] flex items-center justify-center border border-[#E8E5DF]">
              <Award className="w-5 h-5 text-[#D4A373]" />
            </div>
            <h3 className="font-semibold text-xs text-[#2C2A29] uppercase tracking-wider">Heirloom Quality</h3>
            <p className="text-[11px]">Engineered to last for generations — from tested 120 kg swing welds to hypoallergenic organic milk cotton yarns.</p>
          </div>
        </div>

        {/* Studio Location & Contact */}
        <div className="p-6 bg-[#FAF8F5] rounded-xl border border-[#E8E5DF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[#C47D68] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-xs text-[#2C2A29]">Rare You Lifestyle LLP</h4>
              <p className="text-[11px] text-[#716D68]">Sector 21-C, Faridabad, Haryana, 121001, India</p>
              <p className="text-[11px] text-[#716D68]">WhatsApp Studio Concierge: +91 98112 34567 • care@rareyou.com</p>
            </div>
          </div>

          <Link
            to="/collections"
            className="bg-[#4A5844] hover:bg-[#374233] text-white text-xs font-semibold px-6 py-2.5 rounded tracking-wider uppercase transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            Explore Creations <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
