"use client";

import type { AnalyticsData } from "@/hooks/useAnalytics";

type TasksCardProps = {
  data: AnalyticsData["tasks"];
};

export function TasksCard({
  data,
}: TasksCardProps) {
  const completionRate = data.completionRate;
  const progressValue = Math.max(
    0,
    Math.min(100, completionRate ?? 0),
  );

  let message = "No tasks tracked yet.";

  if (data.overdueCount === 0) {
    message = "Nothing overdue. Nice.";
  } else if (
    completionRate !== null &&
    completionRate > 70
  ) {
    message = `${data.overdueCount} ${
      data.overdueCount === 1
        ? "task"
        : "tasks"
    } overdue.`;
  } else if (
    completionRate !== null &&
    completionRate < 50
  ) {
    message = `${data.overdueCount} ${
      data.overdueCount === 1
        ? "task"
        : "tasks"
    } overdue. Take a breath.`;
  } else {
    message = `${data.overdueCount} ${
      data.overdueCount === 1
        ? "task"
        : "tasks"
    } overdue.`;
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div>
        <h2 className="text-base font-semibold">
          Tasks
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          A simple view of your task follow-through.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            Completed
          </p>

          <p className="mt-1 text-lg font-semibold">
            {data.completedCount}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            Overdue
          </p>

          <p className="mt-1 text-lg font-semibold">
            {data.overdueCount}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            Completion
          </p>

          <p className="mt-1 text-lg font-semibold">
            {completionRate === null
              ? "—"
              : `${completionRate}%`}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{
              width: `${progressValue}%`,
            }}
          />
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {message}
      </p>
    </section>
  );
}