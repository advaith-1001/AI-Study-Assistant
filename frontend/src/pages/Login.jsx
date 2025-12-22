import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/apiClient';
import useAuthStore from '../store/authStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

const handleGoogleLogin = async (e) => {
  // 1. Stop everything immediately
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  try {
    // 2. Fetch the JSON boarding pass
    const response = await fetch('http://localhost:8000/auth/google/authorize');
    const data = await response.json();

    if (data.authorization_url) {
      // 3. THE FIX: Create a physical 'a' tag in memory
      const link = document.createElement('a');
      link.href = data.authorization_url;
      
      // Force it to open in the same tab
      link.target = '_self'; 
      
      // 4. Trigger the click and clean up
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (err) {
    console.error("OAuth Error:", err);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    try {
      setLoading(true);
      await authAPI.login(email, password);
      
      // Get current user data
      const user = await authAPI.getCurrentUser();
      setUser(user);
      
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 
                      (err.response?.status === 422 ? 'Invalid email or password' : 'Login failed');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 selection:bg-blue-100">
  <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
    <h2 className="text-3xl font-extrabold text-center mb-2 text-slate-900">Welcome Back</h2>
    <p className="text-slate-500 text-center mb-8">Sign in to resume your learning path</p>

    {/* GOOGLE LOGIN BUTTON */}
    <button
      onClick={handleGoogleLogin}
      className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 py-3 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-all mb-6"
    >
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
      Continue with Google
    </button>

    <div className="relative flex items-center mb-6">
      <div className="flex-grow border-t border-slate-100"></div>
      <span className="flex-shrink mx-4 text-slate-400 text-xs uppercase tracking-widest font-bold">or use email</span>
      <div className="flex-grow border-t border-slate-100"></div>
    </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-blue-500 hover:underline font-semibold"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
