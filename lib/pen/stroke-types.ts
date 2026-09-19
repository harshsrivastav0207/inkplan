import type {
  Stroke,
  StrokePoint,
  ToolName,
} from "@/lib/db/types";

export type {
  Stroke,
  StrokePoint,
  ToolName,
};

export type PenTool = ToolName;

export function createStrokeId(): string {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}