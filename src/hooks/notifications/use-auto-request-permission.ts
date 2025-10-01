// src/hooks/notifications/use-auto-request-permission.ts

import { useEffect } from "react";
import { useBrowserNotifications } from "./use-browser-notifications";
import toastHelper from "@/utils/toast-helper";

/**
 * Hook tự động request notification permission khi user login
 */
export function useAutoRequestPermission() {
  const { permission, requestPermission, isSupported } =
    useBrowserNotifications();

  useEffect(() => {
    // Only request if supported and permission is default (not granted/denied)
    if (isSupported && permission === "default") {
      // Wait 2 seconds after page load to avoid annoying user immediately
      const timer = setTimeout(async () => {
        console.log("🔔 Requesting notification permission...");

        const result = await requestPermission();

        if (result === "granted") {
          toastHelper.success("Notifications enabled! 🎉", {
            description: "You'll receive real-time updates",
          });
        } else if (result === "denied") {
          toastHelper.info("Notifications disabled", {
            description: "You can enable them later in browser settings",
          });
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isSupported, permission, requestPermission]);
}
