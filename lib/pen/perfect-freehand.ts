import { getStroke } from "perfect-freehand";

export type FreehandPoint = {
  x: number;
  y: number;
  pressure: number;
};

export type FreehandOptions = {
  size?: number;
  streamline?: number;
  thinning?: number;
  smoothing?: number;
  easing?: (t: number) => number;
  simulatePressure?: boolean;
};

const defaultOptions: Required<FreehandOptions> = {
  size: 4,
  streamline: 0.5,
  thinning: 0.5,
  smoothing: 0.5,
  easing: (t) => t,
  simulatePressure: true,
};

export function getFreehandOutline(
  points: FreehandPoint[],
  options: FreehandOptions = {}
): [number, number][] {
  const config = {
    ...defaultOptions,
    ...options,
  };

  const input = points.map((point) => [
    point.x,
    point.y,
    point.pressure,
  ] as [number, number, number]);

  return getStroke(input, {
    size: config.size,
    streamline: config.streamline,
    thinning: config.thinning,
    smoothing: config.smoothing,
    easing: config.easing,
    simulatePressure: config.simulatePressure,
  });
}