"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Check if mock API is enabled
  const isMockApiEnabled = process.env.NEXT_PUBLIC_APP_MOCK_API === 'true';

  // Mock API calls - replace with actual API endpoints
  const mockLogin = async (email: string, password: string): Promise<{ user: User; token: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Only allow demo account when mock API is enabled
    if (isMockApiEnabled && email === "test@example.com" && password === "password123") {
      const user = { id: "1", name: "John Doe", email: "test@example.com" };
      const token = "mock-jwt-token-" + Date.now();
      return { user, token };
    }
    
    // If mock API is disabled, this should call your real API
    if (!isMockApiEnabled) {
      // TODO: Replace with actual API call to your authentication endpoint
      // Example:
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });
      // if (!response.ok) throw new Error('Authentication failed');
      // return await response.json();
      
      throw new Error("Authentication API not implemented yet");
    }
    
    throw new Error("Invalid email or password");
  };

  const mockRegister = async (name: string, email: string, password: string): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Only allow demo registration when mock API is enabled
    if (isMockApiEnabled && email && password && name) {
      // Registration successful
      return;
    }
    
    // If mock API is disabled, this should call your real API
    if (!isMockApiEnabled) {
      // TODO: Replace with actual API call to your registration endpoint
      // Example:
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, email, password })
      // });
      // if (!response.ok) throw new Error('Registration failed');
      // return;
      
      throw new Error("Registration API not implemented yet");
    }
    
    throw new Error("Registration failed");
  };

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user, token } = await mockLogin(email, password);
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      await mockRegister(name, email, password);
      // Registration successful - redirect to login will be handled by the component
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
    
    // Redirect to login
    router.push('/login');
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};