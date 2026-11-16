"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Monitor, ChevronDown } from "lucide-react";
import { useThemeStore, type Theme } from "@/lib/theme";

const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Light", icon: <Sun className="w-4 h-4" /> },
  { value: "dark", label: "Dark", icon: <Moon className="w-4 h-4" /> },
  { value: "system", label: "System", icon: <Monitor className="w-4 h-4" /> },
];

interface ThemeToggleProps {
  variant?: "button" | "dropdown";
  className?: string;
}

export default function ThemeToggle({
  variant = "button",
  className = "",
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);

  if (variant === "button") {
    return (
      <motion.button
        onClick={toggleTheme}
        className={`
          relative w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 
          flex items-center justify-center transition-colors
          hover:bg-gray-200 dark:hover:bg-gray-700
          ${className}
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={resolvedTheme}
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            {resolvedTheme === "light" ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-blue-400" />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.button>
    );
  }

  const currentTheme = themes.find((t) => t.value === theme);

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-2 px-3 py-2 rounded-lg
          bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700
          text-gray-900 dark:text-white transition-colors
        "
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {currentTheme?.icon}
        <span className="text-sm font-medium">{currentTheme?.label}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="
                absolute top-full right-0 mt-2 w-40 
                bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                rounded-xl shadow-lg z-50 overflow-hidden
              "
            >
              {themes.map((themeOption) => (
                <button
                  key={themeOption.value}
                  onClick={() => {
                    setTheme(themeOption.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left
                    hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                    ${
                      theme === themeOption.value
                        ? "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"
                        : "text-gray-900 dark:text-white"
                    }
                  `}
                >
                  {themeOption.icon}
                  <span className="text-sm font-medium">
                    {themeOption.label}
                  </span>
                  {theme === themeOption.value && (
                    <motion.div
                      layoutId="theme-indicator"
                      className="ml-auto w-2 h-2 bg-rose-500 rounded-full"
                    />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
