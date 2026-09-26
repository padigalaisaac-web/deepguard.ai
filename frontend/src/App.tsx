import React, { Suspense, lazy } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { Footer } from './components/common/Footer';

// Core pages
import LandingPage from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Lazy-loaded pages for fast initial bundle delivery
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const AnalyzePage = lazy(() => import('./pages/AnalyzePage').then(m => ({ default: m.AnalyzePage })));
const ResultPage = lazy(() => import('./pages/ResultPage').then(m => ({ default: m.ResultPage })));
const HistoryPage = lazy(() => import('./pages/HistoryPage').then(m => ({ default: m.HistoryPage })));
const ReportPage = lazy(() => import('./pages/ReportPage').then(m => ({ default: m.ReportPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));
const AdminLogsPage = lazy(() => import('./pages/AdminLogsPage').then(m => ({ default: m.AdminLogsPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const PageLoadingSpinner: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
    <div className="w-10 h-10 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
    <span className="text-xs text-slate-400 font-mono tracking-wider">Loading DeepGuard module...</span>
  </div>
);

// Protected Route wrapper
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Admin Route wrapper
const AdminRoute: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Dashboard layout with Sidebar
const DashboardLayout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-slate-950/40">
        {children}
      </main>
    </div>
  );
};

// Application routes
export const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <div className="flex-1">
        <Suspense fallback={<PageLoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />

            <Route path="/login" element={<LoginPage />} />

            <Route path="/register" element={<RegisterPage />} />

            <Route path="/about" element={<AboutPage />} />

            <Route path="/privacy" element={<PrivacyPage />} />

            {/* Protected User Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <DashboardPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/analyze"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <AnalyzePage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/analysis/:id"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ResultPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/analysis/:id/report"
              element={
                <ProtectedRoute>
                  <ReportPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <HistoryPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ProfilePage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <DashboardLayout>
                    <AdminDashboardPage />
                  </DashboardLayout>
                </AdminRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <DashboardLayout>
                    <AdminUsersPage />
                  </DashboardLayout>
                </AdminRoute>
              }
            />

            <Route
              path="/admin/logs"
              element={
                <AdminRoute>
                  <DashboardLayout>
                    <AdminLogsPage />
                  </DashboardLayout>
                </AdminRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </div>

      <Footer />
    </div>
  );
};

// Main App
export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
