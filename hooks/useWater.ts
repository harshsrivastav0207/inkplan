"use client";

import { useLiveQuery } from "dexie-react-hooks";

import {
  settingsRepo,
  todayKey,
  waterRepo,
} from "@/lib/db/repositories";

type WaterData = {
  todayTotal: number;
  todayEntries: Awaited<
    ReturnType<typeof waterRepo.listByDate>
  >;
  dailyTarget: number;
  error: string | null;
};

const initialData: WaterData = {
  todayTotal: 0,
  todayEntries: [],
  dailyTarget: 2000,
  error: null,
};

export function useWater() {
  const data = useLiveQuery(
    async (): Promise<WaterData> => {
      try {
        const [entries, settings] =
          await Promise.all([
            waterRepo.listByDate(
              todayKey(),
            ),
            settingsRepo.get(),
          ]);

        const todayTotal =
          entries.reduce(
            (total, entry) =>
              total + entry.amountMl,
            0,
          );

        return {
          todayTotal,
          todayEntries: entries,
          dailyTarget:
            settings?.dailyWaterTargetMl ??
            2000,
          error: null,
        };
      } catch (error) {
        console.error(
          "[InkPlan Water] Failed to load:",
          error,
        );

        return {
          ...initialData,
          error:
            error instanceof Error
              ? error.message
              : "Could not load water data.",
        };
      }
    },
    [],
    initialData,
  );

  return {
    todayTotal: data.todayTotal,
    todayEntries: data.todayEntries,
    dailyTarget: data.dailyTarget,
    error: data.error,
  };
}