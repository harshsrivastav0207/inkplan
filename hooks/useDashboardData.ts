"use client";

import { useLiveQuery } from "dexie-react-hooks";

import {
  focusRepo,
  notesRepo,
  settingsRepo,
  tasksRepo,
  transactionsRepo,
  waterRepo,
} from "@/lib/db/repositories";

import type {
  Note,
  Settings,
  Task,
} from "@/lib/db/types";

function getStartOfToday() {
  const date = new Date();

  date.setHours(0, 0, 0, 0);

  return date.getTime();
}

function getEndOfToday() {
  const date = new Date();

  date.setHours(23, 59, 59, 999);

  return date.getTime();
}

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export type DashboardData = {
  notesCount: number;
  recentNotes: Note[];
  todayTasks: Task[];
  completedTodayCount: number;

  waterTotal: number;
  waterTarget: number;

  focusMinutesToday: number;

  budgetTotal: number;
  budgetSpent: number;
  budgetRemaining: number;
  hasBudget: boolean;

  settings: Settings | undefined;
};

export function useDashboardData() {
  return useLiveQuery<DashboardData>(
    async () => {
      const startOfToday =
        getStartOfToday();

      const endOfToday =
        getEndOfToday();

      const currentMonth =
        getCurrentMonth();

      const [
        notes,
        todayTasks,
        allTasks,
        waterTotal,
        settings,
        focusMinutesToday,
        monthlyTransactions,
      ] = await Promise.all([
        notesRepo.list(),

        tasksRepo.listToday(),

        tasksRepo.listAll(),

        waterRepo.getTodayTotal(),

        settingsRepo.get(),

        focusRepo.totalMinutesInRange(
          startOfToday,
          endOfToday,
        ),

        transactionsRepo.listByMonth(
          currentMonth,
        ),
      ]);

      const completedTodayCount =
        allTasks.filter(
          (task) =>
            task.completedAt !== null &&
            task.completedAt >= startOfToday &&
            task.completedAt <= endOfToday,
        ).length;

      const budgetTotal =
        settings?.monthlyBudget ?? 0;

      const budgetSpent =
        monthlyTransactions
          .filter(
            (transaction) =>
              transaction.type === "expense",
          )
          .reduce(
            (total, transaction) =>
              total + transaction.amount,
            0,
          );

      const budgetRemaining =
        budgetTotal - budgetSpent;

      return {
        notesCount: notes.length,

        recentNotes: notes.slice(0, 3),

        todayTasks,

        completedTodayCount,

        waterTotal,

        waterTarget:
          settings?.dailyWaterTargetMl ??
          2000,

        focusMinutesToday,

        budgetTotal,

        budgetSpent,

        budgetRemaining,

        hasBudget: budgetTotal > 0,

        settings,
      };
    },

    [],
  );
}