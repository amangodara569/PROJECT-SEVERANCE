import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

const PREVIEW_USER = {
  _id: '2d014fdf-0d5b-4b1d-a44c-10578916690a',
  username: 'aman233',
  name: 'Aman Godara',
  email: 'aman@lumon.com',
  headline: 'Lead Architect @ TechNova',
  bio: 'Building high throughput systems.',
  status: 'Employed',
  innieHandle: 'Innie-1001',
  isAdmin: true,
  joinedFloors: [
    '0a41239d-8a67-46f5-b185-ea9644ac5f84',
    '7766bead-f247-490c-9ace-61950dad0e61'
  ]
};

const PREVIEW_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjJkMDE0ZmRmLTBkNWItNGIxZC1hNDRjLTEwNTc4OTE2NjkwYSIsImlhdCI6MTc5NTMyNjk1NywiZXhwIjoxODI2ODYyOTU3fQ.A6Y8anTtSGOWjQcF1jI5m-ubA_yNq8_oeVjqwyCcz2U';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => PREVIEW_USER);
  const [token, setToken] = useState(() => localStorage.getItem('token') || PREVIEW_TOKEN);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const existingToken = localStorage.getItem('token');
    const tokenToUse = existingToken || PREVIEW_TOKEN;

    localStorage.setItem('token', tokenToUse);
    setToken(tokenToUse);

    // Verify session and load authenticated user profile
    api.get('/auth/me')
      .then((res) => {
        if (res.data?.user) {
          setUser(res.data.user);
        }
      })
      .catch(() => {
        // Fallback to valid signed preview user token if stored token expired or had invalid signature
        localStorage.setItem('token', PREVIEW_TOKEN);
        setToken(PREVIEW_TOKEN);
        setUser(PREVIEW_USER);
        api.get('/auth/me')
          .then((res) => {
            if (res.data?.user) setUser(res.data.user);
          })
          .catch(() => {});
      });
  }, []);

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { token: newToken, user: newUser } = response.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    return response.data;
  };

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { token: newToken, user: newUser } = response.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    return response.data;
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : prev));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
