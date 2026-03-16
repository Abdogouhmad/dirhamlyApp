"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function ThemeProvider({ children }: Props) {
  return (
    <NextThemesProvider
      attribute="class" // Will toggle 'dark' class on <html>
      defaultTheme="system" // Follow system by default
      enableSystem={true} // Enable automatic system theme changes
      storageKey="theme" // Optional, localStorage key
    >
      {children}
    </NextThemesProvider>
  );
}
