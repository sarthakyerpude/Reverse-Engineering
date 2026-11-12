import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginDemo: () => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, fullName: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('rareyou_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Validate session on load
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('rareyou_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          setToken(storedToken);
        } else {
          localStorage.removeItem('rareyou_token');
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.error('Session check failed', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('rareyou_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setIsAuthModalOpen(false);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch {
      return { success: false, error: 'Network connection failed' };
    }
  };

  const loginDemo = async () => {
    return login('demo@rareyou.com', 'demo123');
  };

  const register = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName, phone })
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('rareyou_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setIsAuthModalOpen(false);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch {
      return { success: false, error: 'Network connection failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('rareyou_token');
    setUser(null);
    setToken(null);
  };

  const updateUser = (updated: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updated });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        login,
        loginDemo,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

