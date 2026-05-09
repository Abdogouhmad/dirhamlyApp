import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

import { LayoutDashboard, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

import { TooltipProvider } from "@radix-ui/react-tooltip";
import { TxButton } from "./txButton";
import { SettingsDialog } from "@/components/ui/profile/main";
import { useRefresh } from "@/lib/Refreshcontext";
import { useProfile } from "@/lib/ProfileContext";

const NAV_ITEMS = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  // { title: "Insights", url: "/insights", icon: BarChart3 },
  // { title: "Budgets", url: "/budgets", icon: Wallet },
];

export function AppSidebar() {
  const { state, isMobile, toggleSidebar } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed" && !isMobile;
  const { refresh } = useRefresh();
  const { profile } = useProfile();

  return (
    <TooltipProvider>
      <Sidebar
        className={cn(
          "transition-all duration-300 ease-in-out bg-sidebar/80 backdrop-blur-2xl border-r border-white/10",
        )}
        variant="sidebar"
        collapsible="icon"
      >
        {/* Header with brand + toggle */}
        <SidebarHeader 
          className={cn(
            "border-b border-white/5 flex flex-col justify-center transition-all duration-300",
            isCollapsed ? "h-32 px-0" : "h-16 px-4"
          )}
        >
          <div
            className={cn(
              "flex items-center w-full",
              isCollapsed ? "flex-col gap-4" : "justify-between",
            )}
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 shrink-0 rounded-xl bg-gradient-to-br from-cobalt-400 to-cobalt-600 flex items-center justify-center text-white shadow-lg shadow-cobalt-500/20">
                <span className="font-bold text-sm">D</span>
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="font-bold uppercase tracking-[0.2em] text-cobalt-300 text-[10px] leading-none mb-0.5">
                    Dirhamly
                  </span>
                  <span className="text-[10px] text-muted-foreground/60 font-medium">Finance OS</span>
                </div>
              )}
            </div>

            {!isMobile && (
              <SidebarMenuButton
                onClick={toggleSidebar}
                size="sm"
                className="h-8 w-8 shrink-0 rounded-lg hover:bg-white/5"
              >
                <Menu className="h-5 w-5 text-muted-foreground" />
              </SidebarMenuButton>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className={cn("pt-4", isCollapsed ? "px-0" : "px-3")}>
          <div
            className={cn(
              "mb-6 transition-all duration-300 flex justify-center",
            )}
          >
            <TxButton onSuccess={refresh} />
          </div>

          <SidebarGroup className={cn("p-0", !isCollapsed && "px-2")}>
            <SidebarMenu className="gap-1.5">
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                    className={cn(
                      "h-11 rounded-xl transition-all duration-200 hover:bg-white/[0.05] hover:text-cobalt-300 data-[active=true]:bg-white/[0.08] data-[active=true]:text-cobalt-300 data-[active=true]:shadow-sm",
                      isCollapsed && "mx-auto justify-center"
                    )}
                  >
                    <Link to={item.url} className={cn("flex items-center gap-3.5", !isCollapsed && "px-3")}>
                      <item.icon className={cn("h-5 w-5 transition-transform duration-200", location.pathname === item.url && "scale-110")} />
                      {!isCollapsed && <span className="font-semibold text-[13px] tracking-wide">{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="border-t border-white/5 p-4 bg-white/[0.02]">
          <SettingsDialog
            trigger={
              <div
                className={cn(
                  "flex items-center gap-3 cursor-pointer p-1.5 rounded-xl transition-colors hover:bg-white/5",
                  isCollapsed && "justify-center",
                )}
              >
                <Avatar className="h-9 w-9 shrink-0 border border-white/10 shadow-sm">
                  <AvatarImage
                    src={profile?.image || "https://i.pinimg.com/736x/a0/72/7f/a0727f73982fe748cd49651090d3849f.jpg"}
                    alt={profile?.name || "Local user"}
                  />
                  <AvatarFallback className="bg-cobalt-500/10 text-cobalt-400 font-bold text-xs">
                    {profile?.name?.slice(0, 2).toUpperCase() || "AG"}
                  </AvatarFallback>
                </Avatar>

                {!isCollapsed && (
                  <div className="flex flex-col text-sm overflow-hidden">
                    <span className="font-bold text-foreground text-[13px] truncate">
                      {profile?.name || "User"}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider truncate">
                      Personal Workspace
                    </span>
                  </div>
                )}
              </div>
            }
          />
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}
