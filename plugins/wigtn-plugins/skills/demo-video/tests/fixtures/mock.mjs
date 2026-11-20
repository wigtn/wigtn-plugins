// Preloaded with `node --import` in tests: replaces fetch (no network is ever touched)
// and can force the manifest rename to fail. Not part of the template.
import fs from "node:fs";
import { syncBuiltinESMExports } from "node:module";

const MODE = process.env.MOCK_MODE || "ok";
const LOG = process.env.MOCK_LOG;
export const MARKER = "SYNTHETIC_SECRET_IN_RESPONSE";
let calls = 0;

const ok = (text) =>
  new Response(
    JSON.stringify({
      audio_base64: Buffer.from(`FAKE-MP3:${text}:`.padEnd(200, "x")).toString("base64"),
      alignment: { character_end_times_seconds: [0.5, 1.25, 2.0] },
    }),
    { status: 200, headers: { "content-type": "application/json" } },
  );

globalThis.fetch = async (url, init) => {
  calls++;
  if (LOG) fs.appendFileSync(LOG, `${String(url)}\n`);
  const text = JSON.parse(init.body).text;
  if (MODE === "throw") throw new Error(`connect failed ${MARKER} key=${init.headers["xi-api-key"]}`);
  if (MODE === "401") return new Response(JSON.stringify({ detail: `${MARKER} for text ${text}` }), { status: 401 });
  if (MODE === "second-500" && calls === 2) return new Response(MARKER, { status: 500 });
  if (MODE === "bad-json") return new Response(`<html>${MARKER}</html>`, { status: 200 });
  if (MODE === "no-audio") return new Response(JSON.stringify({ note: MARKER }), { status: 200 });
  return ok(text);
};

if (process.env.MOCK_FAIL_MANIFEST) {
  const rename = fs.renameSync;
  fs.renameSync = (from, to) => {
    if (String(to).endsWith("narration-manifest.json")) {
      const e = new Error(`mock disk full ${MARKER}`);
      e.code = "ENOSPC";
      throw e;
    }
    return rename(from, to);
  };
  syncBuiltinESMExports();
}
