"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export type FocusTimerStatus =
  | "idle"
  | "running"
  | "paused"
  | "complete";

export type FocusTimerMode =
  | "focus"
  | "short-break"
  | "long-break";

type FocusTimerState = {
  status: FocusTimerStatus;
  mode: FocusTimerMode;
  durationSeconds: number;
  remainingSeconds: number;
  startedAt: number | null;
};

export type TimerDurations = {
  focus: number;
  shortBreak: number;
  longBreak: number;
};

type StoredTimerState = {
  status: "running" | "paused";
  mode: FocusTimerMode;
  durationSeconds: number;
  remainingSeconds: number;
  startedAt: number | null;
  endAt: number | null;
};

const STORAGE_KEY = "inkplan-focus-timer";

const DEFAULT_DURATIONS: TimerDurations = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

function getDuration(
  durations: TimerDurations,
  mode: FocusTimerMode,
) {
  if (mode === "focus") {
    return durations.focus;
  }

  if (mode === "short-break") {
    return durations.shortBreak;
  }

  return durations.longBreak;
}

function readStoredTimer(): StoredTimerState | null {
  try {
    const raw =
      sessionStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(
      raw,
    ) as Partial<StoredTimerState>;

    if (
      (parsed.status !== "running" &&
        parsed.status !== "paused") ||
      (parsed.mode !== "focus" &&
        parsed.mode !== "short-break" &&
        parsed.mode !== "long-break") ||
      typeof parsed.durationSeconds !==
        "number" ||
      typeof parsed.remainingSeconds !==
        "number"
    ) {
      sessionStorage.removeItem(
        STORAGE_KEY,
      );

      return null;
    }

    return {
      status: parsed.status,
      mode: parsed.mode,
      durationSeconds:
        parsed.durationSeconds,
      remainingSeconds: Math.max(
        0,
        parsed.remainingSeconds,
      ),
      startedAt:
        typeof parsed.startedAt === "number"
          ? parsed.startedAt
          : null,
      endAt:
        typeof parsed.endAt === "number"
          ? parsed.endAt
          : null,
    };
  } catch (error) {
    console.error(
      "[InkPlan Focus] Failed to restore timer state:",
      error,
    );

    return null;
  }
}

function clearStoredTimer() {
  try {
    sessionStorage.removeItem(
      STORAGE_KEY,
    );
  } catch (error) {
    console.error(
      "[InkPlan Focus] Failed to clear timer state:",
      error,
    );
  }
}

function saveStoredTimer(
  state: StoredTimerState,
) {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state),
    );
  } catch (error) {
    console.error(
      "[InkPlan Focus] Failed to persist timer state:",
      error,
    );
  }
}

