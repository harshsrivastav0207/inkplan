"use client";

import type { ThemeName } from "@/lib/db/types";

type PageThemeSelectorProps = {
  value: ThemeName;
  onChange: (theme: ThemeName) => void;
};

const themes: { value: ThemeName; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "warm", label: "Warm" },
];

export function PageThemeSelector({
  value,
  onChange,
}: PageThemeSelectorProps) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-1">
      {themes.map((theme) => {
        const active = value === theme.value;

        return (
          <button
            key={theme.value}
            type="button"
            onClick={() => onChange(theme.value)}
            className={[
              "rounded-lg px-3 py-2 text-xs font-medium transition-colors",
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            ].join(" ")}
          >
            {theme.label}
          </button>
        );
      })}
    </div>
  );
}