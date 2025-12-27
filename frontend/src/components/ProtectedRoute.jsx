import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitialCheckDone } = useAuthStore();
  const location = useLocation();
  const [showSessionExpired, setShowSessionExpired] = useState(false);

  useEffect(() => {
    // Check if redirected due to session expiry
    const params = new URLSearchParams(location.search);
    if (params.get('session_expired') === 'true') {
      setShowSessionExpired(true);
      // Clear the URL param
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Hide message after 5 seconds
      const timer = setTimeout(() => setShowSessionExpired(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.search]);

  if (!isInitialCheckDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {showSessionExpired && (
        <div className="fixed top-4 right-4 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg shadow-lg z-50">
          <p className="font-semibold">Session Expired</p>
          <p className="text-sm">Your session has expired. Please log in again.</p>
        </div>
      )}
      {children}
    </>
  );
};

export default ProtectedRoute;
