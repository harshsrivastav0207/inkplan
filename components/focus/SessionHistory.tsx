"use client";

import { useLiveQuery } from "dexie-react-hooks";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { focusRepo } from "@/lib/db/repositories";

function getStartOfWeek(timestamp: number) {
  const date = new Date(timestamp);

  date.setHours(0, 0, 0, 0);

  const day = date.getDay();
  const daysSinceMonday = (day + 6) % 7;

  date.setDate(date.getDate() - daysSinceMonday);

  return date.getTime();
}

function formatDateTime(timestamp: number) {
  return new Date(timestamp).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function SessionHistory() {
  const data = useLiveQuery(async () => {
    const now = Date.now();
    const weekStart = getStartOfWeek(now);

    const [sessions, weeklyMinutes] =
      await Promise.all([
        focusRepo.listRecent(10),
        focusRepo.totalMinutesInRange(
          weekStart,
          now,
        ),
      ]);

    return {
      sessions,
      weeklyMinutes,
    };
  }, []);

  if (data === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session history</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">
            Loading session history...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Session history</CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Your most recent focus sessions.
            </p>
          </div>

          <div className="rounded-md bg-muted px-3 py-2 text-sm">
            <span className="text-muted-foreground">
              This week:
            </span>{" "}
            <span className="font-medium">
              {data.weeklyMinutes} min
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {data.sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No focus sessions yet.
          </p>
        ) : (
          <div className="space-y-3">
            {data.sessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium">
                    {formatDateTime(
                      session.startedAt,
                    )}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {session.durationMinutes}{" "}
                    {session.durationMinutes === 1
                      ? "minute"
                      : "minutes"}
                  </p>
                </div>

                <div>
                  {session.completed ? (
                    <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium">
                      Completed
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                      Abandoned
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}