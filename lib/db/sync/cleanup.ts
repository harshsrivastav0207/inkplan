import { db } from "@/lib/db";

export async function clearAllLocalData(): Promise<void> {
  await db.transaction(
    "rw",
    [
      db.notes,
      db.pages,
      db.tasks,
      db.waterEntries,
      db.focusSessions,
      db.transactions,
      db.settings,
      db.syncQueue,
    ],
    async () => {
      await db.notes.clear();
      await db.pages.clear();
      await db.tasks.clear();
      await db.waterEntries.clear();
      await db.focusSessions.clear();
      await db.transactions.clear();
      await db.settings.clear();
      await db.syncQueue.clear();
    },
  );
}

export async function countForeignQueueItems(): Promise<number> {
  const items = await db.syncQueue.toArray();

  return items.filter(
    (item) =>
      typeof item.lastError === "string" &&
      item.lastError.includes("code=42501"),
  ).length;
}