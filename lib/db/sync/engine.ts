"use client";

import { pushPendingSync } from "./push";

const SYNC_INTERVAL = 30_000;
const QUEUE_EVENT = "inkplan:sync-queue-changed";

let started = false;
let intervalId: number | null = null;
let debounceId: number | null = null;

function schedulePush() {
  if (debounceId !== null) {
    window.clearTimeout(debounceId);
  }

  debounceId = window.setTimeout(() => {
    debounceId = null;

    void pushPendingSync();
  }, 1000);
}

function handleOnline() {
  void pushPendingSync();
}

function handleQueueChanged() {
  schedulePush();
}

export function startSyncEngine() {
  if (typeof window === "undefined") {
    return;
  }

  if (started) {
    return;
  }

  started = true;

  // Push immediately when the engine starts.
  void pushPendingSync();

  // New queue item.
  window.addEventListener(
    QUEUE_EVENT,
    handleQueueChanged,
  );

  // Network comes back.
  window.addEventListener(
    "online",
    handleOnline,
  );

  // Fallback sync.
  intervalId = window.setInterval(() => {
    void pushPendingSync();
  }, SYNC_INTERVAL);
}

export function stopSyncEngine() {
  if (typeof window === "undefined") {
    return;
  }

  if (!started) {
    return;
  }

  started = false;

  window.removeEventListener(
    QUEUE_EVENT,
    handleQueueChanged,
  );

  window.removeEventListener(
    "online",
    handleOnline,
  );

  if (intervalId !== null) {
    window.clearInterval(intervalId);
    intervalId = null;
  }

  if (debounceId !== null) {
    window.clearTimeout(debounceId);
    debounceId = null;
  }
}

export function notifySyncQueueChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new Event(QUEUE_EVENT),
  );
}