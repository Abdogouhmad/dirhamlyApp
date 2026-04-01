import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "@/lib/theme";
import { Toaster } from "@/components/ui/sonner";
import { RefreshProvider } from "@/lib/Refreshcontext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RefreshProvider>
      <ThemeProvider>
        <App />
        <Toaster richColors />
      </ThemeProvider>
    </RefreshProvider>
  </React.StrictMode>,
);
