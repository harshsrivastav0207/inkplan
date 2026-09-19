"use client";

function getGreeting(hour: number) {
  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function GreetingHeader() {
  const now = new Date();

  return (
    <header>
      <p className="text-sm font-medium text-muted-foreground">
        {formatDate(now)}
      </p>

      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        {getGreeting(now.getHours())}
      </h1>

      <p className="mt-2 text-sm text-muted-foreground sm:text-base">
        Let&apos;s make today count.
      </p>
    </header>
  );
}