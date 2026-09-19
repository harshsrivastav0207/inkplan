"use client";

import Link from "next/link";
import { ListChecks } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { Task } from "@/lib/db/types";

type TasksSummaryCardProps = {
  todayTasks: Task[];
  completedTodayCount: number;
};

export function TasksSummaryCard({
  todayTasks,
  completedTodayCount,
}: TasksSummaryCardProps) {
  const remainingToday = todayTasks.filter(
    (task) => !task.completed,
  ).length;

  const totalToday =
    remainingToday + completedTodayCount;

  const progress =
    totalToday > 0
      ? Math.min(
          (completedTodayCount / totalToday) * 100,
          100,
        )
      : 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-muted">
              <ListChecks className="size-5" />
            </div>

            <CardTitle className="text-base">
              Tasks
            </CardTitle>
          </div>

          <Link
            href="/planner"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Planner
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-3xl font-semibold tracking-tight">
              {remainingToday}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Today&apos;s tasks
            </p>
          </div>

          <div>
            <p className="text-3xl font-semibold tracking-tight">
              {completedTodayCount}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Completed today
            </p>
          </div>
        </div>

        {totalToday > 0 ? (
          <div className="mt-5">
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}