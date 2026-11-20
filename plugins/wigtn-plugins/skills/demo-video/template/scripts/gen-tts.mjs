/**
 * Optional narration audio. THIS CALLS A PAID EXTERNAL API (ElevenLabs text-to-speech).
 * Captions work without it; run it only after the person paying has approved the
 * provider, the voice/model and the character count that `--plan` prints.
 *
 *   node scripts/gen-tts.mjs --plan                 # no network, no key: segments + characters to be sent
 *   ELEVENLABS_API_KEY=... node scripts/gen-tts.mjs --confirm [--only id1,id2] [--force]
 *
 * Env: ELEVENLABS_API_KEY (required for --confirm; read from the environment only,
 *      never written to a file or printed), ELEVENLABS_VOICE_ID, ELEVENLABS_MODEL.
 *
 * - Reads segments (id + text) from src/narration.ts, the single source.
 * - Writes public/audio/narration/<id>.mp3 and the measured length in frames to
 *   narration-manifest.json. The film then plays each clip and sizes its captions to it.
 * - A segment whose text is unchanged since the last run is skipped (no charge) unless --force.
 * - To use another provider, replace `synthesize()`; keep the manifest shape { dur, hash }.
 *
 * To go back to captions only: delete public/audio/narration and reset the manifest to {}.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { flag, option, readConfig, readSegments } from "./_segments.mjs";

const FPS = readConfig("FPS", 30);
const VOICE = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // provider's stock voice
const MODEL = process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2";
const TAIL = 0.28; // seconds of breathing room after each clip
const MANIFEST = "narration-manifest.json";
const OUT_DIR = path.join("public", "audio", "narration");

const hashOf = (text) => crypto.createHash("sha256").update(`${VOICE}|${MODEL}|${text}`).digest("hex").slice(0, 16);

let manifest = {};
try {
  manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
} catch {
  manifest = {};
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
const todo = all
  .filter((s) => !wanted || wanted.has(s.id))
  .filter((s) => flag("--force") || manifest[s.id]?.hash !== hashOf(s.text) || !fs.existsSync(path.join(OUT_DIR, `${s.id}.mp3`)));
const chars = todo.reduce((a, s) => a + s.text.length, 0);

console.log(`provider  ElevenLabs text-to-speech (paid, billed per character)`);
console.log(`voice     ${VOICE}`);
console.log(`model     ${MODEL}`);
console.log(`segments  ${todo.length} to generate, ${all.length - todo.length} unchanged or not selected`);
for (const s of todo) console.log(`  ${s.id.padEnd(24)} ${String(s.text.length).padStart(5)} chars`);
console.log(`total     ${chars} characters would be sent`);

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
  console.error("\nELEVENLABS_API_KEY is not set. Nothing was sent.");
  console.error("Export it in your shell (do not put it in a file in this project), then run with --confirm.");
  console.error("Captions-only is a complete result: the film renders without audio.");
  process.exit(1);
}
if (!flag("--confirm")) {
  console.error("\nThis is a paid API call. Nothing was sent.");
  console.error("Get approval for the provider, voice/model and character count above, then run again with --confirm.");
  process.exit(1);
}

async function synthesize(text) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps`, {
    method: "POST",
    headers: { "xi-api-key": API, "content-type": "application/json" },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.0, use_speaker_boost: true },
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const j = await res.json();
  const ends = j.alignment?.character_end_times_seconds || j.normalized_alignment?.character_end_times_seconds || [];
  return {
    audio: Buffer.from(j.audio_base64, "base64"),
    seconds: ends.length ? ends[ends.length - 1] : text.length / 14, // fallback estimate
  };
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const save = () => fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
for (const s of todo) {
  try {
    const { audio, seconds } = await synthesize(s.text);
    fs.writeFileSync(path.join(OUT_DIR, `${s.id}.mp3`), audio);
    manifest[s.id] = { dur: Math.ceil((seconds + TAIL) * FPS), hash: hashOf(s.text) };
    save(); // after every segment, so a failure keeps what was already paid for
    console.log(`ok  ${s.id.padEnd(24)} ${seconds.toFixed(1)}s → ${manifest[s.id].dur} frames`);
  } catch (e) {
    console.error(`FAILED ${s.id}: ${e.message}`);
    process.exit(1);
  }
}
// Drop entries for segments that no longer exist, so stale audio is not played.
for (const id of Object.keys(manifest)) if (!all.some((s) => s.id === id)) delete manifest[id];
save();
console.log(`\nWrote ${MANIFEST}. Render stills again: scene lengths may need to follow the audio.`);
