"use client";

type TimerDisplayProps = {
  remainingSeconds: number;
};

function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);

  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    seconds,
  ).padStart(2, "0")}`;
}

export function TimerDisplay({
  remainingSeconds,
}: TimerDisplayProps) {
  return (
    <div
      className="flex items-center justify-center"
      aria-label={`Time remaining ${formatTime(
        remainingSeconds,
      )}`}
    >
      <span className="font-mono text-6xl font-semibold tracking-tight sm:text-8xl">
        {formatTime(remainingSeconds)}
      </span>
    </div>
  );
}