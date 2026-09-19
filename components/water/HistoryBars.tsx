"use client";

import { useLiveQuery } from "dexie-react-hooks";

import { db } from "@/lib/db";
import { todayKey } from "@/lib/db/repositories";

type HistoryBarsProps = {
  target: number;
};

function formatDateLabel(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
  }).format(date);
}

function getLastSevenDateKeys() {
  const today = todayKey();
  const todayDate = new Date(`${today}T00:00:00.000Z`);

  const dates: string[] = [];

  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date(todayDate);

    date.setUTCDate(
      todayDate.getUTCDate() - index,
    );

    dates.push(
      date.toISOString().slice(0, 10),
    );
  }

  return dates;
}

export function HistoryBars({
  target,
}: HistoryBarsProps) {
  const result = useLiveQuery(async () => {
    try {
      const entries = await db.waterEntries.toArray();

      return {
        entries,
        error: null,
      };
    } catch (error) {
      console.error("Failed to load water history:", error);

      return {
        entries: [],
        error: "Could not load water history.",
      };
    }
  }, []);

  if (!result) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border">
        <p className="text-sm text-muted-foreground">
          Loading history...
        </p>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border">
        <p className="text-sm text-destructive">
          {result.error}
        </p>
      </div>
    );
  }

  const dateKeys = getLastSevenDateKeys();

  const totals = new Map<string, number>();

  for (const entry of result.entries) {
    totals.set(
      entry.dateKey,
      (totals.get(entry.dateKey) ?? 0) +
        entry.amountMl,
    );
  }

  const values = dateKeys.map((dateKey) => ({
    dateKey,
    total: totals.get(dateKey) ?? 0,
  }));

  const hasHistory = values.some(
    (item) => item.total > 0,
  );

  if (!hasHistory) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border">
        <p className="text-sm font-medium">
          No water history yet.
        </p>

        <p className="text-xs text-muted-foreground">
          Add water to start building your history.
        </p>
      </div>
    );
  }

  const highestValue = Math.max(
    target,
    ...values.map((item) => item.total),
  );

  const chartMax =
    highestValue > 0 ? highestValue : 1;

  const today = todayKey();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Last 7 days
          </h2>

          <p className="text-sm text-muted-foreground">
            Daily water intake
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          Target: {target} ml
        </p>
      </div>

      <div className="relative h-64 overflow-hidden rounded-xl border border-border p-4">
        <div className="flex h-full items-end justify-between gap-2">
          {values.map((item) => {
            const height =
              item.total === 0
                ? 0
                : Math.max(
                    4,
                    (item.total / chartMax) * 100,
                  );

            const isToday =
              item.dateKey === today;

            return (
              <div
                key={item.dateKey}
                className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
              >
                <div className="flex h-full w-full items-end justify-center">
                  <div
                    className={[
                      "w-full max-w-10 rounded-t-md transition-all duration-300",
                      isToday
                        ? "bg-foreground"
                        : "bg-muted-foreground/40",
                    ].join(" ")}
                    style={{
                      height: `${height}%`,
                    }}
                    title={`${item.total} ml`}
                  />
                </div>

                <div
                  className={[
                    "text-xs",
                    isToday
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground",
                  ].join(" ")}
                >
                  {formatDateLabel(item.dateKey)}
                </div>

                <div className="text-[11px] text-muted-foreground">
                  {item.total} ml
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}