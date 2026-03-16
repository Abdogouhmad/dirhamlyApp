import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

import { LayoutDashboard, CreditCard, BarChart3, Wallet } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SettingsDialog } from "@/profile/mainsetting";

export function AppSidebar() {
  const { state, isMobile, setOpen } = useSidebar(); // Hook to get current state

  return (
    <Sidebar
      className="transition-[width] duration-300 ease-in-out bg-background"
      variant="sidebar"
      collapsible="icon"
      onMouseEnter={() => !isMobile && setOpen(true)}
      onMouseLeave={() => !isMobile && setOpen(false)}
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-rust-500 font-bold uppercase tracking-widest text-[10px] mb-4 px-4">
            Dirhamly
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className=" hover:text-rust-400 active:bg-rust-800 transition-colors dark:text-rust-600 ">
                <LayoutDashboard className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton className="hover:text-rust-400 ">
                <CreditCard className="w-5 h-5" />
                <span className="font-medium">Transactions</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton className="hover:text-rust-400 ">
                <BarChart3 className="w-5 h-5" />
                <span className="font-medium">Insights</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton className=" hover:text-rust-400 hover:bg-none">
                <Wallet className="w-5 h-5" />
                <span className="font-medium">Budgets</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Bottom user section */}
      <SidebarFooter className="border-t border-rust-600/5">
        <SettingsDialog
          trigger={
            <div className="flex items-center gap-3 cursor-pointer">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src="https://github.com/Abdogouhmad.png"
                  alt="Abdo"
                />
                <AvatarFallback>AG</AvatarFallback>
              </Avatar>
              <div
                className={
                  !isMobile && state === "collapsed"
                    ? "hidden"
                    : "flex flex-col text-sm"
                }
              >
                <span className="font-semibold">Abderrahman Gouhmad</span>
                <span className="text-muted-foreground text-xs">Manager</span>
              </div>
            </div>
          }
        />
      </SidebarFooter>
    </Sidebar>
  );
}