export function useFocusTimer(
  initialDurations: TimerDurations =
    DEFAULT_DURATIONS,
) {
  const [durations, setDurations] =
    useState<TimerDurations>(
      initialDurations,
    );

  const [state, setState] =
    useState<FocusTimerState>({
      status: "idle",
      mode: "focus",
      durationSeconds:
        initialDurations.focus,
      remainingSeconds:
        initialDurations.focus,
      startedAt: null,
    });

  const intervalRef =
    useRef<number | null>(null);

  const endAtRef =
    useRef<number | null>(null);

  const lastInitialDurationsRef =
    useRef<string | null>(null);

  const restoredRef =
    useRef(false);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(
        intervalRef.current,
      );

      intervalRef.current = null;
    }
  }, []);

  const updateRemaining = useCallback(() => {
    const endAt = endAtRef.current;

    if (endAt === null) {
      return;
    }

    const remaining = Math.max(
      Math.ceil(
        (endAt - Date.now()) / 1000,
      ),
      0,
    );

    if (remaining <= 0) {
      clearTimer();

      endAtRef.current = null;

      setState((current) => ({
        ...current,
        status: "complete",
        remainingSeconds: 0,
      }));

      clearStoredTimer();
      return;
    }

    setState((current) => ({
      ...current,
      remainingSeconds: remaining,
    }));
  }, [clearTimer]);

  const start = useCallback(() => {
    setState((current) => {
      if (current.status === "running") {
        return current;
      }

      if (
        current.status === "complete" ||
        current.remainingSeconds <= 0
      ) {
        return current;
      }

      const now = Date.now();

      const endAt =
        now +
        current.remainingSeconds * 1000;

      endAtRef.current = endAt;

      const nextState = {
        ...current,
        status: "running" as const,
        startedAt:
          current.startedAt ?? now,
      };

      saveStoredTimer({
        status: "running",
        mode: nextState.mode,
        durationSeconds:
          nextState.durationSeconds,
        remainingSeconds:
          nextState.remainingSeconds,
        startedAt: nextState.startedAt,
        endAt,
      });

      return nextState;
    });
  }, []);

  const pause = useCallback(() => {
    setState((current) => {
      if (current.status !== "running") {
        return current;
      }

      const endAt = endAtRef.current;

      let remaining =
        current.remainingSeconds;

      if (endAt !== null) {
        remaining = Math.max(
          Math.ceil(
            (endAt - Date.now()) / 1000,
          ),
          0,
        );
      }

      clearTimer();
      endAtRef.current = null;

      const nextState = {
        ...current,
        status: "paused" as const,
        remainingSeconds: remaining,
      };

      if (remaining > 0) {
        saveStoredTimer({
          status: "paused",
          mode: nextState.mode,
          durationSeconds:
            nextState.durationSeconds,
          remainingSeconds:
            nextState.remainingSeconds,
          startedAt: nextState.startedAt,
          endAt: null,
        });
      } else {
        clearStoredTimer();
      }

      return nextState;
    });
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();

    const duration = getDuration(
      durations,
      state.mode,
    );

    endAtRef.current = null;
    clearStoredTimer();

    setState((current) => ({
      ...current,
      status: "idle",
      durationSeconds: duration,
      remainingSeconds: duration,
      startedAt: null,
    }));
  }, [
    clearTimer,
    durations,
    state.mode,
  ]);

  const switchMode = useCallback(
    (mode: FocusTimerMode) => {
      setState((current) => {
        if (
          current.status !== "idle" &&
          current.status !== "complete"
        ) {
          return current;
        }

        const duration = getDuration(
          durations,
          mode,
        );

        clearTimer();
        endAtRef.current = null;
        clearStoredTimer();

        return {
          status: "idle",
          mode,
          durationSeconds: duration,
          remainingSeconds: duration,
          startedAt: null,
        };
      });
    },
    [clearTimer, durations],
  );

  const updateDuration = useCallback(
    (
      mode: FocusTimerMode,
      seconds: number,
    ) => {
      if (seconds <= 0) {
        return;
      }

      setDurations((current) => ({
        ...current,
        ...(mode === "focus"
          ? { focus: seconds }
          : mode === "short-break"
            ? { shortBreak: seconds }
            : { longBreak: seconds }),
      }));

      setState((current) => {
        if (
          current.mode !== mode ||
          (current.status !== "idle" &&
            current.status !== "complete")
        ) {
          return current;
        }

        endAtRef.current = null;
        clearStoredTimer();

        return {
          ...current,
          durationSeconds: seconds,
          remainingSeconds: seconds,
          status: "idle",
          startedAt: null,
        };
      });
    },
    [],
  );

  useEffect(() => {
    const key = [
      initialDurations.focus,
      initialDurations.shortBreak,
      initialDurations.longBreak,
    ].join(":");

    if (
      lastInitialDurationsRef.current ===
      key
    ) {
      return;
    }

    lastInitialDurationsRef.current = key;

    setDurations(initialDurations);

    setState((current) => {
      if (
        current.status !== "idle" &&
        current.status !== "complete"
      ) {
        return current;
      }

      const duration = getDuration(
        initialDurations,
        current.mode,
      );

      return {
        ...current,
        durationSeconds: duration,
        remainingSeconds: duration,
      };
    });

    // We intentionally depend on the primitive duration values,
    // not the object identity created by the parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialDurations.focus,
    initialDurations.shortBreak,
    initialDurations.longBreak,
  ]);

  useEffect(() => {
    if (restoredRef.current) {
      return;
    }

    restoredRef.current = true;

    const stored = readStoredTimer();

    if (!stored) {
      return;
    }

    let remaining =
      stored.remainingSeconds;

    if (
      stored.status === "running" &&
      stored.endAt !== null
    ) {
      remaining = Math.max(
        Math.ceil(
          (stored.endAt - Date.now()) /
            1000,
        ),
        0,
      );
    }

    if (remaining <= 0) {
      clearStoredTimer();
      endAtRef.current = null;

      // sessionStorage is external persisted state;
      // this is the hydration step for the timer.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState((current) => ({
        ...current,
        status: "complete",
        mode: stored.mode,
        durationSeconds:
          stored.durationSeconds,
        remainingSeconds: 0,
        startedAt: stored.startedAt,
      }));

      return;
    }

    endAtRef.current =
      stored.status === "running" &&
      stored.endAt !== null
        ? stored.endAt
        : null;

    
    setState({
      status: stored.status,
      mode: stored.mode,
      durationSeconds:
        stored.durationSeconds,
      remainingSeconds: remaining,
      startedAt: stored.startedAt,
    });
  }, []);

  useEffect(() => {
    if (state.status !== "running") {
      clearTimer();
      return;
    }

    updateRemaining();

    intervalRef.current =
      window.setInterval(
        updateRemaining,
        250,
      );

    return clearTimer;
  }, [
    state.status,
    updateRemaining,
    clearTimer,
  ]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        updateRemaining();
      }
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, [updateRemaining]);

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  return {
    ...state,
    durations,
    start,
    pause,
    reset,
    switchMode,
    updateDuration,
  };
}