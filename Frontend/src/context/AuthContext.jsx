import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    // Reset toast state after 4 seconds
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Load user data on startup if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          fetchNotifications();
        } catch (err) {
          console.error('Failed to fetch user', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  // Poll notifications periodically when user is logged in
  useEffect(() => {
    let intervalId;
    if (token && user) {
      fetchNotifications();
      intervalId = setInterval(() => {
        fetchNotifications();
      }, 8000); // Poll every 8 seconds
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [token, user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/bookings/notifications/all');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err.message);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const register = async (name, email, password, role, phone) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password, role, phone });
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const verifyOtp = async (email, otp) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
      setLoading(false);
      return res;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const firebaseAdminLogin = async (email, name, uid) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/admin-firebase-login', { email, name, uid });
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setNotifications([]);
  };

  const updateProfile = async (formData) => {
    try {
      const res = await api.put('/auth/profile', formData);
      setUser(prev => ({ ...prev, ...res.data }));
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const toggleSavePG = async (pgId) => {
    try {
      const res = await api.post(`/pgs/${pgId}/save`);
      // Update local user object savedPGs list
      setUser(prev => {
        if (!prev) return null;
        const saved = [...(prev.savedPGs || [])];
        const exists = saved.some(p => (p._id || p) === pgId);
        let updatedSaved;
        if (exists) {
          updatedSaved = saved.filter(p => (p._id || p) !== pgId);
        } else {
          updatedSaved = [...saved, pgId];
        }
        return { ...prev, savedPGs: updatedSaved };
      });
      return res.message;
    } catch (err) {
      throw err;
    }
  };

  const markNotificationsRead = async () => {
    try {
      await api.put('/bookings/notifications/read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        notifications,
        showToast,
        login,
        register,
        verifyOtp,
        firebaseAdminLogin,
        logout,
        updateProfile,
        toggleSavePG,
        fetchNotifications,
        markNotificationsRead
      }}
    >
      {children}
      {toast && (
        <div className={`premium-toast-floating toast-${toast.type} animate-slide-down`}>
          <div className="toast-content d-flex align-items-center gap-2">
            <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};
