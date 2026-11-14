import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Extract return destination if redirected from a protected route
  const from = location.state?.from?.pathname || location.state?.from || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getRedirectMessage = () => {
    if (from.includes('report-lost')) {
      return 'Please sign in to submit your lost item report. You will be returned directly to the report form.';
    }
    if (from.includes('report-found')) {
      return 'Please sign in to register a found campus item. You will be returned directly to the report form.';
    }
    if (from) {
      return 'Please sign in to access your campus account.';
    }
    return null;
  };

  const redirectMessage = getRedirectMessage();

  const handleSuccessfulAuth = (authenticatedUser) => {
    const destination = from || (authenticatedUser.role === 'admin' ? '/admin/overview' : '/user/dashboard');
    navigate(destination, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        setError('Please enter your campus email and password.');
        setLoading(false);
        return;
      }

      const loggedUser = await login(email, password, email.toLowerCase().includes('admin') ? 'admin' : 'user');
      setLoading(false);
      handleSuccessfulAuth(loggedUser);
    } catch (err) {
      setError(err.message || 'Login failed.');
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role) => {
    setLoading(true);
    try {
      if (role === 'admin') {
        const admin = await login('admin.hamc@traceback.org', 'AdminPassword123!', 'admin');
        handleSuccessfulAuth(admin);
      } else {
        const student = await login('aarav.sharma@campus.ves.ac.in', 'Password123!', 'user');
        handleSuccessfulAuth(student);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-olive">
          Welcome to TraceBack
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-light">
          Sign in to report missing items, manage claims and view AI matches at HAMC Chembur.
        </p>
      </div>

      {/* Redirect Notice Banner if arriving from protected route */}
      {redirectMessage && (
        <div className="p-3 bg-terracotta-subtle border border-terracotta/40 text-terracotta text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="font-medium leading-relaxed">{redirectMessage}</span>
        </div>
      )}

      {/* Quick Demo Login Pills */}
      <div className="bg-sand-100 p-3 rounded-xl border border-sand-300 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block text-center">
          Instant Demo One-Click Access
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('user')}
            className="py-1.5 px-2 bg-cream-50 hover:bg-cream-100 border border-sand-300 rounded-lg text-xs font-semibold text-olive flex items-center justify-center gap-1 transition"
          >
            <UserCheck className="w-3.5 h-3.5 text-terracotta" />
            Student / User
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('admin')}
            className="py-1.5 px-2 bg-olive hover:bg-olive-dark text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-terracotta" />
            Campus Admin
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-olive mb-1.5">
            Campus Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta transition"
              placeholder="e.g. your.name@campus.ves.ac.in"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-olive">
              Password
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-xs text-terracotta hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
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

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs text-charcoal-light cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-sand-300 text-terracotta focus:ring-terracotta"
            />
            <span>Remember session on this device</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-terracotta py-3 text-xs sm:text-sm font-semibold shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Switch to Register */}
      <div className="pt-4 border-t border-sand-200 text-center text-xs text-charcoal-muted">
        New to TraceBack HAMC?{' '}
        <Link to="/auth/register" className="font-semibold text-terracotta hover:underline">
          Create campus account
        </Link>
      </div>

    </div>
  );
};
