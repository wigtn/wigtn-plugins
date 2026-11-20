import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { Narration, segFrames } from "./Caption";
import { FPS, GAP_FRAMES, LIMIT_SECONDS } from "./config";
import { planNarration } from "./core.mjs";
import { NARRATION } from "./narration";
import { Footage } from "./scenes/Footage";
import { Outro } from "./scenes/Outro";
import { Points } from "./scenes/Points";
import { Title } from "./scenes/Title";
import { FONT, ThemeContext, THEMES, type ThemeName } from "./theme";
import { dissolve } from "./transitions";

const S = (seconds: number) => Math.round(seconds * FPS);

/** Length of the dissolve between scenes, in frames. Adjacent scenes overlap by this much. */
const TR = 16;

/**
 * The timeline. One line per scene; the duration is the `S(seconds)` on that line.
 * `id` links the scene to its narration in narration.ts.
 */
export const SCENES: { id: string; dur: number; el: React.ReactNode }[] = [
  {
    id: "title",
    dur: S(4),
    el: <Title eyebrow="SYSTEM DEMONSTRATION" title="Your System Name" subtitle="One sentence that says what it does and for whom" meta="Authors · Affiliation" />,
  },
  {
    id: "footage",
    dur: S(7),
    el: <Footage slot="main" label="What the viewer is looking at" zooms={[{ at: 2.5, hold: 2, x: 853, y: 120, w: 1067, h: 600 }]} />,
  },
  {
    id: "points",
    dur: S(4),
    el: (
      <Points
        heading="Results, each with its source"
        points={[
          { value: "Value", label: "what it measures", source: "Table N / file @ commit" },
          { value: "Value", label: "what it measures", source: "Table N / file @ commit" },
          { value: "Value", label: "what it measures", source: "Table N / file @ commit" },
        ]}
      />
    ),
  },
  {
    id: "outro",
    dur: S(4),
    el: <Outro title="Your System Name" lines={["example.org/your-system", "Paper · code · license"]} />,
  },
];

// One pass lays out every narration line on the global timeline and throws when
// a line names an unknown scene, runs past its scene, or is still running when the
// next line starts (which can happen across a transition, where scenes overlap).
const PLAN = planNarration({
  scenes: SCENES.map(({ id, dur }) => ({ id, dur })),
  tr: TR,
  narration: NARRATION,
  framesOf: segFrames,
  gap: GAP_FRAMES,
  fps: FPS,
});

export const TOTAL: number = PLAN.total;

/** Global start frame of each scene (transitions overlap by TR frames). */
export const SCENE_STARTS: Record<string, number> = PLAN.starts;

// Fail the build instead of shipping a film that breaks a constraint.
// Note: only evaluating the composition runs these checks (`npx remotion compositions`,
// a still, a render). `tsc` does not.
if (TOTAL > S(LIMIT_SECONDS)) {
  throw new Error(
    `Timeline is ${(TOTAL / FPS).toFixed(1)}s but LIMIT_SECONDS is ${LIMIT_SECONDS}s (src/config.ts). Shorten scenes in src/Demo.tsx.`,
  );
}

const timing = () => linearTiming({ durationInFrames: TR, easing: Easing.bezier(0.65, 0, 0.35, 1) });

export const Demo: React.FC<{ theme?: ThemeName }> = ({ theme = "dark" }) => {
  const t = THEMES[theme];
  return (
    <ThemeContext.Provider value={t}>
      {/* The root background equals the scene background, so no other color can show through. */}
      <AbsoluteFill style={{ backgroundColor: t.bg, fontFamily: FONT }}>
        <TransitionSeries>
          {SCENES.flatMap((s, i) => {
            const seq = (
              <TransitionSeries.Sequence key={s.id} durationInFrames={s.dur}>
                {s.el}
              </TransitionSeries.Sequence>
            );
            if (i === SCENES.length - 1) return [seq];
            return [seq, <TransitionSeries.Transition key={`${s.id}-out`} presentation={dissolve()} timing={timing()} />];
          })}
        </TransitionSeries>
        <Narration items={PLAN.items} />
      </AbsoluteFill>
    </ThemeContext.Provider>
  );
};
