import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CAPTURES, type CaptureName } from "../captures";
import { EASE, mix, ramp, reveal, useEnter } from "../motion";
import { MONO, TYPE, useTheme } from "../theme";

/**
 * A zoom onto the region being explained. Coordinates are in pixels of the
 * 1920x1080 recording. `at` / `hold` are seconds from the scene start.
 */
export type Zoom = { at: number; hold: number; x: number; y: number; w: number; h: number };

// Window geometry: a 16:9 viewport at 75% scale. With the title bar the window ends
// at y = 902, above the caption band, so a caption never covers the footage.
const VW = 1440;
const VH = 810;
const BAR = 48;
const TOP = 44;
const K = VW / 1920;
// 1.8 keeps a 1080p recording near 1.35x its native pixels. More than that looks soft.
const MAX_ZOOM = 1.8;
const ZOOM_SECONDS = 0.7;

/** Real footage in a window frame. Renders a labelled placeholder while the slot is empty. */
export const Footage: React.FC<{
  slot: CaptureName;
  label: string; // shown in the window title bar: what the viewer is looking at
  zooms?: Zoom[];
  trimStart?: number; // seconds cut from the start of the clip
  playbackRate?: number;
}> = ({ slot, label, zooms = [], trimStart = 0, playbackRate = 1 }) => {
  const t = useTheme();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = useEnter(2, 26);
  const capture = CAPTURES[slot];

  // Camera: blend from the full view to each zoom region and back, always eased.
  let scale = 1;
  let cx = VW / 2;
  let cy = VH / 2;
  for (const z of zooms) {
    const zf = Math.round(ZOOM_SECONDS * fps);
    const p =
      ramp(f, z.at * fps, zf, EASE.inOut) - ramp(f, (z.at + z.hold) * fps + zf, zf, EASE.inOut);
    if (p <= 0) continue;
    const target = Math.min(VW / (z.w * K), VH / (z.h * K), MAX_ZOOM);
    scale = mix(p, 1, target);
    cx = mix(p, VW / 2, (z.x + z.w / 2) * K);
    cy = mix(p, VH / 2, (z.y + z.h / 2) * K);
  }
  // Clamp so the zoomed clip always covers the viewport (no gap at the edges).
  const tx = Math.min(0, Math.max(VW - VW * scale, VW / 2 - cx * scale));
  const ty = Math.min(0, Math.max(VH - VH * scale, VH / 2 - cy * scale));

  return (
    <AbsoluteFill style={{ backgroundColor: t.bg, alignItems: "center" }}>
      <div
        style={{
          ...reveal(enter, 18),
          marginTop: TOP,
          width: VW,
          borderRadius: 14,
          overflow: "hidden",
          background: t.surface,
          border: `1px solid ${t.border}`,
          boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
          boxSizing: "content-box",
        }}
      >
        <div
          style={{
            height: BAR,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 20px",
            background: t.surfaceAlt,
            borderBottom: `1px solid ${t.border}`,
            boxSizing: "border-box",
          }}
        >
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: 6, background: t.border }} />
          ))}
          <div style={{ marginLeft: 14, fontSize: TYPE.min, fontWeight: 500, color: t.ink }}>{label}</div>
        </div>
        <div style={{ position: "relative", width: VW, height: VH, overflow: "hidden", background: t.surface }}>
          {capture.file ? (
            <OffthreadVideo
              src={staticFile(`captures/${capture.file}`)}
              muted
              trimBefore={Math.round(trimStart * fps)}
              playbackRate={playbackRate}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: VW,
                height: VH,
                objectFit: "cover",
                transformOrigin: "0 0",
                transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
              }}
            />
          ) : (
            <AbsoluteFill
              style={{
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                background: t.surface,
                padding: 80,
              }}
            >
              <div
                style={{
                  border: `2px dashed ${t.border}`,
                  borderRadius: 16,
                  padding: "56px 72px",
                  background: t.surfaceAlt,
                  maxWidth: 1040,
                }}
              >
                <div style={{ fontFamily: MONO, fontSize: TYPE.label, letterSpacing: 2, color: t.accent }}>
                  CAPTURE SLOT · {slot}
                </div>
                <div style={{ fontSize: TYPE.lead, fontWeight: 600, color: t.ink, marginTop: 22, lineHeight: 1.3, textWrap: "balance" }}>
                  {capture.hint}
                </div>
                <div style={{ fontFamily: MONO, fontSize: TYPE.min, color: t.sub, marginTop: 26 }}>
                  public/captures/{slot}.mp4 → src/captures.ts
                </div>
              </div>
            </AbsoluteFill>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
