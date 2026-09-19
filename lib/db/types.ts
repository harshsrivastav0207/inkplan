export type PageType = "blank" | "grid" | "lined" | "box";

export type ThemeName = "light" | "dark" | "warm";

export type ToolName = "pen" | "highlighter" | "eraser";

export type Priority = "low" | "medium" | "high";

export interface StrokePoint {
  x: number;
  y: number;
  pressure: number;
}

export interface Stroke {
  id: string;
  points: StrokePoint[];
  color: string;
  size: number;
  opacity: number;
  tool: ToolName;
}

export interface Page {
  id: string;
  noteId: string;
  order: number;
  pageType: PageType;
  theme: ThemeName;
  strokes: Stroke[];
  createdAt: number;
  updatedAt: number;
}

export interface Note {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export interface Task {
  id: string;
  title: string;
  notes: string;
  dueDate: string | null;
  priority: Priority;
  completed: boolean;
  completedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface WaterEntry {
  id: string;
  amountMl: number;
  dateKey: string;
  timestamp: number;
}

export interface FocusSession {
  id: string;
  startedAt: number;
  endedAt: number;
  durationMinutes: number;
  completed: boolean;
  audioTrackId: string | null;
}

export interface Settings {
  id: "app";
  theme: ThemeName;
  defaultPageType: PageType;
  dailyWaterTargetMl: number;
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  audioVolume: number;
  updatedAt: number;
}