// src/hooks/authentication/use-auth.ts
import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import { AuthContextType, User } from "@/types/auth";

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Hook for role-based access
export const useRole = () => {
  const { user } = useAuth();

  return {
    role: user?.role || null,
    isAdmin: user?.role === "admin",
    isUser: user?.role === "user",
    isAuthenticated: !!user,
  };
};

// Hook for checking permissions
export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth();

  const hasRole = (role: string): boolean => {
    if (!isAuthenticated || !user) return false;
    return user.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (!isAuthenticated || !user) return false;
    return roles.includes(user.role);
  };

  const isAdminOrOwner = (resourceOwnerId?: number): boolean => {
    if (!isAuthenticated || !user) return false;
    return user.role === "admin" || user.id === resourceOwnerId;
  };

  return {
    hasRole,
    hasAnyRole,
    isAdminOrOwner,
    isAuthenticated,
    currentUserId: user?.id,
  };
};
