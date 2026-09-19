"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/ui/ErrorState";

export default function NotesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[InkPlan Notes]", error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <ErrorState
          title="Something went wrong in Notes"
          message="Your notes could not be loaded right now."
          onRetry={reset}
        />
      </div>
    </main>
  );
}