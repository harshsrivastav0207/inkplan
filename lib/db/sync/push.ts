import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/client";
import type { SyncQueueItem } from "./types";

type SupabaseRow = Record<string, unknown>;

const BACKOFF_BASE_MS = 30_000;
const BACKOFF_MAX_MS = 60 * 60 * 1000;

const TABLE_MAP: Record<string, string> = {
  notes: "notes",
  pages: "pages",
  tasks: "tasks",
  waterEntries: "water_entries",
  focusSessions: "focus_sessions",
  transactions: "transactions",
  settings: "settings",
};

function getRemoteTable(localTable: string): string {
  const remoteTable = TABLE_MAP[localTable];

  if (!remoteTable) {
    throw new Error(
      `Unsupported sync table: ${localTable}`,
    );
  }

  return remoteTable;
}

function getPayload(
  item: SyncQueueItem,
): Record<string, unknown> {
  if (
    item.payload &&
    typeof item.payload === "object"
  ) {
    return item.payload as Record<string, unknown>;
  }

  return {};
}

function getLocalUpdatedAt(
  item: SyncQueueItem,
): number {
  const payload = getPayload(item);

  if (item.operation === "delete") {
    return item.createdAt;
  }

  switch (item.table) {
    case "notes":
    case "pages":
    case "tasks":
    case "transactions":
    case "settings":
      return typeof payload.updatedAt === "number"
        ? payload.updatedAt
        : item.createdAt;

    case "waterEntries":
      return typeof payload.timestamp === "number"
        ? payload.timestamp
        : item.createdAt;

    case "focusSessions":
      return typeof payload.endedAt === "number"
        ? payload.endedAt
        : typeof payload.startedAt === "number"
          ? payload.startedAt
          : item.createdAt;

    default:
      return item.createdAt;
  }
}

/*
 * Only three settings fields sync across devices.
 * Everything else (theme, page type, timer durations,
 * audio volume) is a device-local preference and must
 * never be written to Supabase.
 */
async function getSyncableSettings(
  payload: Record<string, unknown>,
): Promise<{
  dailyWaterTargetMl: number;
  monthlyBudget: number;
  currency: string;
}> {
  const localSettings = await db.settings.get("app");

  const dailyWaterTargetMl =
    typeof payload.dailyWaterTargetMl === "number"
      ? payload.dailyWaterTargetMl
      : localSettings?.dailyWaterTargetMl ?? 2000;

  const monthlyBudget =
    typeof payload.monthlyBudget === "number"
      ? payload.monthlyBudget
      : localSettings?.monthlyBudget ?? 0;

  const currency =
    typeof payload.currency === "string"
      ? payload.currency
      : localSettings?.currency ?? "INR";

  return { dailyWaterTargetMl, monthlyBudget, currency };
}

async function toRemoteRow(
  item: SyncQueueItem,
  userId: string,
): Promise<SupabaseRow> {
  const payload = getPayload(item);
  const updatedAt = getLocalUpdatedAt(item);

  switch (item.table) {
    case "notes":
      return {
        id: item.recordId,
        user_id: userId,
        title: payload.title,
        created_at: payload.createdAt,
        updated_at: updatedAt,
        deleted_at: null,
      };

    case "pages":
      return {
        id: item.recordId,
        user_id: userId,
        note_id: payload.noteId,
        order: payload.order,
        page_type: payload.pageType,
        theme: payload.theme,
        strokes: payload.strokes,
        created_at: payload.createdAt,
        updated_at: updatedAt,
        deleted_at: null,
      };

    case "tasks":
      return {
        id: item.recordId,
        user_id: userId,
        title: payload.title,
        notes: payload.notes,
        due_date: payload.dueDate,
        priority: payload.priority,
        completed: payload.completed,
        created_at: payload.createdAt,
        updated_at: updatedAt,
        deleted_at: null,
      };

    case "waterEntries":
      return {
        id: item.recordId,
        user_id: userId,
        amount_ml: payload.amountMl,
        date_key: payload.dateKey,
        timestamp: payload.timestamp,
        created_at:
          typeof payload.timestamp === "number"
            ? payload.timestamp
            : updatedAt,
        updated_at: updatedAt,
        deleted_at: null,
      };

    case "focusSessions":
      return {
        id: item.recordId,
        user_id: userId,
        started_at: payload.startedAt,
        ended_at: payload.endedAt,
        duration_minutes: payload.durationMinutes,
        completed: payload.completed,
        audio_track_id: payload.audioTrackId,
        created_at:
          typeof payload.startedAt === "number"
            ? payload.startedAt
            : updatedAt,
        updated_at: updatedAt,
        deleted_at: null,
      };

    case "transactions":
      return {
        id: item.recordId,
        user_id: userId,
        type: payload.type,
        amount: payload.amount,
        category: payload.category,
        note: payload.note,
        date: payload.date,
        created_at: payload.createdAt,
        updated_at: updatedAt,
        deleted_at: null,
      };

    case "settings": {
      const settings =
        await getSyncableSettings(payload);

      return {
        id: item.recordId,
        user_id: userId,
        daily_water_target_ml:
          settings.dailyWaterTargetMl,
        monthly_budget: settings.monthlyBudget,
        currency: settings.currency,
        updated_at: updatedAt,
        deleted_at: null,
      };
    }

    default:
      throw new Error(
        `Unsupported sync table: ${item.table}`,
      );
  }
}

