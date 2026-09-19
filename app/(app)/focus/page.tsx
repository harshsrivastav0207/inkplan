"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useRef, useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { AudioControls } from "@/components/focus/AudioControls";
import { DurationEditor } from "@/components/focus/DurationEditor";
import { SessionHistory } from "@/components/focus/SessionHistory";
import { TimerControls } from "@/components/focus/TimerControls";
import { TimerDisplay } from "@/components/focus/TimerDisplay";

import {
  type AudioTrackId,
  useAmbientAudio,
} from "@/hooks/useAmbientAudio";

import { useFocusTimer } from "@/hooks/useFocusTimer";

import {
  focusRepo,
  settingsRepo,
} from "@/lib/db/repositories";

export default function FocusPage() {
  const settings = useLiveQuery(
    () => settingsRepo.get(),
    [],
  );

  const [audioTrack, setAudioTrack] =
    useState<AudioTrackId>("none");

  const [
    audioVolumeOverride,
    setAudioVolumeOverride,
  ] = useState<number | null>(null);

  const completionRecordedRef =
    useRef<number | null>(null);

  const durations = {
    focus:
      (settings?.pomodoroMinutes ?? 25) *
      60,

    shortBreak:
      (settings?.shortBreakMinutes ?? 5) *
      60,

    longBreak:
      (settings?.longBreakMinutes ?? 15) *
      60,
  };

  const timer = useFocusTimer(durations);

  const audioVolume =
    audioVolumeOverride ??
    settings?.audioVolume ??
    0.5;

  const audio = useAmbientAudio({
    trackId: audioTrack,
    volume: audioVolume,
  });

  const {
    stop: stopAudio,
  } = audio;

  useEffect(() => {
    if (timer.status !== "complete") {
      return;
    }

    if (timer.mode !== "focus") {
      return;
    }

    const startedAt = timer.startedAt;

    if (startedAt === null) {
      return;
    }

    if (
      completionRecordedRef.current ===
      startedAt
    ) {
      return;
    }

    completionRecordedRef.current =
      startedAt;

    void focusRepo
      .record({
        startedAt,
        endedAt: Date.now(),
        durationMinutes: Math.round(
          timer.durationSeconds / 60,
        ),
        completed: true,
        audioTrackId:
          audioTrack === "none"
            ? null
            : audioTrack,
      })
      .catch((error) => {
        console.error(
          "[InkPlan Focus] Failed to record completed session:",
          error,
        );

        completionRecordedRef.current =
          null;
      });
  }, [
    timer.status,
    timer.mode,
    timer.startedAt,
    timer.durationSeconds,
    audioTrack,
  ]);

  useEffect(() => {
    if (timer.status === "complete") {
      stopAudio();
    }
  }, [timer.status, stopAudio]);

  function handleStart() {
    timer.start();

    if (audioTrack !== "none") {
      void audio.play(audioTrack);
    }
  }

  function handlePause() {
    timer.pause();
    audio.pause();
  }

  function handleReset() {
    const isActiveFocusSession =
      (timer.status === "running" ||
        timer.status === "paused") &&
      timer.mode === "focus" &&
      timer.startedAt !== null;

    if (isActiveFocusSession) {
      const startedAt = timer.startedAt;

      if (startedAt !== null) {
        const elapsedSeconds =
          timer.durationSeconds -
          timer.remainingSeconds;

        if (elapsedSeconds >= 60) {
          void focusRepo
            .record({
              startedAt,
              endedAt: Date.now(),
              durationMinutes: Math.floor(
                elapsedSeconds / 60,
              ),
              completed: false,
              audioTrackId:
                audioTrack === "none"
                  ? null
                  : audioTrack,
            })
            .catch((error) => {
              console.error(
                "[InkPlan Focus] Failed to record abandoned session:",
                error,
              );
            });
        }
      }
    }

    timer.reset();
    audio.stop();
  }

  function handleTrackChange(
    nextTrack: AudioTrackId,
  ) {
    setAudioTrack(nextTrack);

    if (nextTrack === "none") {
      audio.stop();
      return;
    }

    if (timer.status === "running") {
      void audio.play(nextTrack);
    }
  }

  async function handleVolumeChange(
    nextVolume: number,
  ) {
    setAudioVolumeOverride(nextVolume);
    audio.setVolume(nextVolume);

    try {
      await settingsRepo.update({
        audioVolume: nextVolume,
      });
    } catch (error) {
      console.error(
        "[InkPlan Focus] Failed to save audio volume:",
        error,
      );
    }
  }

  return (
    <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          InkPlan
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Focus Timer
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Focus on one thing at a time.
        </p>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Focus</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-8 py-8">
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                disabled={
                  timer.status !== "idle" &&
                  timer.status !== "complete"
                }
                onClick={() =>
                  timer.switchMode("focus")
                }
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  timer.mode === "focus"
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Focus
              </button>

              <button
                type="button"
                disabled={
                  timer.status !== "idle" &&
                  timer.status !== "complete"
                }
                onClick={() =>
                  timer.switchMode(
                    "short-break",
                  )
                }
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  timer.mode ===
                  "short-break"
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Short Break
              </button>

              <button
                type="button"
                disabled={
                  timer.status !== "idle" &&
                  timer.status !== "complete"
                }
                onClick={() =>
                  timer.switchMode(
                    "long-break",
                  )
                }
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  timer.mode === "long-break"
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Long Break
              </button>
            </div>

            <TimerDisplay
              remainingSeconds={
                timer.remainingSeconds
              }
            />

            <p className="text-center text-sm text-muted-foreground">
              {timer.status === "idle" &&
                "Ready to focus"}

              {timer.status === "running" &&
                "Session running"}

              {timer.status === "paused" &&
                "Timer paused"}

              {timer.status === "complete" &&
                "Session complete"}
            </p>

            <TimerControls
              status={timer.status}
              onStart={handleStart}
              onPause={handlePause}
              onReset={handleReset}
            />
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <AudioControls
          trackId={audioTrack}
          volume={audioVolume}
          isPlaying={audio.isPlaying}
          error={audio.error}
          onTrackChange={handleTrackChange}
          onVolumeChange={
            handleVolumeChange
          }
        />
      </div>

      <div className="mt-6">
        <DurationEditor
          durations={timer.durations}
          disabled={
            timer.status !== "idle" &&
            timer.status !== "complete"
          }
          onSaved={(nextDurations) => {
            timer.updateDuration(
              "focus",
              nextDurations.focus,
            );

            timer.updateDuration(
              "short-break",
              nextDurations.shortBreak,
            );

            timer.updateDuration(
              "long-break",
              nextDurations.longBreak,
            );
          }}
        />
      </div>

      <div className="mt-6">
        <SessionHistory />
      </div>
    </div>
  );
}