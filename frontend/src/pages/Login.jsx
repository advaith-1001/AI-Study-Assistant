import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/apiClient';
import useAuthStore from '../store/authStore';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const handleGoogleLogin = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const response = await fetch('http://localhost:8000/auth/google/authorize');
      const data = await response.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      }
    } catch (err) {
      console.error("OAuth Error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      await authAPI.login(email, password);
      const user = await authAPI.getCurrentUser();
      setUser(user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.status === 422 ? 'Invalid credentials' : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC] selection:bg-blue-100 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[440px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-10 md:p-12 border border-slate-100/50"
      >
        <header className="text-center mb-10">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-6 shadow-lg shadow-blue-200">
            S
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome Back</h2>
          <p className="text-slate-400 font-medium">Resume your personalized learning path.</p>
        </header>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 py-4 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all mb-8 active:scale-[0.98]"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          Continue with Google
        </button>

        <div className="relative flex items-center mb-8">
          <div className="flex-grow border-t border-slate-100"></div>
          <span className="flex-shrink mx-4 text-slate-300 text-[10px] uppercase tracking-[0.2em] font-black">Secure Login</span>
          <div className="flex-grow border-t border-slate-100"></div>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-black uppercase tracking-widest rounded-2xl border border-red-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600/10 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-300"
              placeholder="name@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600/10 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-300"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="mt-2 text-sm text-blue-600 font-bold hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-2xl shadow-slate-200 hover:bg-blue-600 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? 'Authenticating...' : 'Sign In →'}
          </button>
        </form>

        <p className="text-center text-sm font-medium text-slate-400 mt-10">
          New to StudyFlow?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-blue-600 hover:underline font-black"
          >
            Create Account
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;