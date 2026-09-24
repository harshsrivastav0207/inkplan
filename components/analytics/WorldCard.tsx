"use client";

import { useWorld } from "@/hooks/useWorld";

export function WorldCard() {
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
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">
            World
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Your focus progress made visible.
          </p>
        </div>

        <div className="text-right">
          <p className="text-lg font-semibold tabular-nums">
            {world.xp.toLocaleString()} XP
          </p>

          <p className="text-xs text-muted-foreground">
            {currentUnlock?.name ?? "Grass Field"}
          </p>
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-4 text-xs text-muted-foreground">
        <span>
          {world.nextUnlock
            ? `Next: ${world.nextUnlock.name}`
            : "All unlocks discovered"}
        </span>

        <span>
          {world.nextUnlock
            ? `${world.xpToNextUnlock.toLocaleString()} XP remaining`
            : "Complete"}
        </span>
      </div>
    </section>
  );
}