const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ApiClient {
  private baseURL: string;
  private authToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;

    if (typeof window !== "undefined" && localStorage.getItem("jwt_token")) {
      this.authToken = localStorage.getItem("jwt_token");
    }
  }

  public setAuthToken(token: string | null) {
    this.authToken = token;
    if (token) {
      localStorage.setItem("jwt_token", token);
    } else {
      localStorage.removeItem("jwt_token");
    }
  }

  public getAuthToken(): string | null {
    return this.authToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    const config: RequestInit = {
      headers: headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Xử lý phản hồi không có nội dung (ví dụ: DELETE thành công)
      if (response.status === 204) {
        return {} as T;
      }

      let responseData;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      console.log("📊 Response data:", responseData);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;

        if (typeof responseData === "object" && responseData !== null) {
          if (
            "detail" in responseData &&
            typeof responseData.detail === "string"
          ) {
            errorMessage = responseData.detail;
          } else if (
            "message" in responseData &&
            typeof responseData.message === "string"
          ) {
            errorMessage = responseData.message;
          } else {
            errorMessage = JSON.stringify(responseData);
          }
        } else if (typeof responseData === "string") {
          errorMessage = responseData;
        }

        console.error("❌ API Error Response:", responseData);

        if (response.status === 401) {
          console.error("Token invalid or expired. Please re-authenticate.");

          this.setAuthToken(null);
        }
        throw new Error(errorMessage);
      }

      return responseData as T;
    } catch (error) {
      console.error("💥 API Request Failed:", {
        url,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      if (error instanceof Error) {
        throw error;
      }

      throw new Error("Network error - Unable to connect to server");
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: { signal?: AbortSignal }
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      signal: options?.signal,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const api = new ApiClient(API_BASE_URL);
