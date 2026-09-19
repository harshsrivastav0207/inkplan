"use client";

import { useCallback, useState } from "react";

import type { Stroke } from "@/lib/db/types";

const MAX_HISTORY = 50;

type HistoryState = {
  strokes: Stroke[];
  undoStack: Stroke[][];
  redoStack: Stroke[][];
};

const EMPTY_STATE: HistoryState = {
  strokes: [],
  undoStack: [],
  redoStack: [],
};

export function useStrokeHistory() {
  const [state, setState] =
    useState<HistoryState>(EMPTY_STATE);

  const push = useCallback((stroke: Stroke) => {
    setState((current) => ({
      strokes: [...current.strokes, stroke],
      undoStack: [
        ...current.undoStack,
        current.strokes,
      ].slice(-MAX_HISTORY),
      redoStack: [],
    }));
  }, []);

  const setStrokes = useCallback(
    (
      next:
        | Stroke[]
        | ((previous: Stroke[]) => Stroke[]),
    ) => {
      setState((current) => {
        const nextStrokes =
          typeof next === "function"
            ? next(current.strokes)
            : next;

        if (nextStrokes === current.strokes) {
          return current;
        }

        return {
          strokes: nextStrokes,
          undoStack: [
            ...current.undoStack,
            current.strokes,
          ].slice(-MAX_HISTORY),
          redoStack: [],
        };
      });
    },
    [],
  );

  const removeMany = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) {
        return;
      }

      const idSet = new Set(ids);

      setState((current) => {
        const nextStrokes =
          current.strokes.filter(
            (stroke) =>
              !idSet.has(stroke.id),
          );

        if (
          nextStrokes.length ===
          current.strokes.length
        ) {
          return current;
        }

        return {
          strokes: nextStrokes,
          undoStack: [
            ...current.undoStack,
            current.strokes,
          ].slice(-MAX_HISTORY),
          redoStack: [],
        };
      });
    },
    [],
  );

  const reset = useCallback(
    (strokes: Stroke[]) => {
      setState({
        strokes,
        undoStack: [],
        redoStack: [],
      });
    },
    [],
  );

  const undo = useCallback(() => {
    setState((current) => {
      if (current.undoStack.length === 0) {
        return current;
      }

      const previous =
        current.undoStack[
          current.undoStack.length - 1
        ];

      return {
        strokes: previous,
        undoStack:
          current.undoStack.slice(0, -1),
        redoStack: [
          ...current.redoStack,
          current.strokes,
        ],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((current) => {
      if (current.redoStack.length === 0) {
        return current;
      }

      const next =
        current.redoStack[
          current.redoStack.length - 1
        ];

      return {
        strokes: next,
        undoStack: [
          ...current.undoStack,
          current.strokes,
        ].slice(-MAX_HISTORY),
        redoStack:
          current.redoStack.slice(0, -1),
      };
    });
  }, []);

  const clear = useCallback(() => {
    setState((current) => {
      if (current.strokes.length === 0) {
        return current;
      }

      return {
        strokes: [],
        undoStack: [
          ...current.undoStack,
          current.strokes,
        ].slice(-MAX_HISTORY),
        redoStack: [],
      };
    });
  }, []);

  return {
    strokes: state.strokes,
    setStrokes,
    push,
    removeMany,
    reset,
    undo,
    redo,
    clear,
    canUndo: state.undoStack.length > 0,
    canRedo: state.redoStack.length > 0,
  };
}