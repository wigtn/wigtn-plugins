import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { run, SKILL, tmp } from "./helpers.mjs";

const NEW = path.join(SKILL, "scripts", "new.sh");
const sh = (cwd, ...args) => run("bash", [NEW, ...args], { cwd });
const created = (dir) => fs.existsSync(path.join(dir, "src", "Demo.tsx")) && fs.existsSync(path.join(dir, ".gitignore"));

test("creates a project in a new or empty directory", (t) => {
  const dir = tmp(t);
  assert.equal(sh(dir, "video").code, 0);
  assert.ok(created(path.join(dir, "video")));
  fs.mkdirSync(path.join(dir, "empty"));
  assert.equal(sh(dir, path.join(dir, "empty")).code, 0);
  assert.ok(created(path.join(dir, "empty")));
});

test("refuses a non-empty directory, a file, and missing or extra arguments", (t) => {
  const dir = tmp(t);
  fs.mkdirSync(path.join(dir, "full"));
  fs.writeFileSync(path.join(dir, "full", "keep.txt"), "mine");
  fs.writeFileSync(path.join(dir, "file"), "x");
  for (const args of [["full"], ["file"], [], [""], ["a", "b"]]) assert.equal(sh(dir, ...args).code, 2, args.join(" "));
  assert.deepEqual(fs.readdirSync(path.join(dir, "full")), ["keep.txt"]);
  assert.ok(!fs.existsSync(path.join(dir, "a")));
});

test("a relative path starting with '-' is a path, not an option", (t) => {
  const dir = tmp(t);
  for (const name of ["-name", "-rf", "--help"]) {
    const r = sh(dir, name);
    assert.equal(r.code, 0, r.out);
    assert.ok(created(path.join(dir, name)), name);
  }
});

test("the printed cd hint works for a path with spaces", (t) => {
  const dir = tmp(t);
  const r = sh(dir, "my demo video");
  assert.equal(r.code, 0);
  const hint = r.stdout.split("\n").find((l) => l.trim().startsWith("cd "));
  assert.equal(run("bash", ["-c", `${hint} && pwd -P`], { cwd: dir }).stdout.trim(), fs.realpathSync(path.join(dir, "my demo video")));
});

test("refuses a symbolic link, even to an empty directory", (t) => {
  const dir = tmp(t);
  fs.mkdirSync(path.join(dir, "real"));
  fs.symlinkSync(path.join(dir, "real"), path.join(dir, "link"));
  const r = sh(dir, "link");
  assert.equal(r.code, 2);
  assert.match(r.out, /symbolic link/);
  assert.deepEqual(fs.readdirSync(path.join(dir, "real")), []);
});
