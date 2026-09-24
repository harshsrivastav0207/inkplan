import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/client";

type RemoteRow = Record<string, unknown>;

const TABLES = [
  "notes",
  "pages",
  "tasks",
  "water_entries",
  "focus_sessions",
  "transactions",
  "settings",
] as const;

function asNumber(
  value: unknown,
  fallback = 0,
): number {
  return typeof value === "number"
    ? value
    : fallback;
}

function asString(
  value: unknown,
  fallback = "",
): string {
  return typeof value === "string"
    ? value
    : fallback;
}

function asBoolean(
  value: unknown,
  fallback = false,
): boolean {
  return typeof value === "boolean"
    ? value
    : fallback;
}

function asNullableString(
  value: unknown,
): string | null {
  return typeof value === "string"
    ? value
    : null;
}

function isDeleted(
  row: RemoteRow,
): boolean {
  return row.deleted_at !== null &&
    row.deleted_at !== undefined;
}

async function pullNotes(
  rows: RemoteRow[],
): Promise<void> {
  for (const row of rows) {
    const id = asString(row.id);
    const existing = await db.notes.get(id);

    if (isDeleted(row)) {
      if (existing) {
        await db.notes.delete(id);
      }
      continue;
    }

    const remoteUpdatedAt = asNumber(
      row.updated_at,
    );

    if (
      existing &&
      existing.updatedAt >= remoteUpdatedAt
    ) {
      continue;
    }

    await db.notes.put({
      id,
      title: asString(row.title),
      createdAt: asNumber(row.created_at),
      updatedAt: remoteUpdatedAt,
    });
  }
}

async function pullPages(
  rows: RemoteRow[],
): Promise<void> {
  for (const row of rows) {
    const id = asString(row.id);
    const existing = await db.pages.get(id);

    if (isDeleted(row)) {
      if (existing) {
        await db.pages.delete(id);
      }
      continue;
    }

    const remoteUpdatedAt = asNumber(
      row.updated_at,
    );

    if (
      existing &&
      existing.updatedAt >= remoteUpdatedAt
    ) {
      continue;
    }

    await db.pages.put({
      id,
      noteId: asString(row.note_id),
      order: asNumber(row.order),
      pageType: row.page_type as
        | "blank"
        | "grid"
        | "lined"
        | "box",
      theme: row.theme as
        | "light"
        | "dark"
        | "warm",
      strokes: Array.isArray(row.strokes)
        ? row.strokes
        : [],
      createdAt: asNumber(row.created_at),
      updatedAt: remoteUpdatedAt,
    });
  }
}

async function pullTasks(
  rows: RemoteRow[],
): Promise<void> {
  for (const row of rows) {
    const id = asString(row.id);
    const existing = await db.tasks.get(id);

    if (isDeleted(row)) {
      if (existing) {
        await db.tasks.delete(id);
      }
      continue;
    }

    const remoteUpdatedAt = asNumber(
      row.updated_at,
    );

    if (
      existing &&
      existing.updatedAt >= remoteUpdatedAt
    ) {
      continue;
    }

    await db.tasks.put({
      id,
      title: asString(row.title),
      notes: existing?.notes ?? "",
      dueDate:
        typeof row.due_date === "string"
          ? row.due_date
          : null,
      priority: row.priority as
        | "low"
        | "medium"
        | "high",
      completed: asBoolean(row.completed),
      completedAt:
        existing?.completedAt ?? null,
      createdAt: asNumber(row.created_at),
      updatedAt: remoteUpdatedAt,
    });
  }
}

async function pullWaterEntries(
  rows: RemoteRow[],
): Promise<void> {
  for (const row of rows) {
    const id = asString(row.id);
    const existing =
      await db.waterEntries.get(id);

    if (isDeleted(row)) {
      if (existing) {
        await db.waterEntries.delete(id);
      }
      continue;
    }

    const remoteUpdatedAt = asNumber(
      row.updated_at,
      asNumber(row.timestamp),
    );

    if (
      existing &&
      existing.timestamp >= remoteUpdatedAt
    ) {
      continue;
    }

    await db.waterEntries.put({
      id,
      amountMl: asNumber(row.amount_ml),
      dateKey: asString(row.date_key),
      timestamp: asNumber(row.timestamp),
    });
  }
}

