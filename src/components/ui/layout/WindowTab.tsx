import { useState, useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Button } from "@/components/ui/button";
import { X, Minus, Square, Copy } from "lucide-react";

export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const appWindow = getCurrentWindow(); // Initialize once

  // Keep the UI state in sync with the actual window state
  useEffect(() => {
    const checkMaximized = async () => {
      setIsMaximized(await appWindow.isMaximized());
    };
    checkMaximized();
  }, []);

  const handleMinimize = () => appWindow.minimize();
  const handleClose = () => appWindow.close();

  const handleMaximize = async () => {
    const maximized = await appWindow.isMaximized();
    if (maximized) {
      await appWindow.unmaximize();
      setIsMaximized(false);
    } else {
      await appWindow.maximize();
      setIsMaximized(true);
    }
  };

  return (
    <div
      className="flex items-center justify-between h-10 w-full  border-b dark:border-white/10 select-none"
      data-tauri-drag-region
    >
      {/* Draggable Title Area */}
      <div className="flex items-center px-4 h-full pointer-events-none">
        <span className="text-xs font-medium tracking-tight opacity-70">
          DIRHAMLY
        </span>
      </div>

      {/* Window controls */}
      <div className="flex h-full">
        <Button
          variant="ghost"
          className="h-full w-12 rounded-none hover:bg-white/10 transition-colors"
          onClick={handleMinimize}
        >
          <Minus className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          className="h-full w-12 rounded-none hover:bg-white/10 transition-colors"
          onClick={handleMaximize}
        >
          {isMaximized ? (
            <Copy className="w-3 h-3" />
          ) : (
            <Square className="w-3 h-3" />
          )}
        </Button>
        <Button
          variant="ghost"
          className="h-full w-12 rounded-none hover:bg-red-600! hover:text-white! transition-colors group"
          onMouseDown={(e) => e.stopPropagation()} // Prevents drag interference
          onClick={handleClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
