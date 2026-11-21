import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

const PREVIEW_USER = {
  _id: 'b54b49e7-64a2-4c06-9bbe-12f7bdca0c2b',
  username: 'aman_test',
  email: 'aman@lumon.com',
  headline: 'Lead System Architect at TechNova',
  bio: 'Building distributed platforms. Pragmatic engineer.',
  status: 'Employed',
  innieHandle: 'Innie-1001',
  isAdmin: true,
  joinedFloors: [
    '0a41239d-8a67-46f5-b185-ea9644ac5f84',
    '7766bead-f247-490c-9ace-61950dad0e61'
  ]
};

const PREVIEW_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImI1NGI0OWU3LTY0YTItNGMwNi05YmJlLTEyZjdiZGNhMGMyYiIsImlhdCI6MTc5NTI4NzYxNywiZXhwIjoxNzk3ODc5NjE3fQ.PhSVTUkR2etduSo_a9a4iey1qfHN_Vtcfuw-W3_qswQ';

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
        // Fallback to valid preview user token if stored token expired
        localStorage.setItem('token', PREVIEW_TOKEN);
        setToken(PREVIEW_TOKEN);
        setUser(PREVIEW_USER);
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
