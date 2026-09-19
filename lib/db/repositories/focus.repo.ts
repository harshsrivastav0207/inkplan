import { db } from "../index";
import type { FocusSession } from "../types";

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

    await db.focusSessions.add(session);
    return session;
  },

  async listRecent(limit = 20): Promise<FocusSession[]> {
    const all = await db.focusSessions.orderBy("startedAt").reverse().toArray();
    return all.slice(0, limit);
  },

  async totalMinutesInRange(from: number, to: number): Promise<number> {
    const sessions = await db.focusSessions
      .where("startedAt")
      .between(from, to, true, true)
      .toArray();

    return sessions
      .filter((s) => s.completed)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
  },

  async remove(id: string) {
    await db.focusSessions.delete(id);
  },
};