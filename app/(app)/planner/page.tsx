"use client";

import { useMemo, useState } from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import type { Task } from "@/lib/db/types";
import { todayKey } from "@/lib/db/repositories/water.repo";

import { useTasks } from "@/hooks/useTasks";
import { TaskForm } from "@/components/planner/TaskForm";
import { TaskItem } from "@/components/planner/TaskItem";

type PlannerTab = "today" | "upcoming" | "completed";

function isOverdue(task: Task, today: string) {
  return Boolean(
    task.dueDate &&
      task.dueDate < today &&
      !task.completed,
  );
}

function TaskSkeleton() {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 animate-pulse rounded-md bg-muted" />

        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
        </div>

        <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}

function EmptyState({ tab }: { tab: PlannerTab }) {
  const messages: Record<PlannerTab, string> = {
    today: "No tasks for today.",
    upcoming: "No upcoming tasks.",
    completed: "No completed tasks yet.",
  };

  return (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center">
      <p className="text-sm text-muted-foreground">
        {messages[tab]}
      </p>
    </div>
  );
}

export default function PlannerPage() {
  const [tab, setTab] = useState<PlannerTab>("today");

  const tasks = useTasks();

  const today = todayKey();

  const filteredTasks = useMemo(() => {
    if (!tasks) {
      return [];
    }

    if (tab === "today") {
      return tasks
        .filter(
          (task) =>
            task.dueDate === today &&
            !task.completed,
        )
        .sort((a, b) =>
          a.title.localeCompare(b.title),
        );
    }

    if (tab === "upcoming") {
      return tasks
        .filter(
          (task) =>
            Boolean(task.dueDate) &&
            task.dueDate! > today &&
            !task.completed,
        )
        .sort((a, b) =>
          taskDate(a).localeCompare(taskDate(b)),
        );
    }

    return tasks
      .filter((task) => task.completed)
      .sort(
        (a, b) =>
          (b.completedAt ?? 0) -
          (a.completedAt ?? 0),
      );
  }, [tasks, tab, today]);

  const overdueTasks = useMemo(() => {
    if (!tasks || tab !== "today") {
      return [];
    }

    return tasks
      .filter((task) => isOverdue(task, today))
      .sort((a, b) =>
        taskDate(a).localeCompare(taskDate(b)),
      );
  }, [tasks, tab, today]);

  const visibleTasks =
    tab === "today"
      ? [...overdueTasks, ...filteredTasks]
      : filteredTasks;

  const loading = tasks === undefined;

  return (
    <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          InkPlan
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Task Planner
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Keep track of what needs to get done.
        </p>
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) =>
          setTab(value as PlannerTab)
        }
        className="mt-8"
      >
        <TabsList>
          <TabsTrigger value="today">
            Today
          </TabsTrigger>

          <TabsTrigger value="upcoming">
            Upcoming
          </TabsTrigger>

          <TabsTrigger value="completed">
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-6">
          {loading ? (
            <div className="space-y-3">
              <TaskSkeleton />
              <TaskSkeleton />
              <TaskSkeleton />
            </div>
          ) : (
            <div className="space-y-3">
              {visibleTasks.length === 0 ? (
                <EmptyState tab="today" />
              ) : (
                visibleTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                  />
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          {loading ? (
            <div className="space-y-3">
              <TaskSkeleton />
              <TaskSkeleton />
              <TaskSkeleton />
            </div>
          ) : (
            <div className="space-y-3">
              {visibleTasks.length === 0 ? (
                <EmptyState tab="upcoming" />
              ) : (
                visibleTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                  />
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {loading ? (
            <div className="space-y-3">
              <TaskSkeleton />
              <TaskSkeleton />
              <TaskSkeleton />
            </div>
          ) : (
            <div className="space-y-3">
              {visibleTasks.length === 0 ? (
                <EmptyState tab="completed" />
              ) : (
                visibleTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                  />
                ))
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {tab !== "completed" && (
        <div className="mt-6">
          <TaskForm />
        </div>
      )}
    </div>
  );
}

function taskDate(task: Task) {
  return task.dueDate ?? "";
}