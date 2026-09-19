"use client";

import Link from "next/link";

type NoteEditorHeaderProps = {
  title: string;
  onTitleChange: (title: string) => void;
  onTitleBlur: () => void;
  onExport: () => void;
  onDelete: () => void;
};

export function NoteEditorHeader({
  title,
  onTitleChange,
  onTitleBlur,
  onExport,
  onDelete,
}: NoteEditorHeaderProps) {
  return (
    <header className="flex min-h-16 items-center gap-3 border-b border-border bg-background px-4 sm:px-6">
      <Link
        href="/notes"
        className="shrink-0 rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        ← Back
      </Link>

      <div className="h-6 w-px bg-border" />

      <input
        value={title}
        onChange={(event) =>
          onTitleChange(event.target.value)
        }
        onBlur={onTitleBlur}
        aria-label="Note title"
        className="min-w-0 flex-1 bg-transparent px-2 py-2 text-base font-semibold outline-none placeholder:text-muted-foreground"
        placeholder="Untitled"
      />

      <button
        type="button"
        onClick={onExport}
        className="shrink-0 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
      >
        Export
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
      >
        Delete
      </button>
    </header>
  );
}