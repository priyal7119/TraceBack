import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  BarChart3,
  FileQuestion,
  PackageCheck,
  Sparkles,
  Scale,
  ClipboardCheck,
  Archive,
  Users,
  LogOut,
  Compass,
  Menu,
  X,
  ExternalLink,
  UserCheck,
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, switchRole, logout } = useAuth();
  const { claims, disputes } = useData();

  const pendingClaimsCount = claims.filter(c => c.status === 'pending' || c.status === 'under_review').length;
  const openDisputesCount = disputes.filter(d => d.status === 'open' || d.status === 'investigating').length;

  const adminNavItems = [
    { name: 'Admin Overview', path: '/admin/overview', icon: BarChart3 },
    { name: 'Manage Lost Reports', path: '/admin/lost-reports', icon: FileQuestion },
    { name: 'Manage Found Reports', path: '/admin/found-reports', icon: PackageCheck },
    { name: 'Manage Matches', path: '/admin/matches', icon: Sparkles },
    { name: 'Dispute Management', path: '/admin/disputes', icon: Scale, count: openDisputesCount },
    { name: 'Claim Management', path: '/admin/claims', icon: ClipboardCheck, count: pendingClaimsCount },
    { name: 'Archived Reports', path: '/admin/archived', icon: Archive },
    { name: 'User Management', path: '/admin/users', icon: Users },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-cream-100 flex flex-col md:flex-row w-full overflow-x-hidden">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-olive text-cream-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40 w-full flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-cream-100 hover:bg-olive-light"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 font-bold text-lg">
            <ShieldAlert className="w-5 h-5 text-terracotta" />
            HAMC Admin Console
          </div>
        </div>

        <button
          onClick={() => {
            switchRole('user');
            navigate('/user/dashboard');
          }}
          className="text-xs bg-olive-light px-2.5 py-1 rounded text-cream-100 font-medium"
        >
          Exit Admin
        </button>
      </div>

      {/* Sidebar - Sticky/Fixed on desktop with 100vh */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-charcoal text-cream-100 flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:translate-x-0 md:sticky md:top-0 md:h-screen flex-shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-charcoal-light flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-olive-light flex items-center justify-center text-cream-100">
                <ShieldAlert className="w-5 h-5 text-terracotta" />
              </div>
              <div>
                <span className="font-bold text-lg text-cream-100 block leading-tight">
                  TraceBack
                </span>
                <span className="text-[10px] text-terracotta font-semibold uppercase tracking-wider">
                  HAMC Campus Custody
                </span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 text-charcoal-muted hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Items - Internally scrollable if needed */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-charcoal-muted">
              Campus Administration
            </div>

            {adminNavItems.map((item) => {
              const active = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    active
                      ? 'bg-olive text-white shadow-sm'
                      : 'text-cream-200/80 hover:bg-charcoal-light hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-terracotta' : 'text-cream-300/60'}`} />
                    <span>{item.name}</span>
                  </div>

                  {item.count > 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-terracotta text-white">
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-6 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-charcoal-muted">
              Quick Role Switch
            </div>
            <button
              onClick={() => {
                switchRole('user');
                navigate('/user/dashboard');
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-sand-200 hover:text-white hover:bg-charcoal-light rounded-xl transition text-left"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Switch to Student View</span>
            </button>

            <Link
              to="/browse"
              className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-sand-200 hover:text-white hover:bg-charcoal-light rounded-xl transition"
            >
              <ExternalLink className="w-4 h-4 text-charcoal-muted" />
              <span>Campus Public Directory</span>
            </Link>
          </div>

          {/* Admin User Badge */}
          <div className="p-4 border-t border-charcoal-light bg-charcoal-dark/50 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'}
                  alt="Admin user"
                  className="w-9 h-9 rounded-full object-cover border border-olive-light"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-cream-100 truncate">{user?.name || 'Administrator'}</p>
                  <p className="text-[11px] text-charcoal-muted truncate">HAMC Facility Custodian</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg border border-charcoal-light text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-charcoal/70 z-40 md:hidden"
        />
      )}

      {/* Main Content Area - Only this area scrolls vertically on desktop */}
      <div className="flex-1 flex flex-col min-h-0 md:h-screen overflow-y-auto overflow-x-hidden w-full">
        {/* Top Header bar */}
        <header className="hidden md:flex items-center justify-between h-16 px-6 lg:px-10 border-b border-sand-300 bg-cream-50/90 backdrop-blur sticky top-0 z-30 w-full flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta bg-terracotta-subtle px-2.5 py-1 rounded-md border border-terracotta/20">
              HAMC Custodial Moderation
            </span>
            <span className="text-xs text-charcoal-muted">•</span>
            <span className="text-xs text-charcoal-light font-medium">
              Hashu Advani Memorial Complex, Chembur, Mumbai
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                switchRole('user');
                navigate('/user/dashboard');
              }}
              className="px-3 py-1.5 rounded-lg border border-sand-300 text-xs font-semibold text-charcoal hover:bg-sand-200 transition"
            >
              Open Student View
            </button>
            <Link
              to="/browse"
              className="px-3 py-1.5 rounded-lg bg-olive text-cream-100 text-xs font-semibold hover:bg-olive-dark transition shadow-sm"
            >
              Public Browse
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 w-full">
          <Outlet />
        </main>
      </div>

    </div>
  );
};
