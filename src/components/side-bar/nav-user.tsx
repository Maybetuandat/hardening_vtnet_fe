import {
  LogOutIcon,
  MoreVerticalIcon,
  UserCircleIcon,
  Loader2,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
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


import { ThemeSettingsPanel } from "@/components/theme/theme-settings-panel";

interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  fullName: string;
  isPremium: boolean;
}


const getMockUserData = (): UserInfo => {
  // Kiểm tra localStorage trước
  const storedUser = localStorage.getItem('userInfo');
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error('Error parsing stored user data:', error);
    }
  }

  // Fallback to mock data
  return {
    id: "user-123",
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    email: "john.doe@example.com",
    fullName: "John Doe",
    isPremium: false,
  };
};

// Simulate API call với delay
const fetchUserInfo = (): Promise<UserInfo> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getMockUserData());
    }, 500); // Simulate network delay
  });
};

export function NavUser() {
  const { t } = useTranslation('common');
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Fetch user info - không còn dependency vào api
  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      if (hasLoaded) return; // Only fetch once

      try {
        setLoading(true);
        const userData = await fetchUserInfo(); // Sử dụng function local thay vì api

        if (mounted) {
          setUserInfo(userData);
          setHasLoaded(true);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        if (mounted) {
          setHasLoaded(true); // Mark as loaded even on error
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      mounted = false;
    };
  }, [hasLoaded]);

  const handleAccountClick = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    try {
      // Show loading toast
     
      // Clear localStorage
      localStorage.removeItem('userInfo');
      localStorage.removeItem('authToken'); // nếu có
      
      // Simulate logout delay
      await new Promise(resolve => setTimeout(resolve, 1000));

     

    

      // Redirect after showing toast
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1000);
    } catch (error) {
      console.error("Logout error:", error);

      // Clear local data anyway
      localStorage.removeItem('userInfo');
      localStorage.removeItem('authToken');

    

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1000);
    }
  }, [navigate, t]); // Removed api dependency

  // Helper functions - safe versions
  const getInitials = (user: UserInfo | null): string => {
    if (!user) return "U";

    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.fullName) {
      const parts = user.fullName.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return user.fullName[0].toUpperCase();
    }
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const getDisplayName = (user: UserInfo | null): string => {
    if (!user) return "User";
    return (
      user.fullName ||
      `${user.firstName} ${user.lastName}`.trim() ||
      user.username ||
      "User"
    );
  };

  const getEmail = (user: UserInfo | null): string => {
    return user?.email || "user@example.com";
  };

  // Render logic - simple and safe
  const displayName = getDisplayName(userInfo);
  const initials = getInitials(userInfo);
  const email = getEmail(userInfo);
  const isPremium = userInfo?.isPremium || false;

  // Show loading skeleton
  if (loading && !userInfo) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <div className="h-4 bg-muted rounded animate-pulse mb-1" />
              <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
            </div>
            <Loader2 className="ml-auto size-4 animate-spin" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {email}
                </span>
              </div>
              <MoreVerticalIcon className="ml-auto size-4" />
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
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleAccountClick}>
                <UserCircleIcon />
                {t('sidebar.account')}
              </DropdownMenuItem>
              {isPremium && (
                <DropdownMenuItem>
                  <span className="text-yellow-600 font-medium">
                    ✨ {t('sidebar.premiumAccount')}
                  </span>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <ThemeSettingsPanel 
              variant="dialog"
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Settings />
                  {t('sidebar.settings')}
                </DropdownMenuItem>
              }
            />
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOutIcon />
              {t('sidebar.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}