"""Storyline checks: the rules in references/storyline.md, as code.

These run before any layout, so a deck with no thesis, a section nobody announced,
a number without a source, or a proposal with no counter-argument before it is
caught while it is still cheap to fix. Errors stop the build; warnings are shown.
"""

from __future__ import annotations

import re

from fonts import plain

ROLES = {
    "cover", "map", "section", "context", "claim", "evidence", "counter", "stance",
    "proposal", "example", "action", "conclusion", "ask", "close",
}
STRUCTURAL = {"cover", "map", "section", "close"}
PROPOSAL_SIDE = {"proposal", "example", "action"}
TYPES = {
    # type: (slides per minute low, high, map required)
    "talk": (0.8, 1.3, True),
    "share": (0.7, 1.2, True),
    "briefing": (0.5, 1.0, False),
}
# Titles that name a topic instead of saying something.
TOPIC_TITLES = {"개요", "배경", "현황", "소개", "목차", "결론", "요약", "정리", "참고", "기타", "agenda", "overview", "summary"}

# A space between a Latin letter, digit or closing bracket and a Korean particle
# ("RAG 의", "Claude Code 와"), and spaces just inside brackets or before punctuation.
PARTICLE = r"(?:의|를|을|가|이|은|는|와|과|로|으로|에|에서|에게|도|만|까지|부터|처럼|보다|이다|입니다|이고)"
SPACING = [
    (re.compile(rf"[A-Za-z0-9%)\]’”] {PARTICLE}(?=$|[\s,.?!)·:]|[^가-힣])"), "영문·숫자 뒤 조사 앞에 띄어쓰기"),
    (re.compile(r"\( | \)"), "괄호 안쪽 띄어쓰기"),
    (re.compile(r"[가-힣A-Za-z0-9)] [,.?!:](?!\d)"), "문장부호 앞 띄어쓰기"),
    (re.compile(r"  +"), "연속 공백"),
]
NUMBER = re.compile(r"\d")


def slide_texts(s: dict) -> list[tuple[str, str]]:
    """Every audience-facing string of a slide with its field path."""
    out: list[tuple[str, str]] = []

    def walk(v, path):
        if isinstance(v, str):
            if path.split(".")[-1] not in {"layout", "role", "stage", "id", "kind", "type", "path", "tone",
                                            "fit", "highlight", "answers", "notes", "plant", "payoff",
                                            "defines", "tags", "color", "fill", "line", "align"}:
                out.append((path, v))
        elif isinstance(v, list):
            for i, x in enumerate(v):
                walk(x, f"{path}[{i}]")
        elif isinstance(v, dict):
            for k, x in v.items():
                walk(x, f"{path}.{k}" if path else k)

    walk(s, "")
    return out


def has_number(s: dict) -> bool:
    """True when the slide states a figure: a hero, a chart, a KPI, or a table."""
    def walk(v):
        if isinstance(v, dict):
            if v.get("type") == "hero" or "value" in v or v.get("kind") in ("chart", "table"):
                return True
            return any(walk(x) for x in v.values())
        if isinstance(v, list):
            return any(walk(x) for x in v)
        return False
    return walk({k: s.get(k) for k in ("side", "visual", "items", "columns", "elements", "hero")})


