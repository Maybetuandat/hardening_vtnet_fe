// api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ApiClient {
  private baseURL: string;
  private authToken: string | null = null; // Biến để lưu trữ token

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Tùy chọn: Khởi tạo authToken từ localStorage khi đối tượng được tạo
    // Điều này giúp duy trì trạng thái đăng nhập qua các lần tải lại trang
    if (typeof window !== "undefined" && localStorage.getItem("jwt_token")) {
      this.authToken = localStorage.getItem("jwt_token");
    }
  }

  /**
   * Thiết lập hoặc xóa JWT token.
   * Đồng thời lưu/xóa token vào localStorage.
   * @param token Chuỗi JWT token hoặc null để xóa.
   */
  public setAuthToken(token: string | null) {
    this.authToken = token;
    if (token) {
      localStorage.setItem("jwt_token", token);
    } else {
      localStorage.removeItem("jwt_token");
    }
  }

  /**
   * Lấy JWT token hiện tại.
   * @returns Chuỗi JWT token hoặc null nếu không có.
   */
  public getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Thực hiện một HTTP request chung.
   * @param endpoint Đường dẫn API tương đối (ví dụ: '/users').
   * @param options Tùy chọn cho fetch API (method, headers, body, v.v.).
   * @returns Promise chứa dữ liệu phản hồi từ server.
   */
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

    // Tạo headers mặc định và thêm Content-Type
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>), // Ghi đè bất kỳ header nào được cung cấp trong options
    };

    // Thêm Authorization header nếu có token
    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    const config: RequestInit = {
      headers: headers,
      ...options, // Ghi đè bất kỳ tùy chọn nào khác
    };

    try {
      const response = await fetch(url, config);

      console.log("📈 Response status:", response.status); // Debug log

      // Xử lý phản hồi không có nội dung (ví dụ: DELETE thành công)
      if (response.status === 204) {
        return {} as T; // Trả về một đối tượng rỗng với kiểu T
      }

      // Cố gắng phân tích cú pháp body phản hồi
      let responseData;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      console.log("📊 Response data:", responseData); // Debug log

      if (!response.ok) {
        // Xử lý các định dạng lỗi khác nhau từ server
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

        // Xử lý đặc biệt cho lỗi 401 (Unauthorized)
        if (response.status === 401) {
          console.error("Token invalid or expired. Please re-authenticate.");
          // Xóa token cũ để người dùng phải đăng nhập lại
          this.setAuthToken(null);
          // Bạn có thể thêm logic chuyển hướng đến trang đăng nhập tại đây,
          // hoặc phát ra một sự kiện toàn cục để component khác xử lý.
          // Ví dụ: window.location.href = '/login';
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

      // Ném lại lỗi gốc nếu nó là một instance của Error
      if (error instanceof Error) {
        throw error;
      }

      // Xử lý các lỗi mạng không phải từ server
      throw new Error("Network error - Unable to connect to server");
    }
  }

  /**
   * Thực hiện HTTP GET request.
   * @param endpoint Đường dẫn API tương đối.
   * @returns Promise chứa dữ liệu phản hồi.
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  /**
   * Thực hiện HTTP POST request.
   * @param endpoint Đường dẫn API tương đối.
   * @param data Dữ liệu sẽ gửi trong body request.
   * @param options Tùy chọn bổ sung (ví dụ: signal cho AbortController).
   * @returns Promise chứa dữ liệu phản hồi.
   */
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

  /**
   * Thực hiện HTTP PUT request.
   * @param endpoint Đường dẫn API tương đối.
   * @param data Dữ liệu sẽ gửi trong body request.
   * @returns Promise chứa dữ liệu phản hồi.
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Thực hiện HTTP PATCH request.
   * @param endpoint Đường dẫn API tương đối.
   * @param data Dữ liệu sẽ gửi trong body request.
   * @returns Promise chứa dữ liệu phản hồi.
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Thực hiện HTTP DELETE request.
   * @param endpoint Đường dẫn API tương đối.
   * @returns Promise chứa dữ liệu phản hồi.
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

// Export một instance duy nhất của ApiClient để sử dụng trên toàn ứng dụng.
// Điều này đảm bảo rằng tất cả các phần của ứng dụng đều chia sẻ cùng một đối tượng ApiClient
// và do đó, cùng một trạng thái token.
export const api = new ApiClient(API_BASE_URL);
