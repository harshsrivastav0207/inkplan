"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { waterRepo } from "@/lib/db/repositories";

const PRESETS = [250, 500, 750];

type QuickAddProps = {
  onAdded?: () => void;
};

export function QuickAdd({ onAdded }: QuickAddProps) {
  const [customAmount, setCustomAmount] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  async function addWater(amountMl: number) {
    if (amountMl <= 0 || amountMl > 5000) {
      setError("Enter an amount between 1 and 5000 ml.");
      return;
    }

    try {
      setIsAdding(true);
      setError("");

      await waterRepo.add(amountMl);

      setCustomAmount("");
      onAdded?.();
    } catch (err) {
      console.error("Failed to add water:", err);
      setError("Could not save water entry.");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleCustomAdd() {
    const amount = Number(customAmount);

    if (!Number.isFinite(amount) || !Number.isInteger(amount)) {
      setError("Enter a whole number.");
      return;
    }

    await addWater(amount);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Add water</h2>
        <p className="text-sm text-muted-foreground">
          Quickly record how much water you drank.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((amount) => (
          <Button
            key={amount}
            type="button"
            variant="outline"
            disabled={isAdding}
            onClick={() => addWater(amount)}
          >
            +{amount} ml
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="w-full max-w-xs space-y-2">
          <Label htmlFor="custom-water-amount">
            Custom amount (ml)
          </Label>

          <Input
            id="custom-water-amount"
            type="number"
            min="1"
            max="5000"
            step="1"
            placeholder="e.g. 300"
            value={customAmount}
            onChange={(event) => setCustomAmount(event.target.value)}
          />
        </div>

        <Button
          type="button"
          disabled={isAdding || customAmount.trim() === ""}
          onClick={handleCustomAdd}
        >
          Add custom
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}
    </div>
  );
}