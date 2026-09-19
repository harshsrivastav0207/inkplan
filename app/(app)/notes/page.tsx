"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { NoteCard } from "@/components/notes/NoteCard";
import type { Note } from "@/lib/db/types";
import { notesRepo, pagesRepo } from "@/lib/db/repositories";

type NoteWithPageCount = {
  note: Note;
  pageCount: number;
};

export default function NotesPage() {
  const router = useRouter();

  const [notes, setNotes] = useState<NoteWithPageCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const loadedNotes = await notesRepo.list();

      const notesWithPageCounts = await Promise.all(
        loadedNotes.map(async (note) => {
          const pages = await pagesRepo.listByNote(note.id);

          return {
            note,
            pageCount: pages.length,
          };
        }),
      );

      setNotes(notesWithPageCounts);
    } catch (err) {
      console.error("Failed to load notes:", err);
      setError("Unable to load your notes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const loadedNotes = await notesRepo.list();

        const notesWithPageCounts = await Promise.all(
          loadedNotes.map(async (note) => {
            const pages = await pagesRepo.listByNote(note.id);

            return {
              note,
              pageCount: pages.length,
            };
          }),
        );

        if (!cancelled) {
          setNotes(notesWithPageCounts);
        }
      } catch (err) {
        console.error("Failed to load notes:", err);

        if (!cancelled) {
          setError("Unable to load your notes.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreateNote() {
    try {
      setCreating(true);
      setError(null);

      const note = await notesRepo.create("Untitled");

      await pagesRepo.create(
        note.id,
        0,
        "lined",
        "light",
      );

      router.push(`/notes/${note.id}`);
    } catch (err) {
      console.error("Failed to create note:", err);

      setCreating(false);
      setError("Unable to create a new note.");
    }
  }

  return (
    <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            InkPlan
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            My Notes
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Your handwritten notes, all in one place.
          </p>
        </div>

        <button
          type="button"
          disabled={creating}
          onClick={handleCreateNote}
          className="rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {creating ? "Creating..." : "+ New note"}
        </button>
      </div>

      {loading && (
        <div
          role="status"
          aria-live="polite"
          className="mt-10 rounded-2xl border border-border p-12 text-center"
        >
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />

          <p className="mt-4 text-sm text-muted-foreground">
            Loading your notes...
          </p>
        </div>
      )}

      {!loading && error && (
        <div
          role="alert"
          className="mt-10 rounded-2xl border border-destructive/30 bg-destructive/5 p-12 text-center"
        >
          <h2 className="text-lg font-medium">
            Something went wrong
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {error}
          </p>

          <button
            type="button"
            onClick={loadNotes}
            className="mt-5 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && notes.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-muted text-xl">
            ✎
          </div>

          <h2 className="mt-5 text-lg font-medium">
            No notes yet
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Create your first note to get started.
          </p>

          <button
            type="button"
            onClick={handleCreateNote}
            disabled={creating}
            className="mt-5 rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? "Creating..." : "Create your first note"}
          </button>
        </div>
      )}

      {!loading && !error && notes.length > 0 && (
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {notes.map(({ note, pageCount }) => (
            <NoteCard
              key={note.id}
              note={note}
              pageCount={pageCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}