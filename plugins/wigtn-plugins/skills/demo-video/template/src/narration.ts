/**
 * Narration = the single source for captions AND for optional TTS audio.
 * Edit the script here; nothing else holds narration text.
 *
 * Keys are scene ids from Demo.tsx. Inside a scene the segments play back to back,
 * starting `off` frames after the scene starts (the `off` of the first segment).
 *
 * `id`   unique name of the line; its audio is public/audio/narration/<id>.<hash>.mp3
 * `text` the caption / spoken line. One plain double-quoted string on one line, written
 *        after `id`. The only escapes allowed are \" and \\ (scripts read this file as text
 *        and refuse anything they cannot read exactly).
 * `off`  start offset in frames (first segment of a scene only)
 * `est`  optional duration override in frames, captions-only mode. By default the duration is
 *        an estimate from word count; with NARRATION_AUDIO = true it is the audio length
 *        recorded in narration-manifest.json.
 */
import { FPS, WORDS_PER_SECOND } from "./config";
import { estimateSeconds } from "./core.mjs";

export type NarSeg = { id: string; text: string; off?: number; est?: number };

export const estimateFrames = (text: string) => Math.ceil(estimateSeconds(text, WORDS_PER_SECOND) * FPS);

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
