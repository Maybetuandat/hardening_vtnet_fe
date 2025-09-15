import React from "react";
import { usePermissions } from "@/hooks/authentication/use-permissions";

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  requiredRole,
  fallback = null,
  requireAuth = true,
}) => {
  const { hasRole, isAuthenticated } = usePermissions();

  // Kiểm tra xem có cần đăng nhập không
  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>;
  }

  // Kiểm tra role nếu được yêu cầu
  if (requiredRole && !hasRole(requiredRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Các component shortcut cho từng role
export const AdminOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => (
  <RoleGuard requiredRole="admin" fallback={fallback}>
    {children}
  </RoleGuard>
);

export const UserOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => (
  <RoleGuard requiredRole={["user", "admin"]} fallback={fallback}>
    {children}
  </RoleGuard>
);

// Component để hiển thị khi không có quyền
export const NoPermission: React.FC<{
  message?: string;
  className?: string;
}> = ({
  message = "Bạn không có quyền truy cập chức năng này",
  className = "text-gray-500 text-sm italic",
}) => <div className={className}>{message}</div>;
