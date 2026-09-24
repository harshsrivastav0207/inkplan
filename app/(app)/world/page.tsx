"use client";

import { useWorld } from "@/hooks/useWorld";

import { XPBar } from "@/components/world/XPBar";
import { WorldScene } from "@/components/world/WorldScene";

import { WORLD_UNLOCKS } from "@/lib/world/config";

export default function WorldPage() {
  const world = useWorld();

  if (!world) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-sm font-medium text-muted-foreground">
              Your progress, made visible
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              World
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Focus grows your world.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Loading your world...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-muted-foreground">
            Your progress, made visible
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            World
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Focus grows your world.
          </p>
        </div>

        <div className="space-y-6">
          <WorldScene />

          <XPBar progress={world} />

          <section className="rounded-xl border border-border bg-card p-5">
            <div>
              <h2 className="text-base font-semibold">Unlocks</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Discover what your focus can unlock.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {WORLD_UNLOCKS.map((unlock) => {
                const unlocked = world.xp >= unlock.requiredXp;

                return (
                  <div
                    key={unlock.id}
                    className={`rounded-xl border p-4 transition-colors ${
                      unlocked
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-muted/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold">
                        {unlock.name}
                      </span>

                      <span
                        className={`text-xs ${
                          unlocked
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {unlocked ? "Unlocked" : "Locked"}
                      </span>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {unlock.description}
                    </p>

                    <p className="mt-3 text-xs font-medium text-muted-foreground">
                      {unlock.requiredXp.toLocaleString()} XP
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}