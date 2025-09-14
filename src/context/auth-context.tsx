// src/contexts/AuthContext.tsx
import React, { createContext, useEffect, useReducer, ReactNode } from "react";
import {
  AuthContextType,
  LoginRequest,
  User,
  LoginResponse,
} from "@/types/auth";
import { api } from "@/lib/api"; // Sử dụng trực tiếp api instance có sẵn
import { authReducer, initialAuthState } from "./authReducer";

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Storage keys
const TOKEN_KEY = "jwt_token";
const USER_KEY = "user_data";

// Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // Listen for unauthorized events
  useEffect(() => {
    const handleUnauthorized = () => {
      dispatch({
        type: "AUTH_ERROR",
        payload: "Session expired. Please login again.",
      });
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  // Initialize auth from storage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          const user: User = JSON.parse(storedUser);

          // Set token in api client
          api.setAuthToken(storedToken);

          dispatch({
            type: "AUTH_SUCCESS",
            payload: { user, token: storedToken },
          });
        } else {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Clear corrupted data
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        api.setAuthToken(null);

        dispatch({
          type: "AUTH_ERROR",
          payload: "Error initializing authentication",
        });
      }
    };

    initializeAuth();
  }, []);

  // Login function with improved error handling
  const login = async (credentials: LoginRequest): Promise<void> => {
    dispatch({ type: "AUTH_START" });

    try {
      console.log("🔐 Starting login process...");
      const response = await api.post<LoginResponse>(
        "/auth/login",
        credentials
      );

      console.log("✅ Login successful, dispatching AUTH_SUCCESS");

      // Save to localStorage
      localStorage.setItem(TOKEN_KEY, response.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));

      // Set token in api client
      api.setAuthToken(response.access_token);

      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          user: response.user,
          token: response.access_token,
        },
      });
    } catch (error: any) {
      console.error("❌ Login failed in auth context:", error);

      // Better error message extraction
      let errorMessage = "Login failed";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.detail) {
        errorMessage = error.detail;
      }

      // Handle specific error cases
      if (
        errorMessage.includes("401") ||
        errorMessage.includes("Unauthorized")
      ) {
        errorMessage = "Incorrect username or password";
      } else if (errorMessage.includes("Network error")) {
        errorMessage =
          "Cannot connect to server. Please check your connection.";
      } else if (errorMessage.includes("fetch")) {
        errorMessage = "Network error. Please try again.";
      }

      dispatch({ type: "AUTH_ERROR", payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // Clear localStorage
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      // Clear token in api client
      api.setAuthToken(null);

      dispatch({ type: "LOGOUT" });
    }
  };

  // Refresh token function
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

  // Context value
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