def check(deck: dict, measure, stage: str = "build") -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    meta = deck.get("meta") or {}
    slides = deck.get("slides") or []
    kind = meta.get("type", "talk")

    def e(i, msg):
        errors.append(f"[{i + 1:02d} {slides[i].get('id', '')}] {msg}" if i is not None else msg)

    def w(i, msg):
        warnings.append(f"[{i + 1:02d} {slides[i].get('id', '')}] {msg}" if i is not None else msg)

    if kind not in TYPES:
        e(None, f"meta.type은 {', '.join(TYPES)} 중 하나입니다 (지금 {kind!r})")
        kind = "talk"
    thesis = meta.get("thesis", "")
    if not thesis:
        e(None, "meta.thesis(한 문장 주장)가 없습니다. 발표 전체가 이 문장 하나로 모여야 합니다")
    elif len(plain(thesis)) > 70:
        w(None, f"meta.thesis가 {len(plain(thesis))}자입니다. 70자 안의 한 문장으로 줄이세요")
    if not meta.get("audience"):
        w(None, "meta.audience(누가 듣는가)가 없습니다. 배경 설명의 깊이를 정하는 기준입니다")
    if not slides:
        e(None, "slides가 비었습니다")
        return errors, warnings

    stages = (deck.get("map") or {}).get("stages") or []
    stage_ids = [st.get("id") for st in stages]
    lo, hi, need_map = TYPES[kind]
    if need_map and not 3 <= len(stages) <= 5:
        e(None, f"{kind} 발표는 3–5단계의 지도(map.stages)가 필요합니다 (지금 {len(stages)}단계)")

    roles = [s.get("role") for s in slides]
    for i, s in enumerate(slides):
        r = s.get("role")
        if r not in ROLES:
            e(i, f"role이 없거나 알 수 없습니다: {r!r}")
    ids = [s.get("id") for s in slides]
    for i, sid in enumerate(ids):
        if not sid:
            e(i, "id가 없습니다")
        elif ids.index(sid) != i:
            e(i, f"id가 겹칩니다: {sid}")

    # Skeleton by deck type.
    if roles[0] != "cover":
        e(0, "첫 장은 표지(role: cover)입니다")
    if roles[-1] != "close" and kind != "briefing":
        e(len(slides) - 1, "마지막 장은 마무리(role: close)입니다")
    if kind in ("talk", "share"):
        if len(roles) < 2 or roles[1] != "map":
            e(1 if len(slides) > 1 else 0, "둘째 장은 지도(role: map)입니다. 목차 대신 이야기의 단계를 보여 줍니다")
        seen_sections = [s.get("stage") for s in slides if s.get("role") == "section"]
        for sid in stage_ids:
            if sid not in seen_sections:
                e(None, f"단계 {sid!r}의 구간 표지(role: section)가 없습니다")
        if seen_sections != [x for x in stage_ids if x in seen_sections]:
            e(None, "구간 표지 순서가 지도의 단계 순서와 다릅니다")
    if kind == "briefing":
        if len(roles) < 2 or roles[1] != "conclusion":
            e(1 if len(slides) > 1 else 0, "브리핑은 둘째 장에서 결론부터 말합니다 (role: conclusion)")
        if "ask" not in roles:
            e(None, "브리핑에는 결정 요청이나 다음 행동 장(role: ask)이 필요합니다")
        if not any(r in ("counter", "stance") for r in roles):
            w(None, "브리핑에 위험·반론 장(role: counter)이 없습니다")

    # Stage membership: content slides sit in the stage their section opened.
    current = None
    for i, s in enumerate(slides):
        if s.get("role") == "section":
            current = s.get("stage")
            if current not in stage_ids:
                e(i, f"지도에 없는 단계입니다: {current!r}")
        elif s.get("role") not in STRUCTURAL and stage_ids:
            if s.get("stage") is None:
                s["stage"] = current  # inherit the open section
            elif s.get("stage") != current:
                e(i, f"stage {s.get('stage')!r}가 열려 있는 구간 {current!r}와 다릅니다")

    # Counter-argument before the proposal.
    first_prop = next((i for i, r in enumerate(roles) if r in PROPOSAL_SIDE), None)
    counters_before = sum(1 for r in roles[: first_prop if first_prop is not None else len(roles)] if r == "counter")
    if kind in ("talk", "share") and first_prop is not None:
        if counters_before == 0:
            e(first_prop, "제안 앞에 반론 장(role: counter)이 하나도 없습니다. 불리한 근거를 먼저 보여 주세요")
        elif counters_before < 2 and kind == "talk":
            w(first_prop, f"제안 앞의 반론이 {counters_before}장입니다. 발표라면 2장 이상을 권합니다")
        if "stance" not in roles:
            w(None, "입장 장(role: stance)이 없습니다. 반론을 본 뒤 내 입장을 한 장으로 밝히세요")

    # Proposal share (talk): background should not swallow the talk.
    content = [s for s in slides if s.get("role") not in STRUCTURAL]
    if kind == "talk" and content:
        own = [s for s in content if s.get("role") in PROPOSAL_SIDE or "own" in (s.get("tags") or [])]
        share = len(own) / len(content)
        if share < 0.35:
            w(None, f"제안·예시·적용·직접 측정 장이 본문의 {share:.0%}입니다. 35% 이상을 권합니다 (배경이 발표를 삼키는 중)")

    # Plant and payoff: what is set up early is used again later.
    planted: dict[str, int] = {}
    for i, s in enumerate(slides):
        for p in s.get("plant") or []:
            planted.setdefault(p, i)
    paid = set()
    for i, s in enumerate(slides):
        for p in s.get("payoff") or []:
            if p not in planted:
                e(i, f"payoff {p!r}: 먼저 꺼낸 장(plant)이 없습니다")
            elif planted[p] >= i:
                e(i, f"payoff {p!r}: 꺼낸 장(plant)보다 앞에 있습니다")
            else:
                paid.add(p)
    for p, i in planted.items():
        if p not in paid:
            w(i, f"plant {p!r}: 뒤에서 다시 쓰지 않았습니다 (payoff 없음)")
    if kind == "talk" and len(paid) < 2:
        (e if not paid else w)(None, f"앞에서 꺼내 뒤에서 다시 쓰는 짝(plant→payoff)이 {len(paid)}개입니다. "
                                     "발표는 2개 이상, 권장 3개")
    if kind in ("talk", "share") and slides[-1].get("role") == "close" and stages:
        if slides[-1].get("layout", "close") != "close":
            w(len(slides) - 1, "마무리 장이 지도를 다시 보여 주지 않습니다 (layout: close)")

    # Terms: few, and defined before use.
    terms = deck.get("terms") or []
    if len(terms) > 7:
        w(None, f"새 용어가 {len(terms)}개입니다. 청중이 따라갈 수 있는 건 7개 안쪽입니다")
    defined_at = {}
    for i, s in enumerate(slides):
        for t in s.get("defines") or []:
            defined_at.setdefault(t, i)
    for t in terms:
        name = t.get("term") if isinstance(t, dict) else t
        if name not in defined_at:
            w(None, f"용어 {name!r}: 정의하는 장(defines)이 없습니다")
            continue
        for i, s in enumerate(slides[: defined_at[name]]):
            if s.get("role") in ("cover", "map"):
                continue
            if any(name in plain(txt) for _, txt in slide_texts(s)):
                w(i, f"용어 {name!r}: 정의한 {defined_at[name] + 1}장보다 먼저 나옵니다")
                break

    # Per slide.
    for i, s in enumerate(slides):
        r = s.get("role")
        if r in ("cover",):
            continue
        title = plain(s.get("title", ""))
        if r not in STRUCTURAL and r != "conclusion" and s.get("layout") != "statement" and not title:
            e(i, "제목이 없습니다. 제목은 주장이나 질문입니다")
        if title.strip().lower() in TOPIC_TITLES:
            e(i, f"제목 {title!r}: 주제 이름입니다. 이 장이 말하는 주장이나 질문으로 바꾸세요")
        if r not in STRUCTURAL and r not in ("conclusion",) and s.get("layout") != "statement" and not s.get("lead"):
            e(i, "부제(lead)가 없습니다. 왜 중요한지 한 문장으로 씁니다")
        if r not in STRUCTURAL and i > 2 and not s.get("answers") and slides[i - 1].get("role") not in ("section", "map"):
            w(i, "answers(앞 장에서 생긴 어떤 질문에 답하는지)가 비었습니다")
        if has_number(s) and not s.get("source"):
            e(i, "숫자나 차트가 있는데 출처(source)가 없습니다. 직접 잰 값이면 '직접 측정 · 날짜 · 표본'을 씁니다")
        if r == "example" and "example" not in (s.get("tags") or []):
            s.setdefault("tags", []).append("example")
        if stage == "build" and r not in DEFAULT_LAYOUT_ROLES and not s.get("layout"):
            e(i, "layout이 없습니다")
        for path, txt in slide_texts(s):
            for rx, why in SPACING:
                m = rx.search(txt)
                if m:
                    e(i, f"{path}: {why} — …{txt[max(0, m.start() - 8): m.end() + 8]}…")

    # Rhythm: the same layout more than three slides in a row flattens the talk.
    run, prev = 0, None
    for i, s in enumerate(slides):
        lay = s.get("layout")
        run = run + 1 if lay and lay == prev and s.get("role") not in STRUCTURAL else 1
        prev = lay
        if run == 4:
            w(i, f"layout {lay!r}가 네 장째 이어집니다. 다른 배치를 섞으세요")

    # Pace.
    minutes = meta.get("minutes")
    if minutes:
        n = len(slides)
        if not lo * minutes <= n <= hi * minutes + 2:
            w(None, f"{minutes}분에 {n}장입니다. {kind}는 분당 {lo}–{hi}장 ({lo * minutes:.0f}–{hi * minutes:.0f}장)을 권합니다")
    return errors, warnings


