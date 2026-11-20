#!/usr/bin/env node
/**
 * Measure a rendered video with ffprobe and compare it with what the venue asks for.
 *
 *   node check-video.mjs <video> [--max-seconds N] [--min-seconds N] [--width W] [--height H]
 *                                [--fps F] [--require-audio | --forbid-audio] [--max-mb N] [--json]
 *
 * Prints duration, width x height, fps, whether an audio stream exists, and file size.
 * Limits are compared with the raw measured values; rounding is for display only.
 *
 * --require-audio / --forbid-audio test whether an AUDIO STREAM EXISTS. A silent
 * stream passes --require-audio. This script cannot tell whether speech is present
 * or whether it reads the right script: listen to the film for that.
 * Exit 0 = measured and every expectation holds
 *      1 = measured, at least one expectation failed (each is listed)
 *      2 = could not measure (bad arguments, file missing, ffprobe missing)
 *
 * ffprobe is looked up in this order: $FFPROBE, PATH, then the copy bundled with
 * Remotion under node_modules (searched upward from the current directory and from the video).
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const NUMERIC = ["--max-seconds", "--min-seconds", "--width", "--height", "--fps", "--max-mb"];
const FLAGS = ["--require-audio", "--forbid-audio", "--json"];
const opts = {};
let file = null;
const die = (msg) => {
  console.error(`check-video: ${msg}`);
  process.exit(2);
};
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (NUMERIC.includes(a)) {
    const v = Number(argv[++i]);
    if (!(Number.isFinite(v) && v > 0)) die(`${a} needs a positive, finite number`);
    opts[a] = v;
  } else if (FLAGS.includes(a)) {
    opts[a] = true;
  } else if (a.startsWith("--")) {
    die(`unknown option ${a}`);
  } else if (file) {
    die("give exactly one video file");
  } else {
    file = a;
  }
}
if (!file) die("usage: check-video.mjs <video> [--max-seconds N] [--width W] [--height H] [--fps F] [--require-audio|--forbid-audio] [--max-mb N] [--json]");
if (opts["--require-audio"] && opts["--forbid-audio"]) die("--require-audio and --forbid-audio cannot be combined");
if (opts["--min-seconds"] !== undefined && opts["--max-seconds"] !== undefined && opts["--min-seconds"] > opts["--max-seconds"]) {
  die("--min-seconds is larger than --max-seconds");
}
if (!fs.existsSync(file)) die(`file not found: ${file}`);

function bundled(start) {
  for (let dir = path.resolve(start); ; dir = path.dirname(dir)) {
    const scope = path.join(dir, "node_modules", "@remotion");
    if (fs.existsSync(scope)) {
      for (const pkg of fs.readdirSync(scope).filter((n) => n.startsWith("compositor-"))) {
        for (const name of ["ffprobe", "ffprobe.exe"]) {
          const bin = path.join(scope, pkg, name);
          if (fs.existsSync(bin)) return bin;
        }
      }
    }
    if (dir === path.dirname(dir)) return null;
  }
}

function probe(bin) {
  const libs = path.isAbsolute(bin) ? path.dirname(bin) : "";
  const env = { ...process.env };
  if (libs) {
    // The bundled binary keeps its shared libraries next to it.
    env.DYLD_LIBRARY_PATH = [libs, env.DYLD_LIBRARY_PATH].filter(Boolean).join(":");
    env.LD_LIBRARY_PATH = [libs, env.LD_LIBRARY_PATH].filter(Boolean).join(":");
  }
  return execFileSync(bin, ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", file], {
    env,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 16 * 1024 * 1024,
  });
}

const candidates = [process.env.FFPROBE, "ffprobe", bundled(process.cwd()), bundled(path.dirname(file))].filter(Boolean);
let raw = null;
let used = null;
let lastError = "";
for (const bin of candidates) {
  try {
    raw = probe(bin);
    used = bin;
    break;
  } catch (e) {
    if (e.code !== "ENOENT") lastError = String(e.stderr || e.message).trim();
  }
}
if (raw === null) {
  if (lastError) die(`ffprobe could not read ${file}: ${lastError}`);
  die(
    "ffprobe not found. Install ffmpeg (macOS: brew install ffmpeg, Debian/Ubuntu: apt install ffmpeg), " +
      "set FFPROBE=/path/to/ffprobe, or run this from the video project after `npm install` " +
      "(Remotion bundles one). Nothing was measured.",
  );
}

let info;
try {
  info = JSON.parse(raw);
} catch {
  die(`ffprobe (${used}) did not return JSON for ${file}. Nothing was measured.`);
}
const streams = Array.isArray(info?.streams) ? info.streams : [];
const video = streams.find((s) => s.codec_type === "video");
const audio = streams.filter((s) => s.codec_type === "audio");
if (!video) die(`no video stream in ${file}`);
const ratio = (r) => {
  const m = /^(\d+(?:\.\d+)?)(?:\/(\d+(?:\.\d+)?))?$/.exec(String(r ?? ""));
  if (!m) return NaN;
  const d = m[2] === undefined ? 1 : Number(m[2]);
  return d > 0 ? Number(m[1]) / d : NaN;
};
const positive = (v) => Number.isFinite(v) && v > 0;
const avg = ratio(video.avg_frame_rate);
// Raw values: every comparison below uses these.
const m = {
  file: path.resolve(file),
  seconds: Number(info.format?.duration ?? video.duration),
  width: Number(video.width),
  height: Number(video.height),
  fps: positive(avg) ? avg : ratio(video.r_frame_rate),
  videoCodec: video.codec_name ?? null,
  audioStreams: audio.length,
  audioCodec: audio[0]?.codec_name ?? null,
  megabytes: fs.statSync(file).size / 1e6,
  ffprobe: used,
};
for (const k of ["seconds", "width", "height", "fps"]) {
  if (!positive(m[k])) die(`ffprobe reported no usable ${k} for ${file}. Nothing was checked.`);
}

const fails = [];
const want = (key, ok, text) => {
  if (opts[key] !== undefined && !ok) fails.push(text);
};
want("--max-seconds", m.seconds <= opts["--max-seconds"], `duration ${m.seconds}s is over the limit of ${opts["--max-seconds"]}s`);
want("--min-seconds", m.seconds >= opts["--min-seconds"], `duration ${m.seconds}s is under the minimum of ${opts["--min-seconds"]}s`);
want("--width", m.width === opts["--width"], `width ${m.width} is not ${opts["--width"]}`);
want("--height", m.height === opts["--height"], `height ${m.height} is not ${opts["--height"]}`);
want("--fps", Math.abs(m.fps - opts["--fps"]) < 0.01, `fps ${m.fps} is not ${opts["--fps"]}`);
want("--require-audio", m.audioStreams > 0, "no audio stream, but one is required");
want("--forbid-audio", m.audioStreams === 0, `${m.audioStreams} audio stream(s) present, but none is allowed`);
want("--max-mb", m.megabytes <= opts["--max-mb"], `size ${m.megabytes} MB is over ${opts["--max-mb"]} MB`);

// Display values: rounded up for size and duration so a rounded number never looks inside a limit it exceeds.
const up = (v, digits) => Math.ceil(v * 10 ** digits - 1e-9) / 10 ** digits;
if (opts["--json"]) {
  console.log(JSON.stringify({ ...m, ok: fails.length === 0, failures: fails }, null, 2));
} else {
  const shown = up(m.seconds, 3);
  const mm = Math.floor(shown / 60);
  const ss = (shown - mm * 60).toFixed(1).padStart(4, "0");
  console.log(`file        ${m.file}`);
  console.log(`duration    ${shown}s (${mm}:${ss})`);
  console.log(`resolution  ${m.width}x${m.height}`);
  console.log(`fps         ${Number(m.fps.toFixed(3))}`);
  console.log(`video       ${m.videoCodec}`);
  console.log(`audio       ${m.audioStreams ? `stream present (${m.audioCodec}); not checked for speech` : "no stream"}`);
  console.log(`size        ${up(m.megabytes, 2)} MB`);
  for (const f of fails) console.log(`FAIL        ${f}`);
  if (!fails.length) console.log("result      ok");
}
process.exit(fails.length ? 1 : 0);
