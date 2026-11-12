import React, { useState } from 'react';
import { X, Sparkles, Mail, Lock, User, Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, loginDemo, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isRegistering) {
      const res = await register(email, password, fullName, phone);
      if (!res.success) {
        setError(res.error || 'Failed to create account');
      }
    } else {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || 'Invalid credentials');
      }
    }
    setLoading(false);
  };

  const handleDemoClick = async () => {
    setError(null);
    setLoading(true);
    const res = await loginDemo();
    if (!res.success) {
      setError(res.error || 'Demo login failed');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={closeAuthModal}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="w-full max-w-md transform overflow-hidden rounded-xl bg-white text-left align-middle shadow-2xl transition-all border border-[#E8E5DF] relative">
          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-1.5 text-[#716D68] hover:text-[#2C2A29] rounded-full hover:bg-[#FAF8F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="bg-[#FAF8F5] p-6 text-center border-b border-[#E8E5DF]">
            <span className="font-serif text-xl tracking-[0.2em] text-[#2C2A29] block">
              RARE YOU
            </span>
            <p className="text-xs text-[#716D68] mt-1 font-sans">
              Handcrafted Lifestyle • Member Portal
            </p>

            {/* Quick 1-Click Demo Login Button */}
            <div className="mt-4 pt-3 border-t border-[#E8E5DF]">
              <button
                type="button"
                onClick={handleDemoClick}
                disabled={loading}
                className="w-full bg-[#EFECE6] hover:bg-[#E8E5DF] text-[#4A5844] font-semibold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 border border-[#D8D3CA] transition-colors shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-[#C47D68]" />
                <span>⚡ Instant 1-Click Demo Login (Pooja Sharma)</span>
              </button>
              <p className="text-[10px] text-[#716D68] mt-1">
                Prefilled with verified orders, saved Faridabad address &amp; wishlist
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#E8E5DF] text-xs font-semibold">
            <button
              onClick={() => {
                setIsRegistering(false);
                setError(null);
              }}
              className={`flex-1 py-3 text-center transition-colors ${
                !isRegistering
                  ? 'text-[#4A5844] border-b-2 border-[#4A5844] bg-white'
                  : 'text-[#716D68] bg-[#FAF8F5]/60 hover:text-[#2C2A29]'
              }`}
            >
              SIGN IN
            </button>
            <button
              onClick={() => {
                setIsRegistering(true);
                setError(null);
              }}
              className={`flex-1 py-3 text-center transition-colors ${
                isRegistering
                  ? 'text-[#4A5844] border-b-2 border-[#4A5844] bg-white'
                  : 'text-[#716D68] bg-[#FAF8F5]/60 hover:text-[#2C2A29]'
              }`}
            >
              CREATE ACCOUNT
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {isRegistering && (
              <div>
                <label className="block text-xs font-medium text-[#2C2A29] mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#716D68] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pooja Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#E8E5DF] rounded-lg focus:outline-none focus:border-[#4A5844] text-[#2C2A29]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#2C2A29] mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#716D68] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="e.g. pooja@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#E8E5DF] rounded-lg focus:outline-none focus:border-[#4A5844] text-[#2C2A29]"
                />
              </div>
            </div>

            {isRegistering && (
              <div>
                <label className="block text-xs font-medium text-[#2C2A29] mb-1">
                  Mobile Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#716D68] absolute left-3 top-3" />
                  <input
                    type="tel"
                    placeholder="e.g. +91 98112 34567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#E8E5DF] rounded-lg focus:outline-none focus:border-[#4A5844] text-[#2C2A29]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#2C2A29] mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#716D68] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#E8E5DF] rounded-lg focus:outline-none focus:border-[#4A5844] text-[#2C2A29]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4A5844] hover:bg-[#374233] text-white py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50 mt-2"
            >
              {loading ? (
                'Processing...'
              ) : isRegistering ? (
                <>
                  Register Account <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

