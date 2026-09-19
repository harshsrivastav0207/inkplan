"use client";

import {
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type TimerControlsProps = {
  status: "idle" | "running" | "paused" | "complete";
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
};

export function TimerControls({
  status,
  onStart,
  onPause,
  onReset,
}: TimerControlsProps) {
  const isRunning = status === "running";
  const isComplete = status === "complete";

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button
        type="button"
        onClick={onStart}
        disabled={isRunning || isComplete}
      >
        <Play />
        {status === "paused" ? "Resume" : "Start"}
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={onPause}
        disabled={!isRunning}
      >
        <Pause />
        Pause
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={onReset}
        disabled={status === "idle"}
      >
        <RotateCcw />
        Reset
      </Button>
    </div>
  );
}