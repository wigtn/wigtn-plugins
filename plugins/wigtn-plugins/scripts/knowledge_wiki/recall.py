#!/usr/bin/env python3
"""Knowledge Wiki recall — UserPromptSubmit / SessionStart 훅 엔트리.

쌓기만 하고 다시 꺼내지 않으면 위키는 아무도 읽지 않는 로그가 된다. 이 훅은 프롬프트와
관련 있는 위키 글을 찾아 제목과 요약 한 줄을 컨텍스트에 붙인다. 본문은 붙이지 않는다 -
필요하면 Claude 가 경로를 보고 직접 읽는다.

    (인자 없음)  UserPromptSubmit — 검색해서 주입. 동기 훅이라 clone·네트워크를 하지 않는다.
    --sync       SessionStart     — 위키를 pull 하고 밀린 push 를 보낸다 (없으면 clone).

경계:
- **쓰는 위키에서만 읽는다.** G0(``gates.resolve_tenant``)와 같은 판정을 쓰므로 exclude 된
  repo·범위 밖 repo 에는 아무것도 주입하지 않는다. 팀 지식이 다른 테넌트 작업으로 새는
  반대 방향 유출을 막는다.
- 같은 글은 세션당 한 번만, 전체 ``_MAX_CHARS`` 이내.
- 어떤 실패도 프롬프트를 막지 않는다 (항상 exit 0, 실패하면 출력 없음).

글 형식은 ``compile._COMPILE_PROMPT`` 가 정한다: ``# 제목`` / ``> 요약`` / ``태그:`` /
``<!-- project: ... -->``. 메타데이터를 따로 두지 않고 본문에서 읽는다.
"""

from __future__ import annotations

import hashlib
import json
import math
import re
import sys
import time
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterator

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from knowledge_wiki import config, gates  # noqa: E402

_ROOTS = ("per-user", "shared")   # 검색 대상. ouroboros/ 는 형식이 다른 봇 출력이라 뺀다
_MAX_HITS = 3
_MAX_CHARS = 1200
# 하한은 "드문 검색어 두 개가 한 번씩 겹친 점수" 다. BM25 점수는 글 수에 따라 커지므로
# 고정값을 쓰면 글이 적은 위키에서는 아무것도 안 나온다. 실제 위키 70건 기준 하한은 약 7.7,
# 맞는 글은 13~32점, "이 파일 이름 바꿔줘" 같은 일반 요청은 5점 안팎이었다.
# 1등 근처만 남기는 상대 하한은 "1등은 맞고 2·3등은 우연" 인 경우를 거른다.
_MIN_RARE_TERMS = 2.0              # 절대 하한 = 이 값 × 가장 드문 단어의 IDF
_RELATIVE = 0.65                   # 1등 점수 대비 하한
_MIN_MATCHED = 2                   # 겹치는 검색어가 이보다 적으면 우연의 일치로 본다
_SEEN_TTL = 3 * 86400
_QUIET_SYNC = frozenset({"pull 완료", "pull 완료 (push 보류)", "remote 없음 - 동기화 생략"})

_ASCII = re.compile(r"[a-z0-9][a-z0-9+#]*")
_HANGUL = re.compile(r"[가-힣]+")
_STOP = frozenset(
    "the a an to of and or in on for is it this that with be as at by from are was "
    "can do not we you i me my our how what why when".split()
)


def tokenize(text: str) -> list[str]:
    """영문은 단어, 한글은 2글자 조각(bigram).

    형태소 분석기 없이 한국어를 찾으려면 조각으로 자르는 게 가장 단순하다. "캐시 무효화"와
    "캐시를 무효화할 때"가 "캐시"·"무효"·"효화" 를 공유한다. 흔한 조각은 IDF 가 깎는다.
    """
    lowered = text.lower()
    tokens = [t for t in _ASCII.findall(lowered) if len(t) > 1 and t not in _STOP]
    for run in _HANGUL.findall(lowered):
        tokens.extend(run[i:i + 2] for i in range(len(run) - 1))
    return tokens


