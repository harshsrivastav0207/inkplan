"use client";

import type { AnalyticsData } from "@/hooks/useAnalytics";

type NotesCardProps = {
  data: AnalyticsData["notes"];
  rangeDays: number;
};

export function NotesCard({
  data,
  rangeDays,
}: NotesCardProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div>
        <h2 className="text-base font-semibold">
          Notes
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Your writing activity over time.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            Total notes
          </p>

          <p className="mt-1 text-lg font-semibold">
            {data.totalNotes}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            Total pages
          </p>

          <p className="mt-1 text-lg font-semibold">
            {data.totalPages}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            Active days
          </p>

          <p className="mt-1 text-lg font-semibold">
            {data.activeDays}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-border bg-muted/30 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          You wrote on{" "}
          <span className="font-medium text-foreground">
            {data.activeDays}
          </span>{" "}
          of the last{" "}
          <span className="font-medium text-foreground">
            {rangeDays}
          </span>{" "}
          days.
        </p>
      </div>
    </section>
  );
}