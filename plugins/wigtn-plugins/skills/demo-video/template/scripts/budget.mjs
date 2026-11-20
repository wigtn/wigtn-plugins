/**
 * Does the script fit the time limit? Run before anything is recorded.
 *
 *   node scripts/budget.mjs [--max-seconds N] [--wps 2.5]
 *
 * Counts words per narration segment and estimates speaking time. Defaults come
 * from src/config.ts (LIMIT_SECONDS, WORDS_PER_SECOND, GAP_FRAMES, FPS).
 * Narration is not the whole film: silent scenes and transitions add time on top,
 * so leave headroom. Exit 0 = fits, 1 = over the limit, 2 = bad input.
 */
import { option, readConfig, readSegments } from "./_segments.mjs";

const max = Number(option("--max-seconds", readConfig("LIMIT_SECONDS", 150)));
const wps = Number(option("--wps", readConfig("WORDS_PER_SECOND", 2.5)));
const gap = readConfig("GAP_FRAMES", 9) / readConfig("FPS", 30);
if (!(max > 0) || !(wps > 0)) {
  console.error("--max-seconds and --wps must be positive numbers.");
  process.exit(2);
}

const segs = readSegments();
let words = 0;
let seconds = 0;
let chars = 0;
for (const s of segs) {
  const w = s.text.trim().split(/\s+/).length;
  const sec = w / wps + 0.3 + gap;
  words += w;
  seconds += sec;
  chars += s.text.length;
  console.log(`${s.id.padEnd(24)} ${String(w).padStart(4)} words  ${sec.toFixed(1).padStart(6)}s`);
}
const pct = Math.round((seconds / max) * 100);
console.log(`\n${segs.length} segments · ${words} words · ${chars} characters`);
console.log(`estimated narration ${seconds.toFixed(1)}s at ${wps} words/s · limit ${max}s · ${pct}% of the limit`);
if (seconds > max) {
  console.error(`OVER: cut about ${Math.ceil((seconds - max) * wps)} words.`);
  process.exit(1);
}
if (pct > 90) console.log("Tight: under the limit, but little room is left for silent beats and transitions.");
