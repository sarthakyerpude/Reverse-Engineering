import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Clock, Heart, Mail, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-[#FAF8F5] border-t border-[#F0ECE9] text-gray-600 text-xs pt-16 pb-12 font-sans">
      {/* 4 Brand Pillars Banner */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 pb-14 border-b border-[#F0ECE9]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center md:text-left">
          <div className="flex items-start gap-4 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center shrink-0 text-black">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            </div>
            <div>
              <h4 className="font-medium text-sm text-black mb-1">100% Handcrafted Devotion</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">Each flower petal and macrame knot is hand-knitted by skilled women artisans.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center shrink-0 text-black">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-medium text-sm text-black mb-1">Blinkit &amp; Free Express Delivery</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">Available on Blinkit in Delhi NCR (1-2 days). Free shipping across India on orders above Rs. 1,499.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center shrink-0 text-black">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-medium text-sm text-black mb-1">Damage-Free Guarantee</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">Multi-layer protective gift-ready packaging with free immediate transit replacement.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center shrink-0 text-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-medium text-sm text-black mb-1">Eco-Friendly Milk Cotton</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">Forever flowers that never wither, never fade, and require zero water or maintenance.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Story */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand Mission */}
        <div className="md:col-span-1 space-y-3">
          <span className="text-lg font-normal tracking-[0.2em] text-[#121212] block">
            RARE ❤ YOU
          </span>
          <p className="text-gray-700 text-xs">
            “Because Handmade is Rare. And Rare is You.”
          </p>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Rare You is an artisanal lifestyle brand based in Faridabad, India. We celebrate authentic handcrafting, slow design, and women-led craftsmanship.
          </p>
        </div>

        {/* Collections */}
        <div>
          <h4 className="font-medium text-xs tracking-wider uppercase text-black mb-4">Curated Collections</h4>
          <ul className="space-y-2 text-[12px]">
            <li><Link to="/collections/forever-flower" className="hover:text-black transition-colors">Forever Flowers</Link></li>
            <li><Link to="/collections/home-decor" className="hover:text-black transition-colors">Home Decor &amp; Tapestries</Link></li>
            <li><Link to="/collections/accessories" className="hover:text-black transition-colors">Handmade Accessories &amp; Totes</Link></li>
            <li><Link to="/collections/clothing" className="hover:text-black transition-colors">Handcrafted Apparel</Link></li>
            <li><Link to="/collections/swings" className="hover:text-black transition-colors">Kids &amp; Macrame Swings</Link></li>
          </ul>
        </div>

        {/* Customer Care & Policies */}
        <div>
          <h4 className="font-medium text-xs tracking-wider uppercase text-black mb-4">Customer Care</h4>
          <ul className="space-y-2 text-[12px]">
            <li><Link to="/track" className="hover:text-black transition-colors">Track Your Order</Link></li>
            <li><Link to="/our-story" className="hover:text-black transition-colors">Our Artisan Story</Link></li>
            <li><span className="text-gray-800 font-medium">Blinkit Delivery:</span> Delhi NCR (1-2 Days)</li>
            <li><span className="text-gray-800 font-medium">Support WhatsApp:</span> +91 99999 99999</li>
            <li><span className="text-gray-800 font-medium">Email:</span> care@rareyou.com</li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div>
          <h4 className="font-medium text-xs tracking-wider uppercase text-black mb-4">Artisanal Journal</h4>
          <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
            Join our community for slow-living previews, new forever bloom drops, and exclusive offers.
          </p>
          {subscribed ? (
            <div className="flex items-center gap-2 text-black bg-white border border-gray-200 p-3 rounded-lg text-[11px] font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Welcome to the Rare You circle!</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="bg-white border border-gray-300 text-xs px-3 py-2.5 rounded-l-lg w-full focus:outline-none focus:border-black text-black"
                />
                <button
                  type="submit"
                  className="bg-black hover:bg-gray-800 text-white px-4 py-2.5 rounded-r-lg transition-colors cursor-pointer"
                  aria-label="Subscribe"
                >
                  <Mail className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-gray-400">We respect your privacy. No spam ever.</p>
            </form>
          )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 pt-8 mt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400 gap-4">
        <p>© 2026 RARE YOU LIFESTYLE. All rights reserved. Handcrafted with devotion in Faridabad, India.</p>
        <div className="flex items-center gap-4">
          <Link to="/our-story" className="hover:text-black">Privacy Policy</Link>
          <Link to="/our-story" className="hover:text-black">Terms of Service</Link>
          <Link to="/track" className="hover:text-black">Shipping Policy</Link>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
