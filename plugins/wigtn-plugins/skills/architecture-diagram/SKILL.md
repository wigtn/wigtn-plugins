---
name: architecture-diagram
description: >-
  Draw an architecture, system, or flow diagram as a committable hand-drawn (sketch)
  image — SVG + PNG — in the Excalidraw / Mermaid handDrawn look: rough outlines,
  pastel hachure fills, Korean handwriting titles. A clean style is available too.
  Text is measured in a real browser before layout, so labels never clip, and a layout
  check fails the render on overflow, overlap, or an edge running through a node or label. Use for READMEs, docs, slides, Devpost.
  Triggers on: '아키텍처 그려줘', '아키텍처 다이어그램', '구조도', '시스템 구성도',
  '플로우 그려줘', '흐름도', '다이어그램 그려줘', '손그림 다이어그램', '스케치 도식',
  'architecture diagram', 'system diagram', 'flow diagram', 'hand-drawn diagram',
  'sketch diagram', 'Devpost diagram'.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Architecture diagram (JSON spec → measured layout → hand-drawn SVG/PNG)

You write the **structure** as JSON. The renderer owns everything visual: it measures
each label in headless Chromium, lays out with ELK (layered, orthogonal routing), draws
with rough.js, embeds subset fonts in the SVG, and checks the result.

The look follows what makes Mermaid `look: handDrawn` and Excalidraw read well:
shapes rougher than lines (0.8 vs 0.35), pastel hachure fills from the open-color palette,
warm paper background, Poor Story handwriting for titles and annotations, Pretendard for
node labels so small text stays legible.

## 1. Decide what the diagram must say

- **The question it answers**: "what talks to what" (architecture) or "what happens in which order" (flow).
- **Zones**: client / service / data / external, or phases for a flow. These become `groups`.
- **The one path to follow**: the main request path or happy path. Only this gets `emphasis`.

If the diagram is of a real codebase, read the code first (entry points, services,
datastores, external calls) instead of guessing. 6–15 nodes reads well; split bigger systems
into two diagrams.

## 2. Write the spec (`<name>.json`)

```json
{
  "title": "서비스 아키텍처",
  "subtitle": "한 줄 설명 (선택)",
  "direction": "DOWN",
  "groups": [
    { "id": "client", "label": "클라이언트 (Next.js)", "tone": "blue" },
    { "id": "data", "label": "데이터" }
  ],
  "nodes": [
    { "id": "user", "label": "사용자", "shape": "actor" },
    { "id": "web", "label": "웹 앱", "sub": "Next.js", "group": "client", "emphasis": true },
    { "id": "pg", "label": "PostgreSQL", "sub": "주 DB", "group": "data", "shape": "db" },
    { "id": "pay", "label": "결제 대행사", "shape": "external" }
  ],
  "edges": [
    { "from": "user", "to": "web", "emphasis": true },
    { "from": "web", "to": "pg", "label": "조회", "emphasis": true },
    { "from": "pay", "to": "web", "dashed": true, "label": "웹훅" }
  ],
  "legend": [
    { "kind": "emphasis", "label": "주요 흐름" },
    { "kind": "dashed", "label": "비동기" }
  ]
}
```

