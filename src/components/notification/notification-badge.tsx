// src/components/notification/notification-badge.tsx

import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/notifications/use-notifications";
import { useSSENotifications } from "@/hooks/notifications/use-sse-notifications";
import { NotificationCard } from "./notification-card";
import { useNavigate } from "react-router-dom";

export function NotificationBadge() {
  const navigate = useNavigate();
  const {
    notifications,
    loading,
    unreadCount: dbUnreadCount,
    fetchNotifications,
    markAsRead,
    deleteNotification,
  } = useNotifications();

  // ✅ SSE để nhận real-time notifications
  const { unreadCount: sseUnreadCount } = useSSENotifications(undefined, () => {
    // Callback khi có notification mới -> refresh list
    fetchNotifications(false, 10); // Lấy 10 notifications mới nhất
  });

  const [isOpen, setIsOpen] = useState(false);

  // Sync unread count từ SSE hoặc DB
  const displayUnreadCount =
    sseUnreadCount > 0 ? sseUnreadCount : dbUnreadCount;

  // Initial load
  useEffect(() => {
    fetchNotifications(false, 10);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id);
    fetchNotifications(false, 10);
  };

  const handleDelete = async (id: number) => {
    await deleteNotification(id);
    fetchNotifications(false, 10);
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate("/notifications");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {displayUnreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {displayUnreadCount > 99 ? "99+" : displayUnreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {displayUnreadCount > 0 && (
            <Badge variant="secondary">{displayUnreadCount} unread</Badge>
          )}
        </div>

        <ScrollArea className="h-96">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.slice(0, 10).map((notification) => (
                <div key={notification.id} className="p-2">
                  <NotificationCard
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-2 border-t">
            <Button variant="ghost" className="w-full" onClick={handleViewAll}>
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
