// src/lib/apiClient.ts - Mở rộng ApiClient có sẵn
import { api } from "./api";
import { LoginRequest, LoginResponse } from "@/types/auth";

// Storage keys
export const TOKEN_KEY = "authToken";
export const USER_KEY = "userInfo";

class AuthenticatedApiClient {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage khi khởi tạo
    this.loadToken();
    this.setupApiInterceptors();
  }

  // Load token từ localStorage
  private loadToken(): void {
    this.token = localStorage.getItem(TOKEN_KEY);
  }

  // Setup interceptors cho api object
  private setupApiInterceptors(): void {
    // Modify phương thức request của api để tự động thêm token
    const originalRequest = (api as any).request.bind(api);

    (api as any).request = async <T>(
      endpoint: string,
      options: RequestInit = {}
    ): Promise<T> => {
      // Thêm Authorization header nếu có token
      if (this.token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${this.token}`,
        };
      }

      try {
        const response = await originalRequest(endpoint, options);
        return response;
      } catch (error: any) {
        console.error("API request failed:", error);

        // Xử lý lỗi 401 - Token expired
        if (
          error.message?.includes("401") ||
          error.message?.includes("Unauthorized")
        ) {
          await this.handleUnauthorized();
          throw new Error("Authentication failed. Please login again.");
        }

        // Re-throw original error for other cases
        throw error;
      }
    };
  }

  // Xử lý khi gặp lỗi 401
  private async handleUnauthorized(): Promise<void> {
    // Clear token và redirect hoặc emit event
    this.clearAuthData();

    // Có thể emit event để AuthContext biết
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
  }

  // Auth API methods sử dụng api object
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log("🔐 Attempting login with:", {
        username: credentials.username,
        endpoint: "/auth/login",
      });

      const response = await api.post<LoginResponse>(
        "/auth/login", // Fixed: thêm /api prefix
        credentials
      );

      console.log("✅ Login successful:", response);

      // Lưu token
      this.setToken(response.access_token);
      this.saveAuthData(response.access_token, response.user);

      return response;
    } catch (error: any) {
      console.error("❌ Login failed:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout"); // Fixed: thêm /api prefix
    } catch (error) {
      console.warn("Logout API call failed:", error);
    } finally {
      this.clearAuthData();
    }
  }

  async refreshToken(): Promise<{ access_token: string }> {
    const response = await api.post<{ access_token: string }>(
      "/auth/refresh-token" // Fixed: thêm /api prefix
    );

    // Update token
    this.setToken(response.access_token);
    const userData = this.getStoredUserData();
    if (userData) {
      this.saveAuthData(response.access_token, userData);
    }

    return response;
  }

  // Token management
  setToken(token: string): void {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  // Storage helpers
  saveAuthData(token: string, user: any): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.token = token;
  }

  clearAuthData(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token = null;
  }

  getStoredAuthData(): { token: string | null; user: any | null } {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);

    let user = null;
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem(USER_KEY);
      }
    }

    return { token, user };
  }

  private getStoredUserData(): any | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        return null;
      }
    }
    return null;
  }
}

// Export singleton instance
export const authApi = new AuthenticatedApiClient();
