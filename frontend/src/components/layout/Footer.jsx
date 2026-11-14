import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Cpu, Database, Cloud, MapPin, Building2, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Footer = () => {
  const { switchRole, isAdmin, user } = useAuth();

  return (
    <footer className="bg-sand-200/70 border-t border-sand-300 text-charcoal pt-14 pb-8 transition-colors w-full">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Column 1: Brand & Campus Community */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-olive flex items-center justify-center text-cream-100">
                <Compass className="w-5 h-5 text-terracotta" />
              </div>
              <span className="text-xl font-bold text-olive">
                TraceBack
              </span>
            </div>
            <p className="text-sm text-charcoal-light leading-relaxed">
              Campus Lost & Found platform for the Vivekanand Education Society community at <strong>Hashu Advani Memorial Complex (HAMC)</strong>. Powered by Amazon Rekognition visual matching.
            </p>
            <div className="text-xs text-charcoal-muted space-y-1">
              <div className="flex items-start gap-1.5 font-medium text-olive">
                <MapPin className="w-4 h-4 text-terracotta flex-shrink-0 mt-0.5" />
                <span>Hashu Advani Memorial Complex (HAMC), Collector's Colony, R.C. Marg, Chembur, Mumbai, Maharashtra – 400074.</span>
              </div>
              <p className="text-[11px] text-charcoal-muted pl-5 pt-0.5">
                Serving students, teaching faculty, non-teaching staff, and authorized campus users.
              </p>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-olive mb-4">
              Campus Directory
            </h4>
            <ul className="space-y-2.5 text-sm text-charcoal-light">
              <li>
                <Link to="/" className="hover:text-terracotta transition">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-terracotta transition">About & HAMC Campus</Link>
              </li>
              <li>
                <Link to="/browse" className="hover:text-terracotta transition">Browse Found Items</Link>
              </li>
              <li>
                <Link to="/user/report-lost" className="hover:text-terracotta transition">Report a Lost Item</Link>
              </li>
              <li>
                <Link to="/user/report-found" className="hover:text-terracotta transition">Submit Found Item</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: AWS Architecture */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-olive mb-4">
              Approved AWS Integration
            </h4>
            <ul className="space-y-2 text-xs text-charcoal-light">
              <li className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-terracotta" />
                <span>AWS Lambda & API Gateway</span>
              </li>
              <li className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-terracotta" />
                <span>Amazon DynamoDB Single-Table</span>
              </li>
              <li className="flex items-center gap-2">
                <Cloud className="w-3.5 h-3.5 text-terracotta" />
                <span>Amazon S3 Presigned Media Vault</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-terracotta" />
                <span>Amazon Rekognition Computer Vision</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Prototype Role Switcher */}
          <div className="bg-cream-100/90 p-5 rounded-2xl border border-sand-300">
            <h4 className="text-xs font-bold uppercase tracking-wider text-olive mb-2 flex items-center justify-between">
              <span>Prototype Role Switcher</span>
              <span className="text-[10px] bg-terracotta/10 text-terracotta px-1.5 py-0.5 rounded font-semibold">Demo Tool</span>
            </h4>
            <p className="text-xs text-charcoal-muted mb-3">
              Switch role between HAMC Student/User and Custody Administrator to test all 24 pages:
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => switchRole('user')}
                className={`flex-1 py-1.5 px-2 text-xs rounded-lg font-medium transition ${
                  !isAdmin 
                    ? 'bg-olive text-cream-100 shadow-sm' 
                    : 'bg-sand-200 text-charcoal hover:bg-sand-300'
                }`}
              >
                Student View
              </button>
              <button
                onClick={() => switchRole('admin')}
                className={`flex-1 py-1.5 px-2 text-xs rounded-lg font-medium transition ${
                  isAdmin 
                    ? 'bg-terracotta text-white shadow-sm' 
                    : 'bg-sand-200 text-charcoal hover:bg-sand-300'
                }`}
              >
                Admin View
              </button>
            </div>
            {isAdmin && (
              <Link
                to="/admin/overview"
                className="mt-3 block text-center text-xs font-semibold text-terracotta hover:underline"
              >
                Go to Admin Dashboard →
              </Link>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-sand-300 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal-muted gap-4">
          <p>© {new Date().getFullYear()} TraceBack – Campus Lost & Found. Serving the VES community at HAMC Chembur. Demonstration prototype with sample data.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-charcoal transition">Privacy Policy</Link>
            <Link to="/about" className="hover:text-charcoal transition">Campus Terms</Link>
            <Link to="/about" className="hover:text-charcoal transition">Custody Guidelines</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
