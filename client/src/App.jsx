import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ModeProvider } from './context/ModeContext';
import AppLayout from './components/AppLayout';

// Code-split all page components with React.lazy
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Home = lazy(() => import('./pages/Home'));
const Floors = lazy(() => import('./pages/Floors'));
const FloorPage = lazy(() => import('./pages/FloorPage'));
const PostPage = lazy(() => import('./pages/PostPage'));
const SeveredFloor = lazy(() => import('./pages/SeveredFloor'));
const Comeback = lazy(() => import('./pages/Comeback'));
const Profile = lazy(() => import('./pages/Profile'));
const EditProfile = lazy(() => import('./pages/EditProfile'));
const Handbook = lazy(() => import('./pages/Handbook'));
const Wellness = lazy(() => import('./pages/Wellness'));
const Saved = lazy(() => import('./pages/Saved'));
const ReviewQueue = lazy(() => import('./pages/ReviewQueue'));
const NotFound = lazy(() => import('./pages/NotFound'));

function RouteLoading() {
  return (
    <div
      className="min-h-[50vh] flex items-center justify-center font-mono text-xs text-[var(--color-text-muted)]"
    >
      Loading transmission...
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center font-mono text-sm bg-[var(--color-bg-canvas)] text-[var(--color-text-muted)]"
      >
        Loading...
      </div>
    );
  }

  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        {user ? (
          <>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/floors" element={<Floors />} />
              <Route path="/floors/:slug" element={<FloorPage />} />
              <Route path="/post/:id" element={<PostPage />} />
              <Route path="/posts/:id" element={<PostPage />} />
              <Route path="/severed-floor" element={<SeveredFloor />} />
              <Route path="/comeback" element={<Comeback />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<Profile />} />
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
    </Suspense>
  );
}

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