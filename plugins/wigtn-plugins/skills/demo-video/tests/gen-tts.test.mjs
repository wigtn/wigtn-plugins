import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { FAKE_KEY, fakeProbe, MARKER, MOCK, project, run } from "./helpers.mjs";

// Every run preloads the mock: fetch never reaches the network, and calls are logged.
function tts(dir, args, env = {}) {
  const log = path.join(dir, "fetch.log");
  const base = { ELEVENLABS_API_KEY: "", FFPROBE: fakeProbe(dir, "", 1), MOCK_LOG: log };
  const r = run(process.execPath, ["--import", MOCK, "scripts/gen-tts.mjs", ...args], { cwd: dir, env: { ...base, ...env } });
  return { ...r, calls: fs.existsSync(log) ? fs.readFileSync(log, "utf8").trim().split("\n").length : 0 };
}
const manifestOf = (dir) => fs.readFileSync(path.join(dir, "narration-manifest.json"), "utf8");
const audioDir = (dir) => path.join(dir, "public", "audio", "narration");
const audioFiles = (dir) => (fs.existsSync(audioDir(dir)) ? fs.readdirSync(audioDir(dir)).sort() : []);
const KEY = { ELEVENLABS_API_KEY: FAKE_KEY };
const clean = (r) => {
  assert.ok(!r.out.includes(MARKER), "provider response or exception text leaked");
  assert.ok(!r.out.includes(FAKE_KEY), "API key leaked");
};

test("--plan needs no key and sends nothing", (t) => {
  const r = tts(project(t), ["--plan"]);
  assert.equal(r.code, 0);
  assert.equal(r.calls, 0);
  assert.match(r.out, /4 of 4 segments, 185 characters/);
});

test("no key, or no --confirm: exit 1 and nothing is sent", (t) => {
  const dir = project(t);
  let r = tts(dir, ["--confirm"]);
  assert.equal(r.code, 1);
  assert.match(r.out, /ELEVENLABS_API_KEY is not set/);
  r = tts(dir, [], KEY);
  assert.equal(r.code, 1);
  assert.match(r.out, /paid API call/);
  assert.equal(r.calls, 0);
  clean(r);
});

test("HTTP error: only a status code and a fixed label are printed", (t) => {
  const r = tts(project(t), ["--confirm"], { ...KEY, MOCK_MODE: "401" });
  assert.equal(r.code, 1);
  assert.match(r.out, /FAILED title: http_401_unauthorized/);
  clean(r);
});

test("network error, non-JSON body, body without audio: fixed codes, no raw text", (t) => {
  for (const [mode, code] of [["throw", "network_error"], ["bad-json", "bad_response_not_json"], ["no-audio", "bad_response_no_audio"]]) {
    const r = tts(project(t), ["--confirm"], { ...KEY, MOCK_MODE: mode });
    assert.equal(r.code, 1);
    assert.match(r.out, new RegExp(`FAILED title: ${code}`));
    clean(r);
  }
});

test("success: content-named audio, a valid manifest, and a second run costs nothing", (t) => {
  const dir = project(t);
  let r = tts(dir, ["--confirm"], KEY);
  assert.equal(r.code, 0, r.out);
  assert.equal(r.calls, 4);
  clean(r);
  const m = JSON.parse(manifestOf(dir));
  assert.equal(m.version, 1);
  assert.deepEqual(Object.keys(m.segments), ["title", "footage-1", "points", "outro"]);
  const e = m.segments.title;
  assert.equal(e.text, "Open with what the system is.");
  assert.equal(e.timing, "aligned"); // the fake ffprobe fails, so the provider's last timestamp is used and labelled
  assert.equal(e.seconds, 2);
  assert.match(e.file, /^title\.[0-9a-f]{12}\.mp3$/);
  assert.deepEqual(audioFiles(dir), Object.values(m.segments).map((s) => s.file).sort());
  assert.ok(!manifestOf(dir).includes(FAKE_KEY));

  r = tts(dir, ["--confirm"], KEY);
  assert.equal(r.code, 0);
  assert.match(r.out, /Nothing to generate/);
  assert.equal(r.calls, 4); // no new calls
});

