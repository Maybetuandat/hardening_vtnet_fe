// src/hooks/notifications/use-browser-notifications.ts

import { useEffect, useCallback, useState } from "react";

interface UseBrowserNotificationsReturn {
  permission: NotificationPermission;
  requestPermission: () => Promise<NotificationPermission>;
  showNotification: (title: string, options?: NotificationOptions) => void;
  isSupported: boolean;
}

export function useBrowserNotifications(): UseBrowserNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "denied"
  );

  const isSupported = typeof window !== "undefined" && "Notification" in window;

  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, [isSupported]);

  const requestPermission =
    useCallback(async (): Promise<NotificationPermission> => {
      if (!isSupported) {
        console.warn("Browser notifications not supported");
        return "denied";
      }

      try {
        const result = await Notification.requestPermission();
        setPermission(result);
        return result;
      } catch (error) {
        console.error("Error requesting notification permission:", error);
        return "denied";
      }
    }, [isSupported]);

  const showNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!isSupported) {
        console.warn("Browser notifications not supported");
        return;
      }

      if (permission !== "granted") {
        console.warn("Notification permission not granted");
        return;
      }

      try {
        const notification = new Notification(title, {
          icon: "/logo.png", // Thay bằng logo của bạn
          badge: "/badge.png", // Badge icon
          ...options,
        });

        // Auto close after 10 seconds
        setTimeout(() => notification.close(), 10000);

        // Handle click - focus window
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (error) {
        console.error("Error showing notification:", error);
      }
    },
    [isSupported, permission]
  );

  return {
    permission,
    requestPermission,
    showNotification,
    isSupported,
  };
}
