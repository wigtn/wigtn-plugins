import React from "react";
import { AbsoluteFill } from "remotion";
import { reveal, useEnter } from "../motion";
import { CAPTION_ZONE, MONO, TYPE, useTheme } from "../theme";

/** Opening card: what the system is, in one line. Centered, staggered reveal. */
export const Title: React.FC<{
  eyebrow?: string;
  title: string;
  subtitle?: string;
  meta?: string; // e.g. authors · affiliation
}> = ({ eyebrow, title, subtitle, meta }) => {
  const t = useTheme();
  const a = useEnter(4);
  const b = useEnter(12);
  const c = useEnter(22);
  const d = useEnter(32);
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
      {eyebrow ? (
        <div style={{ ...reveal(a), fontFamily: MONO, fontSize: TYPE.label, letterSpacing: 2, color: t.accent, marginBottom: 28 }}>
          {eyebrow}
        </div>
      ) : null}
      <div style={{ ...reveal(b), fontSize: TYPE.title, fontWeight: 700, lineHeight: 1.12, color: t.ink, letterSpacing: -1.5 }}>
        {title}
      </div>
      {subtitle ? (
        <div style={{ ...reveal(c), fontSize: TYPE.lead, lineHeight: 1.35, color: t.sub, marginTop: 30, maxWidth: 1300 }}>
          {subtitle}
        </div>
      ) : null}
      {meta ? (
        <div style={{ ...reveal(d), fontSize: TYPE.label, color: t.sub, marginTop: 44 }}>{meta}</div>
      ) : null}
    </AbsoluteFill>
  );
};
