import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ModeProvider } from './context/ModeContext';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Floors from './pages/Floors';
import FloorPage from './pages/FloorPage';
import PostPage from './pages/PostPage';
import SeveredFloor from './pages/SeveredFloor';
import Comeback from './pages/Comeback';
import Profile from './pages/Profile';
import Handbook from './pages/Handbook';
import Wellness from './pages/Wellness';
import NotFound from './pages/NotFound';

// AppRoutes with login wall temporarily commented out for full UI preview
function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/floors" element={<Floors />} />
        <Route path="/floors/:slug" element={<FloorPage />} />
        <Route path="/post/:id" element={<PostPage />} />
        <Route path="/severed-floor" element={<SeveredFloor />} />
        <Route path="/comeback" element={<Comeback />} />
        <Route path="/u/:username" element={<Profile />} />
        <Route path="/handbook" element={<Handbook />} />
        <Route path="/wellness" element={<Wellness />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      {/* Standalone auth pages accessible directly at /login and /register */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

// Root application component wrapped with Mode, Auth, and Router
export default function App() {
  return (
    <BrowserRouter>
      <ModeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ModeProvider>
    </BrowserRouter>
  );
}
