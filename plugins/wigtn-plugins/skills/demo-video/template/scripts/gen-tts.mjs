/**
 * Optional narration audio. THIS CALLS A PAID EXTERNAL API (ElevenLabs text-to-speech).
 * Captions work without it; run it only after the person paying has approved the
 * provider, the voice/model and the character count that `--plan` prints.
 *
 *   node scripts/gen-tts.mjs --plan       # no network, no key: what would be sent, and the state of each line
 *   node scripts/gen-tts.mjs --confirm [--only id1,id2] [--force]
 *
 * The API key is read from the ELEVENLABS_API_KEY environment variable of the shell
 * that runs this. Set it in your shell profile or secret manager; do not type the
 * value on the command line, do not put it in a file in this project. It is never
 * written or printed. Voice and model are TTS_VOICE / TTS_MODEL in src/config.ts.
 *
 * What it writes
 * - public/audio/narration/<id>.<hash of the audio>.mp3: a new file per generation,
 *   so audio the current manifest points at is never overwritten.
 * - narration-manifest.json, replaced atomically (temp file + rename) after each
 *   segment. Each entry records the text, voice and model the audio was made from,
 *   the file, its length in seconds and how that length was obtained:
 *     measured  = ffprobe read the mp3
 *     aligned   = last character timestamp returned by the provider (no ffprobe found)
 *     estimated = guessed from the character count (neither was available)
 * - A segment whose text, voice and model are unchanged is skipped (no charge) unless --force.
 *
 * The renderer uses the same rule (src/core.mjs): with NARRATION_AUDIO = true in
 * src/config.ts, a line whose audio was made from different text fails the build.
 *
 * Errors print a short code only. Provider responses and raw exception messages
 * are never printed: they can echo the text, account details or credentials.
 * To use another provider, replace `synthesize()`; keep the manifest shape.
 */
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { audioState, emptyManifest, validateManifest } from "../src/core.mjs";
import { flag, option, readConfig, readSegments } from "./_segments.mjs";

const VOICE = readConfig("TTS_VOICE", "");
const MODEL = readConfig("TTS_MODEL", "");
const MANIFEST = "narration-manifest.json";
const OUT_DIR = path.join("public", "audio", "narration");

class CodedError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}
/** A fixed, allow-listed description of a failure. Never derived from a response body. */
const HTTP_CODES = {
  400: "bad_request",
  401: "unauthorized",
  402: "payment_required",
  403: "forbidden",
  404: "voice_or_model_not_found",
  422: "invalid_request",
  429: "rate_limited",
};
const httpCode = (status) => `http_${status}_${HTTP_CODES[status] || (status >= 500 ? "provider_error" : "error")}`;
/** Only a Node errno name such as ENOSPC is safe to show from a file-system error. */
const fsCode = (e, what) => `${what}_failed${typeof e?.code === "string" && /^E[A-Z0-9]+$/.test(e.code) ? `_${e.code}` : ""}`;

if (!/^[A-Za-z0-9_-]+$/.test(VOICE) || !/^[A-Za-z0-9_.-]+$/.test(MODEL)) {
  console.error('src/config.ts must define TTS_VOICE and TTS_MODEL as plain strings, e.g. export const TTS_VOICE = "...";');
  process.exit(2);
}

// A manifest that cannot be read is an explicit stop, never "empty": treating it as
// empty would regenerate, and bill, every segment.
let manifest;
if (fs.existsSync(MANIFEST)) {
  try {
    manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
    validateManifest(manifest);
  } catch (e) {
    const why = e instanceof SyntaxError ? "it is not valid JSON" : e.message;
    console.error(`${MANIFEST} cannot be used: ${why}`);
    console.error("Nothing was sent. Restore the file from version control. To start over on purpose (audio will");
    console.error(`be generated and billed again), replace its content with ${JSON.stringify(emptyManifest())}`);
    process.exit(2);
  }
} else {
  manifest = emptyManifest();
}

