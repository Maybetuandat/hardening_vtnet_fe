import * as React from "react";
import {
  HelpCircleIcon,
  Boxes,
  LayoutDashboardIcon,
  Key,
  Server,
  Package,
  Shield,
  Bell,
  HardDrive,
  ScrollText,
  FileEdit, // Thêm icon cho OS
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { NavMain } from "@/components/side-bar/nav-main";
import { NavSecondary } from "@/components/side-bar/nav-secondary";
import { NavUser } from "@/components/side-bar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar({
  variant,
  ...props
}: { variant?: string } & React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const { t } = useTranslation();

  const data = {
    navMain: [
      {
        title: t("navigation.home"),
        url: "/",
        icon: LayoutDashboardIcon,
        isActive: location.pathname === "/" || location.pathname === "/home",
      },
      {
        title: t("navigation.workloads"),
        url: "/workloads",
        icon: Package,
        isActive: location.pathname.startsWith("/workloads"),
      },
      {
        title: t("navigation.instances"),
        url: "/instances",
        icon: Server,
        isActive: location.pathname.startsWith("/instances"),
      },
      {
        title: t("navigation.os"),
        url: "/os",
        icon: HardDrive,
        isActive: location.pathname.startsWith("/os"),
      },
      {
        title: t("navigation.log"),
        url: "/logs",
        icon: ScrollText,
        isActive: location.pathname.startsWith("/logs"),
      },
      {
        title: t("navigation.requests"),
        url: "/requests",
        icon: FileEdit,
        isActive: location.pathname.startsWith("/requests"),
      },
    ],
    navSecondary: [
      {
        title: t("navigation.notification"),
        url: "/notifications",
        icon: Bell,
      },
    ],
  };

  return (
    <Sidebar
      collapsible="icon"
      variant={variant}
      {...props}
      className="border-sidebar-border bg-sidebar"
    >
      <SidebarHeader className="bg-sidebar border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Link to="/">
                <Shield className="h-6 w-6 text-sidebar-primary" />
                <span className="text-lg font-semibold text-sidebar-foreground">
                  Hardening System
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar">
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter className="bg-sidebar border-t border-sidebar-border">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
