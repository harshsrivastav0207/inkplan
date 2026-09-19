"use client";

import {
  useCallback,
  useEffect,
  useRef,
} from "react";

import type { Stroke } from "@/lib/db/types";

import {
  createPoint,
  normalizePressure,
} from "@/lib/pen/stroke-utils";

import {
  createStrokeId,
} from "@/lib/pen/stroke-types";

import {
  getFreehandOutline,
} from "@/lib/pen/perfect-freehand";

import type { Viewport } from "./types";

type CanvasSurfaceProps = {
  viewport: Viewport;
  onViewportChange: (
    viewport: Viewport,
  ) => void;
  strokes: Stroke[];
  onStrokesChange: (
    strokes: Stroke[],
  ) => void;
  activeTool:
    | "pen"
    | "highlighter"
    | "eraser";
  color: string;
  size: number;
  opacity: number;
};

export function CanvasSurface({
  viewport,
  onViewportChange,
  strokes,
  onStrokesChange,
  activeTool,
  color,
  size,
  opacity,
}: CanvasSurfaceProps) {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(
      null,
    );

  const drawingRef =
    useRef(false);

  const panningRef =
    useRef(false);

  const currentStrokeRef =
    useRef<Stroke | null>(null);

  const strokesRef =
    useRef<Stroke[]>(strokes);

  const toolRef =
    useRef(activeTool);

  const colorRef =
    useRef(color);

  const sizeRef =
    useRef(size);

  const opacityRef =
    useRef(opacity);

  const viewportRef =
    useRef(viewport);

  const onStrokesChangeRef =
    useRef(onStrokesChange);

  const lastPanPointRef =
    useRef<{
      x: number;
      y: number;
    } | null>(null);

  const redrawFrameRef =
    useRef<number | null>(null);

  useEffect(() => {
    strokesRef.current =
      strokes;
  }, [strokes]);

  useEffect(() => {
    toolRef.current =
      activeTool;
  }, [activeTool]);

  useEffect(() => {
    colorRef.current =
      color;
  }, [color]);

  useEffect(() => {
    sizeRef.current =
      size;
  }, [size]);

  useEffect(() => {
    opacityRef.current =
      opacity;
  }, [opacity]);

  useEffect(() => {
    viewportRef.current =
      viewport;
  }, [viewport]);

  useEffect(() => {
    onStrokesChangeRef.current =
      onStrokesChange;
  }, [onStrokesChange]);

  const drawStroke = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      stroke: Stroke,
    ) => {
      if (
        !Array.isArray(
          stroke.points,
        ) ||
        stroke.points.length < 2
      ) {
        return;
      }

      const outline =
        getFreehandOutline(
          stroke.points,
          {
            size: stroke.size,
            streamline:
              stroke.tool ===
              "highlighter"
                ? 0.35
                : 0.5,
            thinning:
              stroke.tool ===
              "highlighter"
                ? 0
                : 0.5,
            smoothing: 0.5,
            simulatePressure: true,
          },
        );

      if (
        outline.length < 3
      ) {
        return;
      }

      ctx.save();

      ctx.globalAlpha =
        stroke.opacity;

      ctx.fillStyle =
        stroke.color;

      ctx.beginPath();

      ctx.moveTo(
        outline[0][0],
        outline[0][1],
      );

      for (
        let index = 1;
        index < outline.length;
        index += 1
      ) {
        ctx.lineTo(
          outline[index][0],
          outline[index][1],
        );
      }

      ctx.closePath();
      ctx.fill();

      ctx.restore();
    },
    [],
  );

  const redraw = useCallback(() => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx =
      canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    const dpr =
      window.devicePixelRatio ||
      1;

    const width =
      canvas.width / dpr;

    const height =
      canvas.height / dpr;

    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0,
    );

    ctx.clearRect(
      0,
      0,
      width,
      height,
    );

    for (
      const stroke of
      strokesRef.current
    ) {
      drawStroke(
        ctx,
        stroke,
      );
    }

    const liveStroke =
      currentStrokeRef.current;

    if (liveStroke) {
      drawStroke(
        ctx,
        liveStroke,
      );
    }
  }, [drawStroke]);

  const scheduleRedraw =
    useCallback(() => {
      if (
        redrawFrameRef.current !==
        null
      ) {
        return;
      }

      redrawFrameRef.current =
        window.requestAnimationFrame(
          () => {
            redrawFrameRef.current =
              null;

            redraw();
          },
        );
    }, [redraw]);

  useEffect(() => {
    scheduleRedraw();
  }, [
    strokes,
    scheduleRedraw,
  ]);

  useEffect(() => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    const resize =
      () => {
        const dpr =
          window.devicePixelRatio ||
          1;

        const width =
          canvas.clientWidth;

        const height =
          canvas.clientHeight;

        if (
          width <= 0 ||
          height <= 0
        ) {
          return;
        }

        const nextWidth =
          Math.max(
            1,
            Math.round(
              width * dpr,
            ),
          );

        const nextHeight =
          Math.max(
            1,
            Math.round(
              height * dpr,
            ),
          );

        if (
          canvas.width !==
            nextWidth ||
          canvas.height !==
            nextHeight
        ) {
          canvas.width =
            nextWidth;

          canvas.height =
            nextHeight;
        }

        redraw();
      };

    resize();

    const observer =
      new ResizeObserver(
        resize,
      );

    observer.observe(canvas);

    window.addEventListener(
      "resize",
      resize,
    );

    return () => {
      observer.disconnect();

      window.removeEventListener(
        "resize",
        resize,
      );
    };
  }, [redraw]);

  useEffect(() => {
    return () => {
      if (
        redrawFrameRef.current !==
        null
      ) {
        window.cancelAnimationFrame(
          redrawFrameRef.current,
        );
      }
    };
  }, []);

  const getCanvasPoint =
    useCallback(
      (
        event: PointerEvent,
      ) => {
        const canvas =
          canvasRef.current;

        if (!canvas) {
          return createPoint(
            0,
            0,
            0.5,
          );
        }

        const rect =
          canvas.getBoundingClientRect();

        /*
         * CanvasStage applies the viewport
         * as a CSS transform.
         *
         * Convert the transformed
         * screen coordinates back into
         * the canvas's own CSS-pixel space.
         */
        const scaleX =
          rect.width > 0
            ? canvas.clientWidth /
              rect.width
            : 1;

        const scaleY =
          rect.height > 0
            ? canvas.clientHeight /
              rect.height
            : 1;

        const x =
          (event.clientX -
            rect.left) *
          scaleX;

        const y =
          (event.clientY -
            rect.top) *
          scaleY;

        const pressure =
          event.pressure > 0
            ? normalizePressure(
                event.pressure,
              )
            : 0.5;

        return createPoint(
          x,
          y,
          pressure,
        );
      },
      [],
    );

  const pointToSegmentDistance =
    (
      px: number,
      py: number,
      ax: number,
      ay: number,
      bx: number,
      by: number,
    ) => {
      const dx =
        bx - ax;

      const dy =
        by - ay;

      if (
        dx === 0 &&
        dy === 0
      ) {
        return Math.hypot(
          px - ax,
          py - ay,
        );
      }

      const t =
        Math.max(
          0,
          Math.min(
            1,
            ((px - ax) * dx +
              (py - ay) * dy) /
              (dx * dx +
                dy * dy),
          ),
        );

      const closestX =
        ax + t * dx;

      const closestY =
        ay + t * dy;

      return Math.hypot(
        px - closestX,
        py - closestY,
      );
    };

  const strokeHitTest =
    (
      point: {
        x: number;
        y: number;
      },
      stroke: Stroke,
      radius: number,
    ) => {
      for (
        let index = 1;
        index <
        stroke.points.length;
        index += 1
      ) {
        const previous =
          stroke.points[
            index - 1
          ];

        const current =
          stroke.points[index];

        if (
          pointToSegmentDistance(
            point.x,
            point.y,
            previous.x,
            previous.y,
            current.x,
            current.y,
          ) <= radius
        ) {
          return true;
        }
      }

      return false;
    };

  const finishStroke =
    (
      pointerId?: number,
    ) => {
      const canvas =
        canvasRef.current;

      const liveStroke =
        currentStrokeRef.current;

      /*
       * IMPORTANT:
       * Capture the live stroke locally
       * BEFORE clearing the ref.
       */
      if (
        drawingRef.current &&
        liveStroke &&
        liveStroke.points.length >=
          2
      ) {
        const committed = [
          ...strokesRef.current,
          liveStroke,
        ];

        strokesRef.current =
          committed;

        onStrokesChangeRef.current(
          committed,
        );
      }

      drawingRef.current =
        false;

      currentStrokeRef.current =
        null;

      if (
        canvas &&
        pointerId !== undefined &&
        canvas.hasPointerCapture(
          pointerId,
        )
      ) {
        canvas.releasePointerCapture(
          pointerId,
        );
      }

      /*
       * Always redraw AFTER the committed
       * stroke has been placed in strokesRef.
       */
      redraw();
    };

  const cancelStroke =
    (
      pointerId?: number,
    ) => {
      const canvas =
        canvasRef.current;

      drawingRef.current =
        false;

      currentStrokeRef.current =
        null;

      if (
        canvas &&
        pointerId !== undefined &&
        canvas.hasPointerCapture(
          pointerId,
        )
      ) {
        canvas.releasePointerCapture(
          pointerId,
        );
      }

      redraw();
    };

  const finishPan =
    (
      pointerId?: number,
    ) => {
      const canvas =
        canvasRef.current;

      panningRef.current =
        false;

      lastPanPointRef.current =
        null;

      if (
        canvas &&
        pointerId !== undefined &&
        canvas.hasPointerCapture(
          pointerId,
        )
      ) {
        canvas.releasePointerCapture(
          pointerId,
        );
      }
    };

  const handlePointerDown =
    (
      event: React.PointerEvent<HTMLCanvasElement>,
    ) => {
      const canvas =
        canvasRef.current;

      if (!canvas) {
        return;
      }

      if (
        event.pointerType ===
          "mouse" &&
        event.button !== 0
      ) {
        return;
      }

      if (
        event.button === 1 ||
        event.shiftKey
      ) {
        canvas.setPointerCapture(
          event.pointerId,
        );

        panningRef.current =
          true;

        lastPanPointRef.current = {
          x: event.clientX,
          y: event.clientY,
        };

        return;
      }

      canvas.setPointerCapture(
        event.pointerId,
      );

      const point =
        getCanvasPoint(
          event.nativeEvent,
        );

      if (
        toolRef.current ===
        "eraser"
      ) {
        drawingRef.current =
          true;

        const radius =
          Math.max(
            sizeRef.current * 2,
            16,
          );

        const remaining =
          strokesRef.current.filter(
            (stroke) =>
              !strokeHitTest(
                point,
                stroke,
                radius,
              ),
          );

        if (
          remaining.length !==
          strokesRef.current.length
        ) {
          strokesRef.current =
            remaining;

          onStrokesChangeRef.current(
            remaining,
          );
        }

        return;
      }

      drawingRef.current =
        true;

      currentStrokeRef.current = {
        id: createStrokeId(),
        points: [point],
        color:
          colorRef.current,
        size:
          sizeRef.current,
        opacity:
          toolRef.current ===
          "highlighter"
            ? Math.min(
                opacityRef.current,
                0.4,
              )
            : opacityRef.current,
        tool:
          toolRef.current,
      };

      redraw();
    };

  const handlePointerMove =
    (
      event: React.PointerEvent<HTMLCanvasElement>,
    ) => {
      if (
        panningRef.current
      ) {
        const last =
          lastPanPointRef.current;

        if (!last) {
          return;
        }

        const dx =
          event.clientX -
          last.x;

        const dy =
          event.clientY -
          last.y;

        const nextViewport = {
          ...viewportRef.current,
          x:
            viewportRef.current.x +
            dx,
          y:
            viewportRef.current.y +
            dy,
        };

        viewportRef.current =
          nextViewport;

        onViewportChange(
          nextViewport,
        );

        lastPanPointRef.current = {
          x: event.clientX,
          y: event.clientY,
        };

        return;
      }

      if (
        !drawingRef.current
      ) {
        return;
      }

      const point =
        getCanvasPoint(
          event.nativeEvent,
        );

      if (
        toolRef.current ===
        "eraser"
      ) {
        const radius =
          Math.max(
            sizeRef.current * 2,
            16,
          );

        const remaining =
          strokesRef.current.filter(
            (stroke) =>
              !strokeHitTest(
                point,
                stroke,
                radius,
              ),
          );

        if (
          remaining.length !==
          strokesRef.current.length
        ) {
          strokesRef.current =
            remaining;

          onStrokesChangeRef.current(
            remaining,
          );

          redraw();
        }

        return;
      }

      const liveStroke =
        currentStrokeRef.current;

      if (!liveStroke) {
        return;
      }

      liveStroke.points.push(
        point,
      );

      redraw();
    };

  const handlePointerUp =
    (
      event: React.PointerEvent<HTMLCanvasElement>,
    ) => {
      if (
        panningRef.current
      ) {
        finishPan(
          event.pointerId,
        );

        return;
      }

      if (
        drawingRef.current
      ) {
        finishStroke(
          event.pointerId,
        );
      }
    };

  const handlePointerCancel =
    (
      event: React.PointerEvent<HTMLCanvasElement>,
    ) => {
      if (
        panningRef.current
      ) {
        finishPan(
          event.pointerId,
        );

        return;
      }

      if (
        drawingRef.current
      ) {
        cancelStroke(
          event.pointerId,
        );
      }
    };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-10 block h-full w-full touch-none select-none"
      style={{
        touchAction: "none",
      }}
      onPointerDown={
        handlePointerDown
      }
      onPointerMove={
        handlePointerMove
      }
      onPointerUp={
        handlePointerUp
      }
      onPointerCancel={
        handlePointerCancel
      }
    />
  );
}