"use client";

import { useState } from "react";
import { CanvasStage } from "@/components/canvas/CanvasStage";
import type { PageType } from "@/components/canvas/types";

const pageTypes: PageType[] = ["blank", "grid", "lined", "box"];

export default function CanvasSandboxPage() {
  const [pageType, setPageType] = useState<PageType>("lined");

  return (
    <main className="relative h-screen w-full overflow-hidden bg-background">
      <CanvasStage pageType={pageType} />

      <div className="absolute left-4 top-4 z-10 flex gap-2 rounded-lg border bg-background/90 p-2 shadow">
        {pageTypes.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setPageType(type)}
            className={`rounded-md px-3 py-2 text-sm capitalize ${
              pageType === type
                ? "bg-foreground text-background"
                : "bg-muted"
            }`}
          >
            {type}
          </button>
        ))}
      </div>
    </main>
  );
}