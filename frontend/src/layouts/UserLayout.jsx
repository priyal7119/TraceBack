import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  PackageSearch,
  FileText,
  Sparkles,
  Bell,
  User,
  LogOut,
  Compass,
  Menu,
  X,
  Search,
  ExternalLink,
  ShieldAlert,
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const { notifications } = useData();

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { name: 'Dashboard', path: '/user/dashboard', icon: LayoutDashboard },
    { name: 'Report Lost Item', path: '/user/report-lost', icon: PlusCircle, badge: 'Lost' },
    { name: 'Report Found Item', path: '/user/report-found', icon: PackageSearch, badge: 'Found' },
    { name: 'My Reports', path: '/user/reports', icon: FileText },
    { name: 'My Matches', path: '/user/matches', icon: Sparkles, highlight: true },
    { name: 'Notifications', path: '/user/notifications', icon: Bell, count: unreadCount },
    { name: 'My Profile', path: '/user/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-cream-100 flex flex-col md:flex-row w-full overflow-x-hidden">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-cream-50 border-b border-sand-300 px-4 py-3 flex items-center justify-between sticky top-0 z-40 w-full flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-charcoal hover:bg-sand-200"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/" className="flex items-center gap-2 font-bold text-olive text-lg">
            <Compass className="w-5 h-5 text-terracotta" />
            TraceBack
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/user/notifications" className="p-2 relative text-charcoal">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-terracotta rounded-full" />
            )}
          </Link>
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80'}
            alt="User avatar"
            className="w-8 h-8 rounded-full border border-olive/30 object-cover"
          />
        </div>
      </div>

      {/* Sidebar for Desktop & Mobile Overlay - Sticky/Fixed on desktop with 100vh */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-cream-50 border-r border-sand-300 flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:translate-x-0 md:sticky md:top-0 md:h-screen flex-shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo & Close */}
          <div className="px-6 py-5 border-b border-sand-200 flex items-center justify-between flex-shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-olive flex items-center justify-center text-cream-100">
                <Compass className="w-5 h-5 text-terracotta group-hover:rotate-45 transition-transform" />
              </div>
              <div>
                <span className="font-bold text-xl text-olive leading-none block">TraceBack</span>
                <span className="text-[10px] text-charcoal-muted uppercase tracking-wider font-semibold">Campus Portal • HAMC</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 rounded-lg text-charcoal-muted hover:bg-sand-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links - Internally scrollable if needed */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-charcoal-muted">
              Campus Menu
            </div>
            {navItems.map((item) => {
              const active = location.pathname === item.path || (item.path !== '/user/dashboard' && location.pathname.startsWith(item.path));
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    active
                      ? 'bg-olive text-white shadow-sm'
                      : 'text-charcoal hover:bg-sand-200 hover:text-olive'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-cream-100' : item.highlight ? 'text-terracotta' : 'text-charcoal-light'}`} />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && !active && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-sand-200 text-charcoal-light font-semibold">
                      {item.badge}
                    </span>
                  )}
                  {item.count > 0 && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${active ? 'bg-white text-olive' : 'bg-terracotta text-white'}`}>
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-6 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-charcoal-muted">
              Public Catalog
            </div>
            <Link
              to="/browse"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm text-charcoal hover:bg-sand-200 transition"
            >
              <Search className="w-4 h-4 text-charcoal-muted" />
              <span>Browse Found Items</span>
            </Link>
            <Link
              to="/"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm text-charcoal hover:bg-sand-200 transition"
            >
              <ExternalLink className="w-4 h-4 text-charcoal-muted" />
              <span>Public Homepage</span>
            </Link>

            {isAdmin && (
              <div className="pt-4">
                <Link
                  to="/admin/overview"
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-terracotta-subtle text-terracotta border border-terracotta/30 hover:bg-terracotta hover:text-white transition"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Switch to Admin View</span>
                </Link>
              </div>
            )}
          </div>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-sand-200 bg-sand-100/50 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80'}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full object-cover border border-sand-300 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-olive truncate">{user?.name}</p>
                  <p className="text-xs text-charcoal-muted truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-sand-300 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition"
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
          className="fixed inset-0 bg-charcoal/50 z-40 md:hidden"
        />
      )}

      {/* Main Content Area - Only this area scrolls vertically on desktop */}
      <div className="flex-1 flex flex-col min-h-0 md:h-screen overflow-y-auto overflow-x-hidden w-full">
        {/* Desktop Topbar */}
        <header className="hidden md:flex items-center justify-between h-16 px-6 lg:px-10 border-b border-sand-200 bg-cream-50/80 backdrop-blur sticky top-0 z-30 w-full flex-shrink-0">
          <div className="text-sm text-charcoal-muted font-medium flex items-center gap-2">
            <Building2 className="w-4 h-4 text-olive" />
            <span>Hashu Advani Memorial Complex, Chembur • Lost & Found Portal</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/user/report-lost"
              className="px-3.5 py-1.5 rounded-lg border border-terracotta text-terracotta text-xs font-semibold hover:bg-terracotta hover:text-white transition"
            >
              + Report Lost
            </Link>
            <Link
              to="/user/report-found"
              className="px-3.5 py-1.5 rounded-lg bg-olive text-cream-100 text-xs font-semibold hover:bg-olive-dark transition shadow-sm"
            >
              + Report Found
            </Link>

            <div className="h-5 w-px bg-sand-300 mx-1"></div>

            <Link
              to="/user/notifications"
              className="relative p-2 rounded-full hover:bg-sand-200 text-charcoal transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-terracotta rounded-full" />
              )}
            </Link>
          </div>
        </header>

        {/* Page Content - Full width layout */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 w-full">
          <Outlet />
        </main>
      </div>

    </div>
  );
};
