import { db } from "../index";

import type { Settings } from "../types";

const SETTINGS_ID = "app" as const;

const now = () => Date.now();

export const settingsRepo = {
  async get(): Promise<Settings | undefined> {
    return db.settings.get(SETTINGS_ID);
  },

  async update(
    patch: Partial<Omit<Settings, "id">>,
  ) {
    await db.settings.update(SETTINGS_ID, {
      ...patch,
      updatedAt: now(),
    });
  },
};

export { SETTINGS_ID };