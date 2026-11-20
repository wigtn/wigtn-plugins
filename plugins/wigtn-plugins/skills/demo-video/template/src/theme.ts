/**
 * Design tokens. Two neutral themes; pick one with the `theme` prop of the
 * composition (Root.tsx) or `--props='{"theme":"light"}'`.
 * Replace `accent` with your own color. Do not paste third-party brand colors here.
 */
import React from "react";
import { loadFont } from "@remotion/google-fonts/Inter";

// Inter is fetched at render time (no font binary in the repo). The stack after it
// covers offline renders and scripts Inter lacks (e.g. Hangul).
const inter = loadFont("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

export const FONT = `${inter.fontFamily}, "Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", system-ui, sans-serif`;
export const MONO = `ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace`;

export type Theme = {
  bg: string; // composition background, also behind every transition
  surface: string; // solid cards and the footage window
  surfaceAlt: string; // window title bar, placeholder fill
  border: string;
  ink: string; // primary text
  sub: string; // secondary text (still high contrast)
  accent: string;
  captionBg: string;
  captionInk: string;
};

export const THEMES = {
  dark: {
    bg: "#0e1116",
    surface: "#181d25",
    surfaceAlt: "#222a35",
    border: "#343e4d",
    ink: "#f2f5f9",
    sub: "#b9c2cf",
    accent: "#7fb2ff",
    captionBg: "#05070a",
    captionInk: "#ffffff",
  },
  light: {
    bg: "#f3f4f6",
    surface: "#ffffff",
    surfaceAlt: "#e9ecf1",
    border: "#cfd5de",
    ink: "#12161d",
    sub: "#444e5c",
    accent: "#1f4fbf",
    captionBg: "#12161d",
    captionInk: "#ffffff",
  },
} satisfies Record<string, Theme>;

export type ThemeName = keyof typeof THEMES;

/** Type scale at 1920x1080. `min` is the floor for any text on the frame. */
export const TYPE = { min: 24, label: 26, body: 32, caption: 34, lead: 38, heading: 60, title: 88 };

/** Bottom band reserved for captions. Scene content stays above it. */
export const CAPTION_ZONE = 168;

export const ThemeContext = React.createContext<Theme>(THEMES.dark);
export const useTheme = () => React.useContext(ThemeContext);
