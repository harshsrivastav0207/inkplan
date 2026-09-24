"use client";

import { useLiveQuery } from "dexie-react-hooks";

import { focusRepo } from "@/lib/db/repositories";

import { WORLD_UNLOCKS } from "@/lib/world/config";

import type { WorldProgress } from "@/lib/world/types";

export function useWorld(): WorldProgress | undefined {
  return useLiveQuery(async () => {
    const now = Date.now();

    const totalMinutes = await focusRepo.totalMinutesInRange(
      0,
      now,
    );

    const xp = totalMinutes;

    const unlocked = WORLD_UNLOCKS.filter(
      (unlock) => unlock.requiredXp <= xp,
    );

    const nextUnlock =
      WORLD_UNLOCKS.find(
        (unlock) => unlock.requiredXp > xp,
      ) ?? null;

    const xpToNextUnlock = nextUnlock
      ? nextUnlock.requiredXp - xp
      : 0;

    return {
      xp,
      unlocked,
      nextUnlock,
      xpToNextUnlock,
    };
  }, []);
}