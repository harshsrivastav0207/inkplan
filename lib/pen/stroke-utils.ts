import type { FreehandPoint } from "./perfect-freehand";

export type Point = FreehandPoint;

export function distance(
  a: Point,
  b: Point
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  return Math.hypot(dx, dy);
}

export function getBounds(
  points: Point[]
) {
  if (points.length === 0) {
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
    };
  }

  let minX = points[0].x;
  let minY = points[0].y;
  let maxX = points[0].x;
  let maxY = points[0].y;

  for (const point of points) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
  };
}

export function clonePoints(
  points: Point[]
): Point[] {
  return points.map((point) => ({
    x: point.x,
    y: point.y,
    pressure: point.pressure,
  }));
}

export function normalizePressure(
  pressure: number
): number {
  if (!Number.isFinite(pressure)) {
    return 0.5;
  }

  return Math.min(
    1,
    Math.max(0, pressure)
  );
}

export function createPoint(
  x: number,
  y: number,
  pressure = 0.5
): Point {
  return {
    x,
    y,
    pressure: normalizePressure(pressure),
  };
}