"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AudioTrackId =
  | "none"
  | "lofi"
  | "piano"
  | "inspiring-piano"
  | "peaceful-piano"
  | "emotional-piano"
  | "ambient-piano-strings"
  | "cinematic-documentary"
  | "smooth-waters"
  | "water-afro-pop"
  | "moment-of-peace"
  | "wonders-of-the-earth";

export const AUDIO_TRACKS: {
  id: Exclude<AudioTrackId, "none">;
  name: string;
  src: string;
}[] = [
  { id: "lofi", name: "Lo-fi", src: "/audio/lofi.mp3" },
  { id: "piano", name: "Piano", src: "/audio/piano.mp3" },
  {
    id: "inspiring-piano",
    name: "Inspiring Piano",
    src: "/audio/inspiring-piano.mp3",
  },
  {
    id: "peaceful-piano",
    name: "Peaceful Piano",
    src: "/audio/peaceful-piano.mp3",
  },
  {
    id: "emotional-piano",
    name: "Emotional Piano",
    src: "/audio/emotional-piano.mp3",
  },
  {
    id: "ambient-piano-strings",
    name: "Ambient Piano & Strings",
    src: "/audio/ambient-piano-strings.mp3",
  },
  {
    id: "cinematic-documentary",
    name: "Cinematic Documentary",
    src: "/audio/cinematic-documentary.mp3",
  },
  {
    id: "smooth-waters",
    name: "Smooth Waters",
    src: "/audio/smooth-waters.mp3",
  },
  {
    id: "water-afro-pop",
    name: "Water Afro Pop",
    src: "/audio/water-afro-pop.mp3",
  },
  {
    id: "moment-of-peace",
    name: "Moment of Peace",
    src: "/audio/moment-of-peace.mp3",
  },
  {
    id: "wonders-of-the-earth",
    name: "Wonders of the Earth",
    src: "/audio/wonders-of-the-earth.mp3",
  },
];

type UseAmbientAudioOptions = {
  trackId: AudioTrackId;
  volume?: number;
};

export function useAmbientAudio({
  trackId,
  volume = 0.5,
}: UseAmbientAudioOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAudio = useCallback(() => {
    if (audioRef.current) {
      return audioRef.current;
    }

    const audio = new Audio();

    audio.loop = true;
    audio.preload = "none";
    audio.volume = Math.min(Math.max(volume, 0), 1);

    audio.addEventListener("play", () => {
      setIsPlaying(true);
    });

    audio.addEventListener("pause", () => {
      setIsPlaying(false);
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
    });

    audio.addEventListener("error", () => {
      setIsPlaying(false);
      setError("Could not load the selected audio.");
    });

    audioRef.current = audio;

    return audio;
  }, [volume]);

  const pause = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
  }, []);

  const play = useCallback(
    async (requestedTrackId: AudioTrackId = trackId) => {
      if (requestedTrackId === "none") {
        return;
      }

      const track = AUDIO_TRACKS.find(
        (item) => item.id === requestedTrackId,
      );

      if (!track) {
        setError("Selected audio track is unavailable.");
        return;
      }

      const audio = getAudio();

      try {
        setError(null);

        const nextSrc =
          window.location.origin + track.src;

        if (audio.src !== nextSrc) {
          audio.pause();
          audio.src = track.src;
          audio.load();
        }

        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.error(
          "[InkPlan Audio] Playback failed:",
          err,
        );

        setIsPlaying(false);
        setError(
          "Audio could not start. Try pressing Start again.",
        );
      }
    },
    [getAudio, trackId],
  );

  const setVolume = useCallback((nextVolume: number) => {
    const safeVolume = Math.min(
      Math.max(nextVolume, 0),
      1,
    );

    if (audioRef.current) {
      audioRef.current.volume = safeVolume;
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = Math.min(
      Math.max(volume, 0),
      1,
    );
  }, [volume]);

  useEffect(() => {
    const audio = getAudio();

    if (trackId === "none") {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      return;
    }

    const track = AUDIO_TRACKS.find(
      (item) => item.id === trackId,
    );

    if (!track) {
      return;
    }

    const nextSrc =
      window.location.origin + track.src;

    const wasPlaying = !audio.paused;

    audio.pause();

    if (audio.src !== nextSrc) {
      audio.src = track.src;
      audio.load();
    }

    if (wasPlaying) {
      void audio.play().catch((err) => {
        console.error(
          "[InkPlan Audio] Track switch failed:",
          err,
        );

        setError(
          "Could not switch to the selected track.",
        );
      });
    }
  }, [trackId, getAudio]);

  useEffect(() => {
    return () => {
      const audio = audioRef.current;

      if (!audio) {
        return;
      }

      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    };
  }, []);

  return {
    isPlaying,
    error,
    play,
    pause,
    stop,
    setVolume,
  };
}