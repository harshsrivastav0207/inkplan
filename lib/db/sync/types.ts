export type SyncOperation = "upsert" | "delete";

export type SyncQueueStatus =
  | "pending"
  | "syncing"
  | "failed";

export interface SyncQueueItem {
  id: string;
  table: string;
  recordId: string;
  operation: SyncOperation;
  payload: unknown;
  createdAt: number;
  status: SyncQueueStatus;
  attempts: number;
  lastAttemptAt: number | null;
  lastError: string | null;
}