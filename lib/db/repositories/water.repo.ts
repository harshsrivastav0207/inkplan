import { db } from "../index";

import type { WaterEntry } from "../types";

import { enqueueSync } from "../sync/queue";

const newId = () => crypto.randomUUID();

const now = () => Date.now();

export const todayKey = () =>
  new Date().toISOString().slice(0, 10);

export const waterRepo = {
  async add(
    amountMl: number,
    dateKey = todayKey(),
  ): Promise<WaterEntry> {
    const entry: WaterEntry = {
      id: newId(),
      amountMl,
      dateKey,
      timestamp: now(),
    };

    await db.transaction(
      "rw",
      db.waterEntries,
      db.syncQueue,
      async () => {
        await db.waterEntries.add(entry);

        await enqueueSync(db.syncQueue, {
          table: "waterEntries",
          recordId: entry.id,
          operation: "upsert",
          payload: entry,
        });
      },
    );

    return entry;
  },

  async getTodayTotal(): Promise<number> {
    const entries = await db.waterEntries
      .where("dateKey")
      .equals(todayKey())
      .toArray();

    return entries.reduce(
      (sum, entry) => sum + entry.amountMl,
      0,
    );
  },

  async listByDate(
    dateKey: string,
  ): Promise<WaterEntry[]> {
    return db.waterEntries
      .where("dateKey")
      .equals(dateKey)
      .sortBy("timestamp");
  },

  async listByDateRange(
    fromKey: string,
    toKey: string,
  ): Promise<WaterEntry[]> {
    const entries = await db.waterEntries
      .where("dateKey")
      .between(fromKey, toKey, true, true)
      .toArray();

    return entries.sort((a, b) => {
      if (a.dateKey !== b.dateKey) {
        return a.dateKey.localeCompare(b.dateKey);
      }

      return a.timestamp - b.timestamp;
    });
  },

  async listHistory(
    days = 7,
  ): Promise<WaterEntry[]> {
    const today = todayKey();

    const startDate = new Date(
      `${today}T00:00:00.000Z`,
    );

    startDate.setUTCDate(
      startDate.getUTCDate() - (days - 1),
    );

    const startKey = startDate
      .toISOString()
      .slice(0, 10);

    const entries = await db.waterEntries.toArray();

    return entries.filter(
      (entry) =>
        entry.dateKey >= startKey &&
        entry.dateKey <= today,
    );
  },

  async remove(id: string) {
    await db.transaction(
      "rw",
      db.waterEntries,
      db.syncQueue,
      async () => {
        await db.waterEntries.delete(id);

        await enqueueSync(db.syncQueue, {
          table: "waterEntries",
          recordId: id,
          operation: "delete",
          payload: null,
        });
      },
    );
  },
};