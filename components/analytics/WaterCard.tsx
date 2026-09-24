"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AnalyticsData } from "@/hooks/useAnalytics";

type WaterCardProps = {
  data: AnalyticsData["water"];
};

type WaterChartPoint = {
  dateKey: string;
  label: string;
  total: number;
};

export function WaterCard({
  data,
}: WaterCardProps) {
  const chartData: WaterChartPoint[] =
    data.dailyTotals.map((day) => ({
      dateKey: day.dateKey,
      label: day.label,
      total: day.total,
    }));

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div>
        <h2 className="text-base font-semibold">
          Water
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Your hydration pattern over the selected range.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            Daily average
          </p>

          <p className="mt-1 text-lg font-semibold">
            {data.weeklyAverageMl.toLocaleString()} ml
          </p>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            Goal days
          </p>

          <p className="mt-1 text-lg font-semibold">
            {data.goalDaysCount}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            Target
          </p>

          <p className="mt-1 text-lg font-semibold">
            {data.target.toLocaleString()} ml
          </p>
        </div>
      </div>

      <div className="mt-5 h-[200px] w-full">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart
            data={chartData}
            margin={{
              top: 8,
              right: 8,
              left: -16,
              bottom: 0,
            }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-border"
            />

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 11,
              }}
              className="fill-muted-foreground"
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 11,
              }}
              className="fill-muted-foreground"
              allowDecimals={false}
            />

            <Tooltip
              cursor={{
                fill: "hsl(var(--muted))",
                opacity: 0.35,
              }}
              formatter={(value) => [
                `${Number(value).toLocaleString()} ml`,
                "Water",
              ]}
              contentStyle={{
                borderRadius: 8,
                border:
                  "1px solid hsl(var(--border))",
                background:
                  "hsl(var(--card))",
                color:
                  "hsl(var(--foreground))",
              }}
            />

            <ReferenceLine
              y={data.target}
              stroke="hsl(var(--primary))"
              strokeDasharray="5 5"
            />

            <Bar
              dataKey="total"
              radius={[4, 4, 0, 0]}
              animationDuration={700}
            >
              {chartData.map(
                (entry, index) => (
                  <Cell
                    key={`${entry.dateKey}-${index}`}
                    fill={
                      entry.total >= data.target
                        ? "hsl(var(--primary))"
                        : "hsl(var(--muted-foreground) / 0.35)"
                    }
                  />
                ),
              )}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}