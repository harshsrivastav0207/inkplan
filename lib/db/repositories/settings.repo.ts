import { db } from "../index";

import type { Settings } from "../types";

import { enqueueSync } from "../sync/queue";

export const SETTINGS_ID = "app" as const;

const DEFAULT_SETTINGS: Pick<
  Settings,
  "monthlyBudget" | "currency"
> = {
  monthlyBudget: 0,
  currency: "INR",
};

const now = () => Date.now();

export const settingsRepo = {
  async get(): Promise<Settings | undefined> {
    return db.settings.get(SETTINGS_ID);
  },

  async getWithDefaults(): Promise<
    Settings | undefined
  > {
    const settings =
      await db.settings.get(SETTINGS_ID);

    if (!settings) {
      return undefined;
    }

    return {
      ...settings,
      monthlyBudget:
        settings.monthlyBudget ??
        DEFAULT_SETTINGS.monthlyBudget,
      currency:
        settings.currency ??
        DEFAULT_SETTINGS.currency,
    };
  },

  async update(
    patch: Partial<Omit<Settings, "id">>,
  ): Promise<void> {
    await db.transaction(
      "rw",
      db.settings,
      db.syncQueue,
      async () => {
        await db.settings.update(SETTINGS_ID, {
          ...patch,
          updatedAt: now(),
        });

        const settings =
          await db.settings.get(SETTINGS_ID);

        if (!settings) return;

        const syncableSettings = {
          id: settings.id,
          monthlyBudget: settings.monthlyBudget,
          currency: settings.currency,
          updatedAt: settings.updatedAt,
        };

        await enqueueSync(db.syncQueue, {
          table: "settings",
          recordId: SETTINGS_ID,
          operation: "upsert",
          payload: syncableSettings,
        });
      },
    );
  },
};