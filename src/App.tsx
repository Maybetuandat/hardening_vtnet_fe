import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { AuthProvider } from "@/contexts/auth-context";
import ProtectedRoute, {
  AdminRoute,
  UserRoute,
} from "@/components/auth/protected-route";
import { useAuth } from "@/hooks/authentication/use-auth";

import "./i18n";

import SystemHardeningDashboard from "./app/dashboard";
import WorkloadsPage from "./app/workload/work-loads-page";
import ServersPage from "./app/server/server-page";
import NotFoundPage from "./app/404/not-found-page";
import AddWorkloadPage from "./app/workload/create-workload-page";
import { WorkloadDetailPage } from "./app/workload/workload-detail-page";
import ComplianceDetailPage from "./app/dashboard/compliance-detail-page";
import ServerHardeningHistoryPage from "./app/dashboard/compliance-history-page";
import OSPage from "./app/os/os-page";
import ProfilePage from "./app/profile/profile-page";
import UnauthorizedPage from "./app/auth/unauthor-page";
import LoginPage from "./app/login/login-page";

const RootRedirect: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Nếu đã đăng nhập, redirect đến dashboard, nếu chưa thì đến login
  return <Navigate to={isAuthenticated ? "/home" : "/login"} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes - không cần authentication */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Protected routes - Yêu cầu đăng nhập */}
          <Route
            path="/home"
            element={
              <UserRoute>
                <MainLayout>
                  <SystemHardeningDashboard />
                </MainLayout>
              </UserRoute>
            }
          />

          <Route
            path="/os"
            element={
              <UserRoute>
                <MainLayout>
                  <OSPage />
                </MainLayout>
              </UserRoute>
            }
          />

          <Route
            path="/compliance/:complianceId"
            element={
              <UserRoute>
                <MainLayout>
                  <ComplianceDetailPage />
                </MainLayout>
              </UserRoute>
            }
          />

          <Route
            path="/workloads"
            element={
              <UserRoute>
                <MainLayout>
                  <WorkloadsPage />
                </MainLayout>
              </UserRoute>
            }
          />

          <Route
            path="/workloads/:workloadId"
            element={
              <UserRoute>
                <MainLayout>
                  <WorkloadDetailPage />
                </MainLayout>
              </UserRoute>
            }
          />

          <Route
            path="/workload/add"
            element={
              <AdminRoute>
                <MainLayout>
                  <AddWorkloadPage />
                </MainLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/instances"
            element={
              <UserRoute>
                <MainLayout>
                  <ServersPage />
                </MainLayout>
              </UserRoute>
            }
          />

          <Route
            path="/:serverIp/hardening-history"
            element={
              <UserRoute>
                <MainLayout>
                  <ServerHardeningHistoryPage />
                </MainLayout>
              </UserRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <UserRoute>
                <MainLayout>
                  <ProfilePage />
                </MainLayout>
              </UserRoute>
            }
          />

          {/* Admin-only routes - Chỉ dành cho admin */}
          {/* Bạn có thể thêm các route admin tại đây nếu cần:
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <MainLayout>
                  <UserManagementPage />
                </MainLayout>
              </AdminRoute>
            }
          />
          */}

          {/* 404 page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
