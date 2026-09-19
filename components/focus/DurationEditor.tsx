"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { settingsRepo } from "@/lib/db/repositories";
import type { TimerDurations } from "@/hooks/useFocusTimer";

type DurationEditorProps = {
  durations: TimerDurations;
  disabled?: boolean;
  onSaved: (durations: TimerDurations) => void;
};

function secondsToMinutes(seconds: number) {
  return Math.round(seconds / 60);
}

function isValidMinutes(value: number) {
  return Number.isInteger(value) && value >= 1 && value <= 120;
}

export function DurationEditor({
  durations,
  disabled = false,
  onSaved,
}: DurationEditorProps) {
  const [focus, setFocus] = useState(
    String(secondsToMinutes(durations.focus)),
  );

  const [shortBreak, setShortBreak] = useState(
    String(secondsToMinutes(durations.shortBreak)),
  );

  const [longBreak, setLongBreak] = useState(
    String(secondsToMinutes(durations.longBreak)),
  );

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    const focusMinutes = Number(focus);
    const shortBreakMinutes = Number(shortBreak);
    const longBreakMinutes = Number(longBreak);

    if (
      !isValidMinutes(focusMinutes) ||
      !isValidMinutes(shortBreakMinutes) ||
      !isValidMinutes(longBreakMinutes)
    ) {
      setError(
        "Each duration must be a whole number from 1 to 120 minutes.",
      );
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      await settingsRepo.update({
        pomodoroMinutes: focusMinutes,
        shortBreakMinutes,
        longBreakMinutes,
      });

      const nextDurations: TimerDurations = {
        focus: focusMinutes * 60,
        shortBreak: shortBreakMinutes * 60,
        longBreak: longBreakMinutes * 60,
      };

      onSaved(nextDurations);
    } catch (err) {
      console.error(
        "[InkPlan Focus] Failed to save durations:",
        err,
      );

      setError("Could not save durations.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div>
        <h2 className="text-lg font-semibold">
          Timer durations
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Customize your focus and break lengths.
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="focus-duration">
            Focus (minutes)
          </Label>

          <Input
            id="focus-duration"
            type="number"
            min="1"
            max="120"
            step="1"
            value={focus}
            disabled={disabled || isSaving}
            onChange={(event) =>
              setFocus(event.target.value)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="short-break-duration">
            Short Break (minutes)
          </Label>

          <Input
            id="short-break-duration"
            type="number"
            min="1"
            max="120"
            step="1"
            value={shortBreak}
            disabled={disabled || isSaving}
            onChange={(event) =>
              setShortBreak(event.target.value)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="long-break-duration">
            Long Break (minutes)
          </Label>

          <Input
            id="long-break-duration"
            type="number"
            min="1"
            max="120"
            step="1"
            value={longBreak}
            disabled={disabled || isSaving}
            onChange={(event) =>
              setLongBreak(event.target.value)
            }
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          disabled={disabled || isSaving}
          onClick={handleSave}
        >
          {isSaving ? "Saving..." : "Save durations"}
        </Button>

        {disabled ? (
          <p className="text-sm text-muted-foreground">
            Pause or finish the timer before changing durations.
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="mt-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}