const only = option("--only", "");
const wanted = only ? new Set(only.split(",").map((s) => s.trim())) : null;
const all = readSegments();
if (wanted) {
  const unknown = [...wanted].filter((id) => !all.some((s) => s.id === id));
  if (unknown.length) {
    console.error(`Unknown segment id(s) for --only: ${unknown.join(", ")}`);
    process.exit(2);
  }
}
const stateOf = (s) => {
  const entry = manifest.segments[s.id];
  const st = audioState(entry, { text: s.text, voice: VOICE, model: MODEL });
  if (st.state === "fresh" && !fs.existsSync(path.join(OUT_DIR, entry.file))) return { state: "missing", changed: [] };
  return st;
};
const todo = all.filter((s) => (!wanted || wanted.has(s.id)) && (flag("--force") || stateOf(s).state !== "fresh"));
const chars = todo.reduce((a, s) => a + s.text.length, 0);

console.log(`provider  ElevenLabs text-to-speech (paid, billed per character)`);
console.log(`voice     ${VOICE}`);
console.log(`model     ${MODEL}`);
for (const s of all) {
  const st = stateOf(s);
  const label = st.state === "stale" ? `stale (${st.changed.join(", ")} changed)` : st.state === "fresh" ? "fresh" : "no audio";
  console.log(`  ${todo.includes(s) ? "send" : "skip"}  ${s.id.padEnd(24)} ${String(s.text.length).padStart(5)} chars  ${label}`);
}
console.log(`total     ${todo.length} of ${all.length} segments, ${chars} characters would be sent`);

if (flag("--plan")) {
  console.log("\nPlan only. Nothing was sent.");
  process.exit(0);
}
if (!todo.length) {
  console.log("\nNothing to generate.");
  process.exit(0);
}
const API = process.env.ELEVENLABS_API_KEY;
if (!API) {
  console.error("\nELEVENLABS_API_KEY is not set in this shell. Nothing was sent.");
  console.error("Set it in your shell environment (not in a file in this project), then run with --confirm.");
  console.error("Captions-only is a complete result: the film renders without audio.");
  process.exit(1);
}
if (!flag("--confirm")) {
  console.error("\nThis is a paid API call. Nothing was sent.");
  console.error("Get approval for the provider, voice/model and character count above, then run again with --confirm.");
  process.exit(1);
}

