// src/hooks/notifications/use-sse-notifications.ts
import { useEffect, useRef, useCallback, useState } from "react";
import { toast } from "sonner";

interface SSEMessage {
  type: string;
  data?: any;
  timestamp?: string;
  message?: string;
}

interface ComplianceCompletedData {
  id: number;
  server_id: number;
  server_ip: string;
  server_hostname: string;
  workload_name: string;
  status: string;
  total_rules: number;
  passed_rules: number;
  failed_rules: number;
  score: number;
  scan_date: string;
  updated_at: string;
}

export interface UseSSENotificationsReturn {
  isConnected: boolean;
  connectionError: string | null;
  lastMessage: SSEMessage | null;
}

export function useSSENotifications(
  onComplianceCompleted?: (data: ComplianceCompletedData) => void,
  onStatusUpdate?: (
    complianceId: number,
    status: string,
    serverId: number
  ) => void
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
      return; // Already connected
    }

    try {
      // API base URL from environment or default
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const sseURL = `${baseURL}/notifications/stream`;

      console.log("🔌 Connecting to SSE:", sseURL);

      const eventSource = new EventSource(sseURL);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("✅ SSE Connected");
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const message: SSEMessage = JSON.parse(event.data);
          setLastMessage(message);

          console.log("📥 SSE Message received:", message);

          switch (message.type) {
            case "connected":
              console.log("🎉 SSE connection established");
              break;

            case "compliance_completed":
              console.log("✅ Compliance scan completed:", message.data);

              // Show success notification
              toast.success(
                `Scan hoàn thành cho ${
                  message.data.server_hostname || message.data.server_ip
                }`,
                {
                  description: `Score: ${message.data.score}% (${message.data.passed_rules}/${message.data.total_rules} rules passed)`,
                  duration: 5000,
                }
              );

              // Call callback if provided
              if (onComplianceCompleted) {
                onComplianceCompleted(message.data as ComplianceCompletedData);
              }
              break;

            case "compliance_status_update":
              console.log("🔄 Compliance status update:", message.data);

              const { compliance_id, status, server_id } = message.data;

              // Show status update notification
              if (status === "running") {
                toast.info(`Bắt đầu scan server ID: ${server_id}`);
              } else if (status === "failed") {
                toast.error(`Scan thất bại cho server ID: ${server_id}`);
              }

              // Call callback if provided
              if (onStatusUpdate) {
                onStatusUpdate(compliance_id, status, server_id);
              }
              break;

            case "heartbeat":
              // Silent heartbeat
              break;

            default:
              console.log("📨 Unknown SSE message type:", message.type);
          }
        } catch (error) {
          console.error("❌ Error parsing SSE message:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("❌ SSE Error:", error);
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
            `🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.error("❌ Max reconnection attempts reached");
          setConnectionError("Không thể kết nối lại. Vui lòng refresh trang.");
        }
      };
    } catch (error) {
      console.error("❌ Failed to create SSE connection:", error);
      setConnectionError("Không thể tạo kết nối");
    }
  }, []); // Removed onStatusUpdate dependency

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
    console.log("🔌 SSE Disconnected");
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