test("a working ffprobe makes the length 'measured'", (t) => {
  const dir = project(t);
  const r = tts(dir, ["--confirm", "--only", "title"], { ...KEY, FFPROBE: fakeProbe(dir, "3.25\n") });
  assert.equal(r.code, 0, r.out);
  const e = JSON.parse(manifestOf(dir)).segments.title;
  assert.deepEqual([e.seconds, e.timing], [3.25, "measured"]);
  assert.match(r.out, /Still without current audio: footage-1, points, outro/);
});

test("an edited line is reported stale, and only that line is sent again", (t) => {
  const dir = project(t);
  tts(dir, ["--confirm"], KEY);
  const file = path.join(dir, "src", "narration.ts");
  fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("Open with what the system is.", "Open with one sentence."));
  let r = tts(dir, ["--plan"]);
  assert.match(r.out, /send {2}title .* stale \(text changed\)/);
  assert.match(r.out, /1 of 4 segments/);
  const before = JSON.parse(manifestOf(dir)).segments.title.file;
  r = tts(dir, ["--confirm"], KEY);
  assert.equal(r.code, 0, r.out);
  assert.equal(r.calls, 5);
  const after = JSON.parse(manifestOf(dir)).segments.title;
  assert.equal(after.text, "Open with one sentence.");
  assert.notEqual(after.file, before);
  assert.ok(!audioFiles(dir).includes(before), "audio nothing points at is removed after the manifest is replaced");
});

test("changing the voice or model makes every line stale", (t) => {
  const dir = project(t);
  tts(dir, ["--confirm"], KEY);
  const cfg = path.join(dir, "src", "config.ts");
  fs.writeFileSync(cfg, fs.readFileSync(cfg, "utf8").replace("eleven_multilingual_v2", "another_model"));
  assert.match(tts(dir, ["--plan"]).out, /4 of 4 segments/);
});

test("manifest write failure: the old manifest and the audio it points at are untouched", (t) => {
  const dir = project(t);
  tts(dir, ["--confirm"], KEY);
  const manifestBefore = manifestOf(dir);
  const old = JSON.parse(manifestBefore).segments.title.file;
  const oldBytes = fs.readFileSync(path.join(audioDir(dir), old));
  const file = path.join(dir, "src", "narration.ts");
  fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("Open with what the system is.", "A new opening line."));

  const r = tts(dir, ["--confirm"], { ...KEY, MOCK_FAIL_MANIFEST: "1" });
  assert.equal(r.code, 1);
  assert.match(r.out, /FAILED title: manifest_write_failed_ENOSPC/);
  clean(r);
  assert.equal(manifestOf(dir), manifestBefore);
  assert.deepEqual(fs.readFileSync(path.join(audioDir(dir), old)), oldBytes);
  assert.deepEqual(fs.readdirSync(dir).filter((f) => f.includes(".tmp-")), [], "no temp manifest left behind");
});

test("a later segment failing keeps the earlier ones", (t) => {
  const dir = project(t);
  const r = tts(dir, ["--confirm"], { ...KEY, MOCK_MODE: "second-500" });
  assert.equal(r.code, 1);
  assert.match(r.out, /FAILED footage-1: http_500_provider_error/);
  clean(r);
  assert.deepEqual(Object.keys(JSON.parse(manifestOf(dir)).segments), ["title"]);
});

test("a damaged manifest stops the run instead of regenerating everything", (t) => {
  for (const content of ['{"version": 1, "segments": {"title": {"text": "Open', "{}", '{"title":{"dur":68,"hash":"x"}}']) {
    const dir = project(t);
    fs.writeFileSync(path.join(dir, "narration-manifest.json"), content);
    for (const args of [["--plan"], ["--confirm"]]) {
      const r = tts(dir, args, KEY);
      assert.equal(r.code, 2, r.out);
      assert.match(r.out, /cannot be used/);
      assert.equal(r.calls, 0);
    }
    assert.equal(manifestOf(dir), content);
  }
});

test("unsafe narration text stops the run before anything is sent", (t) => {
  const dir = project(t);
  const file = path.join(dir, "src", "narration.ts");
  fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace('"Open with what the system is."', '"Open " + "with"'));
  const r = tts(dir, ["--confirm"], KEY);
  assert.equal(r.code, 2);
  assert.equal(r.calls, 0);
});
