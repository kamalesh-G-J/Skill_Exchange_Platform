import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      // Listen for unauth events triggered from interceptor
      const handleUnauthorized = () => {
        setToken(null);
        setUser(null);
      };
      window.addEventListener('auth-unauthorized', handleUnauthorized);

      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/api/users/me');
        setUser(data);
      } catch {
        handleUnauthorized();
      } finally {
        setLoading(false);
      }

      return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
    restoreSession();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/api/auth/register', { name, email, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
