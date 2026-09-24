"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Check,
  Cloud,
  CloudOff,
  Loader2,
  TriangleAlert,
} from "lucide-react";

import { db } from "@/lib/db";

type SyncState =
  | "checking"
  | "offline"
  | "syncing"
  | "synced"
  | "failed";

const QUEUE_EVENT =
  "inkplan:sync-queue-changed";

export function SyncStatus() {
  const [state, setState] =
    useState<SyncState>("checking");

  const checkStatus = useCallback(async () => {
    if (
      typeof navigator !== "undefined" &&
      !navigator.onLine
    ) {
      setState("offline");
      return;
    }

    try {
      const queue =
        await db.syncQueue.toArray();

      const hasFailed = queue.some(
        (item) => item.status === "failed",
      );

      const hasPendingWork = queue.some(
        (item) =>
          item.status === "pending" ||
          item.status === "syncing",
      );

      if (hasFailed) {
        setState("failed");
        return;
      }

      if (hasPendingWork) {
        setState("syncing");
        return;
      }

      setState("synced");
    } catch (error) {
      console.error(
        "InkPlan sync status check failed:",
        error,
      );

      setState("failed");
    }
  }, []);

  useEffect(() => {
    const initialCheckId =
      window.setTimeout(() => {
        void checkStatus();
      }, 0);

    const handleQueueChanged = () => {
      void checkStatus();
    };

    const handleOnline = () => {
      void checkStatus();
    };

    const handleOffline = () => {
      setState("offline");
    };

    window.addEventListener(
      QUEUE_EVENT,
      handleQueueChanged,
    );

    window.addEventListener(
      "online",
      handleOnline,
    );

    window.addEventListener(
      "offline",
      handleOffline,
    );

    const intervalId =
      window.setInterval(() => {
        void checkStatus();
      }, 2000);

    return () => {
      window.clearTimeout(initialCheckId);

      window.removeEventListener(
        QUEUE_EVENT,
        handleQueueChanged,
      );

      window.removeEventListener(
        "online",
        handleOnline,
      );

      window.removeEventListener(
        "offline",
        handleOffline,
      );

      window.clearInterval(intervalId);
    };
  }, [checkStatus]);

  if (state === "checking") {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" />
        <span>Checking sync...</span>
      </div>
    );
  }

  if (state === "offline") {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground">
        <CloudOff className="size-3.5" />
        <span>Offline</span>
      </div>
    );
  }

  if (state === "syncing") {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" />
        <span>Syncing...</span>
      </div>
    );
  }

  if (state === "failed") {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-destructive">
        <TriangleAlert className="size-3.5" />
        <span>Sync failed</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground">
      <Cloud className="size-3.5" />
      <Check className="size-3" />
      <span>Synced</span>
    </div>
  );
}