import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('job_portal_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('job_portal_token') || null);
  const [loading, setLoading] = useState(false);

  // Theme state: dark / light
  const [theme, setTheme] = useState(() => localStorage.getItem('job_portal_theme') || 'light');

  // Saved job IDs for bookmark tracking
  const [savedJobIds, setSavedJobIds] = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('job_portal_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem('job_portal_token', token);
    } else {
      localStorage.removeItem('job_portal_token');
    }

    if (user) {
      localStorage.setItem('job_portal_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('job_portal_user');
    }
  }, [user, token]);

  // Fetch saved job IDs when candidate logs in
  const fetchSavedJobIds = async () => {
    if (!token || user?.role !== 'candidate') {
      setSavedJobIds([]);
      return;
    }
    try {
      const res = await fetch('/api/profile/saved-job-ids', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setSavedJobIds(data);
      }
    } catch (e) {
      console.error('Failed to fetch saved job ids', e);
    }
  };

  useEffect(() => {
    fetchSavedJobIds();
  }, [user, token]);

  const toggleSaveJob = async (jobId) => {
    if (!token || user?.role !== 'candidate') {
      return { success: false, requireLogin: true };
    }

    try {
      const res = await fetch(`/api/profile/saved-jobs/${jobId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        if (data.saved) {
          setSavedJobIds(prev => [...prev, jobId]);
        } else {
          setSavedJobIds(prev => prev.filter(id => id !== jobId));
        }
        return { success: true, saved: data.saved, message: data.message };
      }
      return { success: false, message: data.error };
    } catch (e) {
      return { success: false, message: 'Failed to bookmark job' };
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to login');

      setUser(data.user);
      setToken(data.token);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setUser(data.user);
      setToken(data.token);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setSavedJobIds([]);
    localStorage.removeItem('job_portal_token');
    localStorage.removeItem('job_portal_user');
  };

  const quickLoginAs = async (role) => {
    if (role === 'admin') {
      return await login('admin321@admin.com', 'admin@321');
    } else if (role === 'recruiter') {
      return await login('recruiter@techcorp.com', 'recruiter123');
    } else if (role === 'candidate') {
      return await login('candidate@example.com', 'candidate123');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      role: user?.role,
      login,
      register,
      logout,
      quickLoginAs,
      loading,
      theme,
      toggleTheme,
      savedJobIds,
      toggleSaveJob,
      refreshSavedJobs: fetchSavedJobIds
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
