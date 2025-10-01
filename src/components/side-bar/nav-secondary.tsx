// src/components/side-bar/nav-secondary.tsx

"use client";

import * as React from "react";
import { LucideIcon, Bell } from "lucide-react";
import { api } from "@/lib/api";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const [unreadCount, setUnreadCount] = React.useState(0);

  const fetchUnreadCount = React.useCallback(async () => {
    try {
      const response = await api.get<{ unread_count: number }>(
        "/notifications/unread-count"
      );
      setUnreadCount(response.unread_count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, []);

  // Fetch on mount
  React.useEffect(() => {
    fetchUnreadCount();

    // Refetch every 30 seconds để cập nhật số
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isNotificationItem = item.icon === Bell;

            return (
              <SidebarMenuItem key={item.title} className="relative">
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <a href={item.url}>
                    <item.icon className="h-5 w-5 text-sidebar-foreground" />
                    <span className="text-base text-sidebar-foreground">
                      {item.title}
                    </span>
                  </a>
                </SidebarMenuButton>

                {isNotificationItem && unreadCount > 0 && (
                  <span className="absolute left-3 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white border-2 border-sidebar z-10">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
