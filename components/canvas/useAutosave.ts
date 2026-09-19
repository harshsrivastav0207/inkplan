"use client";

import { useEffect } from "react";
import type {
  PageType,
  Stroke,
  ThemeName,
} from "@/lib/db/types";
import { db } from "@/lib/db";

const AUTOSAVE_DELAY = 500;

function isValidStroke(
  stroke: unknown
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

export function useAutosave(
  strokesInput: Stroke[] | unknown,
  pageId = "canvas-sandbox",
  pageType: PageType = "blank",
  theme: ThemeName = "light"
) {
  useEffect(() => {
    if (!Array.isArray(strokesInput)) {
      console.warn(
        "[InkPlan autosave] expected Stroke[] but received:",
        typeof strokesInput
      );

      return;
    }

    const timeout = window.setTimeout(
      async () => {
        try {
          const strokes =
            strokesInput.filter(
              isValidStroke
            );

          const existingPage =
            await db.pages.get(pageId);

          await db.pages.put({
            id: pageId,
            noteId:
              existingPage?.noteId ??
              "canvas-sandbox",
            order:
              existingPage?.order ?? 0,
            pageType,
            theme:
              existingPage?.theme ?? theme,
            strokes,
            createdAt:
              existingPage?.createdAt ??
              Date.now(),
            updatedAt: Date.now(),
          });
        } catch (error) {
          console.error(
            "InkPlan autosave failed:",
            error
          );
        }
      },
      AUTOSAVE_DELAY
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    strokesInput,
    pageId,
    pageType,
    theme,
  ]);
}