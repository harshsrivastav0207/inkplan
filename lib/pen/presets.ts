import type { FreehandOptions } from "./perfect-freehand";

export type PenTool = "pen" | "highlighter" | "eraser";

export type PenPreset = {
  size: number;
  color: string;
  opacity: number;
  options: FreehandOptions;
};

export const PEN_SIZES = {
  small: 2,
  medium: 4,
  large: 8,
} as const;

export const PEN_COLORS = [
  "#111111",
  "#D32F2F",
  "#1976D2",
  "#388E3C",
  "#7B1FA2",
  "#F57C00",
  "#795548",
  "#FFFFFF",
] as const;

export const DEFAULT_PEN_PRESET: PenPreset = {
  size: PEN_SIZES.medium,
  color: "#111111",
  opacity: 1,
  options: {
    size: PEN_SIZES.medium,
    streamline: 0.5,
    thinning: 0.5,
    smoothing: 0.5,
    simulatePressure: true,
  },
};

export const DEFAULT_HIGHLIGHTER_PRESET: PenPreset = {
  size: PEN_SIZES.large,
  color: "#FACC15",
  opacity: 0.35,
  options: {
    size: PEN_SIZES.large,
    streamline: 0.5,
    thinning: 0,
    smoothing: 0.5,
    simulatePressure: true,
  },
};