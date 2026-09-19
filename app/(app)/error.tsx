"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/ui/ErrorState";

type AppErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function AppError({
  error,
  reset,
}: AppErrorProps) {
  useEffect(() => {
    console.error("[InkPlan App]", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <ErrorState
          title="Something went wrong"
          message="Something went wrong in InkPlan. Try again."
          onRetry={reset}
        />
      </div>
    </main>
  );
}