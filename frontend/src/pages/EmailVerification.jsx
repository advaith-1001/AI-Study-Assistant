import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/apiClient';
import { motion } from 'framer-motion';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        setLoading(true);
        const token = searchParams.get('token');

        if (!token) {
          setError('No verification token provided');
          return;
        }

        // Attempt verification (assuming a verify email endpoint exists)
        // For now, we'll assume the endpoint exists in the backend
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/verify-email?token=${token}`,
          {
            method: 'POST',
            credentials: 'include'
          }
        );

        if (response.ok) {
          setVerified(true);
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else {
          const data = await response.json();
          setError(data.detail || 'Email verification failed. Token may have expired.');
        }
      } catch (err) {
        setError('An error occurred during email verification. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC] selection:bg-blue-100 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-[440px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-10 md:p-12 border border-slate-100/50"
      >
        <header className="text-center mb-10">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-6 shadow-lg shadow-blue-200">
            S
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            Email Verification
          </h2>
          <p className="text-slate-400 font-medium">
            {loading
              ? 'Verifying your email address...'
              : verified
              ? 'Email verified successfully!'
              : 'Email verification failed'}
          </p>
        </header>

        {loading && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" />
            </div>
            <p className="text-slate-600 font-medium">Please wait...</p>
          </motion.div>
        )}

        {!loading && verified && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="p-8 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="text-6xl mb-4"
              >
                ✓
              </motion.div>
              <h3 className="font-black text-emerald-900 text-xl mb-2">
                Email Verified
              </h3>
              <p className="text-sm text-emerald-700">
                Your email address has been verified successfully. Redirecting
                to dashboard...
              </p>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-[0.98]"
            >
              Go to Dashboard
            </button>
          </motion.div>
        )}

        {!loading && !verified && error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="p-6 bg-red-50 rounded-2xl border border-red-200">
              <div className="flex items-start gap-3">
                <div className="text-2xl">✕</div>
                <div>
                  <h3 className="font-black text-red-900 mb-1">
                    Verification Failed
                  </h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-[0.98]"
            >
              Return to Login
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default EmailVerification;
