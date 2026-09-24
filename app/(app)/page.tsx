"use client";

import { BudgetSummaryCard } from "@/components/dashboard/BudgetSummaryCard";
import { FocusSummaryCard } from "@/components/dashboard/FocusSummaryCard";
import { GreetingHeader } from "@/components/dashboard/GreetingHeader";
import { NotesSummaryCard } from "@/components/dashboard/NotesSummaryCard";
import { RecentNotesList } from "@/components/dashboard/RecentNotesList";
import { TasksSummaryCard } from "@/components/dashboard/TasksSummaryCard";
import { WaterSummaryCard } from "@/components/dashboard/WaterSummaryCard";
import { WorldSummaryCard } from "@/components/dashboard/WorldSummaryCard";

import { useDashboardData } from "@/hooks/useDashboardData";

export default function DashboardPage() {
  const data = useDashboardData();

  return (
    <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <GreetingHeader />

      {data === undefined ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="h-52 animate-pulse rounded-xl bg-muted" />
          <div className="h-52 animate-pulse rounded-xl bg-muted" />
          <div className="h-52 animate-pulse rounded-xl bg-muted" />
          <div className="h-52 animate-pulse rounded-xl bg-muted" />
          <div className="h-52 animate-pulse rounded-xl bg-muted" />
          <div className="h-52 animate-pulse rounded-xl bg-muted" />
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <NotesSummaryCard
            notesCount={data.notesCount}
          />

          <TasksSummaryCard
            todayTasks={data.todayTasks}
            completedTodayCount={data.completedTodayCount}
          />

          <WaterSummaryCard
            waterTotal={data.waterTotal}
            waterTarget={data.waterTarget}
          />

          <FocusSummaryCard
            focusMinutesToday={data.focusMinutesToday}
          />

          <BudgetSummaryCard
            budgetTotal={data.budgetTotal}
            budgetSpent={data.budgetSpent}
            budgetRemaining={data.budgetRemaining}
            hasBudget={data.hasBudget}
            currency={data.settings?.currency ?? "INR"}
          />

          <WorldSummaryCard />

          <div className="md:col-span-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-base font-semibold">
                Recent notes
              </h2>

              <RecentNotesList
                notes={data.recentNotes}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}