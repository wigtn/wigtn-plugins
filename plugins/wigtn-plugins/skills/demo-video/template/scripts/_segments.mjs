// Shared by gen-tts.mjs and budget.mjs: read segments and constants from the sources.
import fs from "node:fs";

/** id + text pairs from src/narration.ts (each segment is one object literal with a double-quoted text). */
export function readSegments(file = "src/narration.ts") {
  if (!fs.existsSync(file)) {
    console.error(`${file} not found. Run this from the video project root.`);
    process.exit(2);
  }
  const src = fs.readFileSync(file, "utf8");
  const re = /\{\s*id:\s*"([^"]+)",[^{}]*?text:\s*"((?:[^"\\]|\\.)*)"/g;
  const segs = [];
  let m;
  while ((m = re.exec(src)) !== null) {
    segs.push({ id: m[1], text: m[2].replace(/\\"/g, '"').replace(/\\\\/g, "\\") });
  }
  if (!segs.length) {
    console.error(`No segments parsed from ${file}.`);
    process.exit(2);
  }
  const dup = segs.map((s) => s.id).filter((id, i, a) => a.indexOf(id) !== i);
  if (dup.length) {
    console.error(`Duplicate segment ids in ${file}: ${[...new Set(dup)].join(", ")}`);
    process.exit(2);
  }
  return segs;
}

/** A numeric `export const NAME = <number>;` from src/config.ts. */
export function readConfig(name, fallback) {
  try {
    const m = fs.readFileSync("src/config.ts", "utf8").match(new RegExp(`export const ${name}\\s*=\\s*([0-9.]+)`));
    return m ? Number(m[1]) : fallback;
  } catch {
    return fallback;
  }
}

export function flag(name) {
  return process.argv.includes(name);
}

export function option(name, fallback) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : fallback;
}
