import { db } from "./index";

export async function runDbSmokeTest(): Promise<boolean> {
  if (process.env.NODE_ENV === "production") return true;

  const results: Record<string, boolean> = {};

  try {
    const noteId = crypto.randomUUID();

    await db.notes.add({
      id: noteId,
      title: "__smoke__",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const noteRead = await db.notes.get(noteId);
    results.notes = noteRead?.title === "__smoke__";

    const pageId = crypto.randomUUID();

    await db.pages.add({
      id: pageId,
      noteId,
      order: 0,
      pageType: "lined",
      theme: "light",
      strokes: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const pageRead = await db.pages.get(pageId);
    results.pages = pageRead?.noteId === noteId;

    const taskId = crypto.randomUUID();

    await db.tasks.add({
      id: taskId,
      title: "__smoke__",
      notes: "",
      dueDate: null,
      priority: "medium",
      completed: false,
      completedAt: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const taskRead = await db.tasks.get(taskId);
    results.tasks = taskRead?.title === "__smoke__";

    const waterId = crypto.randomUUID();

    await db.waterEntries.add({
      id: waterId,
      amountMl: 250,
      dateKey: "2026-01-01",
      timestamp: Date.now(),
    });

    const waterRead = await db.waterEntries.get(waterId);
    results.waterEntries = waterRead?.amountMl === 250;

    const sessionId = crypto.randomUUID();

    await db.focusSessions.add({
      id: sessionId,
      startedAt: Date.now() - 60000,
      endedAt: Date.now(),
      durationMinutes: 1,
      completed: true,
      audioTrackId: null,
    });

    const sessionRead = await db.focusSessions.get(sessionId);
    results.focusSessions = sessionRead?.completed === true;

    await db.pages.delete(pageId);
    await db.notes.delete(noteId);
    await db.tasks.delete(taskId);
    await db.waterEntries.delete(waterId);
    await db.focusSessions.delete(sessionId);

    const allPassed = Object.values(results).every(Boolean);

    console.log("[InkPlan DB] Smoke test results:", results);
    console.log(
      allPassed
        ? "[InkPlan DB] ✅ All tables passed."
        : "[InkPlan DB] ❌ Some tables failed."
    );

    return allPassed;
  } catch (err) {
    console.error("[InkPlan DB] Smoke test threw:", err);
    return false;
  }
}