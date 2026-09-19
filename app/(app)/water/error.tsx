"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/ui/ErrorState";

export default function WaterError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[InkPlan Water]", error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <ErrorState
          title="Something went wrong in Water"
          message="Your water data could not be loaded right now."
          onRetry={reset}
        />
      </div>
    </main>
  );
}