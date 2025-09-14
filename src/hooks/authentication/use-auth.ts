// hooks/useAuth.ts
import { useState, useEffect, useCallback } from "react";

import { User, LoginRequest, LoginResponse, AuthState } from "@/types/auth"; // Sử dụng types đã định nghĩa
import { api } from "@/lib/api";

// Storage keys
const TOKEN_KEY = "jwt_token";
const USER_KEY = "user_data";

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Khởi tạo và kiểm tra token từ localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          const user: User = JSON.parse(storedUser);

          // Đặt token vào api client
          api.setAuthToken(storedToken);

          setState({
            user,
            token: storedToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setState((prev) => ({
            ...prev,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Clear corrupted data
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);

        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: "Error initializing authentication",
        });
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = useCallback(
    async (credentials: LoginRequest): Promise<void> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        console.log("🔐 Attempting login with:", {
          username: credentials.username,
          endpoint: "/auth/login",
        });

        const response = await api.post<LoginResponse>(
          "/auth/login",
          credentials
        );

        console.log("✅ Login successful:", response);

        // Lưu dữ liệu vào localStorage
        localStorage.setItem(TOKEN_KEY, response.access_token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));

        // Đặt token vào api client
        api.setAuthToken(response.access_token);

        setState({
          user: response.user,
          token: response.access_token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error: any) {
        console.error("❌ Login failed:", error);

        let errorMessage = "Login failed";

        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        }

        // Xử lý các loại lỗi cụ thể
        if (
          errorMessage.includes("401") ||
          errorMessage.includes("Unauthorized")
        ) {
          errorMessage = "Tên đăng nhập hoặc mật khẩu không chính xác";
        } else if (errorMessage.includes("Network error")) {
          errorMessage =
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        throw new Error(errorMessage);
      }
    },
    []
  );

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      // Gọi API logout (optional - server có thể không cần xử lý gì)
      await api.post("/auth/logout");
    } catch (error) {
      console.warn("Logout API call failed:", error);
      // Không throw error vì logout local vẫn cần thực hiện
    } finally {
      // Clear dữ liệu local
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      // Clear token trong api client
      api.setAuthToken(null);

      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async (): Promise<void> => {
    if (!state.token) {
      throw new Error("No token available for refresh");
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await api.post<{
        access_token: string;
        token_type: string;
      }>("/auth/refresh-token");

      // Update token
      localStorage.setItem(TOKEN_KEY, response.access_token);
      api.setAuthToken(response.access_token);

      setState((prev) => ({
        ...prev,
        token: response.access_token,
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      console.error("Token refresh failed:", error);

      // Nếu refresh token thất bại, logout user
      await logout();
      throw new Error("Session expired. Please login again.");
    }
  }, [state.token, logout]);

  // Clear error function
  const clearError = useCallback((): void => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  // Update user function
  const updateUser = useCallback((user: User): void => {
    // Update localStorage
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    // Update state
    setState((prev) => ({
      ...prev,
      user,
    }));
  }, []);

  // Check if user has specific role
  const hasRole = useCallback(
    (role: string): boolean => {
      return state.isAuthenticated && state.user?.role === role;
    },
    [state.isAuthenticated, state.user?.role]
  );

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback(
    (roles: string[]): boolean => {
      return state.isAuthenticated && state.user
        ? roles.includes(state.user.role)
        : false;
    },
    [state.isAuthenticated, state.user]
  );

  // Check if user is admin or owner of resource
  const isAdminOrOwner = useCallback(
    (resourceOwnerId?: number): boolean => {
      if (!state.isAuthenticated || !state.user) return false;
      return state.user.role === "admin" || state.user.id === resourceOwnerId;
    },
    [state.isAuthenticated, state.user]
  );

  return {
    // State
    ...state,

    // Actions
    login,
    logout,
    refreshToken,
    clearError,
    updateUser,

    // Helper methods
    hasRole,
    hasAnyRole,
    isAdminOrOwner,
  };
};
