// src/components/theme-provider.tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { ExtendedThemeProvider } from "@/contexts/ThemeContext";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ExtendedThemeProvider>
        {children}
      </ExtendedThemeProvider>
    </NextThemesProvider>
  );
}