| Field | Values | Notes |
|---|---|---|
| `direction` | `DOWN` · `RIGHT` | DOWN for layered architecture, RIGHT for pipelines and event flows |
| `style` | `sketch` (default) · `clean` | `clean` = crisp lines on white, for formal docs |
| `font` | `mixed` (default) · `hand` · `plain` | `hand` puts node labels in handwriting too; `plain` uses no handwriting |
| `tone` (top level) | a tone name | color for nodes outside any toned group (default `violet`) |
| `groups[].tone` | `gray` `blue` `green` `yellow` `orange` `violet` `red` `teal` | nodes inherit their group's tone; untoned groups are gray. `slate` / `amber` / `rose` are accepted as aliases of gray / orange / red |
| `nodes[].shape` | `box` `db` `queue` `actor` `external` `decision` | pick by role: datastore → `db`, queue/worker → `queue`, person/client → `actor`, 3rd party → `external`, branch → `decision` (each outgoing edge gets a condition label: 예/아니오, PASS/FAIL) |
| `nodes[].sub` | short second line | tech or role: "NestJS", "BullMQ" |
| `nodes[].tone` | a tone name | override for one node (rare) |
| `edges[].back` | `true` | feedback / retry edge (FAIL → 수정). Laid out forward, drawn reversed, so a loop never flips the main flow. Self-loops (`from` = `to`) are rejected |
| `legend[].kind` | `emphasis` `dashed` `external` `edge` | add a legend whenever emphasis, dashed edges, or external nodes appear |
| `background` | hex color, e.g. `#ffffff` | defaults to paper `#fdfcf8` (sketch) or white (clean) |

List nodes in reading order (upstream first).

**Design rules**
- **A tone means a zone.** Give each meaningful zone its own tone, at most 4. Leave supporting zones (data, infra) gray. Red only for guards, errors, and blocking paths.
- **Put nodes where their edges go.** A zone is drawn as one block, so if A → Kafka → B and A, B share a zone, the arrows loop around. Split producers and consumers into separate zones (see `examples/`).
- **One emphasized path.** `emphasis` makes outlines and arrows darker and thicker. If more than about a third of the nodes are emphasized, nothing stands out.
- **Short noun labels.** "인증 서비스", not "사용자 인증을 처리하는 서비스". Detail goes in `sub`.
- **Label an edge only when the verb isn't obvious** (웹훅, 비동기, PASS/FAIL, POST /orders).

## 3. Render

```bash
bash "${CLAUDE_PLUGIN_ROOT}/skills/architecture-diagram/scripts/render.sh" docs/diagrams/arch.json
# → docs/diagrams/arch.svg (fonts embedded) + arch.png (2x)
```

The first run installs `elkjs`, `roughjs`, `puppeteer` and `subset-font` and downloads the fonts (Poor Story, Pretendard; both SIL OFL) into `~/.cache/wigtn-diagram`.

Exit codes: `0` rendered and checks passed · `1` rendered, but a layout check failed — each problem is listed (text overflowing its box, overlapping nodes, an edge running through another node or another edge's label); fix the spec · `2` the spec is invalid or setup failed (missing node/npm, install or download error) — the message names the field; nothing about the layout needs changing.

## 4. Look at the PNG and fix the spec (required)

A passing check means nothing clips or overlaps. It says nothing about whether the diagram reads well. Read the PNG and check:

- Does the eye land on the emphasized path first?
- Do arrows loop around a zone or cross each other for no reason? → regroup nodes, reorder `nodes`, or switch `direction`.
- Is a zone mostly empty? → its nodes belong elsewhere, or the zone isn't needed.
- Is any label ambiguous without its `sub`?

Edit the spec and render again. Never hand-edit the SVG. If you cannot view images in this environment, say that the visual check was skipped instead of calling the diagram done.

Worked examples: `examples/layered-architecture.json` (DOWN, three layers) and `examples/pipeline-flow.json` (RIGHT, with a back edge).

## 5. Commit

Commit the `.json` source, the `.svg`, and the `.png`. The SVG carries its own fonts and looks the same in any viewer; the PNG is for places that don't take SVG. Embed with `![서비스 아키텍처](docs/diagrams/arch.png)`.

## Gotchas

- **Offline first run**: if the font download fails, the renderer falls back to system fonts and warns. The SVG is then not self-contained, and Korean on Linux needs `fonts-noto-cjk`.
- **Order inside a zone** follows the spec at the top level, but inside groups the layout engine may still reorder nodes to reduce crossings. If a column reads in the wrong order, split the group or change which nodes connect to it.
- **ids** allow only letters, digits, `_` and `-`. Labels can be anything (Korean, `/`, `→`, `&`).
- **Line breaks**: `\n` in a label forces one. Otherwise long labels wrap at spaces, never inside a word.
