import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FilterBar from "@/components/ui/filter-bar";

import { useNotifications } from "@/hooks/notifications/use-notifications";
import { Bell, CheckCheck, Loader2, Inbox } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationCard } from "@/components/notification/notification-card";

export default function NotificationsPage() {
  const {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [filterType, setFilterType] = useState("all"); // all | unread
  const [searchTerm, setSearchTerm] = useState("");
  const [limit, setLimit] = useState(50);

  // Initial load
  useEffect(() => {
    fetchNotifications(filterType === "unread", limit);
  }, [filterType, limit, fetchNotifications]);

  const handleRefresh = useCallback(() => {
    fetchNotifications(filterType === "unread", limit);
  }, [fetchNotifications, filterType, limit]);

  const handleMarkAsRead = useCallback(
    async (id: number) => {
      await markAsRead(id);
      // Refresh if viewing unread only
      if (filterType === "unread") {
        handleRefresh();
      }
    },
    [markAsRead, filterType, handleRefresh]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
    handleRefresh();
  }, [markAllAsRead, handleRefresh]);

  const handleDelete = useCallback(
    async (id: number) => {
      await deleteNotification(id);
    },
    [deleteNotification]
  );

  // Filter notifications by search term
  const filteredNotifications = notifications.filter((notification) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      notification.title.toLowerCase().includes(search) ||
      notification.message.toLowerCase().includes(search)
    );
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notifications
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage your notifications
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Mark All as Read ({unreadCount})
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchSubmit={() => {}}
        filters={[
          {
            value: filterType,
            onChange: setFilterType,
            options: [
              { value: "all", label: "All Notifications" },
              { value: "unread", label: `Unread (${unreadCount})` },
            ],
            placeholder: "Filter by status",
            widthClass: "w-48",
          },
          {
            value: limit.toString(),
            onChange: (value) => setLimit(parseInt(value)),
            options: [
              { value: "20", label: "Last 20" },
              { value: "50", label: "Last 50" },
              { value: "100", label: "Last 100" },
            ],
            placeholder: "Limit",
            widthClass: "w-32",
          },
        ]}
      />

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {filterType === "unread"
                ? "Unread Notifications"
                : "All Notifications"}{" "}
              ({filteredNotifications.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Inbox className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                {filterType === "unread"
                  ? "You have no unread notifications"
                  : searchTerm
                  ? `No notifications found matching "${searchTerm}"`
                  : "You don't have any notifications yet"}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="space-y-3 pr-4">
                {filteredNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
