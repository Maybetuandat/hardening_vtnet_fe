import { ComplianceResult } from "@/types/compliance";
import { useEffect, useRef, useCallback, useState } from "react";
import { useAuth } from "@/hooks/authentication/use-auth";
import { useBrowserNotifications } from "./use-browser-notifications";

interface SSEMessage {
  type: string;
  data?: any;
  timestamp?: string;
  message?: string;
  title?: string;
  meta_data?: any;
  recipient_id?: number;
}

export interface UseSSENotificationsReturn {
  isConnected: boolean;
  connectionError: string | null;
  lastMessage: SSEMessage | null;
  unreadCount: number;
}

export function useSSENotifications(
  onComplianceCompleted?: (data: ComplianceResult) => void, // Callback cho completed/failed - để refresh dashboard
  onNewNotification?: () => void // Callback cho tất cả notifications - để refresh notification list
): UseSSENotificationsReturn {
  const { token, isAuthenticated, isLoading } = useAuth();
  const { showNotification, permission } = useBrowserNotifications();

  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<SSEMessage | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (isLoading || !isAuthenticated || !token) {
      return;
    }

    if (eventSourceRef.current) {
      return;
    }

    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const sseURL = `${baseURL}/notifications/stream?token=${token}`;

      const eventSource = new EventSource(sseURL);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
        console.log("✅ SSE connection established");
      };

      eventSource.onmessage = (event) => {
        console.log("🔥 SSE Raw message received:", event.data);

        try {
          const message: SSEMessage = JSON.parse(event.data);
          setLastMessage(message);

          console.log("📩 SSE Parsed message type:", message.type);

          switch (message.type) {
            case "connected":
              console.log("✅ SSE connection confirmed from server");
              break;

            case "completed":
              console.log("🎉 Compliance scan completed:", message.data);

              // ✅ Show browser notification
              if (permission === "granted") {
                showNotification("Compliance Scan Completed", {
                  body: `Score: ${message.data.score}% (${message.data.passed_rules}/${message.data.total_rules} rules passed)`,
                  tag: `compliance-${message.data.id}`,
                  requireInteraction: false,
                });
              }

              // Increase unread count
              setUnreadCount((prev) => prev + 1);

              // ✅ Trigger callback to refresh notification list (nếu có)
              onNewNotification?.();

              // ✅ Trigger callback to refresh dashboard data (nếu có)
              console.log(
                "🔄 Calling onComplianceCompleted callback:",
                typeof onComplianceCompleted
              );
              if (onComplianceCompleted) {
                console.log(
                  "✅ Executing onComplianceCompleted with data:",
                  message.data
                );
                onComplianceCompleted(message.data as ComplianceResult);
              } else {
                console.log("⚠️ onComplianceCompleted callback not provided");
              }
              break;

            case "failed":
              console.log("❌ Compliance scan failed:", message.data);

              // ✅ Show browser notification for failure
              if (permission === "granted") {
                showNotification("Compliance Scan Failed", {
                  body: `ip_address:${message.data.instance_ip || "Unknown"} ${
                    message.message || "Unknown error"
                  }`,
                  tag: "compliance-failed",
                  requireInteraction: false,
                });
              }

              // Increase unread count
              setUnreadCount((prev) => prev + 1);

              // ✅ Trigger callback to refresh notification list (nếu có)
              onNewNotification?.();

              // ✅ Trigger callback to refresh dashboard data (nếu có)
              console.log(
                "🔄 Calling onComplianceCompleted callback for failed:",
                typeof onComplianceCompleted
              );
              if (onComplianceCompleted) {
                console.log(
                  "✅ Executing onComplianceCompleted with data:",
                  message.data
                );
                onComplianceCompleted(message.data as ComplianceResult);
              } else {
                console.log("⚠️ onComplianceCompleted callback not provided");
              }
              break;

            // ✅ Rule change notifications - CHỈ refresh notification list, KHÔNG refresh dashboard
            case "rule_change_request":
              console.log("📬 New rule change request notification");

              if (permission === "granted") {
                showNotification(message.title || "New Rule Change Request", {
                  body: message.message,
                  tag: `rule-request-${message.meta_data?.request_id}`,
                  requireInteraction: true,
                  icon: "/icons/rule-change.png",
                });
              }

              setUnreadCount((prev) => prev + 1);
              // CHỈ refresh notification list
              onNewNotification?.();
              break;

            case "rule_change_approved":
              console.log("✅ Rule change request approved");

              if (permission === "granted") {
                showNotification(message.title || "Request Approved", {
                  body: message.message,
                  tag: `rule-approved-${message.meta_data?.request_id}`,
                  requireInteraction: false,
                  icon: "/icons/success.png",
                });
              }

              setUnreadCount((prev) => prev + 1);
              // CHỈ refresh notification list
              onNewNotification?.();
              break;

            case "rule_change_rejected":
              console.log("❌ Rule change request rejected");

              if (permission === "granted") {
                showNotification(message.title || "Request Rejected", {
                  body: message.message,
                  tag: `rule-rejected-${message.meta_data?.request_id}`,
                  requireInteraction: false,
                  icon: "/icons/error.png",
                });
              }

              setUnreadCount((prev) => prev + 1);
              // CHỈ refresh notification list
              onNewNotification?.();
              break;

            case "heartbeat":
              console.log("💓 SSE Heartbeat received at:", message.timestamp);
              break;

            default:
              console.log("⚠️ Unknown SSE message type:", message.type);
          }
        } catch (error) {
          console.error(
            "❌ Error parsing SSE message:",
            error,
            "Raw data:",
            event.data
          );
        }
      };

      eventSource.onerror = (error) => {
        console.error("❌ SSE Error:", error);
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
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (!isAuthenticated || !token) {
          console.log(
            "⚠️ SSE: Not authenticated or no token, stopping reconnection attempts."
          );
          setConnectionError(
            "Session expired or not logged in. Please re-login."
          );
        } else {
          console.error("❌ Max reconnection attempts reached");
          setConnectionError("Unable to reconnect. Please refresh the page.");
        }
      };
    } catch (error) {
      console.error("❌ Error creating SSE connection:", error);
      setConnectionError("Failed to establish connection");
    }
  }, [
    token,
    isAuthenticated,
    isLoading,
    onComplianceCompleted,
    onNewNotification,
    showNotification,
    permission,
  ]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return { isConnected, connectionError, lastMessage, unreadCount };
}
