#!/usr/bin/env node
/**
 * Measure a rendered video with ffprobe and compare it with what the venue asks for.
 *
 *   node check-video.mjs <video> [--max-seconds N] [--min-seconds N] [--width W] [--height H]
 *                                [--fps F] [--require-audio | --forbid-audio] [--max-mb N] [--json]
 *
 * Prints duration, width x height, fps, whether an audio stream exists, and file size.
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
    if (!(v > 0)) die(`${a} needs a positive number`);
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

const info = JSON.parse(raw);
const video = (info.streams || []).find((s) => s.codec_type === "video");
const audio = (info.streams || []).filter((s) => s.codec_type === "audio");
if (!video) die(`no video stream in ${file}`);
const ratio = (r) => {
  const [n, d] = String(r || "0/1").split("/").map(Number);
  return d ? n / d : 0;
};
const m = {
  file: path.resolve(file),
  seconds: Number(Number(info.format?.duration ?? video.duration ?? 0).toFixed(3)),
  width: video.width,
  height: video.height,
  fps: Number((ratio(video.avg_frame_rate) || ratio(video.r_frame_rate)).toFixed(3)),
  videoCodec: video.codec_name,
  audioStreams: audio.length,
  audioCodec: audio[0]?.codec_name ?? null,
  megabytes: Number((fs.statSync(file).size / 1e6).toFixed(2)),
  ffprobe: used,
};

const fails = [];
const want = (key, ok, text) => {
  if (opts[key] !== undefined && !ok) fails.push(text);
};
want("--max-seconds", m.seconds <= opts["--max-seconds"], `duration ${m.seconds}s is over the limit of ${opts["--max-seconds"]}s`);
want("--min-seconds", m.seconds >= opts["--min-seconds"], `duration ${m.seconds}s is under the minimum of ${opts["--min-seconds"]}s`);
want("--width", m.width === opts["--width"], `width ${m.width} is not ${opts["--width"]}`);
want("--height", m.height === opts["--height"], `height ${m.height} is not ${opts["--height"]}`);
want("--fps", Math.abs(m.fps - opts["--fps"]) < 0.01, `fps ${m.fps} is not ${opts["--fps"]}`);
want("--require-audio", m.audioStreams > 0, "no audio stream, but narration audio was requested");
want("--forbid-audio", m.audioStreams === 0, `${m.audioStreams} audio stream(s) present, but none was requested`);
want("--max-mb", m.megabytes <= opts["--max-mb"], `size ${m.megabytes} MB is over ${opts["--max-mb"]} MB`);

if (opts["--json"]) {
  console.log(JSON.stringify({ ...m, ok: fails.length === 0, failures: fails }, null, 2));
} else {
  const mm = Math.floor(m.seconds / 60);
  const ss = (m.seconds - mm * 60).toFixed(1).padStart(4, "0");
  console.log(`file        ${m.file}`);
  console.log(`duration    ${m.seconds}s (${mm}:${ss})`);
  console.log(`resolution  ${m.width}x${m.height}`);
  console.log(`fps         ${m.fps}`);
  console.log(`video       ${m.videoCodec}`);
  console.log(`audio       ${m.audioStreams ? `yes (${m.audioCodec})` : "none"}`);
  console.log(`size        ${m.megabytes} MB`);
  for (const f of fails) console.log(`FAIL        ${f}`);
  if (!fails.length) console.log("result      ok");
}
process.exit(fails.length ? 1 : 0);
