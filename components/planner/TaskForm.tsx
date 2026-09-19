"use client";

import { useRef, useState } from "react";

import type { Priority } from "@/lib/db/types";
import { tasksRepo } from "@/lib/db/repositories";

type TaskFormProps = {
  onCreated?: () => void;
};

export function TaskForm({ onCreated }: TaskFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [creating, setCreating] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle || creating) {
      return;
    }

    try {
      setCreating(true);

      await tasksRepo.create({
        title: trimmedTitle,
        dueDate: dueDate || undefined,
        priority,
      });

      setTitle("");
      setDueDate("");
      setPriority("medium");

      onCreated?.();

      inputRef.current?.focus();
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setCreating(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-background p-4"
    >
      <div className="flex flex-col gap-3">
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs to get done?"
          disabled={creating}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            disabled={creating}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
          />

          <select
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as Priority)
            }
            disabled={creating}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
          >
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
          </select>

          <button
            type="submit"
            disabled={!title.trim() || creating}
            className="rounded-xl bg-foreground px-5 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:ml-auto"
          >
            {creating ? "Adding..." : "Add task"}
          </button>
        </div>
      </div>
    </form>
  );
}