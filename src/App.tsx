import "./App.css";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/diUi/diBar";
import { Dashboard } from "@/dashboard/maindashboard";
import TitleBar from "@/components/ui/tabBar";
import { useEffect } from "react";

const App = () => {
  useEffect(() => {
    // Disable right-click in production
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);
  return (
    <SidebarProvider defaultOpen={true}>
      {/* Container is fixed and hidden to prevent double bars */}
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />

        <div className="flex flex-col flex-1 min-w-0">
          <TitleBar />

          {/* This is the only place that should scroll */}
          <main className="flex-1 overflow-y-auto bg-background custom-scrollbar">
            <Dashboard />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
export default App;
