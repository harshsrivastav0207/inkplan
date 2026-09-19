"use client";

import { useLiveQuery } from "dexie-react-hooks";

import { tasksRepo } from "@/lib/db/repositories";

export function useTasks() {
  return useLiveQuery(
    () => tasksRepo.listAll(),
    [],
  );
}