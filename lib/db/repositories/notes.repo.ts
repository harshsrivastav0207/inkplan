import { db } from "../index";
import type { Note } from "../types";

const newId = () => crypto.randomUUID();
const now = () => Date.now();

export const notesRepo = {
  async create(title = "Untitled"): Promise<Note> {
    const note: Note = {
      id: newId(),
      title,
      createdAt: now(),
      updatedAt: now(),
    };
    await db.notes.add(note);
    return note;
  },

  async get(id: string): Promise<Note | undefined> {
    return db.notes.get(id);
  },

  async list(): Promise<Note[]> {
    return db.notes.orderBy("updatedAt").reverse().toArray();
  },

  async update(
    id: string,
    patch: Partial<Omit<Note, "id" | "createdAt">>
  ) {
    await db.notes.update(id, { ...patch, updatedAt: now() });
  },

  async remove(id: string) {
    await db.transaction("rw", db.notes, db.pages, async () => {
      await db.pages.where("noteId").equals(id).delete();
      await db.notes.delete(id);
    });
  },

  async touch(id: string) {
    await db.notes.update(id, { updatedAt: now() });
  },
};