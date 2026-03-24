/* ─────────────────────────────────────────────────────────
   context/theme-context.tsx
   How it works:
   1. On mount — reads localStorage ("jowel-theme") or system preference
   2. Adds/removes "dark" class on <html>
   3. Saves choice to localStorage
   4. Use <ThemeProvider> in layout.tsx (wrap children)
   5. Use useTheme() hook anywhere to get isDark + toggleTheme
   6. Use <ThemeToggle /> component anywhere for the button
───────────────────────────────────────────────────────── */
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Sun, Moon } from "lucide-react";

/* ── Types ─────────────────────────────────────────── */
interface ThemeCtx {
  isDark:      boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeCtx>({ isDark: false, toggleTheme: () => {} });

/* ── Provider ──────────────────────────────────────── */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark,  setIsDark]  = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored     = localStorage.getItem("jowel-theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark       = stored ? stored === "dark" : systemDark;

    document.documentElement.classList.toggle("dark", dark);
    setIsDark(dark);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("jowel-theme", next ? "dark" : "light");
    setIsDark(next);
  };

  /* Prevent flash of wrong theme */
  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/* ── Hook ──────────────────────────────────────────── */
export function useTheme() {
  return useContext(ThemeContext);
}

/* ─────────────────────────────────────────────────────────
   ThemeToggle button — drop it anywhere
   Props:
     variant="glass"  → white/transparent — for dark backgrounds
     variant="solid"  → stone colors      — for light backgrounds
───────────────────────────────────────────────────────── */
export function ThemeToggle({ variant = "solid" }: { variant?: "glass" | "solid" }) {
  const { isDark, toggleTheme } = useTheme();

  const glass = "bg-white/15 border border-white/25 text-white hover:bg-white/25";
  const solid = [
    "bg-stone-100 dark:bg-stone-800",
    "border border-stone-200 dark:border-stone-700",
    "text-stone-600 dark:text-stone-300",
    "hover:bg-stone-200 dark:hover:bg-stone-700",
  ].join(" ");

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`
        flex items-center justify-center
        w-9 h-9 rounded-full
        transition-all duration-200 active:scale-95
        ${variant === "glass" ? glass : solid}
      `}
    >
      {isDark
        ? <Sun  size={15} aria-hidden="true" />
        : <Moon size={14} aria-hidden="true" />
      }
    </button>
  );
}