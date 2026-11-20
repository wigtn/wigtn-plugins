import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const TEMPLATE = path.join(SKILL, "template");
export const MOCK = path.join(SKILL, "tests", "fixtures", "mock.mjs");
export const MARKER = "SYNTHETIC_SECRET_IN_RESPONSE";
export const FAKE_KEY = "sk_test_FAKE_KEY_DO_NOT_PRINT";

export function tmp(t, prefix = "demo-video-test-") {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

/** A copy of the template (no node_modules needed: the scripts use Node built-ins only). */
export function project(t) {
  const dir = tmp(t);
  fs.cpSync(TEMPLATE, dir, { recursive: true });
  return dir;
}

export function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: "utf8", ...opts, env: { ...process.env, ...opts.env } });
  return { code: r.status, out: `${r.stdout}${r.stderr}`, stdout: r.stdout, stderr: r.stderr };
}

/** An executable that stands in for ffprobe and prints the given text. */
export function fakeProbe(dir, output, exitCode = 0) {
  const data = path.join(dir, `probe-${Math.random().toString(36).slice(2)}.out`);
  const bin = `${data}.sh`;
  fs.writeFileSync(data, output);
  fs.writeFileSync(bin, `#!/bin/sh\ncat "${data}"\nexit ${exitCode}\n`, { mode: 0o755 });
  return bin;
}
