import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fakeProbe, run, SKILL, tmp } from "./helpers.mjs";

const CHECK = path.join(SKILL, "scripts", "check-video.mjs");
const probeJson = ({ duration = "17.4", fps = "30/1", audio = false, width = 1920, height = 1080 } = {}) =>
  JSON.stringify({
    streams: [
      { codec_type: "video", codec_name: "h264", width, height, avg_frame_rate: fps, r_frame_rate: fps },
      ...(audio ? [{ codec_type: "audio", codec_name: "aac" }] : []),
    ],
    format: duration === null ? {} : { duration },
  });

function check(t, probeOutput, args, { name = "demo.mp4", probeExit = 0 } = {}) {
  const dir = tmp(t);
  const video = path.join(dir, name);
  fs.writeFileSync(video, "not a real video; the fake ffprobe answers for it");
  return run(process.execPath, [CHECK, video, ...args], { cwd: dir, env: { FFPROBE: fakeProbe(dir, probeOutput, probeExit) } });
}

test("all expectations met: exit 0", (t) => {
  const r = check(t, probeJson(), ["--max-seconds", "150", "--width", "1920", "--height", "1080", "--fps", "30", "--forbid-audio"]);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /result\s+ok/);
});

test("limits use the raw value: 150.0004 s fails --max-seconds 150", (t) => {
  const r = check(t, probeJson({ duration: "150.0004" }), ["--max-seconds", "150"]);
  assert.equal(r.code, 1);
  assert.match(r.out, /duration 150\.0004s is over the limit of 150s/);
  assert.match(r.out, /duration\s+150\.001s/); // the displayed value is rounded up, never down into the limit
  assert.equal(check(t, probeJson({ duration: "150.0000" }), ["--max-seconds", "150"]).code, 0);
});

test("each failed expectation is listed: exit 1", (t) => {
  const r = check(t, probeJson({ audio: true }), ["--max-seconds", "10", "--width", "1280", "--fps", "60", "--forbid-audio"]);
  assert.equal(r.code, 1);
  for (const re of [/over the limit of 10s/, /width 1920 is not 1280/, /fps 30 is not 60/, /audio stream\(s\) present/]) assert.match(r.out, re);
});

test("--require-audio means a stream exists, and the output says speech is not checked", (t) => {
  const silent = check(t, probeJson({ audio: true }), ["--require-audio"]);
  assert.equal(silent.code, 0);
  assert.match(silent.out, /stream present \(aac\); not checked for speech/);
  assert.equal(check(t, probeJson(), ["--require-audio"]).code, 1);
});

test("29.97 fps is told apart from 30", (t) => {
  assert.equal(check(t, probeJson({ fps: "30000/1001" }), ["--fps", "29.97"]).code, 0);
  assert.equal(check(t, probeJson({ fps: "30000/1001" }), ["--fps", "30"]).code, 1);
});

test("bad arguments: exit 2", (t) => {
  for (const args of [["--max-seconds", "Infinity"], ["--max-seconds", "abc"], ["--max-seconds", "-5"], ["--max-seconds"],
    ["--min-seconds", "20", "--max-seconds", "10"], ["--require-audio", "--forbid-audio"], ["--nope"]]) {
    assert.equal(check(t, probeJson(), args).code, 2, args.join(" "));
  }
});

test("unusable ffprobe output: exit 2, never a crash or a pass", (t) => {
  for (const out of ["this is not json", probeJson({ duration: null }), probeJson({ fps: "0/0" }), probeJson({ fps: "abc" }),
    probeJson({ width: 0 }), JSON.stringify({ streams: [{ codec_type: "audio" }], format: { duration: "5" } }), "{}"]) {
    const r = check(t, out, ["--max-seconds", "150"]);
    assert.equal(r.code, 2, out);
    assert.match(r.out, /^check-video: /m);
    assert.ok(!r.out.includes("    at "), "no stack trace");
  }
});

test("ffprobe failing, a missing file, and no ffprobe at all: exit 2", (t) => {
  assert.equal(check(t, "", [], { probeExit: 1 }).code, 2);
  const dir = tmp(t);
  assert.equal(run(process.execPath, [CHECK, path.join(dir, "nope.mp4")], { cwd: dir }).code, 2);
  fs.writeFileSync(path.join(dir, "a.mp4"), "x");
  const r = run(process.execPath, [CHECK, "a.mp4"], { cwd: dir, env: { FFPROBE: "", PATH: dir } });
  assert.equal(r.code, 2);
  assert.match(r.out, /ffprobe not found/);
});

test("file names with spaces and shell characters are passed as data", (t) => {
  const r = check(t, probeJson(), ["--max-seconds", "150"], { name: "my demo; echo pwned $(id).mp4" });
  assert.equal(r.code, 0, r.out);
  assert.ok(!r.out.includes("uid="));
});
