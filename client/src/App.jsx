import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import ReviewQueue from './pages/ReviewQueue';
import NotFound from './pages/NotFound';

// Inner router handling public and protected routes
function AppRoutes() {
  const { user, loading } = useAuth();

  // Show muted text loading indicator while session initializes
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center font-mono text-sm"
        style={{ backgroundColor: 'var(--bg)', color: 'var(--muted)' }}
      >
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      {user ? (
        <>
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
            <Route path="/review" element={user.isAdmin ? <ReviewQueue /> : <Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
    </Routes>
  );
}

// Root application component wrapped with Mode, Auth, and Router providers
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
