import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  Search, 
  PlusCircle, 
  Bell, 
  User, 
  Menu, 
  X, 
  ShieldAlert, 
  LogOut, 
  LayoutDashboard,
  Layers,
  Sparkles,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const { notifications } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur-md border-b border-sand-200 transition-colors w-full">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-olive flex items-center justify-center text-cream-100 shadow-sm group-hover:bg-olive-dark transition-all duration-200">
              <Compass className="w-6 h-6 text-terracotta group-hover:rotate-45 transition-transform duration-300" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-olive flex items-center gap-1.5">
                TraceBack
                <span className="inline-block w-2 h-2 rounded-full bg-terracotta"></span>
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-charcoal-muted font-semibold -mt-0.5">
                Campus Lost & Found • HAMC Chembur
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/') 
                  ? 'bg-sand-200/80 text-olive font-semibold' 
                  : 'text-charcoal hover:bg-sand-100 hover:text-olive'
              }`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/about') 
                  ? 'bg-sand-200/80 text-olive font-semibold' 
                  : 'text-charcoal hover:bg-sand-100 hover:text-olive'
              }`}
            >
              About Us
            </Link>
            <Link
              to="/browse"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${
                isActive('/browse') 
                  ? 'bg-sand-200/80 text-olive font-semibold' 
                  : 'text-charcoal hover:bg-sand-100 hover:text-olive'
              }`}
            >
              <Search className="w-4 h-4 text-terracotta" />
              Browse Found Items
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Quick Report CTAs - Protected Routes */}
            <Link
              to="/user/report-lost"
              className="px-3.5 py-2 rounded-lg border border-sand-300 text-charcoal text-xs font-semibold hover:border-terracotta hover:text-terracotta transition"
            >
              Report Lost
            </Link>
            <Link
              to="/user/report-found"
              className="px-3.5 py-2 rounded-lg bg-olive text-cream-100 text-xs font-semibold hover:bg-olive-dark transition shadow-sm"
            >
              Report Found
            </Link>

            <div className="h-6 w-px bg-sand-300 mx-1"></div>

            {/* Auth / Account Controls */}
            {user ? (
              <div className="relative">
                <div className="flex items-center gap-2">
                  <Link
                    to="/user/notifications"
                    className="relative p-2 rounded-full hover:bg-sand-200 text-charcoal transition"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-terracotta rounded-full ring-2 ring-cream-50" />
                    )}
                  </Link>

                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-sand-200 transition focus:outline-none"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border-2 border-olive/30"
                    />
                  </button>
                </div>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-cream-50 rounded-xl shadow-warm-xl border border-sand-300 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-sand-200">
                      <p className="text-sm font-semibold text-olive truncate">{user.name}</p>
                      <p className="text-xs text-charcoal-muted truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-sand-200 text-olive">
                        {user.department || user.role}
                      </span>
                    </div>

                    <Link
                      to="/user/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-charcoal hover:bg-sand-100 transition"
                    >
                      <LayoutDashboard className="w-4 h-4 text-olive" />
                      User Dashboard
                    </Link>

                    <Link
                      to="/user/matches"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-charcoal hover:bg-sand-100 transition"
                    >
                      <Sparkles className="w-4 h-4 text-terracotta" />
                      My AI Matches
                    </Link>

                    <Link
                      to="/user/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-charcoal hover:bg-sand-100 transition"
                    >
                      <User className="w-4 h-4 text-charcoal-muted" />
                      My Profile
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin/overview"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-olive font-semibold hover:bg-sand-200/80 border-t border-sand-200 mt-1 transition"
                      >
                        <ShieldAlert className="w-4 h-4 text-terracotta" />
                        Admin Console
                      </Link>
                    )}

                    <div className="border-t border-sand-200 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm text-rose-700 hover:bg-rose-50 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth/login"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-charcoal hover:bg-sand-200 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/register"
                  className="px-4 py-2 rounded-lg bg-terracotta text-white text-sm font-semibold hover:bg-terracotta-hover transition shadow-sm"
                >
                  Join Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {user && (
              <Link to="/user/notifications" className="p-2 text-charcoal relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-terracotta rounded-full" />
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-charcoal hover:bg-sand-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-sand-300 bg-cream-50 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-charcoal hover:bg-sand-200"
          >
            Home
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-charcoal hover:bg-sand-200"
          >
            About Us
          </Link>
          <Link
            to="/browse"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-charcoal hover:bg-sand-200"
          >
            Browse Found Items
          </Link>

          <div className="pt-2 border-t border-sand-200 flex flex-col gap-2">
            <Link
              to="/user/report-lost"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-lg border border-terracotta text-terracotta font-semibold text-sm"
            >
              Report Lost Item
            </Link>
            <Link
              to="/user/report-found"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-lg bg-olive text-white font-semibold text-sm"
            >
              Report Found Item
            </Link>

            {user ? (
              <>
                <Link
                  to="/user/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-sand-200 text-olive font-semibold text-sm"
                >
                  My Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin/overview"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-lg bg-olive-light text-white font-semibold text-sm"
                  >
                    Admin Console
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 text-rose-700 text-sm font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 border border-sand-300 rounded-lg text-sm font-semibold"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 bg-terracotta text-white rounded-lg text-sm font-semibold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
