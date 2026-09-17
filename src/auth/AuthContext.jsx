import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
const TOKEN_KEY = 'vedikshaya_token';
const USER_KEY = 'vedikshaya_user';

// The free-tier backend sleeps after ~15 min idle; the very first request
// after that often aborts or drops outright while it wakes up, even though a
// near-immediate retry succeeds. One silent retry here turns that into a
// slightly slower login instead of a confusing "stuck on the login page".
async function request(path, body, attempt = 0) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || 'Something went wrong. Please try again.');
    }
    return data;
  } catch (err) {
    clearTimeout(timer);
    if (attempt === 0 && (err.name === 'AbortError' || err instanceof TypeError)) {
      return request(path, body, 1);
    }
    if (err.name === 'AbortError') {
      throw new Error('The server is taking a while to wake up. Please try again in a moment.');
    }
    throw err;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  const login = async (email, password) => {
    const data = await request('/auth/login', { email, password });
    setToken(data.access_token);
    setUser(data.user);
    return data;
  };

  const signup = async (name, email, password) => {
    const data = await request('/auth/signup', { name, email, password });
    setToken(data.access_token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ token, user, isAuthenticated: Boolean(token), login, signup, logout }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
