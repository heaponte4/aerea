import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';
import { authApi } from '../lib/api';
import API_CONFIG from '../lib/apiConfig';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, company?: string) => Promise<boolean>;
  signupPhotographer: (
    email: string,
    password: string,
    name: string,
    phone: string,
    bio: string,
    specialties: string[],
    travelFee: number
  ) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { user } = await authApi.login(email, password);
      setUser(user);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    company?: string
  ): Promise<boolean> => {
    try {
      const { user } = await authApi.signup({
        email,
        password,
        name,
        company,
        role: 'broker',
      });
      setUser(user);
      return true;
    } catch (error) {
      console.error('Signup failed:', error);
      return false;
    }
  };

  const signupPhotographer = async (
    email: string,
    password: string,
    name: string,
    phone: string,
    bio: string,
    specialties: string[],
    travelFee: number
  ): Promise<boolean> => {
    try {
      const { user } = await authApi.signup({
        email,
        password,
        name,
        phone,
        role: 'photographer',
      });
      
      // Store photographer-specific data
      if (API_CONFIG.USE_MOCK_DATA) {
        localStorage.setItem('photographerData', JSON.stringify({ bio, specialties, travelFee }));
      }
      
      setUser(user);
      return true;
    } catch (error) {
      console.error('Photographer signup failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  // Check for existing session on mount
  React.useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authApi.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, signupPhotographer, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
