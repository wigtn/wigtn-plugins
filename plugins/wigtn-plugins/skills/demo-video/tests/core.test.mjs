import assert from "node:assert/strict";
import test from "node:test";
import { audioState, emptyManifest, planNarration, resolveAudio, TAIL_SECONDS, validateManifest } from "../template/src/core.mjs";

const entry = (over = {}) => ({ text: "Hello there.", voice: "v1", model: "m1", file: "a.0123456789ab.mp3", seconds: 2, timing: "measured", ...over });
const manifest = (segments) => ({ version: 1, segments });
const want = { voice: "v1", model: "m1" };

test("manifest: the empty manifest is valid, a damaged one is not", () => {
  assert.deepEqual(validateManifest(emptyManifest()), {});
  for (const bad of [null, [], {}, { version: 2, segments: {} }, { version: 1 }, manifest({ a: entry({ file: "../a.mp3" }) }),
    manifest({ a: entry({ file: "dir/a.mp3" }) }), manifest({ a: entry({ seconds: Infinity }) }), manifest({ a: entry({ timing: "real" }) }),
    manifest({ a: { dur: 68, hash: "old-format" } })]) {
    assert.throws(() => validateManifest(bad), /not valid/);
  }
});

test("audioState: text, voice and model each make audio stale", () => {
  assert.equal(audioState(undefined, { text: "x", ...want }).state, "missing");
  assert.equal(audioState(entry(), { text: "Hello there.", ...want }).state, "fresh");
  assert.deepEqual(audioState(entry(), { text: "Hello there!", ...want }), { state: "stale", changed: ["text"] });
  assert.deepEqual(audioState(entry(), { text: "Hello there.", voice: "v2", model: "m1" }).changed, ["voice"]);
  assert.deepEqual(audioState(entry(), { text: "Hello there.", voice: "v1", model: "m2" }).changed, ["model"]);
});

test("resolveAudio: captions-only ignores the manifest completely", () => {
  assert.deepEqual(resolveAudio({ enabled: false, manifest: { garbage: true }, segments: [{ id: "a", text: "x" }], ...want }), {});
});

test("resolveAudio: with audio on, an edited line fails the build and names the segment", () => {
  const m = manifest({ a: entry(), b: entry({ text: "Second." }) });
  const segs = [{ id: "a", text: "Hello there." }, { id: "b", text: "Second, edited." }];
  assert.throws(() => resolveAudio({ enabled: true, manifest: m, segments: segs, ...want }), /b \(text changed\)/);
  assert.throws(() => resolveAudio({ enabled: true, manifest: m, segments: [...segs.slice(0, 1), { id: "c", text: "New." }], ...want }), /c \(no audio\)/);
  assert.throws(() => resolveAudio({ enabled: true, manifest: m, segments: segs.slice(0, 1), voice: "v2", model: "m1" }), /a \(voice changed\)/);
  assert.throws(() => resolveAudio({ enabled: true, manifest: m, segments: segs.slice(0, 1), voice: "v1", model: "m9" }), /a \(model changed\)/);
  assert.throws(() => resolveAudio({ enabled: true, manifest: {}, segments: segs, ...want }), /not valid/);
});

test("resolveAudio: fresh audio is returned, and its length does not depend on FPS", () => {
  const a = resolveAudio({ enabled: true, manifest: manifest({ a: entry() }), segments: [{ id: "a", text: "Hello there." }], ...want }).a;
  assert.equal(a.file, "a.0123456789ab.mp3");
  const frames = (fps) => Math.ceil((a.seconds + TAIL_SECONDS) * fps);
  assert.equal(frames(30), 69);
  assert.equal(frames(60), 137); // same seconds, more frames: changing FPS cannot reuse a stale frame count
});

const plan = (scenes, narration, frames) =>
  planNarration({ scenes, tr: 16, narration, framesOf: (s) => frames[s.id], gap: 9, fps: 30 });

test("planNarration: starts and total account for the transition overlap", () => {
  const p = plan([{ id: "title", dur: 120 }, { id: "next", dur: 120 }], { title: [{ id: "t", off: 12, text: "x" }] }, { t: 60 });
  assert.deepEqual(p.starts, { title: 0, next: 104 });
  assert.equal(p.total, 224);
  assert.deepEqual(p.items, [{ id: "t", scene: "title", text: "x", from: 12, frames: 60 }]);
});

test("planNarration: lines that overlap across a transition are an error", () => {
  // The review's case: 120-frame title, off 12 + 108 frames fits the scene (ends at 120),
  // but the next scene starts at 104 and its line at 116: 4 frames of overlap.
  const scenes = [{ id: "title", dur: 120 }, { id: "next", dur: 120 }];
  const narration = { title: [{ id: "t", off: 12, text: "x" }], next: [{ id: "n", off: 12, text: "y" }] };
  assert.throws(() => plan(scenes, narration, { t: 108, n: 30 }), /overlap by 4 frames/);
  assert.doesNotThrow(() => plan(scenes, narration, { t: 104, n: 30 }));
});

test("planNarration: unknown scene keys, overlong scenes and duplicate ids are errors", () => {
  const scenes = [{ id: "title", dur: 120 }];
  assert.throws(() => plan(scenes, { tilte: [{ id: "t", off: 0, text: "x" }] }, { t: 10 }), /no scene with that id/);
  assert.throws(() => plan(scenes, { title: [{ id: "t", off: 12, text: "x" }] }, { t: 109 }), /its narration needs/);
  assert.throws(() => plan(scenes, { title: [{ id: "t", text: "x" }, { id: "t", text: "y" }] }, { t: 10 }), /used twice/);
  assert.throws(() => plan([...scenes, ...scenes], {}, {}), /used twice in SCENES/);
});
