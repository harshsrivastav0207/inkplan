import { db } from "../index";

import type { FocusSession } from "../types";

import { enqueueSync } from "../sync/queue";

const newId = () => crypto.randomUUID();

export const focusRepo = {
  async record(input: {
    startedAt: number;
    endedAt: number;
    durationMinutes: number;
    completed: boolean;
    audioTrackId?: string | null;
  }): Promise<FocusSession> {
    const session: FocusSession = {
      id: newId(),
      startedAt: input.startedAt,
      endedAt: input.endedAt,
      durationMinutes: input.durationMinutes,
      completed: input.completed,
      audioTrackId: input.audioTrackId ?? null,
    };

    await db.transaction(
      "rw",
      db.focusSessions,
      db.syncQueue,
      async () => {
        await db.focusSessions.add(session);

        await enqueueSync(db.syncQueue, {
          table: "focusSessions",
          recordId: session.id,
          operation: "upsert",
          payload: session,
        });
      },
    );

    return session;
  },

  async listRecent(
    limit = 20,
  ): Promise<FocusSession[]> {
    const all = await db.focusSessions
      .orderBy("startedAt")
      .reverse()
      .toArray();

    return all.slice(0, limit);
  },

  async totalMinutesInRange(
    from: number,
    to: number,
  ): Promise<number> {
    const sessions = await db.focusSessions
      .where("startedAt")
      .between(from, to, true, true)
      .toArray();

    return sessions
      .filter((session) => session.completed)
      .reduce(
        (sum, session) =>
          sum + session.durationMinutes,
        0,
      );
  },

  async sessionsInRange(
    fromMs: number,
    toMs: number,
  ): Promise<FocusSession[]> {
    const sessions = await db.focusSessions
      .where("startedAt")
      .between(fromMs, toMs, true, true)
      .toArray();

    return sessions.sort(
      (a, b) => a.startedAt - b.startedAt,
    );
  },

  async remove(id: string) {
    await db.transaction(
      "rw",
      db.focusSessions,
      db.syncQueue,
      async () => {
        await db.focusSessions.delete(id);

        await enqueueSync(db.syncQueue, {
          table: "focusSessions",
          recordId: id,
          operation: "delete",
          payload: null,
        });
      },
    );
  },
};