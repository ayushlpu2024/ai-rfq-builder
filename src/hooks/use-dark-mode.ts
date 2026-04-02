"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Dark-mode toggle hook. Persists preference to localStorage
 * and applies the `dark` class to <html>.
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  // On mount, read preference
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const dark = stored === "dark" || (!stored && prefersDark);
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  return { isDark, toggle };
}
