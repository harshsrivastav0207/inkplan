"use client";

import {
  Droplets,
  FileText,
  LayoutDashboard,
  ListChecks,
  Timer,
} from "lucide-react";

import { NavItem } from "@/components/layout/NavItem";

const navigation = [
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

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-lg items-center gap-1">
        {navigation.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            mobile
          />
        ))}
      </div>
    </nav>
  );
}