/**
 * The constraints fixed in step 1 of the workflow. Scripts read these constants
 * with a regex, so keep each one a plain `export const NAME = <literal>;` on one line.
 */
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const FPS = 30;

/** Hard length limit of the venue, in seconds. The build fails when the timeline exceeds it. */
export const LIMIT_SECONDS = 150;

/** Speaking rate for estimates: 2.5 words/s (150 wpm) is a calm reading pace. */
export const WORDS_PER_SECOND = 2.5;

/** Pause after each narration segment, in frames. */
export const GAP_FRAMES = 9;

/**
 * false = captions only: the film has no audio stream and narration-manifest.json is ignored.
 * true  = every narration segment must have audio generated from its current text with the
 *         voice and model below. If one does not, the build fails; nothing is regenerated for you.
 */
export const NARRATION_AUDIO = false;

/** Text-to-speech voice and model (scripts/gen-tts.mjs). Changing either makes existing audio stale. */
export const TTS_VOICE = "21m00Tcm4TlvDq8ikWAM";
export const TTS_MODEL = "eleven_multilingual_v2";
