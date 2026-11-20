import React from "react";
import { AbsoluteFill } from "remotion";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";

/**
 * Fade through the background. The exiting scene fades out over the first half and
 * the entering scene fades in over the second half, so two scenes' text never ghost
 * over each other. What shows in between is the root background, which is the same
 * color as every scene background: no flash, no white frame. Nothing is scaled below 1.
 */
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const DissolveC: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({
  children,
  presentationProgress: p,
  presentationDirection,
}) => {
  const opacity = presentationDirection === "entering" ? clamp01(p * 2 - 1) : clamp01(1 - p * 2);
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

export const dissolve = (): TransitionPresentation<Record<string, never>> => ({
  component: DissolveC,
  props: {},
});