async function synthesize(text) {
  let res;
  try {
    res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps`, {
      method: "POST",
      headers: { "xi-api-key": API, "content-type": "application/json" },
      body: JSON.stringify({
        text,
        model_id: MODEL,
        voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.0, use_speaker_boost: true },
      }),
    });
  } catch {
    throw new CodedError("network_error");
  }
  if (!res.ok) throw new CodedError(httpCode(res.status)); // the body is deliberately not read
  let j;
  try {
    j = await res.json();
  } catch {
    throw new CodedError("bad_response_not_json");
  }
  const audio = typeof j?.audio_base64 === "string" ? Buffer.from(j.audio_base64, "base64") : null;
  if (!audio || audio.length < 64) throw new CodedError("bad_response_no_audio");
  const ends = j.alignment?.character_end_times_seconds || j.normalized_alignment?.character_end_times_seconds;
  const last = Array.isArray(ends) ? ends[ends.length - 1] : undefined;
  return { audio, alignedSeconds: Number.isFinite(last) && last > 0 ? last : null };
}

function findFfprobe() {
  const found = [process.env.FFPROBE, "ffprobe"].filter(Boolean);
  const scope = path.join("node_modules", "@remotion");
  if (fs.existsSync(scope)) {
    for (const pkg of fs.readdirSync(scope).filter((n) => n.startsWith("compositor-"))) {
      for (const name of ["ffprobe", "ffprobe.exe"]) {
        const bin = path.resolve(scope, pkg, name);
        if (fs.existsSync(bin)) found.push(bin);
      }
    }
  }
  return found;
}

/** Length of the mp3 as ffprobe reads it, or null when no ffprobe works. */
function measureSeconds(file) {
  for (const bin of findFfprobe()) {
    try {
      const env = { ...process.env };
      if (path.isAbsolute(bin)) {
        const libs = path.dirname(bin);
        env.DYLD_LIBRARY_PATH = [libs, env.DYLD_LIBRARY_PATH].filter(Boolean).join(":");
        env.LD_LIBRARY_PATH = [libs, env.LD_LIBRARY_PATH].filter(Boolean).join(":");
      }
      const out = execFileSync(bin, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], {
        env,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
      const v = Number(out.trim());
      if (Number.isFinite(v) && v > 0) return v;
    } catch {
      /* try the next one */
    }
  }
  return null;
}

/** Replace the manifest in one step: readers see the old file or the new one, never half of either. */
function writeManifest(next) {
  const tmp = `${MANIFEST}.tmp-${process.pid}`;
  try {
    fs.writeFileSync(tmp, JSON.stringify(next, null, 2) + "\n");
    fs.renameSync(tmp, MANIFEST);
  } catch (e) {
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* nothing to clean */
    }
    throw new CodedError(fsCode(e, "manifest_write"));
  }
  manifest = next;
}

/** New audio goes to a new, content-named file. Files the manifest points at are not touched. */
function storeAudio(id, audio) {
  const name = `${id}.${crypto.createHash("sha256").update(audio).digest("hex").slice(0, 12)}.mp3`;
  const dest = path.join(OUT_DIR, name);
  const tmp = path.join(OUT_DIR, `.${name}.tmp-${process.pid}`);
  try {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(tmp, audio);
    fs.renameSync(tmp, dest);
  } catch (e) {
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* nothing to clean */
    }
    throw new CodedError(fsCode(e, "audio_write"));
  }
  return name;
}

/** Delete audio files no manifest entry points at. Runs only after a manifest write succeeded. */
function collectGarbage() {
  const keep = new Set(Object.values(manifest.segments).map((e) => e.file));
  let files = [];
  try {
    files = fs.readdirSync(OUT_DIR);
  } catch {
    return;
  }
  for (const f of files) {
    if (f.endsWith(".mp3") && !keep.has(f)) {
      try {
        fs.unlinkSync(path.join(OUT_DIR, f));
      } catch {
        /* a leftover file is harmless */
      }
    }
  }
}

let guessed = 0;
try {
  for (const s of todo) {
    let step = "request";
    try {
      const { audio, alignedSeconds } = await synthesize(s.text);
      step = "store";
      const file = storeAudio(s.id, audio);
      const measured = measureSeconds(path.join(OUT_DIR, file));
      const seconds = measured ?? alignedSeconds ?? s.text.length / 14;
      const timing = measured ? "measured" : alignedSeconds ? "aligned" : "estimated";
      if (timing === "estimated") guessed++;
      // After every segment, so a later failure keeps what was already paid for.
      writeManifest({
        version: manifest.version,
        segments: {
          ...manifest.segments,
          [s.id]: { text: s.text, voice: VOICE, model: MODEL, file, seconds: Number(seconds.toFixed(3)), timing },
        },
      });
      console.log(`ok    ${s.id.padEnd(24)} ${seconds.toFixed(2)}s (${timing})`);
    } catch (e) {
      const code = e instanceof CodedError ? e.code : "unexpected_error";
      console.error(`FAILED ${s.id}: ${code} (during ${step})`);
      console.error("Segments marked ok above are saved. This segment's previous audio, if any, is unchanged.");
      process.exit(1);
    }
  }
  // Drop entries for lines that no longer exist, then remove files nothing points at.
  const live = Object.fromEntries(Object.entries(manifest.segments).filter(([id]) => all.some((s) => s.id === id)));
  if (Object.keys(live).length !== Object.keys(manifest.segments).length) {
    writeManifest({ version: manifest.version, segments: live });
  }
  collectGarbage();
} catch (e) {
  console.error(`FAILED: ${e instanceof CodedError ? e.code : "unexpected_error"}`);
  process.exit(1);
}

const pending = all.filter((s) => stateOf(s).state !== "fresh").map((s) => s.id);
console.log(`\nWrote ${MANIFEST}.`);
if (guessed) console.log(`${guessed} length(s) are estimated, not measured: check those captions against the audio by ear.`);
if (pending.length) {
  console.log(`Still without current audio: ${pending.join(", ")}. Keep NARRATION_AUDIO = false until every line has audio.`);
} else {
  console.log("Every line has current audio. Set NARRATION_AUDIO = true in src/config.ts, then check the composition:");
  console.log("  npx remotion compositions      # scene lengths may need to follow the audio");
}
