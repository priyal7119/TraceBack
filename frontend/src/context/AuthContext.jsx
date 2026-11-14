import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { mockCurrentUser, mockAdminUser } from '../data/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('traceback_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem('traceback_auth_user');
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Verify active session with backend via HTTP-only cookie on startup
  useEffect(() => {
    let isMounted = true;
    const verifySession = async () => {
      try {
        const response = await api.get('/auth/me');
        if (isMounted && response.data?.user) {
          setUser(response.data.user);
          localStorage.setItem('traceback_auth_user', JSON.stringify(response.data.user));
        }
      } catch (err) {
        // If 401 or network error and no local cache, clear user
        if (isMounted && (!user || err.response?.status === 401)) {
          // Keep existing cached profile for seamless offline preview unless 401
          if (err.response?.status === 401) {
            setUser(null);
            localStorage.removeItem('traceback_auth_user');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    verifySession();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('traceback_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('traceback_auth_user');
    }
  }, [user]);

  const login = async (email, password, role = 'user') => {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }

    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });

      if (response.data?.user) {
        const loggedUser = response.data.user;
        setUser(loggedUser);
        return loggedUser;
      }
      throw new Error(response.data?.message || 'Authentication failed.');
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Login failed. Please check your credentials.';
      throw new Error(errMsg);
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', {
        name: userData.fullName || userData.name || 'Campus Member',
        email: userData.email,
        password: userData.password || 'Password123!',
        department: userData.department || 'HAMC Campus Community',
        phone: userData.phone || '+91 98000 00000',
      });

      if (response.data?.user) {
        setUser(response.data.user);
        return response.data.user;
      }
      throw new Error(response.data?.message || 'Registration failed.');
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Registration failed.';
      throw new Error(errMsg);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    }
    setUser(null);
    // Clear all user-specific and cached state from localStorage
    localStorage.removeItem('traceback_auth_user');
    localStorage.removeItem('traceback_items');
    localStorage.removeItem('traceback_my_reports');
    localStorage.removeItem('traceback_matches');
    localStorage.removeItem('traceback_claims');
    localStorage.removeItem('traceback_disputes');
    localStorage.removeItem('traceback_notifications');
    localStorage.removeItem('traceback_users');
  };

  const updateProfile = async (updatedData) => {
    try {
      const response = await api.put('/users/profile', updatedData);
      if (response.data?.user) {
        setUser(response.data.user);
        return response.data.user;
      }
    } catch (e) {
      console.warn('Backend profile update failed. Updating local state.', e.message);
    }

    setUser(prev => ({
      ...prev,
      ...updatedData
    }));
  };

  const switchRole = async (newRole) => {
    if (newRole === 'admin') {
      await login('admin.hamc@traceback.org', 'AdminPassword123!', 'admin');
    } else {
      await login('aarav.sharma@campus.ves.ac.in', 'Password123!', 'user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        role: user?.role || 'guest',
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
        switchRole,
      }}
    >
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
