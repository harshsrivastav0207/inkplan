"use client";

import { useWorld } from "@/hooks/useWorld";

import { WORLD_UNLOCKS } from "@/lib/world/config";

import { Birds } from "./items/Birds";
import { Bench } from "./items/Bench";
import { Cottage } from "./items/Cottage";
import { Flowers } from "./items/Flowers";
import { Lantern } from "./items/Lantern";
import { Pond } from "./items/Pond";
import { Tree } from "./items/Tree";

export function WorldItems() {
  const world = useWorld();

  const xp = world?.xp ?? 0;

  const isUnlocked = (id: string) => {
    const unlock = WORLD_UNLOCKS.find((item) => item.id === id);

    return unlock ? xp >= unlock.requiredXp : false;
  };

  return (
    <g aria-label="World objects">
      {/* Grass details */}
      <g className="fill-primary/30">
        <path d="M150 575 q8 -25 16 0 q8 -25 16 0 Z" />
        <path d="M260 625 q8 -25 16 0 q8 -25 16 0 Z" />
        <path d="M1060 620 q8 -25 16 0 q8 -25 16 0 Z" />
        <path d="M1130 535 q8 -25 16 0 q8 -25 16 0 Z" />
      </g>

      {/* Ground stones */}
      <g className="fill-muted-foreground/10 stroke-muted-foreground/15">
        <ellipse cx="190" cy="665" rx="18" ry="8" />
        <ellipse cx="330" cy="580" rx="14" ry="7" />
        <ellipse cx="1080" cy="680" rx="20" ry="8" />
      </g>

      {/* Unlockable objects */}
      {isUnlocked("tree") && (
        <Tree
          x={275}
          y={430}
          scale={0.85}
        />
      )}

      {isUnlocked("pond") && (
        <Pond
          x={900}
          y={560}
          scale={0.85}
        />
      )}

      {isUnlocked("bench") && (
        <Bench
          x={650}
          y={565}
          scale={0.8}
        />
      )}

      {isUnlocked("lantern") && (
        <Lantern
          x={770}
          y={470}
          scale={0.85}
        />
      )}

      {isUnlocked("flowers") && (
        <Flowers
          x={390}
          y={610}
          scale={0.8}
        />
      )}

      {isUnlocked("cottage") && (
        <Cottage
          x={300}
          y={450}
          scale={0.75}
        />
      )}

      {isUnlocked("birds") && (
        <Birds
          x={790}
          y={180}
          scale={0.9}
        />
      )}
    </g>
  );
}