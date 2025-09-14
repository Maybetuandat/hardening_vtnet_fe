// src/contexts/AuthContext.tsx
import React, { createContext, useEffect, useReducer, ReactNode } from "react";
import { AuthContextType, LoginRequest, User } from "@/types/auth";

import { authApi } from "@/lib/apiClient";
import { authReducer, initialAuthState } from "./authReducer";

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

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
        const { token, user } = authApi.getStoredAuthData();

        if (token && user) {
          dispatch({
            type: "AUTH_SUCCESS",
            payload: { user, token },
          });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        authApi.clearAuthData();
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginRequest): Promise<void> => {
    dispatch({ type: "AUTH_START" });

    try {
      const response = await authApi.login(credentials);

      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          user: response.user,
          token: response.access_token,
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      dispatch({ type: "AUTH_ERROR", payload: errorMessage });
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
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
      const response = await authApi.refreshToken();

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
    authApi.saveAuthData(state.token!, user);
    dispatch({ type: "UPDATE_USER", payload: user });
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
