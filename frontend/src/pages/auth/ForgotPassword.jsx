import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import api from '../../services/api';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data?.devToken) {
        setDevToken(response.data.devToken);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-olive">
          Password Recovery
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-light">
          Enter your registered email to receive secure instructions to reset your password.
        </p>
      </div>

      {submitted ? (
        <div className="text-center space-y-4 py-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-olive text-base">Check Your Inbox</h3>
            <p className="text-xs text-charcoal-light max-w-xs mx-auto">
              We have dispatched a reset link to <span className="font-bold text-olive">{email}</span>. Please verify within 30 minutes.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to={`/auth/reset-password?email=${encodeURIComponent(email)}${devToken ? `&token=${devToken}` : ''}`}
              className="inline-flex items-center gap-1.5 btn-terracotta px-5 py-2.5 text-xs font-semibold"
            >
              Continue to Reset Screen (Demo) →
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-olive mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 text-xs sm:text-sm text-charcoal focus:outline-none focus:border-terracotta transition"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-terracotta py-3 text-xs sm:text-sm font-semibold shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? 'Sending Request...' : 'Send Recovery Link'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Back to Login */}
      <div className="pt-4 border-t border-sand-200 text-center text-xs">
        <Link to="/auth/login" className="inline-flex items-center gap-1 font-semibold text-charcoal hover:text-olive">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Sign In
        </Link>
      </div>

    </div>
  );
};
