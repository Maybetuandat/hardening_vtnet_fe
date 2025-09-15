import { useAuth } from "@/hooks/authentication/use-auth";

export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth();

  const isAdmin = (): boolean => {
    return isAuthenticated && user?.role === "admin";
  };

  const isUser = (): boolean => {
    return isAuthenticated && (user?.role === "user" || user?.role === "admin");
  };

  const hasRole = (requiredRole: string | string[]): boolean => {
    if (!isAuthenticated || !user) return false;

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }

    return user.role === requiredRole;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (!isAuthenticated || !user) return false;
    return roles.includes(user.role);
  };

  return {
    isAdmin,
    isUser,
    hasRole,
    hasAnyRole,
    currentRole: user?.role || null,
    isAuthenticated,
  };
};
