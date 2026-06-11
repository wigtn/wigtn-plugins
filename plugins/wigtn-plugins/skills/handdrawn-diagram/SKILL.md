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
    A(["Trigger"]):::main --> B["main step"]:::main
    B --> C{"decision?"}:::decision
    C -->|Yes| D["highlighted path"]:::main
    C -->|No| E["side step"]:::muted
    D --> F[("datastore")]:::muted
    E -.-> G["error / end"]:::alert
    classDef main     fill:#e8eaf6,stroke:#3949ab,stroke-width:2.5px,color:#1a237e;
    classDef decision fill:#fff8e1,stroke:#f9a825,stroke-width:2px,color:#e65100;
    classDef muted    fill:#fff,stroke:#9e9e9e,color:#616161;
    classDef alert    fill:#ffebee,stroke:#e53935,color:#b71c1c;
```

Rules that avoid broken output:

- **Quote every label** `["..."]` — `·—≥→/()` break unquoted.
- **No emojis in nodes** — headless Chromium renders them as tofu; use words.
- Shapes carry meaning — pick by role, not looks:
  - `([..])` start/end terminal · `[..]` process step · `[(..)]` datastore/DB
  - `{..}` **decision** (diamond) — every decision MUST have labeled branches:
    `C{"logged in?"} -->|Yes| D` and `C -->|No| E`. Don't fake a branch with a
    plain `[..]` step; a fork without a diamond + condition labels reads as a
    straight line and loses the "when this / when that" meaning.
- `<br/>` for line breaks; Korean renders fine with the fontFamily above.

### Color — meaning, not decoration (60-30-10)

Coloring every node flattens the hierarchy and nothing reads as important. Use
**2–3 colors that each carry meaning**, and let most nodes stay neutral:

- **~60% `muted`** (neutral white/gray) — ordinary steps, datastores, side paths.
- **~30% `main`** (one accent, e.g. indigo) — the pipeline you want the eye to
  follow (the happy path). Emphasize with `stroke-width`, not loud fills.
- **~10% semantic** — `decision` (amber) for diamonds, `alert` (red) for
  error/terminal states. Reserve these so a color instantly signals a role.

Rule of thumb: if a reader can't guess what a color *means*, drop it. One accent
is too plain (no role distinction); 5+ colors are noise (no hierarchy). 2–3
semantic colors give both hierarchy and classification while staying calm.

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
- **Mixed Korean+Latin on one line clips the trailing Latin.** A line like
  `"순차 BUILD"` loses its last char (→ "순차 BUIL"), but a pure-Latin line
  (`"team BUILD"`) renders fine. So don't end a 한글 line with a Latin word: put
  the Latin token on its own `<br/>` line (`"순차<br/>BUILD"`) or pad the line.
  A single trailing space is often NOT enough — verify the PNG and add more.
