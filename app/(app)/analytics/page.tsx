"use client";

import { useState } from "react";

import { BudgetCard } from "@/components/analytics/BudgetCard";
import { FocusCard } from "@/components/analytics/FocusCard";
import { NotesCard } from "@/components/analytics/NotesCard";
import { RangeSelector } from "@/components/analytics/RangeSelector";
import { TasksCard } from "@/components/analytics/TasksCard";
import { WaterCard } from "@/components/analytics/WaterCard";
import { WorldCard } from "@/components/analytics/WorldCard";

import {
  useAnalytics,
  type AnalyticsRange,
} from "@/hooks/useAnalytics";

function AnalyticsPlaceholder({
  title,
}: {
  title: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-base font-semibold">
        {title}
      </h2>

      <div className="mt-5 flex min-h-[180px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
        <p className="text-sm text-muted-foreground">
          Analytics coming soon.
        </p>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] =
    useState<AnalyticsRange>("7d");

  const analytics = useAnalytics(range);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Insights
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                Analytics
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Your patterns over time.
              </p>
            </div>

            <RangeSelector
              value={range}
              onChange={setRange}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {analytics ? (
            <FocusCard
              data={analytics.focus}
              range={range}
            />
          ) : (
            <AnalyticsPlaceholder title="Focus" />
          )}

          {analytics ? (
            <TasksCard
              data={analytics.tasks}
            />
          ) : (
            <AnalyticsPlaceholder title="Tasks" />
          )}

          {analytics ? (
            <WaterCard
              data={analytics.water}
            />
          ) : (
            <AnalyticsPlaceholder title="Water" />
          )}

          {analytics ? (
            <BudgetCard
              data={analytics.budget}
            />
          ) : (
            <AnalyticsPlaceholder title="Budget" />
          )}

          {analytics ? (
            <NotesCard
              data={analytics.notes}
              rangeDays={analytics.dateKeys.length}
            />
          ) : (
            <AnalyticsPlaceholder title="Notes" />
          )}

          <WorldCard />

        </div>
      </div>
    </div>
  );
}