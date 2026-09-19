"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { HistoryBars } from "@/components/water/HistoryBars";
import { ProgressRing } from "@/components/water/ProgressRing";
import { QuickAdd } from "@/components/water/QuickAdd";
import { TargetEditor } from "@/components/water/TargetEditor";

import { useWater } from "@/hooks/useWater";

export default function WaterPage() {
  const {
    todayTotal,
    todayEntries,
    dailyTarget,
    error,
  } = useWater();

  const isLoading = todayTotal === undefined;

  return (
    <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          InkPlan
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Water Tracker
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Keep track of your daily water intake.
        </p>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Daily hydration</CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex min-h-64 items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Loading water data...
              </p>
            </div>
          ) : error ? (
            <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-border">
              <p className="text-sm text-destructive">
                {error}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col items-center gap-4">
                <ProgressRing
                  current={todayTotal}
                  target={dailyTarget}
                />

                <p className="text-sm text-muted-foreground">
                  {todayEntries.length}{" "}
                  {todayEntries.length === 1
                    ? "entry"
                    : "entries"}{" "}
                  today
                </p>
              </div>

              <div className="border-t border-border pt-6">
                <QuickAdd />
              </div>

              <div className="border-t border-border pt-6">
                <TargetEditor
                  currentTarget={dailyTarget}
                />
              </div>

              <div className="border-t border-border pt-6">
                <HistoryBars
                  target={dailyTarget}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}