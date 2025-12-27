import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authAPI } from './services/apiClient';
import useAuthStore from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreatePathway from './pages/CreatePathway';
import PathwayDetail from './pages/PathwayDetail';
import TopicDetail from './pages/TopicDetail';
import Quiz from './pages/Quiz';
import Landing from './pages/Landing';
import GoogleCallback from './pages/GoogleCallback';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EmailVerification from './pages/EmailVerification';

function App() {
  const setUser = useAuthStore((state) => state.setUser);
  const setInitialCheckDone = useAuthStore((state) => state.setInitialCheckDone);

  console.log("App Rendered. Current Path:", window.location.pathname);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        // First, try to verify/refresh token in case it expired
        try {
          await authAPI.verifyToken();
          console.log('[Auth] Token verified on app startup');
          // Update refresh timestamp since token is valid
          localStorage.setItem('refresh_timestamp', new Date().getTime().toString());
        } catch (verifyErr) {
          console.log('[Auth] Token verification failed, attempting refresh:', verifyErr.message);
          // Try to refresh if verify fails
          try {
            await authAPI.refreshToken();
            console.log('[Auth] Token refreshed on app startup');
            localStorage.setItem('refresh_timestamp', new Date().getTime().toString());
          } catch (refreshErr) {
            console.log('[Auth] Token refresh failed on startup');
            // Continue to next step - will treat as logged out
          }
        }

        // Now try to get current user (with potentially refreshed token)
        const user = await authAPI.getCurrentUser();
        if (mounted && user) {
          console.log('[Auth] User authenticated on startup:', user.email);
          setUser(user);
        }
      } catch (err) {
        console.log('[Auth] User not authenticated on startup');
        // User remains logged out
      } finally {
        if (mounted) {
          setInitialCheckDone(true);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [setUser, setInitialCheckDone]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />}  />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<GoogleCallback />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/auth/verify-email" element={<EmailVerification />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-pathway"
          element={
            <ProtectedRoute>
              <CreatePathway />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pathway/:pathwayId"
          element={
            <ProtectedRoute>
              <PathwayDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/topic/:topicId"
          element={
            <ProtectedRoute>
              <TopicDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/topic/:topicId/quiz"
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          }
        />

        {/* Default Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
