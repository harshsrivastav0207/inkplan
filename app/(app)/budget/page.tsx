"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { CategoryBreakdown } from "@/components/budget/CategoryBreakdown";
import { SummaryCard } from "@/components/budget/SummaryCard";
import { TransactionForm } from "@/components/budget/TransactionForm";
import { TransactionList } from "@/components/budget/TransactionList";
import { Button } from "@/components/ui/button";
import { useBudget } from "@/hooks/useBudget";

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function shiftMonth(
  yearMonth: string,
  amount: number,
) {
  const [year, month] = yearMonth
    .split("-")
    .map(Number);

  const date = new Date(
    year,
    month - 1 + amount,
    1,
  );

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}`;
}

function formatMonth(yearMonth: string) {
  const [year, month] = yearMonth
    .split("-")
    .map(Number);

  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

export default function BudgetPage() {
  const [yearMonth, setYearMonth] =
    useState(getCurrentMonth);

  const {
    transactions,
    incomeTotal,
    expenseTotal,
    remaining,
    settings,
    hasBudget,
    loading,
  } = useBudget(yearMonth);

  const monthlyBudget =
    settings?.monthlyBudget ?? 0;

  const currency =
    settings?.currency ?? "INR";

  const isCurrentMonth =
    yearMonth === getCurrentMonth();

  const monthLabel = useMemo(
    () => formatMonth(yearMonth),
    [yearMonth],
  );

  const expenseBreakdown = useMemo(() => {
    const totals = new Map<string, number>();

    for (const transaction of transactions) {
      if (transaction.type !== "expense") {
        continue;
      }

      totals.set(
        transaction.category,
        (totals.get(transaction.category) ?? 0) +
          transaction.amount,
      );
    }

    return Array.from(totals.entries())
      .map(([category, total]) => ({
        category,
        total,
      }))
      .sort((a, b) => b.total - a.total);
  }, [transactions]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-sm font-medium text-muted-foreground">
            Personal Finance
          </p>

          <div className="mt-1 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Budget
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Track your income and expenses.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setYearMonth(
                    shiftMonth(
                      yearMonth,
                      -1,
                    ),
                  )
                }
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="min-w-32 text-center text-sm font-medium">
                {monthLabel}
              </span>

              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setYearMonth(
                    shiftMonth(
                      yearMonth,
                      1,
                    ),
                  )
                }
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {!isCurrentMonth && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setYearMonth(
                      getCurrentMonth(),
                    )
                  }
                >
                  Today
                </Button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Loading budget...
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <SummaryCard
              incomeTotal={incomeTotal}
              expenseTotal={expenseTotal}
              remaining={remaining}
              monthlyBudget={monthlyBudget}
              hasBudget={hasBudget}
            />

            <CategoryBreakdown
              data={expenseBreakdown}
              currency={currency}
            />

            <TransactionForm />

            <TransactionList
              transactions={transactions}
            />
          </div>
        )}
      </div>
    </div>
  );
}