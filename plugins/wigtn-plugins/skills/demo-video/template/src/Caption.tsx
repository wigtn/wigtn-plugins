import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import manifest from "../narration-manifest.json";
import { FPS, NARRATION_AUDIO, TTS_MODEL, TTS_VOICE } from "./config";
import { resolveAudio, TAIL_SECONDS } from "./core.mjs";
import { ramp } from "./motion";
import { estimateFrames, NARRATION, type NarSeg } from "./narration";
import { FONT, TYPE, useTheme } from "./theme";

// Audio per segment id. Empty in captions-only mode (NARRATION_AUDIO = false).
// With audio on, this throws at build time unless every line has audio generated
// from its current text, voice and model: an old recording is never played under
// a new caption. The rule lives in core.mjs and scripts/gen-tts.mjs uses the same one.
const AUDIO = resolveAudio({
  enabled: NARRATION_AUDIO,
  manifest,
  segments: Object.values(NARRATION).flat(),
  voice: TTS_VOICE,
  model: TTS_MODEL,
});

/** Length of a segment in frames: its audio (plus a short tail) when it has one, else an estimate. */
export const segFrames = (s: NarSeg) => {
  const a = AUDIO[s.id];
  return a ? Math.ceil((a.seconds + TAIL_SECONDS) * FPS) : (s.est ?? estimateFrames(s.text));
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

export type NarrationItem = { id: string; scene: string; text: string; from: number; frames: number };

/**
 * Global narration layer, rendered outside the TransitionSeries so a line is not
 * cut off by a scene transition. `items` is the checked schedule from planNarration
 * (Demo.tsx). Each segment plays one audio clip (when it has one); its caption is
 * chunked by sentence and each chunk gets a share of the length by character count.
 */
export const Narration: React.FC<{ items: NarrationItem[] }> = ({ items }) => {
  return (
    <>
      {items.map((s) => {
        const chunks = chunkText(s.text);
        const totalChars = chunks.reduce((a, c) => a + c.length, 0) || 1;
        const audio = AUDIO[s.id];
        let acc = 0;
        return (
          <Sequence key={s.id} from={s.from} durationInFrames={s.frames} layout="none">
            {audio ? <Audio src={staticFile(`audio/narration/${audio.file}`)} /> : null}
            {chunks.map((c, i) => {
              const start = acc;
              const slice =
                i === chunks.length - 1 ? s.frames - acc : Math.max(16, Math.round((s.frames * c.length) / totalChars));
              acc += slice;
              return (
                <Sequence key={i} from={start} durationInFrames={Math.max(1, slice)} layout="none">
                  <CaptionLine text={c} dur={Math.max(1, slice)} />
                </Sequence>
              );
            })}
          </Sequence>
        );
      })}
    </>
  );
};
