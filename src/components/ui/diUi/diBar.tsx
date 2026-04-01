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

import { LayoutDashboard, BarChart3, Wallet, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

import { TooltipProvider } from "@radix-ui/react-tooltip";
import { TxButton } from "./txButton";
import { SettingsDialog } from "@/components/ui/profile/main";
import { useRefresh } from "@/lib/Refreshcontext";

const NAV_ITEMS = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Insights", url: "/insights", icon: BarChart3 },
  { title: "Budgets", url: "/budgets", icon: Wallet },
];

export function AppSidebar() {
  const { state, isMobile, toggleSidebar } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed" && !isMobile;
  const { refresh } = useRefresh();

  return (
    <TooltipProvider>
      <Sidebar
        className={cn(
          "transition-[width] duration-300 ease-in-out bg-background border-r",
          isCollapsed && "w-20",
        )}
        variant="sidebar"
        collapsible="icon"
      >
        {/* Header with brand + toggle */}
        <SidebarHeader className="border-b h-15 flex justify-center">
          <div
            className={cn(
              "flex items-center",
              isCollapsed ? "justify-center w-full" : "justify-between w-full",
            )}
          >
            <div
              className={cn(
                "flex items-center gap-2 overflow-hidden",
                isCollapsed ? "hidden" : "flex",
              )}
            >
              <div className="h-6 w-6 shrink-0 rounded bg-cobalt-300/20 flex items-center justify-center text-cobalt-300 font-bold text-xs">
                D
              </div>
              <span className="font-bold uppercase tracking-wider text-cobalt-300 text-sm whitespace-nowrap">
                Dirhamly
              </span>
            </div>

            {!isMobile && (
              <SidebarMenuButton
                onClick={toggleSidebar}
                size="sm"
                variant="outline"
                className={cn("h-8 w-8 shrink-0", isCollapsed && "mx-auto")}
              >
                <Menu className="h-5 w-5" />
              </SidebarMenuButton>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent>
          <div
            className={cn(
              "pt-4 pb-2 transition-all duration-300",
              isCollapsed ? "p-1" : "p-3",
            )}
          >
            <TxButton onSuccess={refresh} />
          </div>

          <SidebarGroup>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                    className="hover:text-cobalt-300 data-[active=true]:text-cobalt-300"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="border-t p-4">
          <SettingsDialog
            trigger={
              <div
                className={cn(
                  "flex items-center gap-3 cursor-pointer",
                  isCollapsed && "justify-center",
                )}
              >
                <Avatar className="h-9 w-9 shrink-0 border border-cobalt-300/30">
                  <AvatarImage
                    src="https://github.com/Abdogouhmad.png"
                    alt="Abdo"
                  />
                  <AvatarFallback className="bg-cobalt-300/10 text-cobalt-300">
                    AG
                  </AvatarFallback>
                </Avatar>

                {!isCollapsed && (
                  <div className="flex flex-col text-sm overflow-hidden dark:text-iron-300 text-iron-700">
                    <span className="font-semibold truncate">
                      Abderrahman Gouhmad
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      Manager
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
