import { ComplianceResult } from "@/types/compliance";
import { useEffect, useRef, useCallback, useState } from "react";
import { toast } from "sonner";

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
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<SSEMessage | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      return;
    }

    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const sseURL = `${baseURL}/notifications/stream`;

      const eventSource = new EventSource(sseURL);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log(" SSE Connected");
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const message: SSEMessage = JSON.parse(event.data);
          setLastMessage(message);

          console.log(" SSE Message received:", message);

          switch (message.type) {
            case "connected":
              console.log(" SSE connection established");
              break;

            case "compliance_completed":
              console.log(" Compliance scan completed:", message.data);

              toast.success(
                `Scan hoàn thành cho ${
                  message.data.server_hostname || message.data.server_ip
                }`,
                {
                  description: `Score: ${message.data.score}% (${message.data.passed_rules}/${message.data.total_rules} rules passed)`,
                  duration: 5000,
                }
              );

              if (onComplianceCompleted) {
                onComplianceCompleted(message.data as ComplianceResult);
              }
              break;

            case "heartbeat":
              // Silent heartbeat
              break;

            default:
              console.log(" Unknown SSE message type:", message.type);
          }
        } catch (error) {
          console.error(" Error parsing SSE message:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error(" SSE Error:", error);
        setIsConnected(false);
        setConnectionError("Kết nối thất bại");

        // Close current connection
        eventSource.close();
        eventSourceRef.current = null;

        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            30000
          );

          console.log(
            `Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.error(" Max reconnection attempts reached");
          setConnectionError("Không thể kết nối lại. Vui lòng refresh trang.");
        }
      };
    } catch (error) {
      console.error(" Failed to create SSE connection:", error);
      setConnectionError("Không thể tạo kết nối");
    }
  }, []);

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
    console.log(" SSE Disconnected");
  }, []);

  // Auto connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Cleanup on unmount
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
