import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/apiClient';
import { motion } from 'framer-motion';

const ResetPassword = () => {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  const navigate = useNavigate();

  const handleVerifyToken = async () => {
    if (!token.trim()) {
      setError('Please enter the reset token');
      return;
    }

    try {
      setLoading(true);
      const result = await authAPI.verifyResetToken(token);
      if (result.valid) {
        setTokenValid(true);
        setError('');
      }
    } catch (err) {
      setError('Invalid or expired reset token');
      setTokenValid(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token.trim()) {
      setError('Reset token is required');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('Please enter and confirm your new password');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      await authAPI.resetPassword(token, newPassword);
      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setToken('');
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Failed to reset password. Token may have expired.'
      );
      setTokenValid(false);
    } finally {
      setLoading(false);
    }
  };

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
            Create New Password
          </h2>
          <p className="text-slate-400 font-medium">
            Enter the reset token and your new password.
          </p>
        </header>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200">
              <div className="flex items-start gap-3">
                <div className="text-2xl">✓</div>
                <div>
                  <h3 className="font-black text-emerald-900 mb-1">
                    Password Reset Successfully
                  </h3>
                  <p className="text-sm text-emerald-700">
                    Your password has been reset. You can now sign in with your
                    new password.
                  </p>
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
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-red-50 text-red-600 text-xs font-black uppercase tracking-widest rounded-2xl border border-red-100 flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                {error}
              </motion.div>
            )}

            {/* Token Input Section */}
            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">
                Reset Token
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value);
                    setTokenValid(null);
                  }}
                  placeholder="Enter token from email"
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-slate-900 placeholder-slate-400 disabled:bg-slate-50"
                  disabled={loading || tokenValid}
                />
                {tokenValid === null && (
                  <button
                    type="button"
                    onClick={handleVerifyToken}
                    disabled={loading || !token.trim()}
                    className="px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Verify'
                    )}
                  </button>
                )}
                {tokenValid && (
                  <div className="px-4 py-3 bg-emerald-100 text-emerald-700 rounded-xl font-bold">
                    ✓
                  </div>
                )}
              </div>
              {tokenValid && (
                <p className="text-sm text-emerald-600 mt-2 font-medium">
                  Token verified successfully
                </p>
              )}
            </div>

            {/* Password Fields (shown after token verification) */}
            {tokenValid && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-slate-900 placeholder-slate-400"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-slate-900 placeholder-slate-400"
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Resetting...
                    </span>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </motion.div>
            )}

            <p className="text-center text-sm text-slate-600">
              Remember your password?{' '}
              <Link
                to="/login"
                className="text-blue-600 font-bold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
