import { type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                size="lg" // Sử dụng size lớn hơn
                className={
                  item.isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground h-11 px-3 py-2" // Tăng height và padding
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-11 px-3 py-2"
                }
              >
                <Link to={item.url}>
                  {item.icon && (
                    <item.icon
                      className={`h-5 w-5 ${
                        item.isActive
                          ? "text-primary-foreground"
                          : "text-sidebar-foreground"
                      }`}
                    />
                  )}
                  <span
                    className={`text-base font-medium ${
                      item.isActive
                        ? "text-primary-foreground"
                        : "text-sidebar-foreground"
                    }`}
                  >
                    {item.title}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
