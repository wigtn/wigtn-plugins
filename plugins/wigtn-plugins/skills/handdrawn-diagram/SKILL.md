---
name: handdrawn-diagram
description: >-
  Generate a hand-drawn (sketch-style) architecture or flow diagram as a
  committable image (SVG + PNG). Use when the user wants a sketch-aesthetic
  diagram for a README, docs, or hackathon/Devpost submission that still has
  correct, legible text and per-group color. Authors a Mermaid look:handDrawn
  source and renders it with mermaid-cli — works on any viewer and on Devpost.
  Triggers on: 'hand-drawn diagram', 'sketch diagram', '손그림 다이어그램',
  '손그림 아키텍처', '스케치 도식', 'handDrawn', 'Devpost diagram', '손그림으로 그려줘',
  '아키텍처 손그림', 'sketch-style architecture'.
allowed-tools: Read, Write, Edit, Bash, Glob
---

# Hand-drawn diagram (Mermaid look:handDrawn → SVG/PNG)

Renders identically everywhere (README, GitHub/GitLab, Devpost, slides), unlike
inline Mermaid (depends on the viewer's Mermaid version) or AI image generators
(garbled text).

## When to use

- User asks for a "hand-drawn / sketch / 손그림" architecture or flow diagram.
- A diagram is needed as an image file (Devpost, slides, print), not just inline.

## Method

### 1. Write the Mermaid source (`.mmd`)

```
---
config:
  look: handDrawn
  theme: default
  themeVariables:
    fontFamily: "Apple SD Gothic Neo, Malgun Gothic, Noto Sans KR, sans-serif"
---
flowchart TD
    A(["Trigger"]):::trig --> B{{"Lane title"}}:::lane
    B --> C["step line 1<br/>line 2"]:::grp
    C --> D[("datastore")]:::grp
    classDef trig fill:#fff,stroke:#fb8c00,stroke-width:2px,color:#e65100;
    classDef lane fill:#ffe0b2,stroke:#fb8c00,stroke-width:3px,color:#bf360c;
    classDef grp  fill:#e8f5e9,stroke:#43a047,color:#222;
```

Rules that avoid broken output:

- **Quote every label** `["..."]` — `·—≥→/()` break unquoted.
- **No emojis in nodes** — headless Chromium renders them as tofu; use words.
- Shapes: `([..])` trigger · `{{..}}` lane/title · `[(..)]` store · `[..]` step.
- Color groups via `classDef name fill:..,stroke:..,color:..;` + `:::name`.
- `<br/>` for line breaks; Korean renders fine with the fontFamily above.

### 2. Render to SVG + PNG (no Chrome install needed)

```bash
printf '%s\n' '{"args":["--no-sandbox","--disable-setuid-sandbox"]}' > /tmp/pptr.json
npx -y @mermaid-js/mermaid-cli -i d.mmd -o d.svg -p /tmp/pptr.json -b white
npx -y @mermaid-js/mermaid-cli -i d.mmd -o d.png -p /tmp/pptr.json -b white -s 2
```

`-b white` = white bg · `-s 2` = 2× crisp PNG · `look:handDrawn` needs mermaid-cli v11+ (npx pulls latest).

### 3. Verify → embed → commit

- **Read/open the PNG** and confirm: text correct, no tofu, colors right.
- Embed the PNG: `![Title](path/d.png)`.
- Commit all three: `.mmd` (source) · `.svg` (vector master) · `.png` (embed).

## Gotchas

- macOS has no `timeout` — don't wrap npx in it.
- Never put a triple-backtick inside an unquoted `awk`/`grep` pattern (zsh runs backticks as command substitution).
- Label needs `&` → write `and`.
- **CJK clips in handDrawn nodes.** rough.js under-estimates Korean/CJK glyph
  width, so a wide 한글 label gets cut at the node's right edge (e.g. "다이어그램"
  → "다이어그"). Keep Korean node text short, break earlier with `<br/>`, or pad
  with a trailing space inside the quotes (`"손그림 다이어그램 "`). Always verify
  in step 3 by reading the PNG.
