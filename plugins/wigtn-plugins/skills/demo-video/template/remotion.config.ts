/**
 * Applies to the CLI (`remotion studio | still | render`).
 * All options: https://remotion.dev/docs/config
 */
import fs from "node:fs";
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// Remotion writes a silent audio track even when the film has no sound. With no
// narration audio generated (empty manifest), render without an audio stream at all,
// so "has audio" in the output means "has narration".
let hasNarrationAudio = false;
try {
  hasNarrationAudio = Object.keys(JSON.parse(fs.readFileSync("narration-manifest.json", "utf8"))).length > 0;
} catch {
  hasNarrationAudio = false;
}
// Call it only to mute: in Remotion 4.0.473 setMuted() turns muting on whatever it is passed.
if (!hasNarrationAudio) Config.setMuted(true);
