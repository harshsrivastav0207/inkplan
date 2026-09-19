"use client";

import Link from "next/link";
import { Timer } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type FocusSummaryCardProps = {
  focusMinutesToday: number;
};

export function FocusSummaryCard({
  focusMinutesToday,
}: FocusSummaryCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-muted">
            <Timer className="size-5" />
          </div>

          <CardTitle className="text-base">
            Focus
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-4xl font-semibold tracking-tight">
          {focusMinutesToday}
          <span className="ml-1 text-xl font-medium text-muted-foreground">
            min
          </span>
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          focused today
        </p>

        <Link
          href="/focus"
          className="mt-5 flex h-10 w-full items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:opacity-90"
        >
          Start focus
        </Link>
      </CardContent>
    </Card>
  );
}