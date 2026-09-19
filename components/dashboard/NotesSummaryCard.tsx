"use client";

import Link from "next/link";
import { FileText } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type NotesSummaryCardProps = {
  notesCount: number;
};

export function NotesSummaryCard({
  notesCount,
}: NotesSummaryCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-muted">
              <FileText className="size-5" />
            </div>

            <CardTitle className="text-base">
              Notes
            </CardTitle>
          </div>

          <Link
            href="/notes"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            View all
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-4xl font-semibold tracking-tight">
          {notesCount}
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          {notesCount === 1 ? "note" : "notes"} in your library
        </p>
      </CardContent>
    </Card>
  );
}