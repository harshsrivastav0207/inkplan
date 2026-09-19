import { db } from "../index";
import type { Page, PageType, Stroke, ThemeName } from "../types";

const newId = () => crypto.randomUUID();
const now = () => Date.now();

export const pagesRepo = {
  async create(
    noteId: string,
    order: number,
    pageType: PageType = "lined",
    theme: ThemeName = "light"
  ): Promise<Page> {
    const page: Page = {
      id: newId(),
      noteId,
      order,
      pageType,
      theme,
      strokes: [],
      createdAt: now(),
      updatedAt: now(),
    };

    await db.pages.add(page);
    return page;
  },

  async get(id: string): Promise<Page | undefined> {
    return db.pages.get(id);
  },

  async listByNote(noteId: string): Promise<Page[]> {
    return db.pages.where("noteId").equals(noteId).sortBy("order");
  },

  async update(
    id: string,
    patch: Partial<Omit<Page, "id" | "noteId" | "createdAt">>
  ) {
    await db.pages.update(id, { ...patch, updatedAt: now() });
  },

  async saveStrokes(id: string, strokes: Stroke[]) {
    await db.pages.update(id, { strokes, updatedAt: now() });
  },

  async remove(id: string) {
    await db.pages.delete(id);
  },
};