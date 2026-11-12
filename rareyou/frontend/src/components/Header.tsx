import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, User as UserIcon, Search, Menu, X, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, openCart } = useCart();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [logoImgFailed, setLogoImgFailed] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/collections?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Exact 5 collection nav links from real rareyou.com
  const navLinks = [
    { label: 'Forever Flowers', to: '/collections/forever-flower', pathMatch: 'flower' },
    { label: 'Home Decor', to: '/collections/home-decor', pathMatch: 'home-decor' },
    { label: 'Accessories', to: '/collections/accessories', pathMatch: 'accessories' },
    { label: 'Clothing', to: '/collections/clothing', pathMatch: 'clothing' },
    { label: 'Kids', to: '/collections/swings', pathMatch: 'swings' }
  ];

  // Helper to determine exact active link styling matching screenshot 6
  const isLinkActive = (item: { to: string; pathMatch: string }) => {
    return location.pathname.includes(item.pathMatch);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#F0ECE9] transition-all font-sans">
      {/* Top Announcement Bar (Soft blush pink with Blinkit message) */}
      <div className="bg-[#FCEAE6] text-black text-[13px] py-2 px-4 font-normal tracking-wide text-center flex items-center justify-center select-none">
        <div className="flex items-center gap-3">
          <ChevronLeft className="w-4 h-4 text-gray-700 cursor-pointer hover:text-black" />
          <span className="font-normal text-[#121212]">
            Also available on Blinkit in Delhi NCR
          </span>
          <ChevronRight className="w-4 h-4 text-gray-700 cursor-pointer hover:text-black" />
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
        {/* Mobile Menu Button */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-black hover:text-gray-600 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 stroke-[1.5]" /> : <Menu className="w-6 h-6 stroke-[1.5]" />}
          </button>
        </div>

        {/* Brand Logo: RARE ❤ YOU */}
        <div className="flex items-center">
          <Link to="/" className="inline-flex items-center group">
            {!logoImgFailed ? (
              <img
                src="/images/rareyou-logo.png"
                alt="RARE YOU"
                className="h-6 sm:h-7 w-auto object-contain"
                onError={() => setLogoImgFailed(true)}
              />
            ) : (
              <span className="text-xl sm:text-2xl font-normal tracking-[0.2em] text-[#121212] flex items-center">
                RARE
                <Heart className="w-3.5 h-3.5 mx-1.5 text-[#E63946] fill-[#E63946]" />
                YOU
              </span>
            )}
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-8 text-[14px] text-[#121212]">
          {navLinks.map((link) => {
            const active = isLinkActive(link);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`py-1 transition-all hover:text-black relative ${
                  active
                    ? 'font-medium text-black border-b-[1.5px] border-black pb-0.5'
                    : 'text-[#444444] font-normal'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons: Search, User, Bag */}
        <div className="flex items-center space-x-3 sm:space-x-5 text-black">
          {/* Search Toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-1.5 text-black hover:text-gray-600 transition-colors"
            title="Search Products"
            aria-label="Search"
          >
            <Search className="w-5 h-5 stroke-[1.5]" />
          </button>

          {/* User Account / Auth Trigger */}
          <div className="relative">
            {isAuthenticated ? (
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center p-1.5 text-black hover:text-gray-600 transition-colors"
                title="Account"
                aria-label="Account"
              >
                <UserIcon className="w-5 h-5 stroke-[1.5]" />
              </button>
            ) : (
              <button
                onClick={openAuthModal}
                className="p-1.5 text-black hover:text-gray-600 transition-colors"
                title="Sign In"
                aria-label="Sign In"
              >
                <UserIcon className="w-5 h-5 stroke-[1.5]" />
              </button>
            )}

            {/* User Dropdown Menu */}
            {userDropdownOpen && isAuthenticated && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 text-xs">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="font-semibold text-gray-900 truncate">{user?.full_name}</p>
                  <p className="text-gray-500 truncate text-[11px]">{user?.email}</p>
                </div>
                <Link
                  to="/account"
                  onClick={() => setUserDropdownOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 font-normal"
                >
                  My Orders &amp; Addresses
                </Link>
                <Link
                  to="/track"
                  onClick={() => setUserDropdownOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 font-normal"
                >
                  Track Shipment
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 font-normal border-t border-gray-100"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Shopping Bag Drawer Trigger */}
          <button
            onClick={openCart}
            className="relative p-1.5 text-black hover:text-gray-600 transition-colors"
            title="Shopping Bag"
            aria-label="Bag"
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
            {cart.item_count > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-semibold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {cart.item_count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Search Drawer */}
      {searchOpen && (
        <div className="border-t border-[#F0ECE9] bg-[#FAF8F5] px-4 py-3 sm:px-6">
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-400 stroke-[1.5]" />
            <input
              type="text"
              placeholder="Search forever flowers, sunflower ties, macrame swings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-sm text-[#121212] focus:outline-none placeholder-gray-400"
              autoFocus
            />
            <button
              type="submit"
              className="bg-black hover:bg-gray-800 text-white text-xs px-4 py-2 rounded font-medium transition-colors"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="p-1 text-gray-400 hover:text-black"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#F0ECE9] bg-white px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => {
            const active = isLinkActive(link);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2.5 text-sm tracking-wide transition-colors ${
                  active ? 'text-black font-semibold pl-2 border-l-2 border-black' : 'text-gray-700'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {!isAuthenticated ? (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openAuthModal();
              }}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-black text-white text-xs font-semibold py-2.5 rounded"
            >
              Sign In / Register
            </button>
          ) : (
            <div className="pt-2 border-t border-gray-100">
              <Link
                to="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-gray-800"
              >
                My Account ({user?.full_name})
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-red-600 font-medium py-2"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
export default Header;
