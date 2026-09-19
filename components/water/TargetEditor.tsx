"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { settingsRepo } from "@/lib/db/repositories";

type TargetEditorProps = {
  currentTarget: number;
};

export function TargetEditor({
  currentTarget,
}: TargetEditorProps) {
  const [value, setValue] = useState(String(currentTarget));
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function saveTarget() {
    const target = Number(value);

    if (!Number.isFinite(target) || !Number.isInteger(target)) {
      setError("Enter a whole number.");
      return;
    }

    if (target < 500 || target > 10000) {
      setError("Target must be between 500 and 10000 ml.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      await settingsRepo.update({
        dailyWaterTargetMl: target,
      });

      setValue(String(target));
    } catch (err) {
      console.error("Failed to update water target:", err);
      setError("Could not save target.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">
          Daily target
        </h2>

        <p className="text-sm text-muted-foreground">
          Set your daily water target.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="w-full max-w-xs space-y-2">
          <Label htmlFor="water-target">
            Target (ml)
          </Label>

          <Input
            id="water-target"
            type="number"
            min="500"
            max="10000"
            step="1"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </div>

        <Button
          type="button"
          disabled={isSaving}
          onClick={saveTarget}
        >
          {isSaving ? "Saving..." : "Save target"}
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}