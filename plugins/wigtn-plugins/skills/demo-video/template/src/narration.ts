/**
 * Narration = the single source for captions AND for optional TTS audio.
 * Edit the script here; nothing else holds narration text.
 *
 * Keys are scene ids from Demo.tsx. Inside a scene the segments play back to back,
 * starting `off` frames after the scene starts (the `off` of the first segment).
 *
 * `id`   audio file public/audio/narration/<id>.mp3 (written by scripts/gen-tts.mjs)
 * `text` the caption / spoken line. Plain double-quoted string on one line:
 *        scripts/gen-tts.mjs and scripts/budget.mjs read this file with a regex.
 * `off`  start offset in frames (first segment of a scene only)
 * `est`  optional duration override in frames. By default the duration is the measured
 *        audio length from narration-manifest.json, else an estimate from word count.
 */
import { FPS, WORDS_PER_SECOND } from "./config";

export type NarSeg = { id: string; text: string; off?: number; est?: number };

export const estimateFrames = (text: string) =>
  Math.ceil((text.trim().split(/\s+/).length / WORDS_PER_SECOND + 0.3) * FPS);

export const NARRATION: Record<string, NarSeg[]> = {
  title: [
    { id: "title", off: 12, text: "Open with what the system is." },
  ],
  footage: [
    { id: "footage-1", off: 12, text: "Real product footage plays here, and the camera zooms to the part being explained." },
  ],
  points: [
    { id: "points", off: 12, text: "State each result once, with its source." },
  ],
  outro: [
    { id: "outro", off: 12, text: "End with where to find the system." },
  ],
};
