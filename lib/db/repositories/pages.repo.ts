import { db } from "../index";

import type {
  Page,
  PageType,
  Stroke,
  ThemeName,
} from "../types";

import { enqueueSync } from "../sync/queue";

const newId = () => crypto.randomUUID();

const now = () => Date.now();

export const pagesRepo = {
  async create(
    noteId: string,
    order: number,
    pageType: PageType = "lined",
    theme: ThemeName = "light",
  ): Promise<Page> {
    const timestamp = now();

    const page: Page = {
      id: newId(),
      noteId,
      order,
      pageType,
      theme,
      strokes: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await db.transaction(
      "rw",
      db.pages,
      db.syncQueue,
      async () => {
        await db.pages.add(page);

        await enqueueSync(db.syncQueue, {
          table: "pages",
          recordId: page.id,
          operation: "upsert",
          payload: page,
        });
      },
    );

    return page;
  },

  async get(id: string): Promise<Page | undefined> {
    return db.pages.get(id);
  },

  async listByNote(noteId: string): Promise<Page[]> {
    return db.pages
      .where("noteId")
      .equals(noteId)
      .sortBy("order");
  },

  async countAll(): Promise<number> {
    return db.pages.count();
  },

  async countForNoteIds(
    noteIds: string[],
  ): Promise<number> {
    if (noteIds.length === 0) {
      return 0;
    }

    const pages = await db.pages.toArray();

    const noteIdSet = new Set(noteIds);

    return pages.filter((page) =>
      noteIdSet.has(page.noteId),
    ).length;
  },

  async update(
    id: string,
    patch: Partial<
      Omit<Page, "id" | "noteId" | "createdAt">
    >,
  ) {
    await db.transaction(
      "rw",
      db.pages,
      db.syncQueue,
      async () => {
        await db.pages.update(id, {
          ...patch,
          updatedAt: now(),
        });

        const page = await db.pages.get(id);

        if (!page) return;

        await enqueueSync(db.syncQueue, {
          table: "pages",
          recordId: id,
          operation: "upsert",
          payload: page,
        });
      },
    );
  },

  async saveStrokes(
    id: string,
    strokes: Stroke[],
  ) {
    await db.transaction(
      "rw",
      db.pages,
      db.syncQueue,
      async () => {
        await db.pages.update(id, {
          strokes,
          updatedAt: now(),
        });

        const page = await db.pages.get(id);

        if (!page) return;

        await enqueueSync(db.syncQueue, {
          table: "pages",
          recordId: id,
          operation: "upsert",
          payload: page,
        });
      },
    );
  },

  async remove(id: string) {
    await db.transaction(
      "rw",
      db.pages,
      db.syncQueue,
      async () => {
        await db.pages.delete(id);

        await enqueueSync(db.syncQueue, {
          table: "pages",
          recordId: id,
          operation: "delete",
          payload: null,
        });
      },
    );
  },
};