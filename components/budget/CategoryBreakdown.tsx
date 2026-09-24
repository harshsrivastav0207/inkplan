"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  EXPENSE_CATEGORIES,
  getCategoryById,
} from "@/lib/budget/categories";

type CategoryBreakdownItem = {
  category: string;
  total: number;
};

type CategoryBreakdownProps = {
  data: CategoryBreakdownItem[];
  currency?: string;
};

const CHART_COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#84cc16",
  "#0ea5e9",
  "#64748b",
];

function formatCurrency(
  amount: number,
  currency: string,
): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getCategoryLabel(categoryId: string): string {
  return (
    getCategoryById("expense", categoryId)?.label ??
    categoryId
  );
}

export function CategoryBreakdown({
  data,
  currency = "INR",
}: CategoryBreakdownProps) {
  const total = data.reduce(
    (sum, item) => sum + item.total,
    0,
  );

  if (data.length === 0 || total <= 0) {
    return (
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-1">
          <h2 className="text-base font-semibold">
            Expense Breakdown
          </h2>
          <p className="text-sm text-muted-foreground">
            See where your money is going.
          </p>
        </div>

        <div className="flex min-h-[260px] items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Add expenses to see your category breakdown.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold">
          Expense Breakdown
        </h2>
        <p className="text-sm text-muted-foreground">
          See where your money is going this month.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[260px_1fr] md:items-center">
        <div className="relative h-[260px] w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>
              <Pie
                data={data}
                dataKey="total"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.map((item, index) => (
                  <Cell
                    key={`${item.category}-${index}`}
                    fill={
                      CHART_COLORS[
                        index % CHART_COLORS.length
                      ]
                    }
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value) =>
                  formatCurrency(
                    Number(value),
                    currency,
                  )
                }
                labelFormatter={(label) =>
                  getCategoryLabel(String(label))
                }
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground">
              Total
            </span>
            <span className="text-lg font-semibold">
              {formatCurrency(total, currency)}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {data.map((item, index) => {
            const category = EXPENSE_CATEGORIES.find(
              (entry) => entry.id === item.category,
            );

            const percentage =
              total > 0
                ? (item.total / total) * 100
                : 0;

            const Icon = category?.icon;

            return (
              <div
                key={item.category}
                className="flex items-center gap-3"
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      CHART_COLORS[
                        index % CHART_COLORS.length
                      ],
                  }}
                />

                {Icon ? (
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : null}

                <span className="min-w-0 flex-1 truncate text-sm">
                  {getCategoryLabel(item.category)}
                </span>

                <span className="text-sm font-medium">
                  {formatCurrency(
                    item.total,
                    currency,
                  )}
                </span>

                <span className="w-12 text-right text-xs text-muted-foreground">
                  {percentage.toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}