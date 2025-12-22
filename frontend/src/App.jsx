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

function App() {
 const setUser = useAuthStore((state) => state.setUser);
  const setInitialCheckDone = useAuthStore((state) => state.setInitialCheckDone);

 const isChecking = React.useRef(false);

 console.log("App Rendered. Current Path:", window.location.pathname);

useEffect(() => {
  let mounted = true;

  const checkAuth = async () => {
    try {
      const user = await authAPI.getCurrentUser();
      if (mounted && user) {
        setUser(user);
      }
    } catch (err) {
      // ignore 401
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
}, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />}  />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<GoogleCallback />} />

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