@dataclass
class Entry:
    rel: str
    title: str
    summary: str
    tags: list[str]
    project: str
    terms: Counter = field(default_factory=Counter)
    length: int = 0


def parse_article(text: str) -> tuple[str, str, list[str], str]:
    """(제목, 요약, 태그, project). 형식이 다르면 빈 값."""
    title = summary = project = ""
    tags: list[str] = []
    for line in text.splitlines():
        stripped = line.strip()
        if not title and stripped.startswith("# "):
            title = stripped[2:].strip()
        elif title and not summary and stripped.startswith("> "):
            summary = stripped[2:].strip()
        elif stripped.startswith("태그:"):
            tags = [t.strip() for t in stripped[3:].split(",") if t.strip()]
        elif stripped.startswith("<!-- project:"):
            project = stripped[len("<!-- project:"):].split("·")[0].strip()
    return title, summary, tags, project


def iter_articles(wiki: Path) -> Iterator[tuple[str, str]]:
    """(위키 기준 상대경로, 본문). per-user/·shared/ 의 글만."""
    for root in _ROOTS:
        base = wiki / root
        if not base.is_dir():
            continue
        for path in sorted(base.rglob("*.md")):
            if path.name.startswith(".") or path.name.upper() == "README.MD":
                continue
            try:
                yield path.relative_to(wiki).as_posix(), path.read_text(
                    encoding="utf-8", errors="replace")
            except OSError:
                continue


def load_entries(wiki: Path) -> list[Entry]:
    entries: list[Entry] = []
    for rel, text in iter_articles(wiki):
        title, summary, tags, project = parse_article(text)
        if not title:
            continue
        # 제목·태그·요약이 본문보다 주제를 잘 말한다 - 반복해서 가중한다
        terms = Counter(tokenize(text))
        for weight, part in ((2, title), (1, " ".join(tags)), (1, summary)):
            for token in tokenize(part):
                terms[token] += weight
        entries.append(Entry(
            rel=rel, title=title, summary=summary,
            tags=tags, project=project, terms=terms, length=sum(terms.values()),
        ))
    return entries


def known_tags(wiki: Path, limit: int = 40) -> list[str]:
    """위키에 이미 있는 태그, 많이 쓰인 순.

    G2 에 어휘로 넘긴다. 같은 주제에 "reproducibility" 와 "재현성" 이 따로 붙으면
    색인의 태그 묶음과 그래프가 쪼개진다. 대소문자만 다른 태그는 처음 쓰인 표기로 센다.
    """
    counts: Counter = Counter()
    label: dict[str, str] = {}
    for _, text in iter_articles(wiki):
        for tag in parse_article(text)[2]:
            key = tag.lower()
            label.setdefault(key, tag)
            counts[key] += 1
    return [label[key] for key, _ in counts.most_common(limit)]


def search(entries: list[Entry], query: str) -> list[tuple[float, Entry]]:
    """BM25. 하한을 넘고 검색어가 충분히 겹친 글만, 점수 순으로."""
    if not entries:
        return []
    words = set(tokenize(query))
    if len(words) < _MIN_MATCHED:
        return []

    n = len(entries)
    avg = sum(e.length for e in entries) / n or 1.0
    df = Counter(w for e in entries for w in words if w in e.terms)
    k1, b = 1.2, 0.75
    min_score = _MIN_RARE_TERMS * math.log(1 + (n - 0.5) / 1.5)

    scored: list[tuple[float, Entry]] = []
    for entry in entries:
        matched = [w for w in words if w in entry.terms]
        if len(matched) < _MIN_MATCHED:
            continue
        score = 0.0
        for w in matched:
            tf = entry.terms[w]
            idf = math.log(1 + (n - df[w] + 0.5) / (df[w] + 0.5))
            score += idf * tf * (k1 + 1) / (tf + k1 * (1 - b + b * entry.length / avg))
        if score >= min_score:
            scored.append((score, entry))
    scored.sort(key=lambda pair: pair[0], reverse=True)
    if scored:
        floor = scored[0][0] * _RELATIVE
        scored = [pair for pair in scored if pair[0] >= floor]
    return scored


