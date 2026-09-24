import { db } from "../index";

import type { Priority, Task } from "../types";

import { enqueueSync } from "../sync/queue";

const newId = () => crypto.randomUUID();

const now = () => Date.now();

const todayKey = () =>
  new Date().toISOString().slice(0, 10);

export const tasksRepo = {
  async create(input: {
    title: string;
    dueDate?: string | null;
    priority?: Priority;
    notes?: string;
  }): Promise<Task> {
    const timestamp = now();

    const task: Task = {
      id: newId(),
      title: input.title,
      notes: input.notes ?? "",
      dueDate: input.dueDate ?? todayKey(),
      priority: input.priority ?? "medium",
      completed: false,
      completedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await db.transaction(
      "rw",
      db.tasks,
      db.syncQueue,
      async () => {
        await db.tasks.add(task);

        await enqueueSync(db.syncQueue, {
          table: "tasks",
          recordId: task.id,
          operation: "upsert",
          payload: task,
        });
      },
    );

    return task;
  },

  async get(id: string) {
    return db.tasks.get(id);
  },

  async listAll(): Promise<Task[]> {
    return db.tasks.orderBy("dueDate").toArray();
  },

  async listToday(): Promise<Task[]> {
    const key = todayKey();

    return db.tasks
      .where("dueDate")
      .equals(key)
      .toArray();
  },

  async listUpcoming(): Promise<Task[]> {
    const key = todayKey();

    return db.tasks
      .where("dueDate")
      .above(key)
      .and((task) => !task.completed)
      .toArray();
  },

  async listCompletedInRange(
    fromMs: number,
    toMs: number,
  ): Promise<Task[]> {
    const tasks = await db.tasks
      .where("completed")
      .equals(1)
      .toArray();

    return tasks
      .filter(
        (task) =>
          task.completed &&
          task.completedAt !== null &&
          task.completedAt >= fromMs &&
          task.completedAt <= toMs,
      )
      .sort(
        (a, b) =>
          (a.completedAt ?? 0) -
          (b.completedAt ?? 0),
      );
  },

  async countOverdue(
    nowKey: string,
  ): Promise<number> {
    const overdueTasks = await db.tasks
      .where("dueDate")
      .below(nowKey)
      .and((task) => !task.completed)
      .toArray();

    return overdueTasks.length;
  },

  async update(
    id: string,
    patch: Partial<Omit<Task, "id" | "createdAt">>,
  ) {
    await db.transaction(
      "rw",
      db.tasks,
      db.syncQueue,
      async () => {
        await db.tasks.update(id, {
          ...patch,
          updatedAt: now(),
        });

        const task = await db.tasks.get(id);

        if (!task) return;

        await enqueueSync(db.syncQueue, {
          table: "tasks",
          recordId: id,
          operation: "upsert",
          payload: task,
        });
      },
    );
  },

  async setCompleted(
    id: string,
    completed: boolean,
  ) {
    await db.transaction(
      "rw",
      db.tasks,
      db.syncQueue,
      async () => {
        await db.tasks.update(id, {
          completed,
          completedAt: completed ? now() : null,
          updatedAt: now(),
        });

        const task = await db.tasks.get(id);

        if (!task) return;

        await enqueueSync(db.syncQueue, {
          table: "tasks",
          recordId: id,
          operation: "upsert",
          payload: task,
        });
      },
    );
  },

  async remove(id: string) {
    await db.transaction(
      "rw",
      db.tasks,
      db.syncQueue,
      async () => {
        await db.tasks.delete(id);

        await enqueueSync(db.syncQueue, {
          table: "tasks",
          recordId: id,
          operation: "delete",
          payload: null,
        });
      },
    );
  },
};