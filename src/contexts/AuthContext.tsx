import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, handleApiResponse } from '../api/client';

interface Benutzer {
  id: string;
  benutzername: string;
  anzeigename: string | null;
}

interface AuthContextType {
  benutzer: Benutzer | null;
  isLoading: boolean;
  login: (benutzername: string, passwort: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (benutzername: string, passwort: string, anzeigename?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [benutzer, setBenutzer] = useState<Benutzer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const response = await api.api.auth.me.$get();
      if (response.ok) {
        const data = await response.json();
        setBenutzer(data.benutzer);
      }
    } catch {
      setBenutzer(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (benutzername: string, passwort: string) => {
    const response = await api.api.auth.login.$post({
      json: { benutzername, passwort },
    });
    const data = await handleApiResponse<{ benutzer: Benutzer }>(response);
    setBenutzer(data.benutzer);
  };

  const logout = async () => {
    await api.api.auth.logout.$post();
    setBenutzer(null);
  };

  const register = async (benutzername: string, passwort: string, anzeigename?: string) => {
    await handleApiResponse(
      await api.api.auth.register.$post({
        json: { benutzername, passwort, anzeigename },
      })
    );
  };

  return (
    <AuthContext.Provider value={{ benutzer, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth muss innerhalb von AuthProvider verwendet werden');
  }
  return context;
};
