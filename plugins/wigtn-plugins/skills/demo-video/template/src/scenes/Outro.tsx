import React from "react";
import { AbsoluteFill } from "remotion";
import { reveal, useEnter } from "../motion";
import { CAPTION_ZONE, MONO, TYPE, useTheme } from "../theme";

/** Closing card: the name once more, then where to find the system and the paper. */
export const Outro: React.FC<{ title: string; lines: string[] }> = ({ title, lines }) => {
  const t = useTheme();
  const a = useEnter(4);
  const b = useEnter(16);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: t.bg,
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: `0 160px ${CAPTION_ZONE}px`,
      }}
    >
      <div style={{ ...reveal(a), fontSize: TYPE.heading + 8, fontWeight: 700, color: t.ink, letterSpacing: -1 }}>{title}</div>
      <div style={{ ...reveal(b), marginTop: 40, display: "flex", flexDirection: "column", gap: 14 }}>
        {lines.map((l, i) => (
          <div key={i} style={{ fontFamily: MONO, fontSize: TYPE.body, color: i === 0 ? t.accent : t.sub }}>
            {l}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
