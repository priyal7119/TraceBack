import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { UserLayout } from '../layouts/UserLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Route Protection
import { ProtectedRoute } from './ProtectedRoute';

// Public Pages (1-4)
import { Home } from '../pages/public/Home';
import { AboutUs } from '../pages/public/AboutUs';
import { BrowseFoundItems } from '../pages/public/BrowseFoundItems';
import { ItemDetails } from '../pages/public/ItemDetails';

// Auth Pages (5-8)
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { ResetPassword } from '../pages/auth/ResetPassword';

// User Dashboard Pages (9-16)
import { UserDashboard } from '../pages/user/UserDashboard';
import { ReportLostItem } from '../pages/user/ReportLostItem';
import { ReportFoundItem } from '../pages/user/ReportFoundItem';
import { MyReports } from '../pages/user/MyReports';
import { MyMatches } from '../pages/user/MyMatches';
import { MatchDetails } from '../pages/user/MatchDetails';
import { Notifications } from '../pages/user/Notifications';
import { MyProfile } from '../pages/user/MyProfile';

// Admin Dashboard Pages (17-24)
import { AdminOverview } from '../pages/admin/AdminOverview';
import { ManageLostReports } from '../pages/admin/ManageLostReports';
import { ManageFoundReports } from '../pages/admin/ManageFoundReports';
import { ManageMatches } from '../pages/admin/ManageMatches';
import { DisputeManagement } from '../pages/admin/DisputeManagement';
import { ClaimManagement } from '../pages/admin/ClaimManagement';
import { ArchivedReports } from '../pages/admin/ArchivedReports';
import { UserManagement } from '../pages/admin/UserManagement';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public Website */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/browse" element={<BrowseFoundItems />} />
        <Route path="/items/:id" element={<ItemDetails />} />
      </Route>

      {/* 2. Authentication */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
      </Route>

      {/* 3. User Dashboard - Protected Routes */}
      <Route
        path="/user"
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/user/dashboard" replace />} />
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="report-lost" element={<ReportLostItem />} />
        <Route path="report-found" element={<ReportFoundItem />} />
        <Route path="reports" element={<MyReports />} />
        <Route path="matches" element={<MyMatches />} />
        <Route path="matches/:id" element={<MatchDetails />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<MyProfile />} />
      </Route>

      {/* 4. Admin Dashboard - Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/overview" replace />} />
        <Route path="overview" element={<AdminOverview />} />
        <Route path="lost-reports" element={<ManageLostReports />} />
        <Route path="found-reports" element={<ManageFoundReports />} />
        <Route path="matches" element={<ManageMatches />} />
        <Route path="disputes" element={<DisputeManagement />} />
        <Route path="claims" element={<ClaimManagement />} />
        <Route path="archived" element={<ArchivedReports />} />
        <Route path="users" element={<UserManagement />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
