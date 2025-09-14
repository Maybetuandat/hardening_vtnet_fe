import {
  LogOutIcon,
  MoreVerticalIcon,
  UserCircleIcon,
  Loader2,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/authentication/use-auth";
import { ThemeSettingsPanel } from "@/components/theme/theme-settings-panel";

export function NavUser() {
  const { t } = useTranslation("common");
  const { isMobile, state } = useSidebar(); // Thêm state từ useSidebar
  const navigate = useNavigate();

  // Sử dụng auth hooks từ Context
  const { user, logout, isLoading, isAuthenticated } = useAuth();

  const handleAccountClick = () => {
    navigate("/profile");
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      // Force navigate anyway nếu logout API thất bại
      navigate("/login", { replace: true });
    }
  };

  const getInitials = (user: any): string => {
    if (!user) return "U";

    if (user.full_name) {
      const parts = user.full_name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return parts[0][0].toUpperCase();
    }

    return user.username?.[0]?.toUpperCase() || "U";
  };

  const getDisplayName = (user: any): string => {
    return user?.full_name || user?.username || t("sidebar.user", "User");
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive" as const;
      case "user":
        return "default" as const;
      default:
        return "secondary" as const;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              <Loader2 className="size-4 animate-spin" />
            </div>
            {state !== "collapsed" && (
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {t("common.loading", "Đang tải...")}
                </span>
              </div>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            onClick={() => navigate("/login")}
            tooltip={
              state === "collapsed" ? t("auth.login", "Đăng nhập") : undefined
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <UserCircleIcon className="size-5" />
            </div>
            {state !== "collapsed" && (
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {t("auth.login", "Đăng nhập")}
                </span>
                <span className="truncate text-xs">
                  {t("auth.clickToLogin", "Nhấp để đăng nhập")}
                </span>
              </div>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Authenticated user display - Đây là phần quan trọng nhất!
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              tooltip={state === "collapsed" ? getDisplayName(user) : undefined}
            >
              {/* User icon - LUÔN hiển thị */}
              <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                {getInitials(user)}
              </div>

              {/* Text info - CHỈ hiển thị khi KHÔNG collapsed */}
              {state !== "collapsed" && (
                <>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {getDisplayName(user)}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="truncate text-xs text-sidebar-muted-foreground">
                        {user.email}
                      </span>
                      {user.role && (
                        <Badge
                          variant={getRoleBadgeVariant(user.role)}
                          className="text-xs h-4 px-1"
                        >
                          {user.role}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <MoreVerticalIcon className="ml-auto size-4" />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-primary text-primary-foreground font-semibold">
                    {getInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {getDisplayName(user)}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleAccountClick}>
                <UserCircleIcon className="mr-2 h-4 w-4" />
                {t("sidebar.account", "Tài khoản")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            {/* Settings sử dụng ThemeSettingsPanel thay vì navigation */}
            <ThemeSettingsPanel
              variant="dialog"
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Settings className="mr-2 h-4 w-4" />
                  {t("sidebar.settings", "Cài đặt")}
                </DropdownMenuItem>
              }
            />

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOutIcon className="mr-2 h-4 w-4" />
              {t("sidebar.logout", "Đăng xuất")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
