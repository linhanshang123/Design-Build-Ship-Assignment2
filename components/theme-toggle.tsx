"use client";

import { useTheme } from "@/lib/theme-context";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const nextThemeLabel = theme === "original" ? "Moon Theme" : "Original Theme";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="planner-button planner-ui rounded-full px-4 py-2 text-sm"
      aria-label={`Switch to ${nextThemeLabel}`}
    >
      {nextThemeLabel}
    </button>
  );
}
