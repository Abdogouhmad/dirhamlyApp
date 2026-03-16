import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,       // ← added for better structure
  useSidebar,
} from "@/components/ui/sidebar";

import { LayoutDashboard, CreditCard, BarChart3, Wallet, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SettingsDialog } from "@/components/ui/profile/main";
import { cn } from "@/lib/utils"; // assuming you have cn helper
import { Link, useLocation } from "react-router-dom";


// 1. Define your navigation items here
const NAV_ITEMS = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Transactions", url: "/transactions", icon: CreditCard },
  { title: "Insights", url: "/insights", icon: BarChart3 },
  { title: "Budgets", url: "/budgets", icon: Wallet },
];

export function AppSidebar() {
const { state, isMobile, toggleSidebar } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed" && !isMobile;

  return (
    <Sidebar className={cn("transition-[width] duration-300 ease-in-out bg-background border-r", isCollapsed && "w-16")} variant="sidebar" collapsible="icon">
      {/* Header with brand + toggle */}
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Brand - hide text when collapsed */}
          <div className="flex items-center gap-2">
            {/* Optional small logo/icon */}
            <div className="h-6 w-6 rounded bg-rust-500/20 flex items-center justify-center text-rust-500 font-bold text-xs">
              D
            </div>
            <span
              className={cn(
                "font-bold uppercase tracking-wider text-rust-500 text-sm",
                isCollapsed && "hidden"
              )}
            >
              Dirhamly
            </span>
          </div>

          {/* Toggle button - always visible */}
          {!isMobile && (
            <SidebarMenuButton
              onClick={toggleSidebar}
              size="sm"
              variant="outline"
              className="h-8 w-8"
            >
              <Menu className="h-5 w-5" />
            </SidebarMenuButton>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {/* 2. Map over the array to generate links dynamically */}
            {NAV_ITEMS.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                  <Link to={item.url} className="hover:text-rust-400">
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      {/* Footer - cleaner user section */}
      <SidebarFooter className="border-t p-4">
        <SettingsDialog
          trigger={
            <div className="flex items-center gap-3 cursor-pointer">
              <Avatar className="h-9 w-9 border border-rust-500/30">
                <AvatarImage src="https://github.com/Abdogouhmad.png" alt="Abdo" />
                <AvatarFallback className="bg-rust-500/10 text-rust-500">AG</AvatarFallback>
              </Avatar>

              {!isCollapsed && (
                <div className="flex flex-col text-sm">
                  <span className="font-semibold">Abderrahman Gouhmad</span>
                  <span className="text-xs text-muted-foreground">Manager</span>
                </div>
              )}
            </div>
          }
        />
      </SidebarFooter>
    </Sidebar>
  );
}