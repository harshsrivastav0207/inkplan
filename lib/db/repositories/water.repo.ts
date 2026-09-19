import { db } from "../index";

import type { WaterEntry } from "../types";

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

    await db.waterEntries.add(entry);

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
    await db.waterEntries.delete(id);
  },
};