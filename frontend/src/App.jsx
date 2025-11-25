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

function App() {
  const { setUser } = useAuthStore();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const user = await authAPI.getCurrentUser();
          setUser(user);
        } catch (err) {
          console.error('Auth check failed:', err);
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
        }
      }
    };

    checkAuth();
  }, [setUser]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
