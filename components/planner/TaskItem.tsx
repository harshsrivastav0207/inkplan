"use client";

import { useState } from "react";

import { Trash2, Check, X } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";

import type { Priority, Task } from "@/lib/db/types";

import { tasksRepo } from "@/lib/db/repositories";

import { PriorityBadge } from "./PriorityBadge";

type TaskItemProps = {
  task: Task;
};

export function TaskItem({ task }: TaskItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false);

  const [editing, setEditing] = useState(false);

  const [title, setTitle] = useState(task.title);

  const [dueDate, setDueDate] = useState(
    task.dueDate ?? "",
  );

  const [priority, setPriority] =
    useState<Priority>(task.priority);

  async function handleComplete(checked: boolean) {
    await tasksRepo.setCompleted(task.id, checked);
  }

  function handleStartEditing() {
    setTitle(task.title);
    setDueDate(task.dueDate ?? "");
    setPriority(task.priority);
    setEditing(true);
  }

  async function handleSave() {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setTitle(task.title);
      setDueDate(task.dueDate ?? "");
      setPriority(task.priority);
      setEditing(false);
      return;
    }

    await tasksRepo.update(task.id, {
      title: trimmedTitle,
      dueDate: dueDate || undefined,
      priority,
    });

    setEditing(false);
  }

  function handleCancel() {
    setTitle(task.title);
    setDueDate(task.dueDate ?? "");
    setPriority(task.priority);
    setEditing(false);
  }

  async function handleDelete() {
    await tasksRepo.remove(task.id);
    setShowDeleteConfirm(false);
  }

  function handleTitleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleSave();
    }

    if (event.key === "Escape") {
      handleCancel();
    }
  }

  return (
    <div className="rounded-xl border border-border">
      <div className="flex items-center gap-3 p-4">
        <Checkbox
          checked={task.completed}
          onCheckedChange={(checked) =>
            handleComplete(checked === true)
          }
          aria-label={`Mark ${task.title} as ${
            task.completed ? "incomplete" : "complete"
          }`}
        />

        {editing ? (
          <div className="min-w-0 flex-1 space-y-2">
            <input
              autoFocus
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              onKeyDown={handleTitleKeyDown}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
            />

            <div className="flex flex-wrap gap-2">
              <input
                type="date"
                value={dueDate}
                onChange={(event) =>
                  setDueDate(event.target.value)
                }
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-foreground"
              />

              <select
                value={priority}
                onChange={(event) =>
                  setPriority(
                    event.target.value as Priority,
                  )
                }
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-foreground"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <button
                type="button"
                onClick={() => void handleSave()}
                className="inline-flex items-center gap-1 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background"
              >
                <Check className="h-3.5 w-3.5" />
                Save
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={handleStartEditing}
              className={`block max-w-full truncate text-left text-sm font-medium ${
                task.completed
                  ? "text-muted-foreground line-through"
                  : ""
              }`}
            >
              {task.title}
            </button>

            <div className="mt-1 flex items-center gap-2">
              <PriorityBadge priority={task.priority} />

              {task.dueDate && (
                <span className="text-xs text-muted-foreground">
                  {task.dueDate}
                </span>
              )}
            </div>
          </div>
        )}

        {!editing && (
          <button
            type="button"
            onClick={() =>
              setShowDeleteConfirm(true)
            }
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
            aria-label={`Delete ${task.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="border-t border-border bg-muted/30 px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Delete this task?
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setShowDeleteConfirm(false)
                }
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-background"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleDelete()}
                className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}