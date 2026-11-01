import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

// Default preview user to explore the full UI without a MongoDB login
const DEMO_USER = {
  _id: 'preview_123',
  username: 'mark_s',
  email: 'mark@lumon.com',
  headline: 'Macrodata Refinement Chief',
  status: 'Employed',
  innieHandle: 'Innie-4821',
  joinedFloors: []
};

// AuthProvider component to manage session state with preview support
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(DEMO_USER);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  // Attempt to load current user from /api/auth/me if a real token exists
  useEffect(() => {
    const loadUser = async () => {
      const savedToken = localStorage.getItem('token');
      if (!savedToken) return;

      try {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      } catch (error) {
        console.error('Session check failed, keeping preview user:', error.message);
      }
    };

    loadUser();
  }, []);

  // Register a new user and store the returned token
  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { token: newToken, user: newUser } = response.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    return response.data;
  };

  // Log in with email and password and store token
  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { token: newToken, user: newUser } = response.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    return response.data;
  };

  // Clear session data
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(DEMO_USER); // Revert to preview user
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
