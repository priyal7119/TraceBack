import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const emailParam = searchParams.get('email') || 'your account';
  const tokenParam = searchParams.get('token') || '';

  // Basic strength check
  const hasMinLength = password.length >= 6;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!hasMinLength) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (tokenParam) {
        await api.post('/auth/reset-password', {
          token: tokenParam,
          newPassword: password,
        });
      }
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        navigate('/auth/login');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Password reset failed.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-olive">
          Set New Password
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-light">
          Creating new secure credentials for <span className="font-semibold text-olive">{emailParam}</span>.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
          {error}
        </div>
      )}

      {success ? (
        <div className="text-center space-y-3 py-6">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
          <h3 className="text-lg font-bold text-olive">Password Updated!</h3>
          <p className="text-xs text-charcoal-light">
            Your credentials have been securely stored. Redirecting you to sign in...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-olive mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta transition"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-olive mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta transition"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          {/* Strength Indicators */}
          <div className="bg-sand-100 p-3 rounded-xl space-y-1.5 text-[11px] text-charcoal-light">
            <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700 font-medium' : 'text-charcoal-muted'}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>At least 8 characters</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700 font-medium' : 'text-charcoal-muted'}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Includes at least one digit</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-700 font-medium' : 'text-charcoal-muted'}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Includes special character (!@#$%^&*)</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-terracotta py-3 text-xs sm:text-sm font-semibold shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? 'Updating Credentials...' : 'Save New Password'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      <div className="pt-4 border-t border-sand-200 text-center text-xs">
        <Link to="/auth/login" className="font-semibold text-terracotta hover:underline">
          Return to Sign In
        </Link>
      </div>

    </div>
  );
};
