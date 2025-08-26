"use client";

import { useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyThemeToDocument(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as Theme | null);
    const initial: Theme = saved ?? (getSystemPrefersDark() ? "dark" : "light");
    setTheme(initial);
    applyThemeToDocument(initial);
    setMounted(true);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const current = localStorage.getItem(STORAGE_KEY);
      if (current) return; // user has explicit pref
      const sys: Theme = media.matches ? "dark" : "light";
      setTheme(sys);
      applyThemeToDocument(sys);
    };
    media.addEventListener?.("change", onChange);
    return () => media.removeEventListener?.("change", onChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      applyThemeToDocument(next);
      return next;
    });
  }, []);

  const setLight = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "light");
    setTheme("light");
    applyThemeToDocument("light");
  }, []);

  const setDark = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "dark");
    setTheme("dark");
    applyThemeToDocument("dark");
  }, []);

  return { theme, toggleTheme, setLight, setDark, mounted };
}
