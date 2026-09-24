import { db } from "@/lib/db";

import { enqueueSync } from "./queue";

const MIGRATION_KEY =
  "inkplan:local-data-migrated";

async function migrateNotes(): Promise<void> {
  const records = await db.notes.toArray();

  for (const record of records) {
    await enqueueSync(db.syncQueue, {
      table: "notes",
      recordId: record.id,
      operation: "upsert",
      payload: record,
    });
  }
}

async function migratePages(): Promise<void> {
  const records = await db.pages.toArray();

  for (const record of records) {
    await enqueueSync(db.syncQueue, {
      table: "pages",
      recordId: record.id,
      operation: "upsert",
      payload: record,
    });
  }
}

async function migrateTasks(): Promise<void> {
  const records = await db.tasks.toArray();

  for (const record of records) {
    await enqueueSync(db.syncQueue, {
      table: "tasks",
      recordId: record.id,
      operation: "upsert",
      payload: record,
    });
  }
}

async function migrateWaterEntries(): Promise<void> {
  const records = await db.waterEntries.toArray();

  for (const record of records) {
    await enqueueSync(db.syncQueue, {
      table: "waterEntries",
      recordId: record.id,
      operation: "upsert",
      payload: record,
    });
  }
}

async function migrateFocusSessions(): Promise<void> {
  const records = await db.focusSessions.toArray();

  for (const record of records) {
    await enqueueSync(db.syncQueue, {
      table: "focusSessions",
      recordId: record.id,
      operation: "upsert",
      payload: record,
    });
  }
}

async function migrateTransactions(): Promise<void> {
  const records = await db.transactions.toArray();

  for (const record of records) {
    await enqueueSync(db.syncQueue, {
      table: "transactions",
      recordId: record.id,
      operation: "upsert",
      payload: record,
    });
  }
}

async function migrateSettings(): Promise<void> {
  const record = await db.settings.get("app");

  if (!record) {
    return;
  }

  await enqueueSync(db.syncQueue, {
    table: "settings",
    recordId: record.id,
    operation: "upsert",
    payload: record,
  });
}

export async function migrateLocalDataToCloud(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  if (localStorage.getItem(MIGRATION_KEY) === "true") {
    return false;
  }

  await migrateNotes();
  await migratePages();
  await migrateTasks();
  await migrateWaterEntries();
  await migrateFocusSessions();
  await migrateTransactions();
  await migrateSettings();

  localStorage.setItem(MIGRATION_KEY, "true");

  return true;
}