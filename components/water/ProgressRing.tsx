"use client";

type ProgressRingProps = {
  current: number;
  target: number;
  size?: number;
  strokeWidth?: number;
};

export function ProgressRing({
  current,
  target,
  size = 220,
  strokeWidth = 14,
}: ProgressRingProps) {
  const safeTarget = target > 0 ? target : 1;
  const progress = Math.min(Math.max(current / safeTarget, 0), 1);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
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

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tracking-tight">
          {current} ml
        </span>

        <span className="mt-1 text-sm text-muted-foreground">
          of {target} ml
        </span>
      </div>
    </div>
  );
}