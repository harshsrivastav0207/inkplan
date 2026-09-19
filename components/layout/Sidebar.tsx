"use client";

import {
  Droplets,
  FileText,
  LayoutDashboard,
  ListChecks,
  Moon,
  Sun,
  Timer,
} from "lucide-react";

import { NavItem } from "@/components/layout/NavItem";
import { useTheme } from "@/lib/theme/theme-provider";

const navigation = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/notes",
    label: "Notes",
    icon: FileText,
  },
  {
    href: "/planner",
    label: "Planner",
    icon: ListChecks,
  },
  {
    href: "/water",
    label: "Water",
    icon: Droplets,
  },
  {
    href: "/focus",
    label: "Focus",
    icon: Timer,
  },
];

export function Sidebar() {
  const { theme, setTheme } = useTheme();

  function cycleTheme() {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("warm");
    } else {
      setTheme("light");
    }
  }

  const themeLabel =
    theme === "light"
      ? "Light"
      : theme === "dark"
        ? "Dark"
        : "Warm";

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-border bg-background md:flex md:flex-col">
      <div className="border-b border-border px-5 py-5">
        <p className="text-lg font-semibold tracking-tight">
          InkPlan
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Plan. Focus. Create.
        </p>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navigation.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={cycleTheme}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {theme === "dark" ? (
            <Moon className="size-5" />
          ) : (
            <Sun className="size-5" />
          )}

          <span>Theme: {themeLabel}</span>
        </button>
      </div>
    </aside>
  );
}