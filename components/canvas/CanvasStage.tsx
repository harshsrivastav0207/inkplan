"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  Page,
  PageType,
  Stroke,
  ThemeName,
} from "@/lib/db/types";

import { db } from "@/lib/db";
import { PageBackground } from "./PageBackground";
import { CanvasSurface } from "./CanvasSurface";
import { PenToolbar } from "./PenToolbar";
import { useStrokeHistory } from "./useStrokeHistory";
import { useAutosave } from "./useAutosave";
import type { Viewport } from "./types";

const SANDBOX_PAGE_ID = "canvas-sandbox";

type CanvasStageProps = {
  pageId?: string;
  pageType?: PageType;
  theme?: ThemeName;
};

function isValidStroke(
  stroke: unknown,
): stroke is Stroke {
  if (
    !stroke ||
    typeof stroke !== "object"
  ) {
    return false;
  }

  const value =
    stroke as Record<string, unknown>;

  return (
    typeof value.id === "string" &&
    Array.isArray(value.points) &&
    typeof value.color === "string" &&
    typeof value.size === "number" &&
    typeof value.opacity === "number" &&
    typeof value.tool === "string"
  );
}

function sanitizeStrokes(
  page: Page | undefined,
): Stroke[] {
  if (
    !page ||
    !Array.isArray(page.strokes)
  ) {
    return [];
  }

  const clean =
    page.strokes.filter(isValidStroke);

  if (
    clean.length !==
    page.strokes.length
  ) {
    console.warn(
      "[InkPlan] Dropped",
      page.strokes.length -
        clean.length,
      "malformed strokes on load.",
    );
  }

  return clean;
}

export function CanvasStage({
  pageId = SANDBOX_PAGE_ID,
  pageType = "blank",
  theme = "light",
}: CanvasStageProps) {
  const history =
    useStrokeHistory();

  const {
    reset,
    strokes,
    setStrokes,
    undo,
    redo,
    canUndo,
    canRedo,
  } = history;

  const stageRef =
    useRef<HTMLDivElement | null>(null);

  const [loaded, setLoaded] =
    useState(false);

  const [viewport, setViewport] =
    useState<Viewport>({
      x: 0,
      y: 0,
      scale: 1,
    });

  const [activeTool, setActiveTool] =
    useState<
      "pen" | "highlighter" | "eraser"
    >("pen");

  const [size, setSize] =
    useState(4);

  const [color, setColor] =
    useState("#111111");

  const [opacity, setOpacity] =
    useState(1);

  /*
   * Load the page ONLY when pageId changes.
   *
   * reset is intentionally not a dependency because
   * the page-load operation must not restart after
   * every stroke/state update.
   */
  useEffect(() => {
    let cancelled = false;

   

    async function loadPage() {
      try {
        const page =
          await db.pages.get(pageId);

        if (cancelled) {
          return;
        }

        reset(
          sanitizeStrokes(page),
        );

        setLoaded(true);
      } catch (error) {
        console.error(
          "InkPlan page load failed:",
          error,
        );

        if (!cancelled) {
          reset([]);
          setLoaded(true);
        }
      }
    }

    void loadPage();

    return () => {
      cancelled = true;
    };

    // reset is stable, but pageId is the
    // actual page-loading boundary.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  useAutosave(
    loaded ? strokes : [],
    pageId,
    pageType,
    theme,
  );

  const handleKeyDown =
    useCallback(
      (event: KeyboardEvent) => {
        const stage =
          stageRef.current;

        if (!stage) {
          return;
        }

        const target =
          event.target;

        if (
          !(target instanceof Node) ||
          !stage.contains(target)
        ) {
          return;
        }

        if (
          target instanceof HTMLElement &&
          target.closest(
            "input, textarea, select, button, a, [contenteditable='true']",
          )
        ) {
          return;
        }

        const modifier =
          event.ctrlKey ||
          event.metaKey;

        if (!modifier) {
          return;
        }

        const key =
          event.key.toLowerCase();

        if (
          key === "z" &&
          event.shiftKey
        ) {
          event.preventDefault();
          redo();
          return;
        }

        if (key === "z") {
          event.preventDefault();
          undo();
          return;
        }

        if (
          key === "y" &&
          event.ctrlKey &&
          !event.metaKey
        ) {
          event.preventDefault();
          redo();
        }
      },
      [redo, undo],
    );

  useEffect(() => {
    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [handleKeyDown]);

  function handleStagePointerDown(
    event: React.PointerEvent<HTMLDivElement>,
  ) {
    const target =
      event.target;

    if (
      !(target instanceof Element)
    ) {
      return;
    }

    if (
      target.closest(
        "button, input, textarea, select, a, [contenteditable='true']",
      )
    ) {
      return;
    }

    stageRef.current?.focus();
  }

  if (!loaded) {
    return null;
  }

  return (
    <div
      ref={stageRef}
      tabIndex={0}
      onPointerDownCapture={
        handleStagePointerDown
      }
      className="relative h-full w-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      style={{
        touchAction: "none",
      }}
    >
      <div
        className="absolute left-0 top-0 h-full w-full"
        style={{
          transform:
            `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
          transformOrigin:
            "0 0",
        }}
      >
        <PageBackground
          pageType={pageType}
          theme={theme}
        />

        <CanvasSurface
          viewport={viewport}
          onViewportChange={
            setViewport
          }
          strokes={strokes}
          onStrokesChange={
            setStrokes
          }
          activeTool={activeTool}
          color={color}
          size={size}
          opacity={opacity}
        />
      </div>

      <PenToolbar
        tool={activeTool}
        size={size}
        color={color}
        opacity={opacity}
        onToolChange={
          setActiveTool
        }
        onSizeChange={setSize}
        onColorChange={
          setColor
        }
        onOpacityChange={
          setOpacity
        }
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
    </div>
  );
}