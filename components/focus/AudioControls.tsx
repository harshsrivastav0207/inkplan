"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  AUDIO_TRACKS,
  type AudioTrackId,
} from "@/hooks/useAmbientAudio";

type AudioControlsProps = {
  trackId: AudioTrackId;
  volume: number;
  isPlaying: boolean;
  error: string | null;
  onTrackChange: (trackId: AudioTrackId) => void;
  onVolumeChange: (volume: number) => void;
};

export function AudioControls({
  trackId,
  volume,
  isPlaying,
  error,
  onTrackChange,
  onVolumeChange,
}: AudioControlsProps) {
  const localVolume = Math.round(volume * 100);

  function handleVolumeChange(
    value: number | readonly number[],
  ) {
    const next = Array.isArray(value)
      ? (value[0] ?? 0)
      : value;

    onVolumeChange(next / 100);
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div>
        <h2 className="text-lg font-semibold">
          Ambient audio
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Choose a background sound for your focus session.
        </p>
      </div>

      <div className="mt-5">
        <Label>Track</Label>

        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <button
            type="button"
            onClick={() => onTrackChange("none")}
            className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
              trackId === "none"
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background hover:bg-muted"
            }`}
          >
            None
          </button>

          {AUDIO_TRACKS.map((track) => (
            <button
              key={track.id}
              type="button"
              onClick={() => onTrackChange(track.id)}
              className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                trackId === track.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              {track.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 max-w-md">
        <div className="flex items-center justify-between">
          <Label htmlFor="audio-volume">
            Volume
          </Label>

          <span className="text-sm text-muted-foreground">
            {localVolume}%
          </span>
        </div>

        <Slider
          id="audio-volume"
          className="mt-3"
          min={0}
          max={100}
          step={1}
          value={[localVolume]}
          onValueChange={handleVolumeChange}
        />
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {!isPlaying
          ? trackId === "none"
            ? "Audio off"
            : "Selected track ready"
          : "Playing"}
      </p>

      {error ? (
        <p className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}