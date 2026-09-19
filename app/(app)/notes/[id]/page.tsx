"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import type {
  Note,
  Page,
  PageType,
  ThemeName,
} from "@/lib/db/types";

import { notesRepo, pagesRepo } from "@/lib/db/repositories";

import { NoteEditorHeader } from "@/components/notes/NoteEditorHeader";
import { CanvasStage } from "@/components/canvas/CanvasStage";
import { PageNavigator } from "@/components/notes/PageNavigator";
import { PageTypeSelector } from "@/components/notes/PageTypeSelector";
import { PageThemeSelector } from "@/components/notes/PageThemeSelector";

import { exportNoteAsPdf } from "@/lib/notes/export-pdf";

const TITLE_AUTOSAVE_DELAY = 500;

type NoteExport = {
  version: 1;
  exportedAt: number;
  note: Note;
  pages: Page[];
};

export default function NoteEditorPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = params?.id;
  const noteId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [note, setNote] = useState<Note | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveTitle = useCallback(
    async (title: string) => {
      if (!noteId) {
        return;
      }

      try {
        await notesRepo.update(noteId, {
          title,
        });
      } catch (err) {
        console.error("Failed to save note title:", err);
        setError("Unable to save the note title.");
      }
    },
    [noteId],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadEditor() {
      if (!noteId) {
        return;
      }

      try {
        setLoading(true);
        setNotFound(false);
        setError(null);

        const loadedNote = await notesRepo.get(noteId);

        if (!loadedNote) {
          if (!cancelled) {
            setNotFound(true);
            setLoading(false);
          }
          return;
        }

        let loadedPages = await pagesRepo.listByNote(noteId);

        if (loadedPages.length === 0) {
          const firstPage = await pagesRepo.create(
            noteId,
            0,
            "lined",
            "light",
          );

          loadedPages = [firstPage];
        }

        if (!cancelled) {
          setNote(loadedNote);
          setPages(loadedPages);
          setCurrentPageIndex(0);
        }
      } catch (err) {
        console.error("Failed to load note editor:", err);

        if (!cancelled) {
          setError("Unable to load this note.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadEditor();

    return () => {
      cancelled = true;
    };
  }, [noteId]);

  useEffect(() => {
    return () => {
      if (titleSaveTimer.current) {
        clearTimeout(titleSaveTimer.current);
      }
    };
  }, []);

  async function handleDelete() {
    if (!note) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this note? This will permanently delete the note and all of its pages.",
    );

    if (!confirmed) {
      return;
    }

    try {
      const notePages = await pagesRepo.listByNote(note.id);

      for (const page of notePages) {
        await pagesRepo.remove(page.id);
      }

      await notesRepo.remove(note.id);

      router.push("/notes");
    } catch (err) {
      console.error("Failed to delete note:", err);
      setError("Unable to delete this note.");
    }
  }

  async function handleExport() {
    if (!note) {
      return;
    }

    try {
      const latestNote = await notesRepo.get(note.id);
      const latestPages = await pagesRepo.listByNote(note.id);

      if (!latestNote) {
        setError("Unable to export this note.");
        return;
      }

      const exportData: NoteExport = {
        version: 1,
        exportedAt: Date.now(),
        note: latestNote,
        pages: latestPages,
      };

      const json = JSON.stringify(
        exportData,
        null,
        2,
      );

      const blob = new Blob(
        [json],
        {
          type: "application/json",
        },
      );

      const url =
        URL.createObjectURL(blob);

      const safeTitle =
        latestNote.title
          .trim()
          .replace(/[^a-z0-9]+/gi, "-")
          .replace(/^-+|-+$/g, "")
          .toLowerCase() || "untitled";

      const filename =
        `inkplan-${safeTitle}.json`;

      const link =
        document.createElement("a");

      link.href = url;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(
        "Failed to export note:",
        err,
      );

      setError(
        "Unable to export this note.",
      );
    }
  }

  async function handleExportPdf() {
    if (!note) {
      return;
    }

    try {
      setError(null);

      const latestNote =
        await notesRepo.get(note.id);

      const latestPages =
        await pagesRepo.listByNote(note.id);

      if (!latestNote) {
        setError(
          "Unable to export this note.",
        );
        return;
      }

      exportNoteAsPdf(
        latestNote.title,
        latestPages,
      );
    } catch (err) {
      console.error(
        "Failed to export PDF:",
        err,
      );

      setError(
        "Unable to export this note as PDF.",
      );
    }
  }

  function handleTitleChange(title: string) {
    if (!note) {
      return;
    }

    const updatedAt = Date.now();

    setNote((currentNote) =>
      currentNote
        ? {
            ...currentNote,
            title,
            updatedAt,
          }
        : currentNote,
    );

    if (titleSaveTimer.current) {
      clearTimeout(
        titleSaveTimer.current,
      );
    }

    titleSaveTimer.current =
      setTimeout(() => {
        void saveTitle(title);
      }, TITLE_AUTOSAVE_DELAY);
  }

  async function handleTitleBlur() {
    if (!note) {
      return;
    }

    if (titleSaveTimer.current) {
      clearTimeout(
        titleSaveTimer.current,
      );

      titleSaveTimer.current = null;
    }

    await saveTitle(note.title);
  }

  async function handleAddPage() {
    if (!note) {
      return;
    }

    try {
      const newPage =
        await pagesRepo.create(
          note.id,
          pages.length,
          "lined",
          "light",
        );

      setPages((currentPages) => [
        ...currentPages,
        newPage,
      ]);

      setCurrentPageIndex(
        pages.length,
      );
    } catch (err) {
      console.error(
        "Failed to add page:",
        err,
      );

      setError(
        "Unable to add a new page.",
      );
    }
  }

  async function handleDeletePage() {
    if (pages.length <= 1) {
      return;
    }

    const currentPage =
      pages[currentPageIndex];

    if (!currentPage) {
      return;
    }

    const confirmed =
      window.confirm(
        "Delete this page? All handwriting on this page will be permanently deleted.",
      );

    if (!confirmed) {
      return;
    }

    try {
      await pagesRepo.remove(
        currentPage.id,
      );

      const remainingPages =
        pages.filter(
          (page) =>
            page.id !== currentPage.id,
        );

      const reorderedPages =
        remainingPages.map(
          (page, index) => ({
            ...page,
            order: index,
          }),
        );

      for (const page of reorderedPages) {
        await pagesRepo.update(
          page.id,
          {
            order: page.order,
          },
        );
      }

      const nextIndex =
        Math.min(
          currentPageIndex,
          reorderedPages.length - 1,
        );

      setPages(reorderedPages);
      setCurrentPageIndex(nextIndex);
    } catch (err) {
      console.error(
        "Failed to delete page:",
        err,
      );

      setError(
        "Unable to delete this page.",
      );
    }
  }

  function handlePreviousPage() {
    setCurrentPageIndex(
      (index) =>
        Math.max(0, index - 1),
    );
  }

  function handleNextPage() {
    setCurrentPageIndex(
      (index) =>
        Math.min(
          pages.length - 1,
          index + 1,
        ),
    );
  }

  async function handlePageTypeChange(
    pageType: PageType,
  ) {
    const currentPage =
      pages[currentPageIndex];

    if (!currentPage) {
      return;
    }

    try {
      await pagesRepo.update(
        currentPage.id,
        {
          pageType,
        },
      );

      setPages(
        (currentPages) =>
          currentPages.map(
            (page) =>
              page.id === currentPage.id
                ? {
                    ...page,
                    pageType,
                    updatedAt: Date.now(),
                  }
                : page,
          ),
      );
    } catch (err) {
      console.error(
        "Failed to update page type:",
        err,
      );

      setError(
        "Unable to change the page type.",
      );
    }
  }

  async function handlePageThemeChange(
    theme: ThemeName,
  ) {
    const currentPage =
      pages[currentPageIndex];

    if (!currentPage) {
      return;
    }

    try {
      await pagesRepo.update(
        currentPage.id,
        {
          theme,
        },
      );

      setPages(
        (currentPages) =>
          currentPages.map(
            (page) =>
              page.id === currentPage.id
                ? {
                    ...page,
                    theme,
                    updatedAt: Date.now(),
                  }
                : page,
          ),
      );
    } catch (err) {
      console.error(
        "Failed to update page theme:",
        err,
      );

      setError(
        "Unable to change the page theme.",
      );
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">
          Loading note...
        </p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Note Editor
          </p>

          <h1 className="mt-2 text-2xl font-semibold">
            Note not found
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            This note does not exist or may have been deleted.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">
            Something went wrong
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!note || pages.length === 0) {
    return null;
  }

  const currentPage =
    pages[currentPageIndex];

  if (!currentPage) {
    return null;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-background text-foreground">
      <NoteEditorHeader
        title={note.title}
        onTitleChange={
          handleTitleChange
        }
        onTitleBlur={
          handleTitleBlur
        }
        onExport={handleExport}
        onDelete={handleDelete}
      />

      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-border bg-background px-4 py-2">
        <PageTypeSelector
          value={
            currentPage.pageType
          }
          onChange={
            handlePageTypeChange
          }
        />

        <PageThemeSelector
          value={currentPage.theme}
          onChange={
            handlePageThemeChange
          }
        />

        <button
          type="button"
          onClick={handleExportPdf}
          className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
        >
          Export PDF
        </button>
      </div>

      <div className="min-h-0 flex-1">
        <CanvasStage
          pageId={currentPage.id}
          pageType={
            currentPage.pageType
          }
          theme={currentPage.theme}
        />
      </div>

      <PageNavigator
        currentPage={currentPageIndex}
        totalPages={pages.length}
        onPrevious={
          handlePreviousPage
        }
        onNext={
          handleNextPage
        }
        onAddPage={handleAddPage}
        onDeletePage={
          handleDeletePage
        }
      />
    </div>
  );
}