"""Slide geometry: the grid, the type scale, and the layouts.

Every number here is in points on a 960 x 540 slide (PowerPoint's 16:9,
13.333 x 7.5 in). references/layout.md documents the same numbers; change both
together. A layout turns one slide of deck.json into a list of items (text boxes,
shapes, images, charts, tables) and records an error when text does not fit,
so the writer never has to guess.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

W, H = 960.0, 540.0
M = 48.0                 # left and right margin
CW = W - 2 * M           # content width, 864
BODY_TOP = 128.0         # content area: y 128..480
BODY_BOTTOM = 480.0
BODY_H = BODY_BOTTOM - BODY_TOP
GAP = 18.0               # between stacked blocks

# role: (size pt, bold, line height as a multiple of size)
TYPE = {
    "cover_title": (40, True, 1.15),
    "cover_sub": (20, False, 1.3),
    "section_no": (32, True, 1.1),
    "section_title": (32, True, 1.2),
    "title": (28, True, 1.15),
    "statement": (32, True, 1.3),
    "hero": (40, True, 1.1),
    "close": (26, True, 1.3),
    "quote": (24, True, 1.35),
    "map_label": (20, True, 1.25),
    "col_head": (20, True, 1.25),
    "heading": (18, True, 1.3),
    "quote_sm": (18, True, 1.35),
    "lead": (16, False, 1.3),
    "head": (16, True, 1.3),
    "body": (16, False, 1.35),
    "body_sm": (14, False, 1.4),
    "label": (14, True, 1.3),
    "event": (14, True, 1.3),
    "sub": (13, False, 1.3),
    "caption": (12, False, 1.3),
    "note": (12, False, 1.35),
    "meta": (10, True, 1.2),
    "source": (9, False, 1.3),
}
# Text the audience is meant to read is never below this. Captions and notes
# (12) explain a visual; source lines (9) and the breadcrumb (10) are not read aloud.
MIN_READ = 14
SMALL_ROLES = {"caption", "note", "sub", "meta", "source"}

ZONE = {
    "breadcrumb": (M + CW / 2, 14.0, CW / 2, 14.0),
    "badges": (M, 14.0, CW / 2, 14.0),
    "title": (M, 28.0, CW, 40.0),
    "rule_y": 76.0,
    "lead": (M, 86.0, CW, 24.0),
    "source": (M, 504.0, CW - 110, 18.0),
    "page": (W - M - 100, 503.0, 100.0, 18.0),
}

BADGE_TEXT = {"concept": "우리 제안", "example": "설명용 예시", "limit": "한계", "own": "직접 측정"}


@dataclass
class Ctx:
    deck: dict
    theme: dict
    measure: object
    base_dir: Path
    errors: list = field(default_factory=list)
    warnings: list = field(default_factory=list)
    index: int = 0          # 1-based page number of the slide being laid out
    slide_id: str = ""

    def err(self, where: str, msg: str):
        self.errors.append(f"[{self.index:02d} {self.slide_id}] {where}: {msg}")

    def warn(self, where: str, msg: str):
        self.warnings.append(f"[{self.index:02d} {self.slide_id}] {where}: {msg}")

    def stages(self) -> list[dict]:
        return (self.deck.get("map") or {}).get("stages") or []

    def stage_no(self, stage_id) -> int | None:
        for i, st in enumerate(self.stages(), 1):
            if st.get("id") == stage_id:
                return i
        return None


# ── text ────────────────────────────────────────────────────────────────────

def text_item(ctx: Ctx, role: str, text, x, y, w, *, max_lines=None, color="text", align="left",
              accent="accent", bullets=False, where=None, bold=None, h=None):
    """Lay out a text box at (x, y) of width w. Returns (item, height).

    `text` is a string or a list of paragraphs. Height follows the measured lines;
    more than max_lines (or more than h) is an error at `where`.
    """
    size, role_bold, lh = TYPE[role]
    bold = role_bold if bold is None else bold
    paras = text if isinstance(text, list) else [text]
    paras = [p for p in paras if p not in (None, "")]
    indent = size * 1.1 if bullets else 0.0
    lines = 0
    for p in paras:
        lines += len(ctx.measure.wrap(str(p), size, w - indent, bold))
    para_gap = size * 0.45 if bullets and len(paras) > 1 else 0.0
    height = lines * size * lh + para_gap * max(len(paras) - 1, 0)
    label = where or role
    if max_lines is not None and lines > max_lines:
        ctx.err(label, f"{lines}줄입니다. 최대 {max_lines}줄({size}pt, 폭 {w:.0f}pt). 문장을 줄이세요: {paras[0]!s:.40}")
    if h is not None and height > h + 0.5:
        ctx.err(label, f"높이 {height:.0f}pt가 자리 {h:.0f}pt를 넘습니다. 문장을 줄이거나 장을 나누세요")
    item = {
        "t": "text", "role": role, "paras": [str(p) for p in paras], "box": (x, y, w, max(height, size * lh)),
        "size": size, "bold": bold, "lh": lh, "color": color, "align": align, "accent": accent,
        "bullets": bullets, "indent": indent, "para_gap": para_gap,
    }
    return item, height


def rect(x, y, w, h, fill=None, line=None, lw=0.75, kind="rect", radius=0.0):
    return {"t": kind, "box": (x, y, w, h), "fill": fill, "line": line, "lw": lw, "radius": radius}


def hline(x1, y, x2, color="line", lw=0.75, arrow=False, dash=False):
    return {"t": "line", "p1": (x1, y), "p2": (x2, y), "color": color, "lw": lw, "arrow": arrow, "dash": dash}


def vline(x, y1, y2, color="line", lw=0.75):
    return {"t": "line", "p1": (x, y1), "p2": (x, y2), "color": color, "lw": lw, "arrow": False, "dash": False}


# Short content sits a little above the middle of the body area (the optical
# center), not at its top, so a slide with one row does not leave its bottom half empty.
OPTICAL = 0.42


def settle(items: list, top: float, height: float, area_top=BODY_TOP, area_h=BODY_H):
    """Move items laid out from `top` so their block sits at the optical center."""
    dy = max(0.0, area_top + (area_h - height) * OPTICAL - top)
    for it in items:
        if "box" in it:
            x, y, w, h = it["box"]
            it["box"] = (x, y + dy, w, h)
        if "p1" in it:
            it["p1"] = (it["p1"][0], it["p1"][1] + dy)
            it["p2"] = (it["p2"][0], it["p2"][1] + dy)
    return items


# ── chrome: header and footer of a content slide ────────────────────────────

def chrome(ctx: Ctx, s: dict, items: list, title=True):
    stage_no = ctx.stage_no(s.get("stage"))
    if stage_no:
        st = ctx.stages()[stage_no - 1]
        bx, by, bw, _ = ZONE["breadcrumb"]
        it, _ = text_item(ctx, "meta", f"=={stage_no:02d}==  {st.get('label', '')}", bx, by, bw,
                          color="muted", align="right", max_lines=1, where="breadcrumb")
        items.append(it)
    badges = [BADGE_TEXT[t] for t in s.get("tags") or [] if t in BADGE_TEXT and t != "own"]
    if badges:
        bx, by, bw, _ = ZONE["badges"]
        it, _ = text_item(ctx, "meta", "  ·  ".join(badges), bx, by, bw, color="accent", max_lines=1, where="tags")
        items.append(it)
    if title:
        x, y, w, _ = ZONE["title"]
        it, _ = text_item(ctx, "title", s.get("title", ""), x, y, w, max_lines=1, where="title")
        items.append(it)
        items.append(hline(M, ZONE["rule_y"], W - M, color="line", lw=0.75))
        if s.get("lead"):
            x, y, w, _ = ZONE["lead"]
            it, _ = text_item(ctx, "lead", s["lead"], x, y, w, max_lines=1, color="text2", where="lead")
            items.append(it)
    footer(ctx, s, items)


def footer(ctx: Ctx, s: dict, items: list):
    if s.get("source"):
        x, y, w, _ = ZONE["source"]
        it, _ = text_item(ctx, "source", s["source"], x, y, w, max_lines=2, color="muted", where="source")
        if it["box"][3] > 10:  # two lines grow upward so the footer keeps its baseline
            it["box"] = (x, y + 11.7 - it["box"][3], w, it["box"][3])
        items.append(it)
    x, y, w, h = ZONE["page"]
    signature = ctx.theme.get("signature")
    label = f"{ctx.index}"
    it, _ = text_item(ctx, "meta", label, x, y, w - (12 if signature == "page-dot" else 0),
                      color="muted", align="right", max_lines=1, where="page")
    items.append(it)
    if signature == "page-dot":
        items.append(rect(W - M - 6, y + 4.5, 6, 6, fill="accent", kind="oval"))


# ── blocks for the right-hand evidence column and other flows ───────────────

def block(ctx: Ctx, b: dict, x, y, w, where: str):
    """One stacked block. Returns (items, height)."""
    kind = b.get("type") or ("hero" if "value" in b else "point" if "head" in b else "text")
    items, hgt = [], 0.0
    tone = b.get("tone", "accent")
    if kind == "hero":
        it, h1 = text_item(ctx, "hero", b.get("value", ""), x, y, w, max_lines=1, color=tone, where=f"{where}.value")
        items.append(it); hgt = h1 + 2
        if b.get("label"):
            it, h2 = text_item(ctx, "label", b["label"], x, y + hgt, w, max_lines=2, where=f"{where}.label")
            items.append(it); hgt += h2 + 2
        if b.get("note"):
            it, h3 = text_item(ctx, "note", b["note"], x, y + hgt, w, max_lines=2, color="text2", where=f"{where}.note")
            items.append(it); hgt += h3
    elif kind == "point":
        it, h1 = text_item(ctx, "head", b.get("head", ""), x, y, w, max_lines=2,
                           color=b.get("tone", "text"), where=f"{where}.head")
        items.append(it); hgt = h1
        if b.get("text"):
            it, h2 = text_item(ctx, "body_sm", b["text"], x, y + hgt + 4, w, max_lines=4, color="text2",
                               where=f"{where}.text")
            items.append(it); hgt += 4 + h2
    elif kind == "quote":
        it, h1 = text_item(ctx, "quote_sm", f"“{b.get('text', '')}”", x, y, w, max_lines=5, where=f"{where}.text")
        items.append(it); hgt = h1
        if b.get("by"):
            it, h2 = text_item(ctx, "caption", f"— {b['by']}", x, y + hgt + 6, w, max_lines=1, color="text2",
                               where=f"{where}.by")
            items.append(it); hgt += 6 + h2
    elif kind == "list":
        it, hgt = text_item(ctx, "body_sm", b.get("items", []), x, y, w, bullets=True, color="text", where=where)
        items.append(it)
    else:
        it, hgt = text_item(ctx, b.get("role", "body"), b.get("text", ""), x, y, w,
                            color=b.get("tone", "text"), where=where)
        items.append(it)
    return items, hgt


def flow(ctx: Ctx, blocks: list, x, y, w, h, where: str, gap=GAP):
    items, cur = [], y
    for i, b in enumerate(blocks or []):
        if i and b.get("gap") is not None:
            cur += b["gap"]
        elif i:
            cur += gap
        its, hgt = block(ctx, b, x, cur, w, f"{where}[{i}]")
        items += its
        cur += hgt
    if cur - y > h + 0.5:
        ctx.err(where, f"내용 높이 {cur - y:.0f}pt가 자리 {h:.0f}pt를 넘습니다. 블록을 줄이거나 장을 나누세요")
    return items, cur - y


# ── visuals ─────────────────────────────────────────────────────────────────

def visual(ctx: Ctx, v: dict | None, x, y, w, h, where="visual"):
    if not v:
        ctx.err(where, "그림이 없습니다 (visual)")
        return []
    kind = v.get("kind")
    if kind in ("image", "diagram"):
        path = (ctx.base_dir / v.get("path", "")).resolve()
        if not v.get("path") or not path.is_file():
            ctx.err(where, f"이미지 파일이 없습니다: {v.get('path')}")
            return placeholder(ctx, x, y, w, h, v.get("path") or "image")
        return [{"t": "image", "path": path, "box": (x, y, w, h), "fit": v.get("fit", "contain")}]
    if kind == "chart":
        return chart_items(ctx, v, x, y, w, h, where)
    if kind == "table":
        return table_items(ctx, v, x, y, w, h, where)
    if kind == "placeholder":
        ctx.warn(where, f"자리표시 그림이 남아 있습니다: {v.get('label', '')}")
        return placeholder(ctx, x, y, w, h, v.get("label", ""))
    ctx.err(where, f"알 수 없는 visual.kind: {kind}")
    return []


def placeholder(ctx, x, y, w, h, label):
    it, th = text_item(ctx, "caption", f"[그림] {label}", x + 16, y + h / 2 - 8, w - 32, color="muted",
                       align="center", where="placeholder")
    return [rect(x, y, w, h, fill="surface", line="line", lw=1), it]


def chart_items(ctx: Ctx, v: dict, x, y, w, h, where):
    items = []
    top = y
    if v.get("title"):
        it, th = text_item(ctx, "label", v["title"], x, y, w, max_lines=1, where=f"{where}.title")
        items.append(it)
        top = y + th + 10
    cats = v.get("categories") or []
    series = v.get("series") or []
    if not cats or not series:
        ctx.err(where, "차트에 categories와 series가 필요합니다")
        return items
    for sr in series:
        if len(sr.get("values") or []) != len(cats):
            ctx.err(where, f"series '{sr.get('name')}'의 값 개수가 categories와 다릅니다")
    if v.get("type", "bar") == "bar" and len(cats) * 24 > (y + h - top):
        ctx.err(where, f"막대 {len(cats)}개가 높이 {y + h - top:.0f}pt에 들어가지 않습니다 (막대당 24pt 이상)")
    items.append({"t": "chart", "spec": v, "box": (x, top, w, y + h - top)})
    return items


def table_items(ctx: Ctx, v: dict, x, y, w, h, where):
    header = v.get("header") or []
    rows = v.get("rows") or []
    ncol = len(header) or (len(rows[0]) if rows else 0)
    if not ncol:
        ctx.err(where, "표에 header나 rows가 필요합니다")
        return []
    widths = v.get("col_widths") or [1] * ncol
    total = sum(widths)
    col_w = [w * c / total for c in widths]
    size = 14
    row_h = []
    for r_i, row in enumerate(([header] if header else []) + rows):
        if len(row) != ncol:
            ctx.err(where, f"{r_i + 1}번째 행의 칸 수가 {ncol}이 아닙니다")
            row = (row + [""] * ncol)[:ncol]
        lines = max(len(ctx.measure.wrap(str(c), size, cw - 20, r_i == 0 and bool(header))) for c, cw in zip(row, col_w))
        row_h.append(lines * size * 1.3 + 16)
    if sum(row_h) > h + 0.5:
        ctx.err(where, f"표 높이 {sum(row_h):.0f}pt가 자리 {h:.0f}pt를 넘습니다. 행을 줄이거나 장을 나누세요")
    return [{"t": "table", "spec": v, "box": (x, y, w, sum(row_h)), "col_w": col_w, "row_h": row_h}]


# ── layouts ─────────────────────────────────────────────────────────────────

def lay_cover(ctx: Ctx, s: dict):
    meta = ctx.deck.get("meta", {})
    items = [{"t": "logo", "variant": "full", "box": (M, 44.0, 0, 22.0)}]
    items.append(rect(M, 150, 40, 4, fill="accent"))
    event = "  ·  ".join(p for p in (meta.get("event"), meta.get("date")) if p)
    if event:
        it, _ = text_item(ctx, "event", event, M, 164, 720, max_lines=1, color="accent", where="meta.event")
        items.append(it)
    # With a cover visual the text keeps the left 520pt and the visual takes the right.
    tw = 500.0 if s.get("visual") else 760.0
    if s.get("visual"):
        items += visual(ctx, s["visual"], M + tw + 36, BODY_TOP, CW - tw - 36, BODY_H)
    it, th = text_item(ctx, "cover_title", s.get("title") or meta.get("title", ""), M, 192, tw,
                       max_lines=3 if s.get("visual") else 2, where="title")
    items.append(it)
    sub = s.get("lead") or meta.get("subtitle")
    if sub:
        it, _ = text_item(ctx, "cover_sub", sub, M, 192 + th + 16, tw, max_lines=2, color="text2", where="subtitle")
        items.append(it)
    if meta.get("speaker"):
        it, _ = text_item(ctx, "head", meta["speaker"], M, 420, 520, max_lines=1, where="meta.speaker")
        items.append(it)
    if meta.get("affiliation"):
        it, _ = text_item(ctx, "body_sm", meta["affiliation"], M, 443, 520, max_lines=1, color="text2",
                          where="meta.affiliation")
        items.append(it)
    if ctx.theme.get("signature") == "page-dot":
        items.append(rect(W - M - 10, H - 46, 10, 10, fill="accent", kind="oval"))
    return items


def map_items(ctx: Ctx, y0: float, highlight=None, compact=False, upto=None):
    stages = ctx.stages()
    n = len(stages)
    most = 6 if (ctx.deck.get("meta") or {}).get("type") == "case" else 5
    if not 3 <= n <= most:
        ctx.err("map.stages", f"지도 단계는 3–{most}개여야 합니다 (지금 {n}개)")
        if not n:
            return [], 0
    # Six stages (a case talk) keep the row inside 864pt with a narrower gap and 16pt names.
    gap = 24.0 if n >= 6 else 36.0
    cw = (CW - gap * (n - 1)) / n
    items, bottom = [], y0
    for i, st in enumerate(stages):
        x = M + i * (cw + gap)
        active = highlight is None or st.get("id") == highlight
        done = upto is not None and i < upto
        bar = "accent" if (highlight is not None and active) else ("text" if highlight is None else "line")
        items.append(rect(x, y0, cw, 3, fill=bar))
        tone_no = "accent" if active else "muted"
        tone_label = "text" if active or done else "muted"
        it, h1 = text_item(ctx, "label" if compact else "event", f"{i + 1:02d}", x, y0 + 14, cw,
                           max_lines=1, color=tone_no, where=f"map[{i}]")
        items.append(it)
        role = "head" if compact or n >= 6 else "map_label"
        it, h2 = text_item(ctx, role, st.get("label", ""), x, y0 + 38, cw, max_lines=2,
                           color=tone_label, where=f"map[{i}].label")
        items.append(it)
        cur = y0 + 38 + h2
        if st.get("sub"):
            it, h3 = text_item(ctx, "sub", st["sub"], x, cur + 4, cw, max_lines=1,
                               color="text2" if active else "muted", where=f"map[{i}].sub")
            items.append(it); cur += 4 + h3
        if st.get("desc") and not compact:
            it, h4 = text_item(ctx, "body_sm", st["desc"], x, cur + 10, cw, max_lines=3,
                               color="text2" if active else "muted", where=f"map[{i}].desc")
            items.append(it); cur += 10 + h4
        bottom = max(bottom, cur)
        if i < n - 1:
            ay = y0 + 38 + TYPE[role][0] * 0.65
            items.append(hline(x + cw + 8, ay, x + cw + gap - 8, color="muted", lw=1.25, arrow=True))
    return items, bottom - y0


def lay_map(ctx: Ctx, s: dict):
    items = []
    chrome(ctx, s, items)
    its, mh = map_items(ctx, BODY_TOP, highlight=s.get("highlight"))
    return items + settle(its, BODY_TOP, mh)


def lay_section(ctx: Ctx, s: dict):
    items = []
    no = ctx.stage_no(s.get("stage"))
    if no is None:
        ctx.err("stage", f"지도에 없는 단계입니다: {s.get('stage')}")
        footer(ctx, s, items)
        return items
    st = ctx.stages()[no - 1]
    its, _ = map_items(ctx, BODY_TOP - 64, highlight=st.get("id"), compact=True, upto=no - 1)
    items += its
    it, h1 = text_item(ctx, "section_no", f"{no:02d}", M, 292, 200, max_lines=1, color="accent", where="section.no")
    items.append(it)
    it, h2 = text_item(ctx, "section_title", s.get("title") or st.get("label", ""), M, 292 + h1 + 6, CW,
                       max_lines=1, where="title")
    items.append(it)
    if s.get("lead"):
        it, _ = text_item(ctx, "heading", s["lead"], M, 292 + h1 + 6 + h2 + 14, CW, max_lines=2, color="text2",
                          bold=False, where="lead")
        items.append(it)
    footer(ctx, s, items)
    return items


def lay_visual_evidence(ctx: Ctx, s: dict):
    items = []
    chrome(ctx, s, items)
    vw, sw, gap = 508.0, 324.0, 32.0
    vx, sx = (M, M + vw + gap) if not s.get("flip") else (M + sw + gap, M)
    cap_h = 22.0 if s.get("caption") else 0.0
    items += visual(ctx, s.get("visual"), vx, BODY_TOP, vw, BODY_H - cap_h)
    if s.get("caption"):
        it, _ = text_item(ctx, "caption", s["caption"], vx, BODY_BOTTOM - 16, vw, max_lines=1, color="text2",
                          where="caption")
        items.append(it)
    its, _ = flow(ctx, s.get("side"), sx, BODY_TOP + 8, sw, BODY_H - 8, "side")
    return items + its


def lay_chart(ctx: Ctx, s: dict):
    items = []
    chrome(ctx, s, items)
    v = s.get("visual") or {}
    if v.get("kind") != "chart":
        ctx.err("visual", "chart 레이아웃에는 kind가 chart인 visual이 필요합니다")
    if s.get("side"):
        items += visual(ctx, v, M, BODY_TOP, 560, BODY_H)
        its, _ = flow(ctx, s["side"], M + 592, BODY_TOP + 8, CW - 592, BODY_H - 8, "side")
        items += its
    else:
        items += visual(ctx, v, M, BODY_TOP, CW, BODY_H)
    return items


def lay_compare(ctx: Ctx, s: dict):
    items = []
    chrome(ctx, s, items)
    cols = s.get("columns") or []
    n = len(cols)
    if not 2 <= n <= 3:
        ctx.err("columns", f"비교는 2–3칸입니다 (지금 {n}칸)")
        return items
    gap = 40.0
    cw = (CW - gap * (n - 1)) / n
    top = BODY_TOP + 8
    group, tallest = [], 0.0
    for i, c in enumerate(cols):
        x = M + i * (cw + gap)
        blocks = [{"type": "text", "role": "col_head", "text": c.get("head", ""), "tone": c.get("tone", "text")}]
        if c.get("sub"):
            blocks.append({"type": "text", "role": "sub", "text": c["sub"], "tone": "text2", "gap": 4})
        if c.get("points"):
            blocks.append({"type": "list", "items": c["points"], "gap": 14})
        if c.get("hero"):
            blocks.append(dict(c["hero"], type="hero", gap=22))
        its, ch = flow(ctx, blocks, x, top, cw, BODY_H - 8, f"columns[{i}]")
        group += its
        tallest = max(tallest, ch)
    # Dividers run as tall as the tallest column, not to the bottom of the slide.
    for i in range(1, n):
        group.append(vline(M + i * (cw + gap) - gap / 2, top, top + tallest))
    return items + settle(group, top, tallest)


def lay_cards(ctx: Ctx, s: dict):
    items = []
    chrome(ctx, s, items)
    cards = s.get("items") or []
    n = len(cards)
    if not 2 <= n <= 4:
        ctx.err("items", f"카드는 2–4장입니다 (지금 {n}장)")
        return items
    gap, pad = 24.0, 24.0
    cw = (CW - gap * (n - 1)) / n
    top, room = BODY_TOP + 8, BODY_H - 8
    texts, tallest = [], 0.0
    for i, c in enumerate(cards):
        x = M + i * (cw + gap)
        blocks = [{"type": "text", "role": "label", "text": c.get("num", f"{i + 1:02d}"), "tone": c.get("tone", "accent")},
                  {"type": "text", "role": "heading", "text": c.get("head", ""), "gap": 8}]
        if c.get("text"):
            blocks.append({"type": "text", "role": "body_sm", "text": c["text"], "tone": "text2", "gap": 10})
        if c.get("hero"):
            blocks.append(dict(c["hero"], type="hero", gap=18))
        its, ch = flow(ctx, blocks, x + pad, top + pad, cw - 2 * pad, room - 2 * pad, f"items[{i}]")
        texts += its
        tallest = max(tallest, ch)
    # Cards share one height: the tallest card's content, at least 160pt so a short card still reads as a card.
    hgt = min(room, max(160.0, tallest + 2 * pad))
    boxes = [rect(M + i * (cw + gap), top, cw, hgt, fill="surface", kind="round", radius=8) for i in range(n)]
    return items + settle(boxes + texts, top, hgt)


def lay_kpi(ctx: Ctx, s: dict):
    items = []
    chrome(ctx, s, items)
    kp = s.get("items") or []
    n = len(kp)
    if not 2 <= n <= 4:
        ctx.err("items", f"큰 숫자는 2–4개입니다 (지금 {n}개)")
        return items
    gap = 32.0
    cw = (CW - gap * (n - 1)) / n
    group, tallest = [], 0.0
    for i, k in enumerate(kp):
        its, kh = flow(ctx, [dict(k, type="hero")], M + i * (cw + gap), BODY_TOP, cw, 200, f"items[{i}]")
        group += its
        tallest = max(tallest, kh)
    if s.get("foot"):
        group.append(hline(M, BODY_TOP + tallest + 36, W - M, color="line"))
        it, fh = text_item(ctx, "body", s["foot"], M, BODY_TOP + tallest + 56, CW, max_lines=2, where="foot")
        group.append(it)
        tallest += 56 + fh
    return items + settle(group, BODY_TOP, tallest)


def lay_quote(ctx: Ctx, s: dict):
    items = []
    chrome(ctx, s, items)
    q = s.get("quote") or {}
    top = BODY_TOP
    group = []
    it, qh = text_item(ctx, "quote", f"“{q.get('text', '')}”", M + 24, top, CW - 100, max_lines=4, where="quote.text")
    group.append(it)
    group.append(rect(M, top, 4, qh, fill="accent"))
    cur = top + qh
    if q.get("by"):
        it, h2 = text_item(ctx, "sub", f"— {q['by']}", M + 24, cur + 12, CW - 100, max_lines=1, color="text2",
                           where="quote.by")
        group.append(it); cur += 12 + h2
    if q.get("translation"):
        it, h3 = text_item(ctx, "heading", q["translation"], M + 24, cur + 22, CW - 100, max_lines=2, bold=False,
                           where="quote.translation")
        group.append(it); cur += 22 + h3
    return items + settle(group, top, cur - top)


def lay_statement(ctx: Ctx, s: dict):
    items = []
    has_title = bool(s.get("title"))
    chrome(ctx, s, items, title=has_title)
    top = 200.0 if has_title else 190.0
    it, th = text_item(ctx, "statement", s.get("text", ""), M, top, CW, max_lines=3, where="text")
    items.append(it)
    if s.get("sub"):
        it, _ = text_item(ctx, "heading", s["sub"], M, top + th + 18, CW, max_lines=2, color="text2", bold=False,
                          where="sub")
        items.append(it)
    return items


def lay_qa(ctx: Ctx, s: dict):
    items = []
    chrome(ctx, s, items)
    blocks = []
    for i, qa in enumerate(s.get("items") or []):
        blocks.append({"type": "text", "role": "heading", "text": f"{i + 1}. {qa.get('q', '')}"})
        blocks.append({"type": "text", "role": "body_sm", "text": qa.get("a", ""), "tone": "text2", "gap": 6})
    if len(s.get("items") or []) > 3:
        ctx.err("items", "질문은 3개까지입니다")
    its, _ = flow(ctx, blocks, M, BODY_TOP + 8, 540, BODY_H - 8, "items", gap=22)
    items += its
    px, pw = M + 580, CW - 580
    summary = s.get("summary") or {}
    side = []
    if summary.get("head"):
        side.append({"type": "text", "role": "col_head", "text": summary["head"]})
    if summary.get("lines"):
        side.append({"type": "list", "items": summary["lines"], "gap": 12})
    its, sh = flow(ctx, side, px + 20, BODY_TOP + 16, pw - 20, 260, "summary")
    items += its
    items.append(vline(px, BODY_TOP + 8, BODY_TOP + 16 + max(sh, 120) + 8, color="accent", lw=2))
    if s.get("bridge"):
        it, _ = text_item(ctx, "heading", s["bridge"], px, BODY_BOTTOM - 48, pw, max_lines=2, color="accent",
                          where="bridge")
        items.append(it)
    return items


def lay_steps(ctx: Ctx, s: dict):
    items = []
    chrome(ctx, s, items)
    steps = s.get("steps") or []
    n = len(steps)
    if not 3 <= n <= 6:
        ctx.err("steps", f"단계는 3–6개입니다 (지금 {n}개)")
        return items
    if s.get("visual"):
        items += visual(ctx, s["visual"], M, BODY_TOP, 500, BODY_H)
        blocks = []
        for i, st in enumerate(steps):
            blocks.append({"type": "point", "head": f"=={i + 1}==  {st.get('head', '')}", "text": st.get("text", ""),
                           "tone": st.get("tone", "text")})
        its, _ = flow(ctx, blocks, M + 532, BODY_TOP + 8, CW - 532, BODY_H - 8, "steps", gap=14)
        return items + its
    gap = 24.0
    cw = (CW - gap * (n - 1)) / n
    cy = BODY_TOP
    group, tallest = [], 0.0
    group.append(hline(M + 18, cy + 18, M + (n - 1) * (cw + gap) + 18, color="line", lw=1.5))
    for i, st in enumerate(steps):
        x = M + i * (cw + gap)
        tone = st.get("tone", "accent" if i == n - 1 else "text")
        group.append(rect(x, cy, 36, 36, fill=tone, kind="oval"))
        it, _ = text_item(ctx, "label", str(i + 1), x, cy + 9, 36, max_lines=1, color="on_accent", align="center",
                          where=f"steps[{i}].no")
        group.append(it)
        its, fh = flow(ctx, [{"type": "point", "head": st.get("head", ""), "text": st.get("text", "")}],
                       x, cy + 56, cw, BODY_H - 56, f"steps[{i}]")
        group += its
        tallest = max(tallest, 56 + fh)
    return items + settle(group, cy, tallest)


def lay_table(ctx: Ctx, s: dict):
    items = []
    chrome(ctx, s, items)
    items += visual(ctx, dict(s.get("visual") or {}, kind="table"), M, BODY_TOP + 8, CW, BODY_H - 8)
    return items


def lay_image(ctx: Ctx, s: dict):
    items = []
    chrome(ctx, s, items)
    cap_h = 22.0 if s.get("caption") else 0.0
    items += visual(ctx, s.get("visual"), M, BODY_TOP, CW, BODY_H - cap_h)
    if s.get("caption"):
        it, _ = text_item(ctx, "caption", s["caption"], M, BODY_BOTTOM - 16, CW, max_lines=1, color="text2",
                          where="caption")
        items.append(it)
    return items


def lay_close(ctx: Ctx, s: dict):
    items = []
    has_title = bool(s.get("title"))
    chrome(ctx, s, items, title=has_title)
    stages = ctx.stages()
    hl = s.get("highlight") or (stages[-1].get("id") if stages else None)
    top = BODY_TOP if has_title else 64.0
    y0, group = top, []
    if stages:
        its, mh = map_items(ctx, y0, highlight=hl, compact=True, upto=len(stages))
        group += its
        y0 += mh + 56
    it, th = text_item(ctx, "close", s.get("text", ""), M, y0, CW, max_lines=2, where="text")
    group.append(it)
    y0 += th
    if s.get("contact"):
        it, ch = text_item(ctx, "body_sm", s["contact"], M, y0 + 18, CW, max_lines=1, color="text2",
                           where="contact")
        group.append(it)
        y0 += 18 + ch
    area_top = top
    return items + settle(group, top, y0 - top, area_top=area_top, area_h=BODY_BOTTOM - area_top)


def lay_free(ctx: Ctx, s: dict):
    """Absolute layout from `elements`, for slides rebuilt object by object from a reference image."""
    items = []
    chrome(ctx, s, items, title=bool(s.get("title")))
    for i, e in enumerate(s.get("elements") or []):
        where = f"elements[{i}]"
        x, y, w, h = (float(e.get(k, 0)) for k in ("x", "y", "w", "h"))
        kind = e.get("kind")
        if kind == "text":
            role = e.get("role", "body")
            if role not in TYPE:
                ctx.err(where, f"알 수 없는 role: {role}")
                continue
            it, _ = text_item(ctx, role, e.get("text", ""), x, y, w, h=h or None, color=e.get("color", "text"),
                              align=e.get("align", "left"), bullets=bool(e.get("bullets")), where=where)
            items.append(it)
        elif kind in ("rect", "round", "oval"):
            items.append(rect(x, y, w, h, fill=e.get("fill"), line=e.get("line"), lw=e.get("lw", 0.75), kind=kind,
                              radius=e.get("radius", 8)))
        elif kind == "line":
            items.append({"t": "line", "p1": (x, y), "p2": (x + w, y + h), "color": e.get("color", "line"),
                          "lw": e.get("lw", 0.75), "arrow": bool(e.get("arrow")), "dash": bool(e.get("dash"))})
        elif kind in ("image", "chart", "table", "placeholder", "diagram"):
            items += visual(ctx, dict(e, kind=kind), x, y, w, h, where)
        else:
            ctx.err(where, f"알 수 없는 kind: {kind}")
    return items


LAYOUTS = {
    "cover": lay_cover, "map": lay_map, "section": lay_section, "visual-evidence": lay_visual_evidence,
    "chart": lay_chart, "compare": lay_compare, "cards": lay_cards, "kpi": lay_kpi, "quote": lay_quote,
    "statement": lay_statement, "qa": lay_qa, "steps": lay_steps, "table": lay_table, "image": lay_image,
    "close": lay_close, "free": lay_free,
}
DEFAULT_LAYOUT = {"cover": "cover", "map": "map", "section": "section", "close": "close", "conclusion": "statement"}


def check_geometry(ctx: Ctx, items: list):
    """Every item inside the slide, text inside the safe margins, no two text boxes overlapping."""
    texts = []
    for it in items:
        if it["t"] == "line":
            (x1, y1), (x2, y2) = it["p1"], it["p2"]
            box = (min(x1, x2), min(y1, y2), abs(x2 - x1), abs(y2 - y1))
        elif it["t"] == "logo":
            continue
        else:
            box = it["box"]
        x, y, w, h = box
        if x < -0.5 or y < -0.5 or x + w > W + 0.5 or y + h > H + 0.5:
            ctx.err("geometry", f"{it['t']}이(가) 슬라이드 밖으로 나갑니다 ({x:.0f},{y:.0f},{w:.0f},{h:.0f})")
        if it["t"] == "text":
            if x < M - 24 - 0.5 or x + w > W - M + 24 + 0.5:
                ctx.err("geometry", f"글자가 좌우 여백({M - 24:.0f}pt) 안쪽을 벗어납니다: {it['paras'][:1]}")
            if it["size"] < MIN_READ and it["role"] not in SMALL_ROLES:
                ctx.err("geometry", f"{it['role']} 글자가 {it['size']}pt입니다. 읽히는 글자는 {MIN_READ}pt 이상")
            texts.append(it)
    for i, a in enumerate(texts):
        for b in texts[i + 1:]:
            ax, ay, aw, ah = a["box"]
            bx, by, bw, bh = b["box"]
            if ax < bx + bw - 1 and bx < ax + aw - 1 and ay < by + bh - 1 and by < ay + ah - 1:
                ctx.err("geometry", f"글자 상자가 겹칩니다: {a['paras'][:1]} / {b['paras'][:1]}")
