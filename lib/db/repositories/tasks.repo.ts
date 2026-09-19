import { db } from "../index";
import type { Priority, Task } from "../types";

const newId = () => crypto.randomUUID();
const now = () => Date.now();
const todayKey = () => new Date().toISOString().slice(0, 10);

export const tasksRepo = {
  async create(input: {
    title: string;
    dueDate?: string | null;
    priority?: Priority;
    notes?: string;
  }): Promise<Task> {
    const task: Task = {
      id: newId(),
      title: input.title,
      notes: input.notes ?? "",
      dueDate: input.dueDate ?? todayKey(),
      priority: input.priority ?? "medium",
      completed: false,
      completedAt: null,
      createdAt: now(),
      updatedAt: now(),
    };

    await db.tasks.add(task);
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
    return db.tasks.where("dueDate").equals(key).toArray();
  },

  async listUpcoming(): Promise<Task[]> {
    const key = todayKey();
    return db.tasks
      .where("dueDate")
      .above(key)
      .and((task) => !task.completed)
      .toArray();
  },

  async update(
    id: string,
    patch: Partial<Omit<Task, "id" | "createdAt">>
  ) {
    await db.tasks.update(id, { ...patch, updatedAt: now() });
  },

  async setCompleted(id: string, completed: boolean) {
    await db.tasks.update(id, {
      completed,
      completedAt: completed ? now() : null,
      updatedAt: now(),
    });
  },

  async remove(id: string) {
    await db.tasks.delete(id);
  },
};