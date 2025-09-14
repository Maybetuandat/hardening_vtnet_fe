// src/hooks/useAuth.ts
import { useContext } from "react";

import { AuthContextType } from "@/types/auth";
import { AuthContext } from "@/context/auth-context";

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

// Hook để check role
export const useRole = () => {
  const { user } = useAuth();

  const isAdmin = () => user?.role === "admin";
  const isUser = () => user?.role === "user" || user?.role === "admin";
  const hasRole = (role: string) => user?.role === role;

  return {
    role: user?.role,
    isAdmin,
    isUser,
    hasRole,
  };
};

// Hook để check authentication status
export const useAuthStatus = () => {
  const { isAuthenticated, isLoading, user, error } = useAuth();

  return {
    isAuthenticated,
    isLoading,
    user,
    error,
    isLoggedIn: isAuthenticated && !!user,
  };
};

// Hook để sử dụng authenticated API calls
export const useAuthenticatedApi = () => {
  const { isAuthenticated, token } = useAuth();

  return {
    isReady: isAuthenticated && !!token,
    // Có thể thêm các wrapper methods khác nếu cần
  };
};
