// src/hooks/notifications/use-notifications.ts

import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import toastHelper from "@/utils/toast-helper";

export interface Notification {
  id: number;
  recipient_id: number;
  type: string;
  reference_id?: number;
  title: string;
  message: string;
  is_read: boolean;
  meta_data?: Record<string, any>;
  created_at: string;
  read_at?: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  loading: boolean;
  unreadCount: number;
  fetchNotifications: (unreadOnly?: boolean, limit?: number) => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(
    async (unreadOnly: boolean = false, limit: number = 50) => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append("unread_only", unreadOnly.toString());
        params.append("limit", limit.toString());

        const response = await api.get<NotificationListResponse>(
          `/notifications/list?${params.toString()}`
        );

        setNotifications(response.notifications);
        setUnreadCount(response.unread_count);
      } catch (err: any) {
        console.error("Error fetching notifications:", err);
        toastHelper.error("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await api.post(`/notifications/${notificationId}/read`);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error("Error marking notification as read:", err);
      toastHelper.error("Failed to mark as read");
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.post("/notifications/mark-all-read");

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);

      toastHelper.success("All notifications marked as read");
    } catch (err: any) {
      console.error("Error marking all as read:", err);
      toastHelper.error("Failed to mark all as read");
    }
  }, []);

  const deleteNotification = useCallback(
    async (notificationId: number) => {
      try {
        await api.delete(`/notifications/${notificationId}`);

        // Update local state
        const deletedNotif = notifications.find((n) => n.id === notificationId);
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

        if (deletedNotif && !deletedNotif.is_read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }

        toastHelper.success("Notification deleted");
      } catch (err: any) {
        console.error("Error deleting notification:", err);
        toastHelper.error("Failed to delete notification");
      }
    },
    [notifications]
  );

  return {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
