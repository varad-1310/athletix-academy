import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('athletix_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('athletix_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('athletix_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Session expired or invalid', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token, user: userData } = res.data;
      localStorage.setItem('athletix_token', token);
      localStorage.setItem('athletix_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const logout = () => {
    localStorage.removeItem('athletix_token');
    localStorage.removeItem('athletix_user');
    setUser(null);
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const isAcademyAdmin = user?.role === 'academy_admin';
  const isCoach = user?.role === 'coach';
  const isAdmin = isSuperAdmin || isAcademyAdmin;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isSuperAdmin,
      isAcademyAdmin,
      isCoach,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
