"use client";

import type { PenTool } from "@/lib/pen/stroke-types";

type PenToolbarProps = {
  tool: PenTool;
  size: number;
  color: string;
  opacity: number;
  onToolChange: (tool: PenTool) => void;
  onSizeChange: (size: number) => void;
  onColorChange: (color: string) => void;
  onOpacityChange: (opacity: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

const COLORS = [
  "#111111",
  "#e11d48",
  "#2563eb",
  "#16a34a",
  "#9333ea",
  "#ea580c",
  "#ca8a04",
  "#64748b",
];

const SIZES = [2, 4, 8];

export function PenToolbar({
  tool,
  size,
  color,
  opacity,
  onToolChange,
  onSizeChange,
  onColorChange,
  onOpacityChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: PenToolbarProps) {
  return (
    <div className="absolute bottom-4 left-1/2 z-50 flex max-w-[calc(100%-2rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-2xl border bg-background/95 p-2 shadow-lg backdrop-blur">
      {/* Undo / Redo */}
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className="rounded-xl border px-3 py-2 text-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        title="Undo"
      >
        ↶
      </button>

      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        className="rounded-xl border px-3 py-2 text-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        title="Redo"
      >
        ↷
      </button>

      <div className="h-8 w-px bg-border" />

      {/* Tools */}
      <button
        type="button"
        onClick={() => onToolChange("pen")}
        className={`rounded-xl border px-3 py-2 text-sm transition ${
          tool === "pen"
            ? "bg-foreground text-background"
            : "hover:bg-muted"
        }`}
      >
        Pen
      </button>

      <button
        type="button"
        onClick={() =>
          onToolChange("highlighter")
        }
        className={`rounded-xl border px-3 py-2 text-sm transition ${
          tool === "highlighter"
            ? "bg-foreground text-background"
            : "hover:bg-muted"
        }`}
      >
        Highlight
      </button>

      <button
        type="button"
        onClick={() => onToolChange("eraser")}
        className={`rounded-xl border px-3 py-2 text-sm transition ${
          tool === "eraser"
            ? "bg-foreground text-background"
            : "hover:bg-muted"
        }`}
      >
        Eraser
      </button>

      <div className="h-8 w-px bg-border" />

      {/* Sizes */}
      <div className="flex items-center gap-1">
        {SIZES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onSizeChange(value)}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
              size === value
                ? "bg-muted"
                : "hover:bg-muted"
            }`}
            title={`${value}px`}
          >
            <span
              className="block rounded-full bg-foreground"
              style={{
                width: Math.max(4, value),
                height: Math.max(4, value),
              }}
            />
          </button>
        ))}
      </div>

      <div className="h-8 w-px bg-border" />

      {/* Colors */}
      <div className="flex items-center gap-1">
        {COLORS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onColorChange(value)}
            className={`h-7 w-7 rounded-full border-2 transition ${
              color === value
                ? "border-foreground scale-110"
                : "border-transparent"
            }`}
            style={{
              backgroundColor: value,
            }}
            title={value}
          />
        ))}
      </div>

      {/* Opacity */}
      <label className="flex items-center gap-2 px-2 text-xs">
        <span>Opacity</span>

        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={opacity}
          onChange={(event) =>
            onOpacityChange(
              Number(event.target.value)
            )
          }
          className="w-20"
        />
      </label>
    </div>
  );
}