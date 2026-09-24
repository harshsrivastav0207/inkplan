"use client";

import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";

import {
  focusRepo,
  notesRepo,
  pagesRepo,
  tasksRepo,
  transactionsRepo,
  waterRepo,
} from "@/lib/db/repositories";
import { settingsRepo } from "@/lib/db/repositories/settings.repo";

export type AnalyticsRange =
  | "7d"
  | "30d"
  | "12w";

type RangeConfig = {
  days: number;
};

type DayPoint = {
  dateKey: string;
  label: string;
  total: number;
};

type FocusAnalytics = {
  totalMinutes: number;
  sessionsCount: number;
  averageMinutes: number;
  bestDayMinutes: number;
  dailyTotals: DayPoint[];
  streak: number;
};

type TasksAnalytics = {
  completedCount: number;
  overdueCount: number;
  completionRate: number | null;
};

type WaterAnalytics = {
  dailyTotals: DayPoint[];
  weeklyAverageMl: number;
  goalDaysCount: number;
  target: number;
};

type BudgetAnalytics = {
  monthIncome: number;
  monthSpending: number;
  remaining: number;
  monthlyBudget: number;
  topCategories: {
    category: string;
    total: number;
  }[];
  lastMonthSpending: number;
};

type NotesAnalytics = {
  totalNotes: number;
  totalPages: number;
  activeDays: number;
  createdInRange: number;
};

export type AnalyticsData = {
  range: AnalyticsRange;
  fromMs: number;
  toMs: number;
  fromKey: string;
  toKey: string;
  dateKeys: string[];
  focus: FocusAnalytics;
  tasks: TasksAnalytics;
  water: WaterAnalytics;
  budget: BudgetAnalytics;
  notes: NotesAnalytics;
};

const RANGE_CONFIG: Record<
  AnalyticsRange,
  RangeConfig
> = {
  "7d": {
    days: 7,
  },
  "30d": {
    days: 30,
  },
  "12w": {
    days: 84,
  },
};

function getDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getRangeDates(
  range: AnalyticsRange,
) {
  const today = new Date();
  const todayKeyValue = getDateKey(today);

  const start = new Date(
    `${todayKeyValue}T00:00:00.000Z`,
  );

  start.setUTCDate(
    start.getUTCDate() -
      (RANGE_CONFIG[range].days - 1),
  );

  const end = new Date(
    `${todayKeyValue}T23:59:59.999Z`,
  );

  const fromMs = start.getTime();
  const toMs = end.getTime();

  const dateKeys: string[] = [];

  const cursor = new Date(start);

  while (cursor <= end) {
    dateKeys.push(getDateKey(cursor));

    cursor.setUTCDate(
      cursor.getUTCDate() + 1,
    );
  }

  return {
    fromMs,
    toMs,
    fromKey: getDateKey(start),
    toKey: todayKeyValue,
    dateKeys,
  };
}

function formatDayLabel(
  dateKey: string,
): string {
  const date = new Date(
    `${dateKey}T00:00:00.000Z`,
  );

  return date.toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      timeZone: "UTC",
    },
  );
}

function calculateFocusStreak(
  dailyTotals: DayPoint[],
): number {
  let streak = 0;

  for (
    let index = dailyTotals.length - 1;
    index >= 0;
    index -= 1
  ) {
    if (
      dailyTotals[index].total <= 0
    ) {
      break;
    }

    streak += 1;
  }

  return streak;
}

function getPreviousMonthStart(
  currentFromKey: string,
): string {
  const date = new Date(
    `${currentFromKey}T00:00:00.000Z`,
  );

  date.setUTCMonth(
    date.getUTCMonth() - 1,
  );

  date.setUTCDate(1);

  return getDateKey(date);
}

function getPreviousMonthEnd(
  currentFromKey: string,
): string {
  const date = new Date(
    `${currentFromKey}T00:00:00.000Z`,
  );

  date.setUTCDate(0);

  return getDateKey(date);
}

