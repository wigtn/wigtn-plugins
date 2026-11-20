import React from "react";
import { AbsoluteFill } from "remotion";
import { reveal, useEnter } from "../motion";
import { CAPTION_ZONE, MONO, TYPE, useTheme } from "../theme";

export type Point = {
  value: string; // the number or short phrase
  label: string; // what it measures
  source?: string; // where it comes from: "Table 2", "eval/results.json @ 3f2a1c9"
};

const Card: React.FC<{ point: Point; delay: number }> = ({ point, delay }) => {
  const t = useTheme();
  const p = useEnter(delay);
  return (
    <div
      style={{
        ...reveal(p),
        flex: 1,
        maxWidth: 520,
        background: t.surface, // solid card, no translucency
        border: `1px solid ${t.border}`,
        borderRadius: 18,
        padding: "44px 40px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 76, fontWeight: 700, color: t.ink, lineHeight: 1.1, letterSpacing: -1 }}>{point.value}</div>
      <div style={{ fontSize: TYPE.body, color: t.sub, marginTop: 16, lineHeight: 1.3 }}>{point.label}</div>
      {point.source ? (
        <div style={{ fontFamily: MONO, fontSize: TYPE.min, color: t.accent, marginTop: 22 }}>{point.source}</div>
      ) : null}
    </div>
  );
};

/** Up to three results or callouts side by side, each with its source. */
export const Points: React.FC<{ heading: string; points: Point[] }> = ({ heading, points }) => {
  const t = useTheme();
  const h = useEnter(4);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: t.bg,
        alignItems: "center",
        justifyContent: "center",
        padding: `0 120px ${CAPTION_ZONE}px`,
      }}
    >
      <div style={{ ...reveal(h), fontSize: TYPE.heading, fontWeight: 700, color: t.ink, textAlign: "center", letterSpacing: -0.8 }}>
        {heading}
      </div>
      <div style={{ display: "flex", gap: 36, marginTop: 60, width: "100%", justifyContent: "center", alignItems: "stretch" }}>
        {points.slice(0, 3).map((pt, i) => (
          <Card key={i} point={pt} delay={14 + i * 8} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
