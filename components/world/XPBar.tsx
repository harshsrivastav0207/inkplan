"use client";

import type { WorldProgress } from "@/lib/world/types";

type XPBarProps = {
  progress: WorldProgress;
};

export function XPBar({ progress }: XPBarProps) {
  const currentUnlock = progress.unlocked.at(-1) ?? null;

  const previousXp = currentUnlock?.requiredXp ?? 0;
  const nextXp = progress.nextUnlock?.requiredXp ?? progress.xp;

  const range = Math.max(nextXp - previousXp, 1);
  const currentProgress = Math.max(
    0,
    Math.min(100, ((progress.xp - previousXp) / range) * 100),
  );

  const isComplete = progress.nextUnlock === null;

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">World Progress</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Focus to unlock new parts of your world.
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-lg font-semibold tabular-nums">
            {progress.xp.toLocaleString()} XP
          </p>

          {currentUnlock && (
            <p className="text-xs text-muted-foreground">
              {currentUnlock.name}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5">
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
            style={{ width: `${currentProgress}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-4 text-xs text-muted-foreground">
        <span>
          {currentUnlock
            ? `${currentUnlock.requiredXp.toLocaleString()} XP`
            : "0 XP"}
        </span>

        {isComplete ? (
          <span className="font-medium text-foreground">
            All unlocks discovered
          </span>
        ) : (
          <span className="text-right">
            {progress.xpToNextUnlock.toLocaleString()} XP until{" "}
            <span className="font-medium text-foreground">
              {progress.nextUnlock?.name}
            </span>
          </span>
        )}

        {!isComplete && (
          <span>{progress.nextUnlock?.requiredXp.toLocaleString()} XP</span>
        )}
      </div>
    </section>
  );
}