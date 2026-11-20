/**
 * Motion primitives. Everything is a pure function of `useCurrentFrame()`, so
 * every frame renders the same way every time. Nothing here moves at constant speed.
 */
import type React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1), // settles gently
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.5, 0, 0.75, 0),
};

/** Eased 0 → 1 progress starting at `start` (frames) over `dur` frames. */
export const ramp = (frame: number, start: number, dur: number, easing = EASE.out) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** Eased enter progress for an element that appears `delay` frames into its scene. */
export const useEnter = (delay = 0, dur = 24) => ramp(useCurrentFrame(), delay, dur);

/** Fade + short rise. `p` is a 0 → 1 progress from `ramp` / `useEnter`. */
export const reveal = (p: number, rise = 26): React.CSSProperties => ({
  opacity: p,
  transform: `translateY(${(1 - p) * rise}px)`,
});

export const mix = (t: number, a: number, b: number) => a + (b - a) * t;
