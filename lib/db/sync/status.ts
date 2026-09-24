"use client";

import { useLiveQuery } from "dexie-react-hooks";

import { db } from "@/lib/db";

export type SyncStatusKind =
  | "loading"
  | "signed-out"
  | "offline"
  | "syncing"
  | "pending"
  | "failed"
  | "synced";

export interface SyncStatus {
  kind: SyncStatusKind;
  pendingCount: number;
  syncingCount: number;
  failedCount: number;
  lastError: string | null;
}

interface QueueSummary {
  pending: number;
  syncing: number;
  failed: number;
  lastError: string | null;
}

const EMPTY_SUMMARY: QueueSummary = {
  pending: 0,
  syncing: 0,
  failed: 0,
  lastError: null,
};

export function useSyncStatus(
  isSignedIn: boolean,
  authLoading: boolean,
): SyncStatus {
  const rawSummary = useLiveQuery(
    async (): Promise<QueueSummary> => {
      const all = await db.syncQueue.toArray();

      let pending = 0;
      let syncing = 0;
      let failed = 0;
      let lastError: string | null = null;

      for (const item of all) {
        if (item.status === "pending") {
          pending += 1;
        } else if (item.status === "syncing") {
          syncing += 1;
        } else if (item.status === "failed") {
          failed += 1;

          if (item.lastError) {
            lastError = item.lastError;
          }
        }
      }

      return {
        pending,
        syncing,
        failed,
        lastError,
      };
    },
    [],
  );

  const summary: QueueSummary =
    rawSummary ?? EMPTY_SUMMARY;

  const offline =
    typeof navigator !== "undefined" &&
    !navigator.onLine;

  let kind: SyncStatusKind;

  if (authLoading) {
    kind = "loading";
  } else if (!isSignedIn) {
    kind = "signed-out";
  } else if (offline) {
    kind = "offline";
  } else if (summary.syncing > 0) {
    kind = "syncing";
  } else if (summary.pending > 0) {
    kind = "pending";
  } else if (summary.failed > 0) {
    kind = "failed";
  } else {
    kind = "synced";
  }

  return {
    kind,
    pendingCount: summary.pending,
    syncingCount: summary.syncing,
    failedCount: summary.failed,
    lastError: summary.lastError,
  };
}

export async function retryFailedItems(): Promise<void> {
  await db.syncQueue
    .where("status")
    .equals("failed")
    .modify({
      status: "pending",
      attempts: 0,
      lastAttemptAt: null,
    });
}

export async function clearFailedItems(): Promise<number> {
  return db.syncQueue
    .where("status")
    .equals("failed")
    .delete();
}