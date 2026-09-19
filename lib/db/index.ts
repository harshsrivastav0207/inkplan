import Dexie, { type Table } from "dexie";
import type {
  Note,
  Page,
  Task,
  WaterEntry,
  FocusSession,
  Settings,
} from "./types";

export class InkPlanDB extends Dexie {
  notes!: Table<Note, string>;
  pages!: Table<Page, string>;
  tasks!: Table<Task, string>;
  waterEntries!: Table<WaterEntry, string>;
  focusSessions!: Table<FocusSession, string>;
  settings!: Table<Settings, string>;

  constructor() {
    super("inkplan");

    this.version(1).stores({
      notes: "id, updatedAt, createdAt",
      pages: "id, noteId, order, [noteId+order]",
      tasks: "id, dueDate, completed, [completed+dueDate], updatedAt",
      waterEntries: "id, dateKey, timestamp, [dateKey+timestamp]",
      focusSessions: "id, startedAt, completed",
      settings: "id",
    });
  }
}

export const db = new InkPlanDB();