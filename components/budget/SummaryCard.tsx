"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { settingsRepo } from "@/lib/db/repositories/settings.repo";

type SummaryCardProps = {
  incomeTotal: number;
  expenseTotal: number;
  remaining: number;
  monthlyBudget: number;
  hasBudget: boolean;
};

function formatAmount(amount: number) {
  return amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}

export function SummaryCard({
  incomeTotal,
  expenseTotal,
  remaining,
  monthlyBudget,
  hasBudget,
}: SummaryCardProps) {
  const [editing, setEditing] =
    useState(false);
  const [value, setValue] = useState(
    String(monthlyBudget || ""),
  );

  async function saveBudget() {
    const budget = Number(value);

    if (!Number.isFinite(budget) || budget < 0) {
      return;
    }

    await settingsRepo.update({
      monthlyBudget: budget,
    });

    setEditing(false);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Income
          </p>

          <p className="mt-1 text-2xl font-semibold text-success">
            +₹{formatAmount(incomeTotal)}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Spending
          </p>

          <p className="mt-1 text-2xl font-semibold">
            ₹{formatAmount(expenseTotal)}
          </p>
        </div>

        {hasBudget && (
          <div>
            <p className="text-sm text-muted-foreground">
              {remaining < 0
                ? "Over budget"
                : "Remaining budget"}
            </p>

            <p
              className={`mt-1 text-2xl font-semibold ${
                remaining < 0
                  ? "text-destructive"
                  : "text-success"
              }`}
            >
              ₹{formatAmount(Math.abs(remaining))}
            </p>
          </div>
        )}

        <div>
          <p className="text-sm text-muted-foreground">
            Monthly budget
          </p>

          {editing ? (
            <div className="mt-2 space-y-2">
              <Label
                htmlFor="monthly-budget"
                className="sr-only"
              >
                Monthly budget
              </Label>

              <Input
                id="monthly-budget"
                type="number"
                min="0"
                value={value}
                onChange={(event) =>
                  setValue(event.target.value)
                }
              />

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={saveBudget}
                >
                  Save
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setEditing(false)
                  }
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setValue(
                  String(
                    monthlyBudget || "",
                  ),
                );
                setEditing(true);
              }}
              className="mt-1 text-left"
            >
              <p className="text-2xl font-semibold">
                {hasBudget
                  ? `₹${formatAmount(monthlyBudget)}`
                  : "Set budget"}
              </p>

              {!hasBudget && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Set a monthly budget to track your
                  remaining.
                </p>
              )}
            </button>
          )}
        </div>
      </div>

      {hasBudget && remaining < 0 && (
        <p className="mt-4 text-sm text-destructive">
          You are ₹
          {formatAmount(
            Math.abs(remaining),
          )}{" "}
          over your monthly budget.
        </p>
      )}
    </div>
  );
}