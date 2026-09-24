"use client";

type ProgressRingProps = {
  current: number;
  target: number;
  size?: number;
  strokeWidth?: number;
};

function formatWater(amountMl: number): string {
  if (amountMl >= 1000) {
    const liters = amountMl / 1000;

    return Number.isInteger(liters)
      ? `${liters} L`
      : `${liters.toFixed(1)} L`;
  }

  return `${amountMl} ml`;
}

export function ProgressRing({
  current,
  target,
  size = 220,
  strokeWidth = 14,
}: ProgressRingProps) {
  const safeTarget = target > 0 ? target : 1;

  const progress = Math.min(
    Math.max(current / safeTarget, 0),
    1,
  );

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  const currentLabel = formatWater(current);
  const targetLabel = formatWater(target);

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-foreground transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
        <span className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {currentLabel}
        </span>

        <span className="mt-1 text-xs text-muted-foreground sm:text-sm">
          of {targetLabel}
        </span>
      </div>
    </div>
  );
}