"use client";

import type { PageType } from "@/lib/db/types";

type PageTypeSelectorProps = {
  value: PageType;
  onChange: (pageType: PageType) => void;
};

const pageTypes: { value: PageType; label: string }[] = [
  { value: "blank", label: "Blank" },
  { value: "grid", label: "Grid" },
  { value: "lined", label: "Lined" },
  { value: "box", label: "Box" },
];

export function PageTypeSelector({
  value,
  onChange,
}: PageTypeSelectorProps) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-1">
      {pageTypes.map((pageType) => {
        const active = value === pageType.value;

        return (
          <button
            key={pageType.value}
            type="button"
            onClick={() => onChange(pageType.value)}
            className={[
              "rounded-lg px-3 py-2 text-xs font-medium transition-colors",
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            ].join(" ")}
          >
            {pageType.label}
          </button>
        );
      })}
    </div>
  );
}