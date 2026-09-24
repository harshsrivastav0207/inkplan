"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  AnalyticsData,
  AnalyticsRange,
} from "@/hooks/useAnalytics";

type FocusCardProps = {
  data: AnalyticsData["focus"];
  range: AnalyticsRange;
};

type ChartPoint = {
  label: string;
  minutes: number;
};

function buildChartData(
  data: AnalyticsData["focus"],
  range: AnalyticsRange,
): ChartPoint[] {
  if (range === "12w") {
    const weekly = [];

    for (let index = 0; index < 12; index += 1) {
      const start = index * 7;
      const week = data.dailyTotals.slice(
        start,
        start + 7,
      );

      const minutes = week.reduce(
        (total, day) => total + day.total,
        0,
      );

      weekly.push({
        label: `W${index + 1}`,
        minutes,
      });
    }

    return weekly;
  }

  return data.dailyTotals.map((day, index) => {
    const date = new Date(
      `${day.dateKey}T00:00:00.000Z`,
    );

    let label = day.label;

    if (range === "30d") {
      if (index % 5 !== 0) {
        label = "";
      } else {
        label = `${date.getUTCDate()}`;
      }
    }

    return {
      label,
      minutes: day.total,
    };
  });
}

function formatMinutes(value: number): string {
  if (value < 60) {
    return `${Math.round(value)} min`;
  }

  const hours = Math.floor(value / 60);
  const minutes = Math.round(value % 60);

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

export function FocusCard({
  data,
  range,
}: FocusCardProps) {
  const chartData = buildChartData(
    data,
    range,
  );

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">
          Focus
        </h2>

        <p className="text-sm text-muted-foreground">
          How consistently you are focusing over time.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            Total minutes
          </p>

          <p className="mt-1 text-lg font-semibold">
            {formatMinutes(
              data.totalMinutes,
            )}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            Sessions
          </p>

          <p className="mt-1 text-lg font-semibold">
            {data.sessionsCount}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            Avg. length
          </p>

          <p className="mt-1 text-lg font-semibold">
            {formatMinutes(
              data.averageMinutes,
            )}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="h-[240px] w-full">
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
                  formatMinutes(
                    Number(value),
                  ),
                  "Focus",
                ]}
                labelFormatter={(label) =>
                  label
                    ? String(label)
                    : "Focus"
                }
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

              <Bar
                dataKey="minutes"
                radius={[4, 4, 0, 0]}
                fill="hsl(var(--primary))"
                animationDuration={700}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <div>
          <p className="text-xs text-muted-foreground">
            Best day
          </p>

          <p className="mt-1 text-sm font-medium">
            {formatMinutes(
              data.bestDayMinutes,
            )}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-muted-foreground">
            Focus streak
          </p>

          <p className="mt-1 text-sm font-medium">
            {data.streak}{" "}
            {data.streak === 1
              ? "day"
              : "days"}
          </p>
        </div>
      </div>
    </section>
  );
}