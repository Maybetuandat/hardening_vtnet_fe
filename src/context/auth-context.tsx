// src/contexts/AuthContext.tsx
import React, { createContext, useEffect, useReducer, ReactNode } from "react";
import {
  AuthContextType,
  LoginRequest,
  User,
  LoginResponse,
} from "@/types/auth";
import { api } from "@/lib/api";
import { authReducer, initialAuthState } from "./authReducer";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

const TOKEN_KEY = "jwt_token";
const USER_KEY = "user_data";

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    ...initialAuthState,
    isLoading: true, // Bắt đầu với isLoading = true
  });

  // Listen for unauthorized events (existing logic)
  useEffect(() => {
    const handleUnauthorized = () => {
      console.error("Auth: Unauthorized event received, logging out.");
      dispatch({
        type: "AUTH_ERROR",
        payload: "Session expired. Please login again.",
      });
      // Optionally, force a full logout which clears token and redirects.
      // logout(); // Be careful with calling async functions directly in event handlers without proper cleanup
      // Or simply:
      api.setAuthToken(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []); // Empty dependency array means this runs once on mount

  // Initialize auth from storage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      // Make it async if you want to perform async checks like token validation later
      dispatch({ type: "AUTH_START" }); // Explicitly set loading to true

      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          const user: User = JSON.parse(storedUser);

          // Rất quan trọng: Set token trong ApiClient NGAY LẬP TỨC
          api.setAuthToken(storedToken);

          // Tùy chọn: Gọi một API endpoint nhỏ (ví dụ: /auth/me)
          // để xác thực token với backend và kiểm tra xem token còn hợp lệ không.
          // Điều này ngăn chặn việc hiển thị người dùng đăng nhập với token đã hết hạn.
          try {
            // Ví dụ: Lấy thông tin người dùng từ backend để xác thực token
            // Nếu API này fail (401), nó sẽ nhảy vào catch block
            const validatedUser: User = await api.get<User>("/auth/me");
            dispatch({
              type: "AUTH_SUCCESS",
              payload: { user: validatedUser, token: storedToken },
            });
            console.log(
              "Auth initialized: User session restored and token validated."
            );
          } catch (validationError: any) {
            console.error(
              "Auth initialization: Token validation failed, forcing logout.",
              validationError
            );
            // Token không hợp lệ hoặc hết hạn, coi như chưa đăng nhập
            api.setAuthToken(null);
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            dispatch({
              type: "AUTH_ERROR",
              payload: "Session expired or invalid. Please login again.",
            });
          }
        } else {
          // Không có token hoặc user, chỉ đơn giản là không authenticated
          console.log("Auth initialized: No token/user found in localStorage.");
          dispatch({ type: "LOGOUT" }); // Đảm bảo trạng thái sạch
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Clear corrupted data
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        api.setAuthToken(null);

        dispatch({
          type: "AUTH_ERROR",
          payload: "Error initializing authentication",
        });
      } finally {
        // Đảm bảo isLoading luôn được đặt thành false sau khi quá trình khởi tạo hoàn tất
        // dispatch({ type: "SET_LOADING", payload: false }); // AUTH_SUCCESS/AUTH_ERROR/LOGOUT đã xử lý isLoading=false
      }
    };

    initializeAuth();
  }, []); // Chạy một lần khi component mount

  // ... (login, logout, refreshToken, clearError, updateUser functions remain the same) ...
  const login = async (credentials: LoginRequest): Promise<void> => {
    dispatch({ type: "AUTH_START" });

    try {
      console.log("🔐 Starting login process...");
      const response = await api.post<LoginResponse>(
        "/auth/login",
        credentials
      );

      console.log("✅ Login successful, dispatching AUTH_SUCCESS");

      localStorage.setItem(TOKEN_KEY, response.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      api.setAuthToken(response.access_token); // Đảm bảo api client được cập nhật

      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          user: response.user,
          token: response.access_token,
        },
      });
    } catch (error: any) {
      console.error("❌ Login failed in auth context:", error);
      let errorMessage = "Login failed";
      // ... (error handling) ...
      dispatch({ type: "AUTH_ERROR", payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      api.setAuthToken(null);
      dispatch({ type: "LOGOUT" });
    }
  };

  const refreshToken = async (): Promise<void> => {
    if (!state.token) {
      throw new Error("No token available for refresh");
    }

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const response = await api.post<{
        access_token: string;
        token_type: string;
      }>("/auth/refresh-token");

      // Update localStorage
      localStorage.setItem(TOKEN_KEY, response.access_token);

      // Set new token in api client
      api.setAuthToken(response.access_token);

      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          user: state.user!,
          token: response.access_token,
        },
      });
    } catch (error) {
      console.error("Token refresh failed:", error);
      await logout();
      throw error;
    }
  };

  // Clear error
  const clearError = (): void => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  // Update user
  const updateUser = (user: User): void => {
    if (state.token) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      dispatch({ type: "UPDATE_USER", payload: user });
    }
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshToken,
    clearError,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
