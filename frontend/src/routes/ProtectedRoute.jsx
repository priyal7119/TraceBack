import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-olive border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-olive">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login preserving the intended URL
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    // Authenticated user trying to access admin route without admin privileges
    return <Navigate to="/user/dashboard" replace />;
  }

  return children;
};
