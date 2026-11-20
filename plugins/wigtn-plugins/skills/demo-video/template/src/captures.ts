/**
 * Capture slots: real screen recordings of the product.
 * Put the file in public/captures/ and set its name here. A slot left `null`
 * renders a labelled placeholder, so the film builds with any subset filled.
 *
 * `hint` says what the clip must show; the placeholder prints it, and it is the
 * brief for whoever records the clip.
 */
export type CaptureSlot = { file: string | null; hint: string };

export const CAPTURES = {
  main: { file: null, hint: "The core interaction, start to finish, at reading pace" },
} satisfies Record<string, CaptureSlot>;

export type CaptureName = keyof typeof CAPTURES;