function formatSyncError(
  error: unknown,
): string {
  if (error instanceof Error) {
    const errorRecord =
      error as Error & {
        code?: unknown;
        details?: unknown;
        hint?: unknown;
      };

    const parts = [
      `message=${error.message}`,
      typeof errorRecord.code === "string"
        ? `code=${errorRecord.code}`
        : null,
      typeof errorRecord.details === "string"
        ? `details=${errorRecord.details}`
        : null,
      typeof errorRecord.hint === "string"
        ? `hint=${errorRecord.hint}`
        : null,
    ].filter(Boolean);

    return parts.join(" | ");
  }

  if (
    error &&
    typeof error === "object"
  ) {
    const value =
      error as Record<string, unknown>;

    const parts = [
      typeof value.message === "string"
        ? `message=${value.message}`
        : null,
      typeof value.code === "string"
        ? `code=${value.code}`
        : null,
      typeof value.details === "string"
        ? `details=${value.details}`
        : null,
      typeof value.hint === "string"
        ? `hint=${value.hint}`
        : null,
    ].filter(Boolean);

    if (parts.length > 0) {
      return parts.join(" | ");
    }

    try {
      return JSON.stringify(error);
    } catch {
      return "Unknown sync error";
    }
  }

  return String(error);
}

async function getRemoteRecord(
  supabase: ReturnType<typeof createClient>,
  remoteTable: string,
  recordId: string,
  userId: string,
): Promise<{
  id: string;
  updated_at: number;
  deleted_at: number | null;
} | null> {
  const { data, error } = await supabase
    .from(remoteTable)
    .select("id, updated_at, deleted_at")
    .eq("id", recordId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Remote read failed for ${remoteTable}/${recordId}: ${formatSyncError(error)}`,
    );
  }

  if (!data) {
    return null;
  }

  return {
    id: String(data.id),
    updated_at:
      typeof data.updated_at === "number"
        ? data.updated_at
        : 0,
    deleted_at:
      typeof data.deleted_at === "number"
        ? data.deleted_at
        : null,
  };
}

type PushResult = "pushed" | "remote-newer";

async function pushItem(
  supabase: ReturnType<typeof createClient>,
  item: SyncQueueItem,
  userId: string,
): Promise<PushResult> {
  const remoteTable = getRemoteTable(item.table);
  const localUpdatedAt = getLocalUpdatedAt(item);

  const remote = await getRemoteRecord(
    supabase,
    remoteTable,
    item.recordId,
    userId,
  );

  if (
    remote &&
    remote.updated_at > localUpdatedAt
  ) {
    return "remote-newer";
  }

  if (item.operation === "delete") {
    const { error } = await supabase
      .from(remoteTable)
      .update({
        deleted_at: localUpdatedAt,
        updated_at: localUpdatedAt,
      })
      .eq("id", item.recordId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(
        `Remote delete failed for ${remoteTable}/${item.recordId}: ${formatSyncError(error)}`,
      );
    }

    return "pushed";
  }

  const row = await toRemoteRow(item, userId);

  const { error } = await supabase
    .from(remoteTable)
    .upsert(row);

  if (error) {
    throw new Error(
      `Remote upsert failed for ${remoteTable}/${item.recordId}: ${formatSyncError(error)}`,
    );
  }

  return "pushed";
}

function getQueueKey(
  item: SyncQueueItem,
): string {
  return `${item.table}:${item.recordId}`;
}

function coalesceQueue(
  items: SyncQueueItem[],
): SyncQueueItem[] {
  const latest =
    new Map<string, SyncQueueItem>();

  for (const item of items) {
    const key = getQueueKey(item);
    const existing = latest.get(key);

    if (
      !existing ||
      item.createdAt >= existing.createdAt
    ) {
      latest.set(key, item);
    }
  }

  return Array.from(latest.values()).sort(
    (a, b) => a.createdAt - b.createdAt,
  );
}

async function removeDuplicateQueueItems(
  items: SyncQueueItem[],
): Promise<void> {
  const latestIds = new Set(
    items.map((item) => item.id),
  );

  const allItems = await db.syncQueue
    .where("status")
    .anyOf(["pending", "failed", "syncing"])
    .toArray();

  const duplicateIds = allItems
    .filter(
      (item) =>
        !latestIds.has(item.id) &&
        items.some(
          (latest) =>
            getQueueKey(latest) ===
            getQueueKey(item),
        ),
    )
    .map((item) => item.id);

  if (duplicateIds.length > 0) {
    await db.syncQueue.bulkDelete(duplicateIds);
  }
}

function getBackoffDelay(
  attempts: number,
): number {
  if (attempts <= 0) {
    return 0;
  }

  const delay =
    BACKOFF_BASE_MS *
    Math.pow(2, attempts - 1);

  return Math.min(delay, BACKOFF_MAX_MS);
}

function isReadyForRetry(
  item: SyncQueueItem,
  now: number,
): boolean {
  /*
   * One-time recovery path:
   *
   * The settings mapper was over-sending fields after
   * the schema was corrected. Older settings:app queue
   * items are stuck behind exponential backoff.
   *
   * Force settings:app to retry on every push cycle so
   * the corrected mapper drains the item immediately.
   *
   * This branch becomes a harmless no-op once the
   * queue is empty. Remove it in a follow-up cleanup.
   */
  if (
    item.table === "settings" &&
    item.recordId === "app"
  ) {
    return true;
  }

  if (item.attempts <= 0) {
    return true;
  }

  if (item.lastAttemptAt === null) {
    return true;
  }

  const backoff = getBackoffDelay(item.attempts);

  return now - item.lastAttemptAt >= backoff;
}

let pushInProgress = false;

export async function pushPendingSync(): Promise<void> {
  if (pushInProgress) {
    return;
  }

  if (
    typeof navigator !== "undefined" &&
    !navigator.onLine
  ) {
    return;
  }

  pushInProgress = true;

  try {
    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw new Error(
        `Auth check failed: ${formatSyncError(userError)}`,
      );
    }

    if (!user) {
      console.warn(
        "[InkPlan Sync] Skipping push — no authenticated user.",
      );
      return;
    }

    await db.syncQueue
      .where("status")
      .equals("syncing")
      .modify({ status: "pending" });

    const queue = await db.syncQueue
      .where("status")
      .anyOf(["pending", "failed"])
      .sortBy("createdAt");

    const now = Date.now();

    const retryable = queue.filter((item) =>
      isReadyForRetry(item, now),
    );

    const items = coalesceQueue(retryable);

    await removeDuplicateQueueItems(items);

    let remoteWasNewer = false;

    for (const item of items) {
      const current = await db.syncQueue.get(item.id);

      if (!current) {
        continue;
      }

      if (
        current.status !== "pending" &&
        current.status !== "failed"
      ) {
        continue;
      }

      await db.syncQueue.update(item.id, {
        status: "syncing",
        lastError: null,
      });

      try {
        const result = await pushItem(
          supabase,
          item,
          user.id,
        );

        if (result === "remote-newer") {
          remoteWasNewer = true;
        }

        await db.syncQueue.delete(item.id);
      } catch (error) {
        const attempts = current.attempts + 1;
        const errorMessage =
          formatSyncError(error);

        await db.syncQueue.update(item.id, {
          status: "failed",
          attempts,
          lastAttemptAt: Date.now(),
          lastError: errorMessage,
        });

        console.error(
          "[InkPlan Sync] Failed",
          {
            table: item.table,
            recordId: item.recordId,
            operation: item.operation,
            attempts,
            errorMessage,
          },
        );
      }
    }

    if (remoteWasNewer) {
      try {
        const { pullRemoteData } = await import("./pull");
        await pullRemoteData();
      } catch (error) {
        console.error(
          "[InkPlan Sync] Pull after LWW conflict failed:",
          formatSyncError(error),
        );
      }
    }
  } finally {
    pushInProgress = false;
  }
}