DEFAULT_LAYOUT_ROLES = {"cover", "map", "section", "close", "conclusion"}


def outline(deck: dict) -> str:
    """Markdown table of the storyline, for review before any design work."""
    meta = deck.get("meta") or {}
    stages = {st.get("id"): f"{i + 1:02d} {st.get('label', '')}"
              for i, st in enumerate((deck.get("map") or {}).get("stages") or [])}
    lines = [
        f"# {meta.get('title', '')}",
        "",
        f"- 한 문장 주장: {meta.get('thesis', '')}",
        f"- 청중: {meta.get('audience', '')} · 유형: {meta.get('type', 'talk')} · {meta.get('minutes', '?')}분 · {len(deck.get('slides') or [])}장",
    ]
    if stages:
        lines.append(f"- 지도: {' → '.join(stages.values())}")
    lines += ["", "| 장 | 구간 | 역할 | 이어받는 질문 | 제목 | 부제 | 근거·숫자 | 출처 |", "|---|---|---|---|---|---|---|---|"]
    current = ""
    for i, s in enumerate(deck.get("slides") or []):
        if s.get("role") == "section":
            current = stages.get(s.get("stage"), "")
        ev = []
        for b in s.get("side") or []:
            if b.get("value"):
                ev.append(b["value"])
        v = s.get("visual") or {}
        if v.get("kind"):
            ev.append(v.get("title") or v["kind"])
        for k in s.get("items") or []:
            if isinstance(k, dict) and k.get("value"):
                ev.append(k["value"])
        cell = lambda x: plain(str(x or "")).replace("|", "/").replace("\n", " ")
        mark = []
        if s.get("plant"):
            mark.append("심음:" + ",".join(s["plant"]))
        if s.get("payoff"):
            mark.append("회수:" + ",".join(s["payoff"]))
        role = s.get("role", "") + (f" ({'; '.join(mark)})" if mark else "")
        lines.append(f"| {i + 1} | {cell(current)} | {cell(role)} | {cell(s.get('answers'))} | {cell(s.get('title'))} | "
                     f"{cell(s.get('lead'))} | {cell(' · '.join(ev))} | {cell(s.get('source'))[:40]} |")
    return "\n".join(lines)
