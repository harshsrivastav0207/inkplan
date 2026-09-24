import type { WorldUnlock } from "./types";

export const WORLD_UNLOCKS: WorldUnlock[] = [
  {
    id: "grass",
    name: "Grass Field",
    description: "The beginning of your world.",
    requiredXp: 0,
  },
  {
    id: "tree",
    name: "Tree",
    description: "A tree grows from your focused time.",
    requiredXp: 30,
  },
  {
    id: "pond",
    name: "Pond",
    description: "A peaceful pond appears in your world.",
    requiredXp: 100,
  },
  {
    id: "bench",
    name: "Bench",
    description: "A quiet place to pause and reflect.",
    requiredXp: 250,
  },
  {
    id: "lantern",
    name: "Lantern",
    description: "A warm light joins your world.",
    requiredXp: 450,
  },
  {
    id: "flowers",
    name: "Flowers",
    description: "Flowers begin to bloom.",
    requiredXp: 700,
  },
  {
    id: "cottage",
    name: "Cottage",
    description: "A small cottage becomes part of your world.",
    requiredXp: 1000,
  },
  {
    id: "birds",
    name: "Birds",
    description: "Birds arrive as your world comes alive.",
    requiredXp: 1500,
  },
];