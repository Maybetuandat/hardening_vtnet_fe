const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    console.log("🌐 API Request:", url); // Debug log
    console.log("📦 Request options:", {
      method: options.method || "GET",
      headers: options.headers,
      body: options.body,
    });

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      console.log("📈 Response status:", response.status); // Debug log

      // Handle no content responses (like DELETE)
      if (response.status === 204) {
        return {} as T;
      }

      // Try to parse response body
      let responseData;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      console.log("📊 Response data:", responseData); // Debug log

      if (!response.ok) {
        // Handle different error formats
        let errorMessage = `HTTP ${response.status}`;

        if (typeof responseData === "object" && responseData.detail) {
          errorMessage = responseData.detail;
        } else if (typeof responseData === "string") {
          errorMessage = responseData;
        } else if (typeof responseData === "object" && responseData.message) {
          errorMessage = responseData.message;
        }

        console.error("❌ API Error Response:", responseData);
        throw new Error(errorMessage);
      }

      return responseData as T;
    } catch (error) {
      console.error("💥 API Request Failed:", {
        url,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Re-throw with better error message
      if (error instanceof Error) {
        throw error;
      }

      // Handle network errors
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

// Export instance
export const api = new ApiClient(API_BASE_URL);
