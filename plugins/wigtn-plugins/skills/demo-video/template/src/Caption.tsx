import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import manifest from "../narration-manifest.json";
import { GAP_FRAMES } from "./config";
import { ramp } from "./motion";
import { estimateFrames, NARRATION, type NarSeg } from "./narration";
import { FONT, TYPE, useTheme } from "./theme";

// scripts/gen-tts.mjs writes the measured audio length (frames) per segment id.
// A segment without an entry shows its caption for an estimated time, with no audio.
const M = manifest as Record<string, { dur: number } | undefined>;

export const segFrames = (s: NarSeg) => M[s.id]?.dur ?? s.est ?? estimateFrames(s.text);

/** Frames a scene's narration needs, counted from the scene start. */
export const sceneNarrationFrames = (sceneId: string) => {
  const segs = NARRATION[sceneId] ?? [];
  if (!segs.length) return 0;
  return (segs[0].off ?? 0) + segs.reduce((a, s) => a + segFrames(s), 0) + GAP_FRAMES * (segs.length - 1);
};

const LONG = 96; // a sentence longer than this is split once, at a natural break

/**
 * Sentence-level captions (split on . ! ?). Only a very long sentence is split once
 * more, at the ; : , or dash nearest its middle, so a caption is at most two lines
 * and never a mid-phrase fragment.
 */
export function chunkText(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+(?:["')\]]+)?|\S[^.!?]*$/g) || [text];
  const out: string[] = [];
  for (const raw of sentences) {
    const s = raw.trim();
    if (!s) continue;
    if (s.length > LONG) {
      const seps = [...s.matchAll(/[—;:,]/g)].map((m) => m.index as number);
      if (seps.length) {
        const mid = s.length / 2;
        const at = seps.reduce((a, b) => (Math.abs(b - mid) < Math.abs(a - mid) ? b : a));
        out.push(s.slice(0, at + 1).trim());
        out.push(s.slice(at + 1).trim());
        continue;
      }
    }
    out.push(s);
  }
  return out;
}

const CaptionLine: React.FC<{ text: string; dur: number }> = ({ text, dur }) => {
  const f = useCurrentFrame();
  const t = useTheme();
  const opacity = Math.min(ramp(f, 0, 6), 1 - ramp(f, dur - 6, 6));
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: 1400,
          margin: "0 80px 44px",
          padding: "12px 32px",
          borderRadius: 12,
          background: t.captionBg, // solid: stays readable over any footage
          opacity,
          textAlign: "center",
          textWrap: "balance",
        }}
      >
        <span
          style={{
            fontFamily: FONT,
            fontSize: TYPE.caption,
            fontWeight: 500,
            lineHeight: 1.3,
            color: t.captionInk,
          }}
        >
          {text}
        </span>
      </div>
    </AbsoluteFill>
  );
};

/**
 * Global narration layer, rendered outside the TransitionSeries so a line is not
 * cut off by a scene transition. `starts` maps scene id → global start frame.
 * Each segment plays one audio clip (when generated); its caption is chunked by
 * sentence and each chunk gets a share of the audio length by character count.
 */
export const Narration: React.FC<{ starts: Record<string, number> }> = ({ starts }) => {
  const items: React.ReactNode[] = [];
  for (const scene of Object.keys(NARRATION)) {
    const segs = NARRATION[scene];
    let cursor = (starts[scene] ?? 0) + (segs[0]?.off ?? 0);
    for (const s of segs) {
      const dur = segFrames(s);
      const from = cursor;
      cursor += dur + GAP_FRAMES;
      const chunks = chunkText(s.text);
      const totalChars = chunks.reduce((a, c) => a + c.length, 0) || 1;
      let acc = 0;
      items.push(
        <Sequence key={s.id} from={from} durationInFrames={dur} layout="none">
          {M[s.id] ? <Audio src={staticFile(`audio/narration/${s.id}.mp3`)} /> : null}
          {chunks.map((c, i) => {
            const start = acc;
            const slice =
              i === chunks.length - 1 ? dur - acc : Math.max(16, Math.round((dur * c.length) / totalChars));
            acc += slice;
            return (
              <Sequence key={i} from={start} durationInFrames={Math.max(1, slice)} layout="none">
                <CaptionLine text={c} dur={Math.max(1, slice)} />
              </Sequence>
            );
          })}
        </Sequence>,
      );
    }
  }
  return <>{items}</>;
};
