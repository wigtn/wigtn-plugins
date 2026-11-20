// Pure rules shared by the renderer (src/*.tsx) and the scripts (scripts/*.mjs).
// No Node or browser APIs here: the same file runs in both, so the decision
// "is this audio still valid for this line" cannot differ between them.

export const MANIFEST_VERSION = 1;
/** Breathing room added after each audio clip, in seconds. */
export const TAIL_SECONDS = 0.28;
export const TIMINGS = ["measured", "aligned", "estimated"];

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

/** Estimated speaking time of a line, in seconds. */
export function estimateSeconds(text, wordsPerSecond) {
  return text.trim().split(/\s+/).length / wordsPerSecond + 0.3;
}

export function emptyManifest() {
  return { version: MANIFEST_VERSION, segments: {} };
}

/**
 * Throws when narration-manifest.json is not a manifest this version wrote.
 * A damaged manifest is never treated as empty: that would regenerate (and bill) everything.
 * @returns {Record<string, {text: string, voice: string, model: string, file: string, seconds: number, timing: string}>}
 */
export function validateManifest(m) {
  const bad = (why) => new Error(`narration-manifest.json is not valid (${why}).`);
  if (!isObject(m)) throw bad("not an object");
  if (m.version !== MANIFEST_VERSION) throw bad(`version must be ${MANIFEST_VERSION}`);
  if (!isObject(m.segments)) throw bad("segments must be an object");
  for (const [id, e] of Object.entries(m.segments)) {
    if (!isObject(e)) throw bad(`segment ${id} is not an object`);
    for (const k of ["text", "voice", "model", "file", "timing"]) {
      if (typeof e[k] !== "string" || !e[k]) throw bad(`segment ${id}: ${k} must be a non-empty string`);
    }
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*\.mp3$/.test(e.file)) throw bad(`segment ${id}: file must be a plain .mp3 name`);
    if (!TIMINGS.includes(e.timing)) throw bad(`segment ${id}: timing must be one of ${TIMINGS.join(", ")}`);
    if (!(Number.isFinite(e.seconds) && e.seconds > 0)) throw bad(`segment ${id}: seconds must be a positive number`);
  }
  return m.segments;
}

/**
 * Is the recorded audio for a segment generated from exactly this text, voice and model?
 * @returns {{state: "fresh" | "missing" | "stale", changed: string[]}}
 */
export function audioState(entry, want) {
  if (!entry) return { state: "missing", changed: [] };
  const changed = ["text", "voice", "model"].filter((k) => entry[k] !== want[k]);
  return { state: changed.length ? "stale" : "fresh", changed };
}

/**
 * Audio to play per segment id.
 * - enabled = false: captions only. The manifest is ignored, whatever it contains.
 * - enabled = true: every segment must have fresh audio. Anything else is an error,
 *   so a film never plays an old sentence under a new caption and never ships half voiced.
 * @returns {Record<string, {file: string, seconds: number, timing: string}>}
 */
export function resolveAudio({ enabled, manifest, segments, voice, model }) {
  if (!enabled) return {};
  const entries = validateManifest(manifest);
  const out = {};
  const problems = [];
  for (const s of segments) {
    const { state, changed } = audioState(entries[s.id], { text: s.text, voice, model });
    if (state === "fresh") out[s.id] = entries[s.id];
    else problems.push(state === "missing" ? `${s.id} (no audio)` : `${s.id} (${changed.join(", ")} changed)`);
  }
  if (problems.length) {
    throw new Error(
      `NARRATION_AUDIO is true but the audio does not match the script: ${problems.join("; ")}. ` +
        `Either set NARRATION_AUDIO = false in src/config.ts (captions only), or regenerate those segments ` +
        `with scripts/gen-tts.mjs (a paid call that needs approval). Nothing is regenerated automatically.`,
    );
  }
  return out;
}

/**
 * Lay the narration out on the global timeline and reject anything that would
 * collide. `scenes` are in film order; adjacent scenes overlap by `tr` frames.
 * `framesOf(segment)` gives a segment's length in frames.
 * @returns {{starts: Record<string, number>, total: number, items: {id: string, scene: string, text: string, from: number, frames: number}[]}}
 */
export function planNarration({ scenes, tr, narration, framesOf, gap, fps }) {
  const sec = (f) => `${(f / fps).toFixed(1)}s`;
  const starts = {};
  let acc = 0;
  for (const s of scenes) {
    if (s.id in starts) throw new Error(`Scene id "${s.id}" is used twice in SCENES.`);
    starts[s.id] = acc;
    acc += s.dur - tr;
  }
  const total = scenes.length ? acc + tr : 0;
  const durOf = Object.fromEntries(scenes.map((s) => [s.id, s.dur]));

  const items = [];
  const seen = new Set();
  for (const [scene, segs] of Object.entries(narration)) {
    if (!(scene in starts)) {
      throw new Error(`narration.ts has lines for scene "${scene}", but SCENES in Demo.tsx has no scene with that id.`);
    }
    let cursor = starts[scene] + (segs[0]?.off ?? 0);
    for (const s of segs) {
      if (seen.has(s.id)) throw new Error(`Narration segment id "${s.id}" is used twice.`);
      seen.add(s.id);
      const frames = framesOf(s);
      items.push({ id: s.id, scene, text: s.text, from: cursor, frames });
      cursor += frames + gap;
    }
    const end = cursor - gap;
    if (segs.length && end > starts[scene] + durOf[scene]) {
      throw new Error(
        `Scene "${scene}" is ${sec(durOf[scene])} but its narration needs ${sec(end - starts[scene])}. ` +
          `Lengthen the scene in src/Demo.tsx or trim its text in src/narration.ts.`,
      );
    }
  }
  items.sort((a, b) => a.from - b.from);
  for (let i = 1; i < items.length; i++) {
    const a = items[i - 1];
    const b = items[i];
    if (a.from + a.frames > b.from) {
      throw new Error(
        `Narration "${a.id}" (scene "${a.scene}") is still running when "${b.id}" (scene "${b.scene}") starts: ` +
          `they overlap by ${a.from + a.frames - b.from} frames across the transition. ` +
          `Shorten "${a.id}", lengthen scene "${a.scene}", or raise the off of "${b.id}".`,
      );
    }
  }
  return { starts, total, items };
}
