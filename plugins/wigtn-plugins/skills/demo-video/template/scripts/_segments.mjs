// Shared by gen-tts.mjs and budget.mjs: read segments and constants from the sources.
//
// narration.ts is read as text, not executed. To make sure the text a script sees is
// exactly the caption the renderer shows, the reader is strict: comments are skipped,
// every `text:` field must be one plain double-quoted string, and anything it cannot
// read exactly is an error instead of a guess.
import fs from "node:fs";

/** Split TypeScript source into code and string-literal tokens, dropping comments. */
function tokenize(src) {
  const tokens = [];
  let code = "";
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    const d = src[i + 1];
    if (c === "/" && d === "/") {
      while (i < n && src[i] !== "\n") i++;
    } else if (c === "/" && d === "*") {
      const end = src.indexOf("*/", i + 2);
      i = end < 0 ? n : end + 2;
      code += " ";
    } else if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      while (j < n && src[j] !== c) {
        if (src[j] === "\\") j++;
        if (src[j] === "\n" && c !== "`") break;
        j++;
      }
      if (src[j] !== c) throw new Error("unterminated string literal");
      if (code) tokens.push({ type: "code", value: code });
      code = "";
      tokens.push({ type: "str", quote: c, raw: src.slice(i + 1, j) });
      i = j + 1;
    } else {
      code += c;
      i++;
    }
  }
  if (code) tokens.push({ type: "code", value: code });
  return tokens;
}

function unescape(raw, id) {
  return raw.replace(/\\([\s\S]?)/g, (_, c) => {
    if (c !== '"' && c !== "\\") {
      throw new Error(`segment "${id}": only \\" and \\\\ escapes are supported in text. Write the character itself.`);
    }
    return c;
  });
}

/** id + text of every narration segment, in file order. Throws on anything ambiguous. */
export function parseSegments(src) {
  const strings = [];
  const shape = tokenize(src)
    .map((t) => (t.type === "code" ? t.value : `"§${strings.push(t) - 1}§"`))
    .join("");
  const segs = [];
  const re = /\{\s*id\s*:\s*"§(\d+)§"\s*,[^{}]*?\btext\s*:\s*"§(\d+)§"(?=\s*[,}])/g;
  let m;
  while ((m = re.exec(shape)) !== null) {
    const idTok = strings[Number(m[1])];
    const textTok = strings[Number(m[2])];
    const id = idTok.raw;
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(id)) {
      throw new Error(`segment id "${id}": use letters, digits, - and _ only (it becomes a file name).`);
    }
    if (textTok.quote !== '"') throw new Error(`segment "${id}": text must be a double-quoted string.`);
    segs.push({ id, text: unescape(textTok.raw, id) });
  }
  const fields = (shape.match(/\btext\s*:\s*"§\d+§"/g) || []).length;
  if (fields !== segs.length) {
    throw new Error(
      `${fields} text fields found but ${segs.length} could be read. Each segment must look like ` +
        `{ id: "name", ..., text: "one double-quoted string" } with id first and no string concatenation.`,
    );
  }
  if (!segs.length) throw new Error("no segments found");
  const dup = segs.map((s) => s.id).filter((id, i, a) => a.indexOf(id) !== i);
  if (dup.length) throw new Error(`duplicate segment ids: ${[...new Set(dup)].join(", ")}`);
  return segs;
}

export function readSegments(file = "src/narration.ts") {
  if (!fs.existsSync(file)) {
    console.error(`${file} not found. Run this from the video project root.`);
    process.exit(2);
  }
  try {
    return parseSegments(fs.readFileSync(file, "utf8"));
  } catch (e) {
    console.error(`${file}: ${e.message}`);
    process.exit(2);
  }
}

/** A one-line `export const NAME = <number | "string" | true | false>;` from src/config.ts. */
export function readConfig(name, fallback) {
  let src;
  try {
    src = fs.readFileSync("src/config.ts", "utf8");
  } catch {
    return fallback;
  }
  const m = src.match(new RegExp(`^export const ${name}\\s*=\\s*(?:"([^"\\\\\\n]*)"|([0-9.]+)|(true|false))\\s*;`, "m"));
  if (!m) return fallback;
  if (m[1] !== undefined) return m[1];
  if (m[2] !== undefined) return Number(m[2]);
  return m[3] === "true";
}

export function flag(name) {
  return process.argv.includes(name);
}

export function option(name, fallback) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : fallback;
}
