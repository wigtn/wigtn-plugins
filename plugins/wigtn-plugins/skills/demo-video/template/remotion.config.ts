/**
 * Applies to the CLI (`remotion studio | still | render`).
 * All options: https://remotion.dev/docs/config
 */
import fs from "node:fs";
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// The output has an audio stream if and only if narration audio was asked for
// (NARRATION_AUDIO in src/config.ts). Remotion writes a silent track even when the
// film has no sound, so captions-only renders are muted here. The manifest is not
// consulted: leftover entries cannot switch audio on.
const m = fs.readFileSync("src/config.ts", "utf8").match(/^export const NARRATION_AUDIO\s*=\s*(true|false)\s*;/m);
if (!m) {
  throw new Error("src/config.ts must contain `export const NARRATION_AUDIO = true;` or `= false;` on one line.");
}
// Call it only to mute: in Remotion 4.0.473 setMuted() turns muting on whatever it is passed.
if (m[1] === "false") Config.setMuted(true);
