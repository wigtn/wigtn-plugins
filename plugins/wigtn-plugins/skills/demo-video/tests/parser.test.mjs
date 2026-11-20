import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { parseSegments } from "../template/scripts/_segments.mjs";
import { TEMPLATE } from "./helpers.mjs";

const wrap = (body) => `export const NARRATION = {\n  a: [\n${body}\n  ],\n};\n`;

test("the template narration parses", () => {
  const segs = parseSegments(fs.readFileSync(path.join(TEMPLATE, "src", "narration.ts"), "utf8"));
  assert.deepEqual(segs.map((s) => s.id), ["title", "footage-1", "points", "outro"]);
});

test("commented-out segments are not sent", () => {
  const segs = parseSegments(
    wrap(`    // { id: "old", text: "Old line that must not be spoken." },
    /* { id: "older", off: 3, text: "Neither this one." }, */
    { id: "live", off: 12, text: "The live line." },`),
  );
  assert.deepEqual(segs, [{ id: "live", text: "The live line." }]);
});

test("comment markers and braces inside the text are kept as text", () => {
  const segs = parseSegments(wrap(`    { id: "url", text: "See https://example.org/a /* not a comment */ and {braces}." },`));
  assert.equal(segs[0].text, "See https://example.org/a /* not a comment */ and {braces}.");
});

test("a segment-looking string inside a text is not a segment", () => {
  const segs = parseSegments(wrap(`    { id: "outer", text: "He typed { id: \\"inner\\", text: \\"x\\" } here." },`));
  assert.deepEqual(segs, [{ id: "outer", text: 'He typed { id: "inner", text: "x" } here.' }]);
});

test("escaped quotes and backslashes are read the way TypeScript reads them", () => {
  const segs = parseSegments(wrap(`    { id: "q", text: "She said \\"go\\" and typed C:\\\\tmp." },`));
  assert.equal(segs[0].text, 'She said "go" and typed C:\\tmp.');
});

for (const [name, body] of [
  ["other escapes", `    { id: "n", text: "line one\\nline two" },`],
  ["unicode escapes", `    { id: "u", text: "caf\\u00e9" },`],
  ["single-quoted text", `    { id: "s", text: 'single quoted' },`],
  ["template-literal text", "    { id: \"t\", text: `template` },"],
  ["concatenated text", `    { id: "c", text: "part one " + "part two" },`],
  ["text before id", `    { text: "wrong order", id: "o" },`],
  ["duplicate ids", `    { id: "d", text: "one" },\n    { id: "d", text: "two" },`],
  ["ids that are not file-name safe", `    { id: "../x", text: "one" },`],
]) {
  test(`${name} are refused instead of guessed`, () => {
    assert.throws(() => parseSegments(wrap(body)));
  });
}
