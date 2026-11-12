import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { WhatsAppWidget } from './components/WhatsAppWidget';

import { HomePage } from './pages/HomePage';
import { CollectionsPage } from './pages/CollectionsPage';
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { AccountPage } from './pages/AccountPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { OurStoryPage } from './pages/OurStoryPage';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// 404 Component
function NotFoundPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
      <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-gray-400 block">
        ERROR 404
      </span>
      <h1 className="text-3xl sm:text-4xl font-normal text-[#121212]">
        Page Not Found
      </h1>
      <p className="text-xs text-gray-500 max-w-sm mx-auto">
        The destination you entered could not be found. Explore our collections or return to the homepage.
      </p>
      <div className="pt-2">
        <Link
          to="/"
          className="inline-block bg-black hover:bg-gray-800 text-white text-xs font-medium px-6 py-3 rounded-full tracking-wider uppercase transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen bg-white text-[#121212] font-sans antialiased">
            <Header />

            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/collections" element={<CollectionsPage />} />
                <Route path="/collections/:categoryParam" element={<CollectionsPage />} />
                <Route path="/collections.html" element={<CollectionsPage />} />
                {/* Support both /products/:handle (Shopify format) and /product/:handle */}
                <Route path="/products/:handle" element={<ProductPage />} />
                <Route path="/product/:handle" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success/:orderNumber" element={<OrderSuccessPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/track" element={<TrackOrderPage />} />
                <Route path="/our-story" element={<OurStoryPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>

            <Footer />

            {/* Global Overlays & Widgets */}
            <CartDrawer />
            <AuthModal />
            <WhatsAppWidget />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
