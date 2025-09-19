import { ComplianceResult } from "@/types/compliance";
import { useEffect, useRef, useCallback, useState } from "react";

import { useAuth } from "@/hooks/authentication/use-auth"; // Import useAuth hook
import toastHelper from "@/utils/toast-helper";

interface SSEMessage {
  type: string;
  data?: any;
  timestamp?: string;
  message?: string;
}

export interface UseSSENotificationsReturn {
  isConnected: boolean;
  connectionError: string | null;
  lastMessage: SSEMessage | null;
}

export function useSSENotifications(
  onComplianceCompleted?: (data: ComplianceResult) => void
): UseSSENotificationsReturn {
  const { token, isAuthenticated, isLoading } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<SSEMessage | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    // Không kết nối nếu đang loading hoặc không authenticated
    if (isLoading || !isAuthenticated || !token) {
      if (!isLoading && !isAuthenticated) {
        console.log("SSE: Not authenticated, skipping connection.");
      }
      if (!isLoading && isAuthenticated && !token) {
        console.log(
          "SSE: Authenticated but no token found, skipping connection."
        );
      }
      return;
    }

    if (eventSourceRef.current) {
      // Đã có kết nối, không tạo lại
      return;
    }

    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      // Thêm token vào URL làm query parameter
      const sseURL = `${baseURL}/notifications/stream?token=${token}`;

      const eventSource = new EventSource(sseURL);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
        console.log(" SSE connection established");
      };

      eventSource.onmessage = (event) => {
        console.log("🔥 SSE Raw message received:", event.data); // Debug raw data

        try {
          const message: SSEMessage = JSON.parse(event.data);
          setLastMessage(message);

          console.log("📩 SSE Parsed message type:", message.type); // Debug message type

          switch (message.type) {
            case "connected":
              console.log("✅ SSE connection confirmed from server");
              break;

            case "completed":
              console.log("🎉 Compliance scan completed:", message.data);

              toastHelper.success(
                `Scan successful for ${
                  message.data.server_hostname || message.data.server_ip
                }`,
                {
                  description: `Score: ${message.data.score}% (${message.data.passed_rules}/${message.data.total_rules} rules passed)`,
                  duration: 300,
                  action: {
                    label: "View",
                    onClick: () => {
                      /* Handle view action */
                    },
                  },
                }
              );

              if (onComplianceCompleted) {
                onComplianceCompleted(message.data as ComplianceResult);
              }
              break;

            case "failed":
              toastHelper.error(
                `Scan failed: ${message.message || "Unknown error"}`,
                {
                  duration: 300,
                }
              );

              if (onComplianceCompleted) {
                onComplianceCompleted(message.data as ComplianceResult);
              }
              break;

            case "heartbeat":
              console.log(" SSE Heartbeat received at:", message.timestamp);
              break;

            default:
              console.log(" Unknown SSE message type:", message.type);
          }
        } catch (error) {
          console.error(
            " Error parsing SSE message:",
            error,
            "Raw data:",
            event.data
          );
        }
      };

      eventSource.onerror = (error) => {
        console.error(" SSE Error:", error);
        setIsConnected(false);
        setConnectionError("Connection failed");

        eventSource.close();
        eventSourceRef.current = null;

        if (
          isAuthenticated &&
          token &&
          reconnectAttempts.current < maxReconnectAttempts
        ) {
          reconnectAttempts.current++;
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            30000
          ); // Max 30 seconds delay

          console.log(
            `Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect(); // Gọi lại connect
          }, delay);
        } else if (!isAuthenticated || !token) {
          console.log(
            "SSE: Not authenticated or no token, stopping reconnection attempts."
          );
          setConnectionError(
            "Session expired or not logged in. Please re-login."
          );
        } else {
          console.error(" Max reconnection attempts reached");
          setConnectionError("Unable to reconnect. Please refresh the page.");
        }
      };
    } catch (error) {
      console.error(" Failed to create SSE connection:", error);
      setConnectionError("Failed to create connection");
    }
  }, [token, isAuthenticated, isLoading, onComplianceCompleted]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setIsConnected(false);
    setConnectionError(null); // Clear error on disconnect
    reconnectAttempts.current = 0; // Reset attempts
    console.log(" SSE Disconnected");
  }, []);

  // Effect để quản lý kết nối dựa trên trạng thái xác thực và token
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && token) {
        connect();
      } else {
        disconnect(); // Ngắt kết nối nếu không authenticated hoặc không có token
      }
    }

    // Cleanup khi component unmount hoặc khi dependencies thay đổi
    return () => {
      disconnect();
    };
  }, [isAuthenticated, token, isLoading, connect, disconnect]);

  // Cleanup on unmount (đảm bảo ngắt kết nối khi component bị hủy)
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    connectionError,
    lastMessage,
  };
}
