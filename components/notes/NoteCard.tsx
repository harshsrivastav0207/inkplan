import Link from "next/link";
import type { Note } from "@/lib/db/types";

type NoteCardProps = {
  note: Note;
  pageCount: number;
};

export function NoteCard({ note, pageCount }: NoteCardProps) {
  const updatedDate = new Date(note.updatedAt);

  return (
    <Link
      href={`/notes/${note.id}`}
      className="group block rounded-2xl border border-border bg-background p-5 transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <div className="flex min-h-32 flex-col justify-between">
        <div>
          <h2 className="line-clamp-2 text-lg font-semibold tracking-tight group-hover:underline">
            {note.title || "Untitled"}
          </h2>
        </div>

        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {pageCount} {pageCount === 1 ? "page" : "pages"}
          </span>

          <span>
            {updatedDate.toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </Link>
  );
}