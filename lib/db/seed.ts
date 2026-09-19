import { db } from "./index";

import { SETTINGS_ID } from "./repositories/settings.repo";

import type { Settings } from "./types";

const DEFAULT_SETTINGS: Settings = {
  id: SETTINGS_ID,
  theme: "light",
  defaultPageType: "lined",
  dailyWaterTargetMl: 2000,
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  audioVolume: 0.5,
  updatedAt: Date.now(),
};

export async function ensureSeedData(): Promise<void> {
  const existing = await db.settings.get(SETTINGS_ID);

  if (!existing) {
    await db.settings.add(DEFAULT_SETTINGS);
  }
}