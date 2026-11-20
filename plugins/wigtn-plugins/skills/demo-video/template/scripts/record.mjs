/**
 * Screen recorder TEMPLATE (Playwright). Adapt CLIPS to your product before running.
 *
 *   npm i -D playwright@1.65.0 && npx playwright install chromium     # one-time
 *   node scripts/record.mjs            # every clip
 *   node scripts/record.mjs main       # one clip
 *
 * Each clip opens its URL in a fresh 1920x1080 browser context, runs the listed
 * steps, and saves public/captures/<name>.mp4 (or .webm when no ffmpeg is found).
 * Then set the file name in src/captures.ts.
 *
 * Scope, on purpose: this opens pages and performs steps, nothing else. It does not
 * log in and does not disguise the browser. For pages behind a login, record by hand
 * (see the capture guide).
 *
 * RECORD ONLY PAGES AND DATA THAT ARE SAFE TO PUBLISH. Use a demo account and demo
 * data. `mask` is a second line of defence, not a licence to record real secrets:
 * - it covers elements matching the CSS selectors you list with an opaque block,
 *   from before the first paint and on every navigation and frame of the clip;
 * - it cannot cover what your selectors do not match: text inside a canvas, an
 *   image or shadow DOM, a value shown in a place you did not list.
 * Watch every clip from the first frame to the last before using it. If a secret
 * is readable in any frame, delete the clip and rotate the secret.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "captures");
const RAW = path.join(OUT, "_raw");
const VIEW = { width: 1920, height: 1080 };
const BASE = process.env.DEMO_BASE_URL || "http://localhost:3000";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Opaque masking, installed before any page script runs and re-installed on every
 * navigation and in every frame (context.addInitScript). The matched element becomes
 * a flat grey block: its text, children and background are not rendered at all, so
 * nothing can be recovered from the recording (unlike a blur).
 */
function maskScript(selectors) {
  const list = selectors.join(", ");
  const inner = selectors.map((s) => `${s} *`).join(", ");
  const css =
    `${list} { color: transparent !important; -webkit-text-fill-color: transparent !important; ` +
    `text-shadow: none !important; caret-color: transparent !important; background: #8a8f98 !important; ` +
    `border-color: #8a8f98 !important; filter: contrast(0) !important; }` +
    `${inner} { visibility: hidden !important; }`;
  return `(() => {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(${JSON.stringify(css)});
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  })();`;
}

/** Move like a person: glide to the element, pause, then click. */
async function clickSlow(page, selector) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) throw new Error(`not found: ${selector}`);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 30 });
  await wait(350);
  await page.mouse.down();
  await wait(60);
  await page.mouse.up();
}

/** Scroll in small eased steps so the viewer can follow. */
async function scrollSlow(page, pixels, steps = 24) {
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, pixels / steps);
    await wait(40);
  }
}

// ---- EDIT HERE: one entry per capture slot in src/captures.ts ----------------
// Keep each clip to the action the narration describes, at reading pace.
const CLIPS = {
  main: {
    url: `${BASE}/`,
    // Selectors to cover for the whole clip, first frame included. List them here,
    // not inside steps: steps run after the page has already been recorded loading.
    mask: [], // e.g. ["[data-secret]", ".user-email"]
    steps: async (page) => {
      await wait(1500); // let the first frame settle
      // await clickSlow(page, "text=Run");
      // await page.keyboard.type("example query", { delay: 70 });
      await scrollSlow(page, 600);
      await wait(2000); // hold on the result
    },
  },
};
// -----------------------------------------------------------------------------

// Recordings have no mouse pointer, so draw one.
const CURSOR = `
  window.addEventListener("DOMContentLoaded", () => {
    const c = document.createElement("div");
    c.style.cssText = "position:fixed;z-index:2147483647;left:0;top:0;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:rgba(20,24,31,.55);border:2px solid #fff;pointer-events:none;opacity:0;transition:transform .08s ease-out;";
    document.body.appendChild(c);
    addEventListener("mousemove", (e) => { c.style.opacity = "1"; c.style.left = e.clientX + "px"; c.style.top = e.clientY + "px"; }, true);
    addEventListener("mousedown", () => { c.style.transform = "scale(.7)"; }, true);
    addEventListener("mouseup", () => { c.style.transform = "scale(1)"; }, true);
  });`;

function toMp4(webm, mp4) {
  const args = ["-y", "-i", webm, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "30", "-an", mp4];
  // System ffmpeg first, then the one bundled with Remotion.
  for (const [cmd, pre] of [["ffmpeg", []], ["npx", ["remotion", "ffmpeg"]]]) {
    try {
      execFileSync(cmd, [...pre, ...args], { cwd: ROOT, stdio: "ignore" });
      return true;
    } catch {
      /* try the next one */
    }
  }
  return false;
}

async function record(chromium, name, clip) {
  const dir = path.join(RAW, name);
  fs.mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: VIEW, recordVideo: { dir, size: VIEW } });
  await context.addInitScript(CURSOR);
  if (clip.mask?.length) await context.addInitScript(maskScript(clip.mask));
  const page = await context.newPage();
  let webm;
  try {
    await page.goto(clip.url, { waitUntil: "networkidle" });
    await clip.steps(page);
  } finally {
    const video = page.video();
    await context.close(); // flushes the recording
    webm = video ? await video.path() : null;
    await browser.close();
  }
  if (!webm) throw new Error("no recording was produced");
  const mp4 = path.join(OUT, `${name}.mp4`);
  if (toMp4(webm, mp4)) {
    console.log(`ok  public/captures/${name}.mp4`);
  } else {
    fs.copyFileSync(webm, path.join(OUT, `${name}.webm`));
    console.log(`ok  public/captures/${name}.webm (no ffmpeg found, kept as webm)`);
  }
}

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("playwright is not installed. Run: npm i -D playwright@1.65.0 && npx playwright install chromium");
  process.exit(2);
}
const only = process.argv[2];
if (only && !CLIPS[only]) {
  console.error(`unknown clip "${only}". Known: ${Object.keys(CLIPS).join(", ")}`);
  process.exit(2);
}
let failed = 0;
for (const name of only ? [only] : Object.keys(CLIPS)) {
  console.log(`recording ${name} ...`);
  try {
    await record(chromium, name, CLIPS[name]);
  } catch (e) {
    failed++;
    console.error(`FAILED ${name}: ${e.message}`);
  }
}
console.log("Watch every clip before using it, then set the file names in src/captures.ts.");
process.exit(failed ? 1 : 0);
