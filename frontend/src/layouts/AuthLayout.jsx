import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Compass, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-cream-100 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Bar */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group text-charcoal hover:text-olive transition">
          <ArrowLeft className="w-4 h-4 text-terracotta group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-semibold uppercase tracking-wider">Back to Home</span>
        </Link>

        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-olive flex items-center justify-center text-cream-100">
            <Compass className="w-4 h-4 text-terracotta" />
          </div>
          <span className="font-bold text-lg text-olive">TraceBack</span>
        </Link>
      </div>

      {/* Main Container */}
      <div className="max-w-md w-full mx-auto my-6">
        <div className="bg-cream-50 rounded-2xl shadow-warm-lg border border-sand-300 p-8 sm:p-10">
          <Outlet />
        </div>
      </div>

      {/* Bottom Footer Note */}
      <div className="max-w-md w-full mx-auto text-center space-y-2">
        <div className="flex items-center justify-center gap-3 text-xs text-charcoal-muted">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-olive" />
            256-bit S3 Encryption
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-terracotta" />
            AWS Rekognition Protected
          </span>
        </div>
        <p className="text-[11px] text-charcoal-muted">
          © {new Date().getFullYear()} TraceBack Inc. Lost & Found Matching Platform.
        </p>
      </div>
    </div>
  );
};
