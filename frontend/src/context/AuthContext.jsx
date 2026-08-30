import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: 'usr-demo-1',
    email: 'demo@omnibot.io',
    full_name: 'Alex Vance',
    business_name: 'Apex Digital Solutions',
    plan_tier: 'pro'
  });
  const [token, setToken] = useState(localStorage.getItem('omnibot_token') || 'demo-token');
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('omnibot_token', data.token);
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const logout = () => {
    setUser({
      id: 'usr-demo-1',
      email: 'demo@omnibot.io',
      full_name: 'Alex Vance',
      business_name: 'Apex Digital Solutions',
      plan_tier: 'pro'
    });
    setToken('demo-token');
    localStorage.removeItem('omnibot_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