export function useAnalytics(
  range: AnalyticsRange = "7d",
): AnalyticsData | undefined {
  const rangeDates = useMemo(
    () => getRangeDates(range),
    [range],
  );

  const data = useLiveQuery(
    async () => {
      const {
        fromMs,
        toMs,
        fromKey,
        toKey,
        dateKeys,
      } = rangeDates;

      const [
        focusSessions,
        completedTasks,
        overdueCount,
        waterEntries,
        settings,
        currentTransactions,
        previousTransactions,
        allNotes,
        createdNotes,
        totalPages,
      ] = await Promise.all([
        focusRepo.sessionsInRange(
          fromMs,
          toMs,
        ),

        tasksRepo.listCompletedInRange(
          fromMs,
          toMs,
        ),

        tasksRepo.countOverdue(
          toKey,
        ),

        waterRepo.listByDateRange(
          fromKey,
          toKey,
        ),

        settingsRepo.getWithDefaults(),

        transactionsRepo.listByRange(
          fromKey,
          toKey,
        ),

        transactionsRepo.listByRange(
          getPreviousMonthStart(fromKey),
          getPreviousMonthEnd(fromKey),
        ),

        notesRepo.list(),

        notesRepo.listCreatedInRange(
          fromMs,
          toMs,
        ),

        pagesRepo.countAll(),
      ]);

      // --------------------------------------------------
      // FOCUS
      // --------------------------------------------------

      const focusTotals = new Map<
        string,
        number
      >();

      for (const session of focusSessions) {
        if (!session.completed) {
          continue;
        }

        const dateKey = getDateKey(
          new Date(session.startedAt),
        );

        focusTotals.set(
          dateKey,
          (focusTotals.get(dateKey) ?? 0) +
            session.durationMinutes,
        );
      }

      const focusDailyTotals =
        dateKeys.map((dateKey) => ({
          dateKey,
          label: formatDayLabel(
            dateKey,
          ),
          total:
            focusTotals.get(dateKey) ??
            0,
        }));

      const completedFocusSessions =
        focusSessions.filter(
          (session) =>
            session.completed,
        );

      const totalFocusMinutes =
        completedFocusSessions.reduce(
          (total, session) =>
            total +
            session.durationMinutes,
          0,
        );

      const averageFocusMinutes =
        completedFocusSessions.length >
        0
          ? totalFocusMinutes /
            completedFocusSessions.length
          : 0;

      const bestDayMinutes = Math.max(
        0,
        ...focusDailyTotals.map(
          (day) => day.total,
        ),
      );

      // --------------------------------------------------
      // TASKS
      // --------------------------------------------------

      const completedTaskCount =
        completedTasks.length;

      /*
       * Completion rate:
       *
       * 0 completed + 0 overdue = 100%
       * 0 completed + 1 overdue = 0%
       * 3 completed + 1 overdue = 75%
       */
      const taskCompletionRate =
        completedTaskCount === 0 &&
        overdueCount === 0
          ? 100
          : Math.round(
              (completedTaskCount /
                (completedTaskCount +
                  overdueCount)) *
                100,
            );

      // --------------------------------------------------
      // WATER
      // --------------------------------------------------

      const waterTotals = new Map<
        string,
        number
      >();

      for (const entry of waterEntries) {
        waterTotals.set(
          entry.dateKey,
          (waterTotals.get(
            entry.dateKey,
          ) ?? 0) + entry.amountMl,
        );
      }

      const waterDailyTotals =
        dateKeys.map((dateKey) => ({
          dateKey,
          label: formatDayLabel(
            dateKey,
          ),
          total:
            waterTotals.get(dateKey) ??
            0,
        }));

      const waterTotal =
        waterDailyTotals.reduce(
          (total, day) =>
            total + day.total,
          0,
        );

      const waterDays =
        waterDailyTotals.length;

      const weeklyAverageMl =
        waterDays > 0
          ? Math.round(
              waterTotal / waterDays,
            )
          : 0;

      /*
       * InkPlan currently uses a fixed
       * 2000ml analytics target because
       * Settings does not contain a
       * waterTargetMl field yet.
       */
      const waterTarget = 2000;

      const goalDaysCount =
        waterDailyTotals.filter(
          (day) =>
            day.total >= waterTarget,
        ).length;

      // --------------------------------------------------
      // BUDGET
      // --------------------------------------------------

      const monthIncome =
        currentTransactions
          .filter(
            (transaction) =>
              transaction.type ===
              "income",
          )
          .reduce(
            (total, transaction) =>
              total +
              transaction.amount,
            0,
          );

      const monthSpending =
        currentTransactions
          .filter(
            (transaction) =>
              transaction.type ===
              "expense",
          )
          .reduce(
            (total, transaction) =>
              total +
              transaction.amount,
            0,
          );

      const remaining =
        monthIncome -
        monthSpending;

      const categoryTotals =
        new Map<string, number>();

      for (const transaction of currentTransactions) {
        if (
          transaction.type !==
          "expense"
        ) {
          continue;
        }

        categoryTotals.set(
          transaction.category,
          (categoryTotals.get(
            transaction.category,
          ) ?? 0) +
            transaction.amount,
        );
      }

      const topCategories =
        Array.from(
          categoryTotals.entries(),
        )
          .map(
            ([category, total]) => ({
              category,
              total,
            }),
          )
          .sort(
            (a, b) =>
              b.total - a.total,
          )
          .slice(0, 3);

      const lastMonthSpending =
        previousTransactions
          .filter(
            (transaction) =>
              transaction.type ===
              "expense",
          )
          .reduce(
            (total, transaction) =>
              total +
              transaction.amount,
            0,
          );

      // --------------------------------------------------
      // NOTES
      // --------------------------------------------------

      const activeDateKeys =
        new Set<string>();

      for (const note of allNotes) {
        if (
          note.createdAt >= fromMs &&
          note.createdAt <= toMs
        ) {
          activeDateKeys.add(
            getDateKey(
              new Date(
                note.createdAt,
              ),
            ),
          );
        }

        if (
          note.updatedAt >= fromMs &&
          note.updatedAt <= toMs
        ) {
          activeDateKeys.add(
            getDateKey(
              new Date(
                note.updatedAt,
              ),
            ),
          );
        }
      }

      // --------------------------------------------------
      // FINAL ANALYTICS DATA
      // --------------------------------------------------

      return {
        range,

        fromMs,

        toMs,

        fromKey,

        toKey,

        dateKeys,

        focus: {
          totalMinutes:
            totalFocusMinutes,

          sessionsCount:
            completedFocusSessions.length,

          averageMinutes:
            Math.round(
              averageFocusMinutes,
            ),

          bestDayMinutes,

          dailyTotals:
            focusDailyTotals,

          streak:
            calculateFocusStreak(
              focusDailyTotals,
            ),
        },

        tasks: {
          completedCount:
            completedTaskCount,

          overdueCount,

          completionRate:
            taskCompletionRate,
        },

        water: {
          dailyTotals:
            waterDailyTotals,

          weeklyAverageMl,

          goalDaysCount,

          target:
            waterTarget,
        },

        budget: {
          monthIncome,

          monthSpending,

          remaining,

          monthlyBudget:
            settings?.monthlyBudget ??
            0,

          topCategories,

          lastMonthSpending,
        },

        notes: {
          totalNotes:
            await notesRepo.countAll(),

          totalPages,

          activeDays:
            activeDateKeys.size,

          createdInRange:
            createdNotes.length,
        },
      };
    },
    [rangeDates],
  );

  return data;
}