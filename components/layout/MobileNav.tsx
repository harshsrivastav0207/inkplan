"use client";

import {
  FileText,
  Globe2,
  LayoutDashboard,
  ListChecks,
  MoreHorizontal,
  Timer,
} from "lucide-react";
import { useState } from "react";

import { NavItem } from "@/components/layout/NavItem";

const mainNavigation = [
  {
    href: "/",
    label: "Home",
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
    href: "/focus",
    label: "Focus",
    icon: Timer,
  },
  {
    href: "/world",
    label: "World",
    icon: Globe2,
  },
];

const moreNavigation = [
  {
    href: "/water",
    label: "Water",
  },
  {
    href: "/analytics",
    label: "Analytics",
  },
];

export function MobileNav() {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      {moreOpen && (
        <div className="fixed inset-x-3 bottom-[4.75rem] z-50 rounded-xl border border-border bg-background p-2 shadow-lg md:hidden">
          {moreNavigation.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={MoreHorizontal}
              mobile
            />
          ))}
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-1">
          {mainNavigation.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              mobile
            />
          ))}

          <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-md px-1 py-1.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <MoreHorizontal className="size-5" />
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}