async function pullFocusSessions(
  rows: RemoteRow[],
): Promise<void> {
  for (const row of rows) {
    const id = asString(row.id);
    const existing =
      await db.focusSessions.get(id);

    if (isDeleted(row)) {
      if (existing) {
        await db.focusSessions.delete(id);
      }
      continue;
    }

    const remoteUpdatedAt = asNumber(
      row.updated_at,
    );

    const existingUpdatedAt =
      existing?.endedAt ?? 0;

    if (
      existing &&
      existingUpdatedAt >= remoteUpdatedAt
    ) {
      continue;
    }

    await db.focusSessions.put({
      id,
      startedAt: asNumber(row.started_at),
      endedAt: asNumber(row.ended_at),
      durationMinutes: asNumber(
        row.duration_minutes,
      ),
      completed: asBoolean(row.completed),
      audioTrackId: asNullableString(
        row.audio_track_id,
      ),
    });
  }
}

async function pullTransactions(
  rows: RemoteRow[],
): Promise<void> {
  for (const row of rows) {
    const id = asString(row.id);
    const existing =
      await db.transactions.get(id);

    if (isDeleted(row)) {
      if (existing) {
        await db.transactions.delete(id);
      }
      continue;
    }

    const remoteUpdatedAt = asNumber(
      row.updated_at,
    );

    if (
      existing &&
      existing.updatedAt >= remoteUpdatedAt
    ) {
      continue;
    }

    await db.transactions.put({
      id,
      type: row.type as
        | "income"
        | "expense",
      amount: asNumber(row.amount),
      category: asString(row.category),
      note: asString(row.note),
      date: asString(row.date),
      createdAt: asNumber(row.created_at),
      updatedAt: remoteUpdatedAt,
    });
  }
}

async function pullSettings(
  rows: RemoteRow[],
): Promise<void> {
  const row = rows[0];

  if (!row) {
    return;
  }

  const existing = await db.settings.get("app");

  if (isDeleted(row)) {
    if (existing) {
      await db.settings.delete("app");
    }
    return;
  }

  const remoteUpdatedAt = asNumber(
    row.updated_at,
  );

  if (
    existing &&
    existing.updatedAt >= remoteUpdatedAt
  ) {
    return;
  }

  await db.settings.put({
    id: "app",
    theme: existing?.theme ?? "light",
    defaultPageType:
      existing?.defaultPageType ?? "blank",
    dailyWaterTargetMl:
      existing?.dailyWaterTargetMl ?? 2000,
    pomodoroMinutes:
      existing?.pomodoroMinutes ?? 25,
    shortBreakMinutes:
      existing?.shortBreakMinutes ?? 5,
    longBreakMinutes:
      existing?.longBreakMinutes ?? 15,
    audioVolume:
      existing?.audioVolume ?? 0.5,
    monthlyBudget:
      typeof row.monthly_budget === "number"
        ? row.monthly_budget
        : existing?.monthlyBudget ?? 0,
    currency:
      typeof row.currency === "string"
        ? row.currency
        : existing?.currency ?? "INR",
    updatedAt: remoteUpdatedAt,
  });
}

async function pullTable(
  table: (typeof TABLES)[number],
  userId: string,
): Promise<void> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as RemoteRow[];

  switch (table) {
    case "notes":
      await pullNotes(rows);
      return;

    case "pages":
      await pullPages(rows);
      return;

    case "tasks":
      await pullTasks(rows);
      return;

    case "water_entries":
      await pullWaterEntries(rows);
      return;

    case "focus_sessions":
      await pullFocusSessions(rows);
      return;

    case "transactions":
      await pullTransactions(rows);
      return;

    case "settings":
      await pullSettings(rows);
      return;
  }
}

export async function pullRemoteData(): Promise<void> {
  if (
    typeof navigator !== "undefined" &&
    !navigator.onLine
  ) {
    return;
  }

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  for (const table of TABLES) {
    await pullTable(table, user.id);
  }
}