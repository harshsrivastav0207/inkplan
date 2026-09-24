"use client";

import Link from "next/link";

import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
} from "lucide-react";

type BudgetSummaryCardProps = {
  budgetTotal: number;
  budgetSpent: number;
  budgetRemaining: number;
  hasBudget: boolean;
  currency?: string;
};

function formatCurrency(
  amount: number,
  currency: string,
) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function BudgetSummaryCard({
  budgetTotal,
  budgetSpent,
  budgetRemaining,
  hasBudget,
  currency = "INR",
}: BudgetSummaryCardProps) {
  const spentPercentage =
    budgetTotal > 0
      ? Math.min(
          (budgetSpent / budgetTotal) * 100,
          100,
        )
      : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Wallet className="h-5 w-5 text-muted-foreground" />
          </div>

          <div>
            <h2 className="text-base font-semibold">
              Budget
            </h2>

            <p className="text-sm text-muted-foreground">
              This month
            </p>
          </div>
        </div>

        <Link
          href="/budget"
          className="inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-muted"
        >
          View
        </Link>
      </div>

      {!hasBudget ? (
        <div className="mt-6">
          <p className="text-sm text-muted-foreground">
            No monthly budget set yet.
          </p>

          <Link
            href="/budget"
            className="mt-3 inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            Set up budget
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowDownRight className="h-3.5 w-3.5" />
                Spent
              </div>

              <p className="mt-1 text-lg font-semibold">
                {formatCurrency(
                  budgetSpent,
                  currency,
                )}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowUpRight className="h-3.5 w-3.5" />
                Remaining
              </div>

              <p
                className={`mt-1 text-lg font-semibold ${
                  budgetRemaining < 0
                    ? "text-destructive"
                    : ""
                }`}
              >
                {formatCurrency(
                  budgetRemaining,
                  currency,
                )}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {formatCurrency(
                  budgetSpent,
                  currency,
                )}{" "}
                spent
              </span>

              <span>
                {formatCurrency(
                  budgetTotal,
                  currency,
                )}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${spentPercentage}%`,
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}