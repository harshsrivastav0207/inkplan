"use client";

import Link from "next/link";
import { FileText } from "lucide-react";

import type { Note } from "@/lib/db/types";

type RecentNotesListProps = {
  notes: Note[];
};

function formatRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp;

  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  if (hours < 48) {
    return "Yesterday";
  }

  const days = Math.floor(hours / 24);

  return `${days} ${days === 1 ? "day" : "days"} ago`;
}

export function RecentNotesList({
  notes,
}: RecentNotesListProps) {
  return (
    <div className="mt-4 space-y-2">
      {notes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-4">
          <p className="text-sm text-muted-foreground">
            No notes yet.
          </p>

          <Link
            href="/notes"
            className="mt-2 inline-block text-sm font-medium underline underline-offset-4"
          >
            Create your first note
          </Link>
        </div>
      ) : (
        notes.map((note) => (
          <Link
            key={note.id}
            href={`/notes/${note.id}`}
            className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
              <FileText className="size-4" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {note.title || "Untitled"}
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatRelativeTime(note.updatedAt)}
              </p>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}