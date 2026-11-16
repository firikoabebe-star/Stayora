"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/lib/theme";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, resolvedTheme, setTheme } = useThemeStore();

  useEffect(() => {
    // Initialize theme on mount
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);

    // Add theme-color meta tag if it doesn't exist
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.setAttribute("name", "theme-color");
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute(
      "content",
      resolvedTheme === "dark" ? "#111827" : "#ffffff",
    );

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        setTheme("system"); // This will trigger the resolver
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, resolvedTheme, setTheme]);

  return <>{children}</>;
}
