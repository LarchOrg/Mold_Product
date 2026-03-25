import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import AppLayout from '@/layouts/AppLayout';

// Pages
import LoginPage       from '@/pages/Auth/LoginPage';
import DashboardPage   from '@/pages/Dashboard/DashboardPage';
import MouldPage       from '@/pages/Mould/MouldPage';
import PMPlanPage      from '@/pages/PMPlan/PMPlanPage';
import SpecEntryPage   from '@/pages/SpecEntry/SpecEntryPage';
import ChecksheetPage  from '@/pages/Checksheet/ChecksheetPage';
import LifeReportPage  from '@/pages/Reports/LifeReportPage';
import MouldHistoryPage from '@/pages/Reports/MouldHistoryPage';
import PMHistoryPage   from '@/pages/Reports/PMHistoryPage';
import UsersPage       from '@/pages/Users/UsersPage';
import SettingsPage    from '@/pages/Settings/SettingsPage';

function ProtectedRoute({ children }) {
  const isAuth = useAuthStore((s) => s.isAuth);
  return isAuth ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const isAuth = useAuthStore((s) => s.isAuth);
  return isAuth ? <Navigate to="/dashboard" replace /> : children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected — all wrapped in AppLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"  element={<DashboardPage />} />
        <Route path="moulds"     element={<MouldPage />} />
        <Route path="pm-plans"   element={<PMPlanPage />} />
        <Route path="spec-entry" element={<SpecEntryPage />} />
        <Route path="checksheet" element={<ChecksheetPage />} />
        <Route path="reports/life"       element={<LifeReportPage />} />
        <Route path="reports/pm-history" element={<PMHistoryPage />} />
        <Route path="reports/mould-history" element={<MouldHistoryPage />} />
        <Route path="users"      element={<UsersPage />} />
        <Route path="settings"   element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
