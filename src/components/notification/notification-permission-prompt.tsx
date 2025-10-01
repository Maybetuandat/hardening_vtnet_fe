// src/components/notification/notification-permission-prompt.tsx

import React, { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBrowserNotifications } from "@/hooks/notifications/use-browser-notifications";

export function NotificationPermissionPrompt() {
  const { permission, requestPermission, isSupported } =
    useBrowserNotifications();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if user dismissed before
    const dismissed = localStorage.getItem("notification-permission-dismissed");
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show prompt after 3 seconds if permission is default
    if (isSupported && permission === "default") {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isSupported, permission]);

  const handleEnable = async () => {
    const result = await requestPermission();
    if (result === "granted") {
      setShowPrompt(false);
      // Show success notification
      new Notification("Notifications Enabled! 🎉", {
        body: "You'll now receive real-time updates",
        icon: "/logo.png",
      });
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsDismissed(true);
    localStorage.setItem("notification-permission-dismissed", "true");
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
    // Will show again next session
  };

  if (!isSupported || isDismissed || !showPrompt || permission !== "default") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="shadow-lg border-2 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-sm">
                    Enable Notifications
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Get instant alerts for compliance scans, rule changes, and
                    important updates
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 -mt-1 -mr-1"
                  onClick={handleDismiss}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleEnable} className="flex-1">
                  Enable
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRemindLater}
                  className="flex-1"
                >
                  Later
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
