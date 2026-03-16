// src/components/layout/MainLayout.tsx
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/diUi/diBar";
import TitleBar from "@/components/ui/layout/WindowTab";


export function MainLayout() {
  useEffect(() => {
    // Disable right-click in production
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    if (import.meta.env.PROD) {
      document.addEventListener("contextmenu", handleContextMenu);
    }
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        
        <div className="flex flex-col flex-1 min-w-0">
          <TitleBar />
          <main className="flex-1 overflow-y-auto bg-background custom-scrollbar">
            <Outlet /> 
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}