import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/apiClient';
import useAuthStore from '../store/authStore';
import axios from 'axios';
import { motion } from 'framer-motion';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuthStore();
  const hasCalled = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (hasCalled.current) return;
      hasCalled.current = true;

      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const state = params.get('state');

      if (!code || !state) {
        navigate('/login?error=invalid_callback');
        return;
      }

      try {
        const response = await axios.get('http://localhost:8000/auth/google/callback', {
          params: { code, state, redirect_url: "http://localhost:5173/auth/callback" },
          withCredentials: true 
        });

        if (response.data.access_token) {
          localStorage.setItem('access_token', response.data.access_token);
        }

        const user = await authAPI.getCurrentUser();
        setUser(user);
        
        // Short delay for a smooth visual exit
        setTimeout(() => navigate('/dashboard'), 600); 

      } catch (err) {
        navigate('/login?error=oauth_exchange_failed');
      }
    };

    handleCallback();
  }, [location, navigate, setUser]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center"
      >
        {/* Minimalist Progress Ring */}
        <div className="w-6 h-6 border-2 border-slate-100 border-t-slate-900 rounded-full animate-spin mb-6" />
        
        {/* Quiet Typography */}
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] ml-[0.3em]">
          Verifying
        </p>
      </motion.div>
    </div>
  );
};

export default GoogleCallback;