def _seen_file(session_id: str) -> Path | None:
    state = config.state_dir()
    if state is None or not session_id:
        return None
    folder = state / "recall"
    try:
        folder.mkdir(parents=True, exist_ok=True)
        cutoff = time.time() - _SEEN_TTL
        for old in folder.iterdir():
            if old.stat().st_mtime < cutoff:
                old.unlink(missing_ok=True)
    except OSError:
        return None
    return folder / hashlib.sha1(session_id.encode("utf-8")).hexdigest()[:16]


def render(wiki: Path, hits: list[Entry]) -> str:
    lines = [
        "[wigtn 팀 위키] 이 요청과 관련 있을 수 있는 기록입니다. 맞지 않으면 무시하세요.",
        f"위키: {wiki}",
    ]
    for entry in hits:
        line = f"- {entry.title}"
        if entry.summary:
            line += f" — {entry.summary}"
        line += f" ({entry.rel})"
        if len("\n".join(lines + [line])) > _MAX_CHARS:
            # 요약을 빼고라도 제목은 넣어 본다
            line = f"- {entry.title} ({entry.rel})"
            if len("\n".join(lines + [line])) > _MAX_CHARS:
                break
        lines.append(line)
    return "\n".join(lines) if len(lines) > 2 else ""


def recall(hook_input: dict) -> str:
    """주입할 텍스트. 없으면 빈 문자열."""
    prompt = str(hook_input.get("prompt") or "")
    if not prompt.strip():
        return ""
    tenant, _ = gates.resolve_tenant(str(hook_input.get("cwd") or ""), clone=False)
    if tenant is None:
        return ""

    seen_path = _seen_file(str(hook_input.get("session_id") or ""))
    seen: set[str] = set()
    if seen_path is not None and seen_path.exists():
        try:
            seen = set(seen_path.read_text(encoding="utf-8").split())
        except OSError:
            pass

    hits = [e for _, e in search(load_entries(tenant.wiki_path), prompt[:4000])
            if e.rel not in seen][:_MAX_HITS]
    text = render(tenant.wiki_path, hits)
    if text and seen_path is not None:
        shown = [e.rel for e in hits if f"({e.rel})" in text]
        try:
            with seen_path.open("a", encoding="utf-8") as f:
                f.write("".join(f"{rel}\n" for rel in shown))
        except OSError:
            pass
    return text


def sync(hook_input: dict) -> None:
    from knowledge_wiki import accumulate, publish

    tenant, _ = gates.resolve_tenant(str(hook_input.get("cwd") or ""))
    if tenant is None:
        return
    result = publish.sync(tenant.wiki_path, push=tenant.push)
    # 매 세션 "pull 완료" 를 남기면 로그가 묻힌다. 복구·실패·생략만 남긴다.
    if result not in _QUIET_SYNC:
        accumulate._log(tenant.wiki_path, f"동기화 [{tenant.project}]: {result}")


def main() -> int:
    try:
        hook_input = json.loads(sys.stdin.read() or "{}")
    except (json.JSONDecodeError, ValueError):
        return 0
    if not isinstance(hook_input, dict):
        return 0

    if "--sync" in sys.argv[1:]:
        sync(hook_input)
        return 0

    text = recall(hook_input)
    if text:
        print(json.dumps({
            "hookSpecificOutput": {
                "hookEventName": "UserPromptSubmit",
                "additionalContext": text,
            }
        }, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception:  # noqa: BLE001 - 훅은 어떤 경우에도 프롬프트를 막지 않는다
        sys.exit(0)
