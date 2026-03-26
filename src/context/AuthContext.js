import { createContext, useContext, useMemo, useState } from 'react';
import { AUTH_STORAGE_KEY } from '../api/axiosClient';

const AuthContext = createContext(null);

function normalizeAuth(payload) {
  if (!payload) {
    return null;
  }

  return {
    token: payload.token,
    userId: payload.userId,
    name: payload.name,
    email: payload.email,
    role: payload.role,
  };
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const login = (payload) => {
    const next = normalizeAuth(payload);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
    setAuth(next);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth(null);
  };

  const value = useMemo(() => ({
    auth,
    isAuthenticated: !!auth?.token,
    login,
    logout,
  }), [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
