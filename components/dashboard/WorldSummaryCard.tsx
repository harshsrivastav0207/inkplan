"use client";

import Link from "next/link";

import { useWorld } from "@/hooks/useWorld";

export function WorldSummaryCard() {
  const world = useWorld();

  if (!world) {
    return (
      <section className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          Loading world...
        </p>
      </section>
    );
  }

  const currentUnlock = world.unlocked.at(-1) ?? null;

  const previousXp = currentUnlock?.requiredXp ?? 0;
  const nextXp = world.nextUnlock?.requiredXp ?? world.xp;

  const range = Math.max(nextXp - previousXp, 1);

  const progress = Math.max(
    0,
    Math.min(
      100,
      ((world.xp - previousXp) / range) * 100,
    ),
  );

  return (
    <Link
      href="/world"
      className="group block rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/30"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            World
          </p>

          <h2 className="mt-1 text-base font-semibold">
            {currentUnlock?.name ?? "Grass Field"}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Focus grows your world.
          </p>
        </div>

        <div className="text-right">
          <p className="text-lg font-semibold tabular-nums">
            {world.xp.toLocaleString()} XP
          </p>

          <p className="text-xs text-muted-foreground">
            {world.nextUnlock
              ? `${world.xpToNextUnlock.toLocaleString()} XP to go`
              : "All unlocked"}
          </p>
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {world.nextUnlock
            ? `Next: ${world.nextUnlock.name}`
            : "World complete"}
        </span>

        <span className="transition-colors group-hover:text-foreground">
          View world →
        </span>
      </div>
    </Link>
  );
}