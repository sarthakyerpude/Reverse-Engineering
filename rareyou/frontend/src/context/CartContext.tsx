import React, { createContext, useContext, useState, useEffect, useCallback, useTransition } from 'react';
import type { CartSummary } from '../types';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartSummary;
  isCartOpen: boolean;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (
    productId: string,
    variantId?: string,
    quantity?: number,
    selectedSize?: string,
    customMeasurements?: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const emptyCart: CartSummary = {
  items: [],
  item_count: 0,
  subtotal: 0,
  shipping_fee: 0,
  free_shipping_threshold: 1499,
  is_free_shipping: false,
  free_shipping_remaining: 1499,
  free_shipping_progress: 0,
  total: 0
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [cart, setCart] = useState<CartSummary>(emptyCart);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  // Get or initialize persistent session ID for guest tracking
  const getSessionId = useCallback(() => {
    let sId = localStorage.getItem('rareyou_session_id');
    if (!sId) {
      sId = 'guest_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
      localStorage.setItem('rareyou_session_id', sId);
    }
    return sId;
  }, []);

  const getHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Session-Id': getSessionId()
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [token, getSessionId]);

  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart', {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success && data.cart) {
        startTransition(() => {
          setCart(data.cart);
        });
      }
    } catch (err) {
      console.error('Fetch cart failed', err);
    }
  }, [getHeaders]);

  // Load cart on start & whenever auth state changes (merge if logged in)
  useEffect(() => {
    const initOrMerge = async () => {
      setIsLoading(true);
      const sId = getSessionId();

      if (token && user) {
        // Trigger server merge
        try {
          await fetch('/api/cart/merge', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ session_id: sId })
          });
        } catch (err) {
          console.error('Cart merge error', err);
        }
      }

      await refreshCart();
      setIsLoading(false);
    };

    initOrMerge();
  }, [token, user, getSessionId, getHeaders, refreshCart]);

  const addToCart = async (
    productId: string,
    variantId?: string,
    quantity = 1,
    selectedSize?: string,
    customMeasurements?: string
  ) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          product_id: productId,
          variant_id: variantId,
          quantity,
          selected_size: selectedSize,
          custom_measurements: customMeasurements
        })
      });
      const data = await res.json();
      if (data.success && data.cart) {
        setCart(data.cart);
        setIsCartOpen(true); // Open drawer on add
        return { success: true };
      }
      return { success: false, error: data.error || 'Failed to add item' };
    } catch {
      return { success: false, error: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ quantity })
      });
      const data = await res.json();
      if (data.success && data.cart) {
        setCart(data.cart);
      }
    } catch (err) {
      console.error('Update qty failed', err);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success && data.cart) {
        setCart(data.cart);
      }
    } catch (err) {
      console.error('Remove item failed', err);
    }
  };

  const clearCart = async () => {
    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success && data.cart) {
        setCart(data.cart);
      }
    } catch (err) {
      console.error('Clear cart failed', err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        isLoading,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toggleCart: () => setIsCartOpen(prev => !prev),
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

