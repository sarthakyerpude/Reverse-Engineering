import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Phone, CheckSquare, Square, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('demo@infyshopy.in');
  const [password, setPassword] = useState('demo12345');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['saree', 'kurti']);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const categoryOptions = [
    { id: 'saree', label: 'Saree' },
    { id: 'kurti', label: 'Kurti' },
    { id: 'western', label: 'Western Wear' },
    { id: 'jewellery', label: 'Jewellery' },
    { id: 'home', label: 'Home & Living' },
    { id: 'footwear', label: 'Footwear' }
  ];

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.ok) {
      navigate(from, { replace: true });
    } else {
      setError(res.error || 'Failed to sign in');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await register({
      email,
      password,
      name: fullName,
      phone,
      countryCode,
      categories: selectedCategories
    });
    setLoading(false);

    if (res.ok) {
      navigate('/', { replace: true });
    } else {
      setError(res.error || 'Failed to create account');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eeeaff] via-[#f7f9ff] to-[#e8f6ff] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[#e2e8e5] rounded-2xl shadow-xl overflow-hidden">
        {/* Brand Header Banner */}
        <div className="bg-[#143e32] p-8 text-center text-white relative">
          <div className="text-3xl font-black tracking-tight flex items-center justify-center gap-1.5">
            <span>INFY</span>
            <span className="text-[#c6dc9b]">SHOPY</span>
          </div>
          <div className="text-[10px] tracking-[3px] uppercase text-[#a0bcaa] font-semibold mt-1">
            Marketplace Listing Studio
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-[#ffffff15] rounded-full text-xs text-[#c6dc9b] font-medium border border-[#ffffff15]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Portal B2B Catalog Automation</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#e2e8e5] bg-[#f9fafb]">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`flex-1 py-3 text-xs font-bold transition-all cursor-pointer ${
              mode === 'signin'
                ? 'text-[#143e32] border-b-2 border-[#143e32] bg-white'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-3 text-xs font-bold transition-all cursor-pointer ${
              mode === 'signup'
                ? 'text-[#143e32] border-b-2 border-[#143e32] bg-white'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Create Seller Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#243b32] mb-1">Seller Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="demo@infyshopy.in"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#cdd8d2] rounded-lg focus:outline-none focus:border-[#143e32]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#243b32] mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#cdd8d2] rounded-lg focus:outline-none focus:border-[#143e32]"
                  />
                </div>
              </div>

              {/* Prefill helper */}
              <div className="p-2.5 bg-[#eff5e7] border border-[#d5e3c7] rounded-lg text-[11px] text-[#3b6329] flex items-center justify-between">
                <div>
                  <span className="font-bold">Demo Account: </span>
                  <span>demo@infyshopy.in (20 Credits)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('demo@infyshopy.in');
                    setPassword('demo12345');
                  }}
                  className="underline font-bold hover:text-[#143e32] cursor-pointer"
                >
                  Use
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#143e32] text-white rounded-lg text-xs font-bold hover:bg-[#1a4f40] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Studio'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#243b32] mb-1">Full Name / Business Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Aman Malik"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#cdd8d2] rounded-lg focus:outline-none focus:border-[#143e32]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#243b32] mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seller@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#cdd8d2] rounded-lg focus:outline-none focus:border-[#143e32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#243b32] mb-1">Code</label>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full px-2 py-2 text-xs border border-[#cdd8d2] rounded-lg focus:outline-none focus:border-[#143e32] bg-white"
                  >
                    <option value="+91">+91 (IN)</option>
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+971">+971 (UAE)</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-[#243b32] mb-1">Mobile Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-[#cdd8d2] rounded-lg focus:outline-none focus:border-[#143e32]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#243b32] mb-1">Create Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#cdd8d2] rounded-lg focus:outline-none focus:border-[#143e32]"
                  />
                </div>
              </div>

              {/* Categories selection */}
              <div>
                <label className="block text-xs font-semibold text-[#243b32] mb-1.5">
                  Select Your Product Categories
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {categoryOptions.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#143e32] bg-[#f0f6f3] text-[#143e32] font-semibold'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-3.5 h-3.5 text-[#143e32]" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-gray-300" />
                        )}
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#143e32] text-white rounded-lg text-xs font-bold hover:bg-[#1a4f40] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs mt-2"
              >
                <span>{loading ? 'Creating Account...' : 'Register & Claim 20 Free Credits'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Security badge footer */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit Encrypted Session · Same-Origin CSRF Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

