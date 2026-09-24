export type WorldUnlockId =
  | "grass"
  | "tree"
  | "pond"
  | "bench"
  | "lantern"
  | "flowers"
  | "cottage"
  | "birds";

export type WorldUnlock = {
  id: WorldUnlockId;
  name: string;
  description: string;
  requiredXp: number;
};

export type WorldProgress = {
  xp: number;
  unlocked: WorldUnlock[];
  nextUnlock: WorldUnlock | null;
  xpToNextUnlock: number;
};