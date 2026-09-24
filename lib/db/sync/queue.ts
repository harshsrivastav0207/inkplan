import type { Table } from "dexie";

import type {
  SyncOperation,
  SyncQueueItem,
} from "./types";

import { notifySyncQueueChanged } from "./engine";

export async function enqueueSync(
  syncQueue: Table<SyncQueueItem, string>,
  input: {
    table: string;
    recordId: string;
    operation: SyncOperation;
    payload: unknown;
  },
) {
  await syncQueue.put({
    id: `${input.table}:${input.recordId}`,
    table: input.table,
    recordId: input.recordId,
    operation: input.operation,
    payload: input.payload,
    createdAt: Date.now(),
    status: "pending",
    attempts: 0,
    lastAttemptAt: null,
    lastError: null,
  });

  notifySyncQueueChanged();
}