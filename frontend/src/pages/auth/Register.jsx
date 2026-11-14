import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowRight, Building2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [affiliation, setAffiliation] = useState('Student');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!agreeTerms) {
      setError('You must agree to the Terms of Service & Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName,
        email,
        password,
        phone,
        department: affiliation,
      });
      setLoading(false);
      navigate('/user/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-olive">
          Create Campus Account
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-light">
          For students, faculty and staff at Hashu Advani Memorial Complex (HAMC), Chembur.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-olive mb-1">
            Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-white pl-10 pr-4 py-2 rounded-xl border border-sand-300 text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta transition"
              placeholder="e.g. Aarav Sharma"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-olive mb-1">
            Campus Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white pl-10 pr-4 py-2 rounded-xl border border-sand-300 text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta transition"
              placeholder="name@campus.ves.ac.in"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-olive mb-1">
            Campus Role / Affiliation
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
              className="w-full bg-white pl-10 pr-4 py-2 rounded-xl border border-sand-300 text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta transition"
            >
              <option value="Student">Student (HAMC)</option>
              <option value="Teaching Faculty">Teaching Faculty</option>
              <option value="Non-Teaching Staff">Non-Teaching Staff</option>
              <option value="Other Authorized Campus User">Other Authorized Campus User</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-olive mb-1">
            Phone Number (for SMS Match Alerts)
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white pl-10 pr-4 py-2 rounded-xl border border-sand-300 text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta transition"
              placeholder="+91 98201 23456"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-olive mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white pl-10 pr-4 py-2 rounded-xl border border-sand-300 text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-olive mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white pl-10 pr-4 py-2 rounded-xl border border-sand-300 text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta transition"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        <div className="pt-1">
          <label className="flex items-start gap-2 text-xs text-charcoal-light cursor-pointer">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded border-sand-300 text-terracotta focus:ring-terracotta"
            />
            <span>
              I agree to the <Link to="/about" className="text-terracotta hover:underline">Campus Guidelines</Link> and <Link to="/about" className="text-terracotta hover:underline">Privacy Policy</Link>.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-terracotta py-3 text-xs sm:text-sm font-semibold shadow-md flex items-center justify-center gap-2 mt-3 disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Complete Registration'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Switch to Login */}
      <div className="pt-4 border-t border-sand-200 text-center text-xs text-charcoal-muted">
        Already registered on TraceBack?{' '}
        <Link to="/auth/login" className="font-semibold text-terracotta hover:underline">
          Sign In
        </Link>
      </div>

    </div>
  );
};
