"use client";

import { getCategoryById } from "@/lib/budget/categories";

import type { AnalyticsData } from "@/hooks/useAnalytics";

type BudgetCardProps = {
  data: AnalyticsData["budget"];
};

function formatCurrency(
  amount: number,
  currency: string,
): string {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString(
      "en-IN",
    )}`;
  }
}

export function BudgetCard({
  data,
}: BudgetCardProps) {
  const budgetProgress =
    data.monthlyBudget > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (data.monthSpending /
              data.monthlyBudget) *
              100,
          ),
        )
      : 0;

  const hasPreviousMonth =
    data.lastMonthSpending > 0;

  const spendingChange = hasPreviousMonth
    ? ((data.monthSpending -
        data.lastMonthSpending) /
        data.lastMonthSpending) *
      100
    : null;

  const changeLabel =
    spendingChange === null
      ? "First month of tracking."
      : `${spendingChange >= 0 ? "+" : ""}${Math.round(
          spendingChange,
        )}%`;

  const changeIsDecrease =
    spendingChange !== null &&
    spendingChange < 0;

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div>
        <h2 className="text-base font-semibold">
          Budget
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Your spending and income patterns.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            Income
          </p>

          <p className="mt-1 text-lg font-semibold">
            {formatCurrency(
              data.monthIncome,
              "INR",
            )}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            Spending
          </p>

          <p className="mt-1 text-lg font-semibold">
            {formatCurrency(
              data.monthSpending,
              "INR",
            )}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            Remaining
          </p>

          <p className="mt-1 text-lg font-semibold">
            {formatCurrency(
              data.remaining,
              "INR",
            )}
          </p>
        </div>
      </div>

      {data.monthlyBudget > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Budget used
            </span>

            <span className="font-medium">
              {Math.round(budgetProgress)}%
            </span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{
                width: `${budgetProgress}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="mt-5 rounded-lg border border-border bg-muted/30 p-3">
        <p className="text-xs text-muted-foreground">
          Spending vs last month
        </p>

        <p
          className={`mt-1 text-sm font-medium ${
            changeIsDecrease
              ? "text-primary"
              : "text-muted-foreground"
          }`}
        >
          {changeLabel}
        </p>
      </div>

      {data.topCategories.length > 0 && (
        <div className="mt-5">
          <p className="text-xs text-muted-foreground">
            Top categories
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            {data.topCategories.map(
              (item) => {
                const category =
                  getCategoryById(
                    "expense",
                    item.category,
                  );

                return (
                  <div
                    key={item.category}
                    className="rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs"
                  >
                    <span className="font-medium">
                      {category?.label ??
                        item.category}
                    </span>

                    <span className="ml-1 text-muted-foreground">
                      {formatCurrency(
                        item.total,
                        "INR",
                      )}
                    </span>
                  </div>
                );
              },
            )}
          </div>
        </div>
      )}
    </section>
  );
}