/**
 * The constraints fixed in step 1 of the workflow. Scripts read the numeric
 * constants below with a regex, so keep each one a plain `export const NAME = <number>;`.
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
