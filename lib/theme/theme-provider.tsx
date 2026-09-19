"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark" | "warm";

const STORAGE_KEY = "inkplan-theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext =
  createContext<ThemeContextValue | null>(null);

function isTheme(
  value: string | null,
): value is Theme {
  return (
    value === "light" ||
    value === "dark" ||
    value === "warm"
  );
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    const stored =
      localStorage.getItem(STORAGE_KEY);

    return isTheme(stored)
      ? stored
      : "light";
  } catch {
    return "light";
  }
}

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;

  root.classList.remove("dark", "warm");

  if (
    theme === "dark" ||
    theme === "warm"
  ) {
    root.classList.add(theme);
  }
}

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setThemeState] =
    useState<Theme>("light");

  useEffect(() => {
    const stored = readStoredTheme();

    // Local storage is an external browser system.
    // We hydrate React state from it after client mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(stored);

    applyThemeClass(stored);
  }, []);

  const setTheme = useCallback(
    (next: Theme) => {
      setThemeState(next);

      try {
        localStorage.setItem(
          STORAGE_KEY,
          next,
        );
      } catch {
        // Ignore storage failures.
      }

      applyThemeClass(next);
    },
    [],
  );

  const value = useMemo(
    () => ({ theme, setTheme }),
    [theme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used within ThemeProvider",
    );
  }

  return context;
}