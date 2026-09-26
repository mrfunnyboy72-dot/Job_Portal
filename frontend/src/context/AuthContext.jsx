import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('job_portal_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('job_portal_token') || null);
  const [loading, setLoading] = useState(false);

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
    localStorage.removeItem('job_portal_token');
    localStorage.removeItem('job_portal_user');
  };

  // Quick switch between demo accounts for testing without typing credentials
  const quickLoginAs = async (role) => {
    if (role === 'admin') {
      return await login('admin@jobportal.com', 'admin123');
    } else if (role === 'recruiter') {
      return await login('recruiter@techcorp.com', 'recruiter123');
    } else if (role === 'candidate') {
      return await login('candidate@example.com', 'candidate123');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, role: user?.role, login, register, logout, quickLoginAs, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
