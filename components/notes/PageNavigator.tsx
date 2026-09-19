"use client";

type PageNavigatorProps = {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  onAddPage: () => void;
  onDeletePage: () => void;
};

export function PageNavigator({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  onAddPage,
  onDeletePage,
}: PageNavigatorProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 border-t border-border bg-background px-4 py-3">
      <button
        type="button"
        onClick={onPrevious}
        disabled={currentPage === 0}
        className="rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
      >
        ← Previous
      </button>

      <div className="min-w-28 text-center text-sm font-medium">
        Page {currentPage + 1} of {totalPages}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={currentPage === totalPages - 1}
        className="rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next →
      </button>

      <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

      <button
        type="button"
        onClick={onAddPage}
        className="rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        + Add Page
      </button>

      <button
        type="button"
        onClick={onDeletePage}
        disabled={totalPages <= 1}
        className="rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Delete Page
      </button>
    </div>
  );
}