import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  role: 'author' | 'reader' | 'admin';
  isVerified: boolean;
  twoFactorEnabled: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needs2FA: boolean;
  tempToken: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; needs2FA?: boolean }>;
  register: (email: string, password: string, role: string) => Promise<{ success: boolean }>;
  verify2FA: (token: string, code: string) => Promise<{ success: boolean }>;
  setup2FA: () => Promise<{ qrCodeUrl: string; secret: string }>;
  verify2FASetup: (secret: string, code: string) => Promise<{ success: boolean }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [needs2FA, setNeeds2FA] = useState<boolean>(false);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data.user);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.needs2FA) {
        setNeeds2FA(true);
        setTempToken(response.data.tempToken);
        return { success: true, needs2FA: true };
      }
      
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false };
    }
  };

  const register = async (email: string, password: string, role: string) => {
    try {
      await api.post('/auth/register', { email, password, role });
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false };
    }
  };

  const verify2FA = async (token: string, code: string) => {
    try {
      const response = await api.post('/auth/2fa/verify', { token, code });
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
      setNeeds2FA(false);
      setTempToken(null);
      return { success: true };
    } catch (error) {
      console.error('2FA verification failed:', error);
      return { success: false };
    }
  };

  const setup2FA = async () => {
    try {
      const response = await api.post('/auth/2fa/enable');
      return { 
        qrCodeUrl: response.data.qrCodeUrl, 
        secret: response.data.secret 
      };
    } catch (error) {
      console.error('Failed to setup 2FA:', error);
      throw error;
    }
  };

  const verify2FASetup = async (secret: string, code: string) => {
    try {
      await api.post('/auth/2fa/verify-setup', { secret, code });
      // Update user data to reflect 2FA is now enabled
      if (user) {
        setUser({ ...user, twoFactorEnabled: true });
      }
      return { success: true };
    } catch (error) {
      console.error('Failed to verify 2FA setup:', error);
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    needs2FA,
    tempToken,
    login,
    register,
    verify2FA,
    setup2FA,
    verify2FASetup,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};