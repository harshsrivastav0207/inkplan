import { db } from "../index";
import type { Note } from "../types";
import { enqueueSync } from "../sync/queue";

const newId = () => crypto.randomUUID();

const now = () => Date.now();

export const notesRepo = {
  async create(title = "Untitled"): Promise<Note> {
    const timestamp = now();

    const note: Note = {
      id: newId(),
      title,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await db.transaction(
      "rw",
      db.notes,
      db.syncQueue,
      async () => {
        await db.notes.add(note);

        await enqueueSync(db.syncQueue, {
          table: "notes",
          recordId: note.id,
          operation: "upsert",
          payload: note,
        });
      },
    );

    return note;
  },

  async get(id: string): Promise<Note | undefined> {
    return db.notes.get(id);
  },

  async list(): Promise<Note[]> {
    return db.notes
      .orderBy("updatedAt")
      .reverse()
      .toArray();
  },

  async countAll(): Promise<number> {
    return db.notes.count();
  },

  async listCreatedInRange(
    fromMs: number,
    toMs: number,
  ): Promise<Note[]> {
    const notes = await db.notes
      .where("createdAt")
      .between(fromMs, toMs, true, true)
      .toArray();

    return notes.sort(
      (a, b) => a.createdAt - b.createdAt,
    );
  },

  async update(
    id: string,
    patch: Partial<Omit<Note, "id" | "createdAt">>,
  ) {
    await db.transaction(
      "rw",
      db.notes,
      db.syncQueue,
      async () => {
        await db.notes.update(id, {
          ...patch,
          updatedAt: now(),
        });

        const note = await db.notes.get(id);

        if (!note) return;

        await enqueueSync(db.syncQueue, {
          table: "notes",
          recordId: id,
          operation: "upsert",
          payload: note,
        });
      },
    );
  },

  async remove(id: string) {
    await db.transaction(
      "rw",
      db.notes,
      db.pages,
      db.syncQueue,
      async () => {
        const pages = await db.pages
          .where("noteId")
          .equals(id)
          .toArray();

        for (const page of pages) {
          await enqueueSync(db.syncQueue, {
            table: "pages",
            recordId: page.id,
            operation: "delete",
            payload: null,
          });
        }

        await db.pages
          .where("noteId")
          .equals(id)
          .delete();

        await db.notes.delete(id);

        await enqueueSync(db.syncQueue, {
          table: "notes",
          recordId: id,
          operation: "delete",
          payload: null,
        });
      },
    );
  },

  async touch(id: string) {
    await db.transaction(
      "rw",
      db.notes,
      db.syncQueue,
      async () => {
        await db.notes.update(id, {
          updatedAt: now(),
        });

        const note = await db.notes.get(id);

        if (!note) return;

        await enqueueSync(db.syncQueue, {
          table: "notes",
          recordId: id,
          operation: "upsert",
          payload: note,
        });
      },
    );
  },
};