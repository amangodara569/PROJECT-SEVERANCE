import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

// Temporary preview user and valid token so user can browse the UI without logging in
const PREVIEW_USER = {
  _id: '88157f86-5db6-4dbe-8763-9ca9c3e92cb1',
  username: 'aman_test',
  email: 'aman@lumon.com',
  headline: 'Lead System Architect at TechNova',
  bio: 'Building distributed platforms. Pragmatic engineer.',
  status: 'Employed',
  innieHandle: 'Innie-1001',
  isAdmin: true,
  joinedFloors: []
};
const PREVIEW_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijg4MTU3Zjg2LTVkYjYtNGRiZS04NzYzLTljYTljM2U5MmNiMSIsImlhdCI6MTc5MzYzMDEyOSwiZXhwIjoxNzk2MjIyMTI5fQ.R_87D9W5A8rCkZga8_WAJonLxVVA3nolEk4WjNU48c0';

// AuthProvider manages user authentication state
export const AuthProvider = ({ children }) => {
  // Login bypassed for UI preview
  const [user, setUser] = useState(() => PREVIEW_USER);
  const [token, setToken] = useState(() => localStorage.getItem('token') || PREVIEW_TOKEN);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      localStorage.setItem('token', PREVIEW_TOKEN);
    }
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

  // Clear session data and log out
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
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
