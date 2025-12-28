import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authAPI } from './services/apiClient';
import useAuthStore from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';

// --- OPTIMIZED: Lazy Loading Pages ---
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CreatePathway = lazy(() => import('./pages/CreatePathway'));
const PathwayDetail = lazy(() => import('./pages/PathwayDetail'));
const TopicDetail = lazy(() => import('./pages/TopicDetail'));
const Quiz = lazy(() => import('./pages/Quiz'));
const GoogleCallback = lazy(() => import('./pages/GoogleCallback'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const EmailVerification = lazy(() => import('./pages/EmailVerification'));

// Simple Loading Component
const PageLoader = () => (
  <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
    Loading...
  </div>
);

function App() {
  const setUser = useAuthStore((state) => state.setUser);
  const setInitialCheckDone = useAuthStore((state) => state.setInitialCheckDone);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        // Optimization: Just call getCurrentUser. 
        // If your backend handles token refresh via cookies/middleware, 
        // you don't need 3 separate calls on every load.
        const user = await authAPI.getCurrentUser();
        if (mounted && user) {
          setUser(user);
        }
      } catch (err) {
        console.log('[Auth] Session not found');
      } finally {
        if (mounted) setInitialCheckDone(true);
      }
    };

    checkAuth();
    return () => { mounted = false; };
  }, [setUser, setInitialCheckDone]);

  return (
    <BrowserRouter>
      {/* Suspense is required for lazy loading */}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<GoogleCallback />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/auth/verify-email" element={<EmailVerification />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/create-pathway" element={<ProtectedRoute><CreatePathway /></ProtectedRoute>} />
          <Route path="/pathway/:pathwayId" element={<ProtectedRoute><PathwayDetail /></ProtectedRoute>} />
          <Route path="/topic/:topicId" element={<ProtectedRoute><TopicDetail /></ProtectedRoute>} />
          <Route path="/topic/:topicId/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;