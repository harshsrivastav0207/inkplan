"use client";

type AnalyticsRange = "7d" | "30d" | "12w";

type RangeSelectorProps = {
  value: AnalyticsRange;
  onChange: (value: AnalyticsRange) => void;
};

const RANGES: {
  value: AnalyticsRange;
  label: string;
}[] = [
  {
    value: "7d",
    label: "7 days",
  },
  {
    value: "30d",
    label: "30 days",
  },
  {
    value: "12w",
    label: "12 weeks",
  },
];

export function RangeSelector({
  value,
  onChange,
}: RangeSelectorProps) {
  return (
    <div
      className="inline-flex items-center rounded-lg border border-border bg-card p-1"
      role="group"
      aria-label="Analytics time range"
    >
      {RANGES.map((range) => {
        const isActive = value === range.value;

        return (
          <button
            key={range.value}
            type="button"
            onClick={() => onChange(range.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            aria-pressed={isActive}
          >
            {range.label}
          </button>
        );
      })}
    </div>
  );
}