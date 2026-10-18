"""G2 LLM 컴파일 + G3 LLM 감사.

contracts/INGEST-POLICY.md §3 의 LLM 단계를 집행한다.

핵심 설계 — **LLM 은 승인자가 아니다**:
- G2 는 원문을 옮기지 않고 "배운 것"을 새로 쓴다. verbatim 유출이 구조적으로 불가능하다.
- G3 은 위반 목록만 반환한다. "괜찮다"고 판정할 어휘 자체를 주지 않는다.
- 두 단계 모두 실패·타임아웃·파싱 불가 = **폐기**(fail-closed). 통과가 아니다.
- 최종 통과 판정은 여기가 아니라 gates.scan (G4) 이 내린다.
"""

from __future__ import annotations

import hashlib
import json
import re
import subprocess
from pathlib import Path

_MODEL = "haiku"
_TIMEOUT = 90

# 분야 범례. 이름은 estudy(github.com/rlaope/estudy)의 상위 분류를 따르고, 거기 없는 Research 만
# 더했다 (팀 위키 글의 절반 이상이 논문 repo 에서 나온다). G2 는 이 안에서 하나만 고르고,
# apply_field 가 그 값을 frontmatter ``type`` 으로 옮긴다 - openwiki visualize 는 type 으로
# 노드 색과 범례를 정하므로 그래프 범례가 곧 이 표가 된다.
FIELDS: tuple[tuple[str, str], ...] = (
    ("AI", "LLM·에이전트·프롬프트, 모델 평가와 LLM 심사자, 생성 모델 활용"),
    ("MLOps", "모델 서빙·추론 엔드포인트, ML 파이프라인, 에이전트 실행 인프라"),
    ("Back-End", "서버·API, 언어·런타임·라이브러리 동작, 동시성·캐싱, 신호·음성 처리, 백엔드 테스트"),
    ("Front-End", "웹 UI·레이아웃·CSS, JS/TS·React/Next.js, 정적 사이트, 폰트·SVG·접근성"),
    ("DevOps", "git·GitHub(브랜치·PR·ruleset), CI/CD·자동화 파이프라인, 배포·호스팅, 컨테이너·클라우드"),
    ("DataBase", "DB·쿼리·스키마, 트랜잭션, 데이터 적재·무결성"),
    ("Design-Pattern", "설계 판단·아키텍처·모듈 경계, 의사결정 기록(ADR), 정보 구조"),
    ("SRE", "운영·장애 대응, 모니터링, 신뢰성, 성능 측정"),
    ("Algorithm", "알고리즘·자료구조"),
    ("Math", "통계·확률·추정 방법 자체, 수치 계산"),
    ("Research", "실험·측정 설계, 결과 해석과 보고, 논문 작성·LaTeX, 그림·포스터, 재현성, 학회 심사"),
)
_FIELD_BY_KEY = {name.lower(): name for name, _ in FIELDS}

_COMPILE_PROMPT = """당신은 개발 세션 기록을 팀 위키 article 로 컴파일한다.

## 절대 규칙
1. **원문을 인용하지 않는다.** 세션에 나온 문장·코드·로그를 그대로 옮기지 말 것.
   개념을 이해한 뒤 **당신의 말로 새로 쓴다.**
2. **"배운 것"만 쓴다.** "무엇을 했다"가 아니라 "무엇이 참인가"를 쓴다.
   ❌ "A 파일을 고쳐서 버그를 잡았다"
   ✅ "이 라이브러리는 X 조건에서 Y 로 동작한다. 그래서 Z 를 먼저 확인해야 한다."
3. **다음은 절대 포함하지 않는다** — 하나라도 있으면 출력 전체를 `SKIP` 으로 대체:
   - 키·토큰·비밀번호·자격증명
   - 이메일·전화번호·실명·주민번호
   - 고객사명·조직명·프로젝트 코드명·계약 내용
   - 사설 IP·내부 호스트명·사내 URL·DB 접속 문자열
   - 프로젝트에서 복사한 소스 코드 원문 (개념 설명용 의사코드는 허용)
   - 절대 경로 (`/Users/...`, `/home/...`)
   - 미공개 사업 정보 (가격·일정·인사)
4. **일반화한다.** 특정 프로젝트를 몰라도 이해되게 쓴다.
   프로젝트 고유 이름은 역할 명사로 바꾼다 (예: "결제 서비스", "인증 미들웨어").

## 기록할 가치 판단
다음 중 하나에 해당할 때만 article 을 만든다. 아니면 `SKIP` 한 단어만 출력한다.
- 재사용 가능한 기술 패턴·설계 판단
- 30분 이상 걸린 트러블슈팅의 원인과 해결
- 도구·라이브러리의 함정이나 우회법
- 측정 결과와 그 해석

단순 파일 수정, 설정 변경, 일반 Q&A, 이미 공식 문서에 있는 내용은 `SKIP`.

## 출력 형식 (이것만 출력. 다른 말 금지)
```
# <제목 — 한 줄, 무엇을 배웠는지>

> <한 줄 요약>

## 배경
<왜 이게 필요했는지 2~3줄. 프로젝트 고유명 없이.>

## 내용
<구체적 기술 내용. 재현 가능하게. 코드가 필요하면 의사코드로.>

## 결론
<핵심 takeaway 1~2줄>

---
분야: <아래 분야 범례에서 가장 가까운 것 하나. 이름 그대로>
태그: <쉼표로 구분한 기술 태그 2~4개>
slug: <제목을 영어 소문자 kebab-case 3~6단어로. 파일명에 쓴다>
```

## 분야 범례
글의 주제에 가장 가까운 분야를 **하나만** 고른다. 딱 맞지 않아도 가장 가까운 것을 고르고,
새 분야를 만들지 않는다. 어느 프로젝트에서 나왔는지가 아니라 **배운 내용**으로 고른다
(논문 repo 에서 나왔어도 git 함정이면 DevOps).
{fields}

## 기존 태그
위키에 이미 있는 태그다. 같은 주제면 새로 만들지 말고 여기서 **표기 그대로** 고른다.
맞는 게 없을 때만 새 태그를 만든다.
{known_tags}

## 세션 기록
{conversation}
"""

_AUDIT_PROMPT = """당신은 반출 심사관이다. 아래 문서가 팀 위키에 올라가도 되는지 **위반만** 찾는다.

## 찾을 것
- D1 키·토큰·비밀번호·자격증명·개인키
- D2 이메일·전화·실명·주민번호 등 개인정보
- D3 고객사·조직 식별 정보, 프로젝트 코드명, 계약 내용
- D4 사설 IP·내부 호스트명·사내 URL·DB 접속 문자열
- D5 프로젝트에서 복사한 것으로 보이는 소스 코드 원문
- D6 절대 경로 (사용자명 포함)
- D7 미공개 사업 정보 (가격·일정·인사·미발표 제품)
- D8 제3자 비공개 자료의 내용

## 출력
**JSON 만** 출력한다. 설명·인사·코드펜스 금지.

{{"violations": [{{"code": "D3", "why": "<무엇이 문제인지 한 줄>"}}]}}

위반이 없으면: {{"violations": []}}

⚠️ 당신은 "괜찮다"고 승인하는 역할이 아니다. **위반을 찾는 역할만** 한다.
빈 배열은 "당신이 추가로 찾은 게 없다"는 뜻일 뿐 최종 승인이 아니다.
애매하면 위반으로 기록한다.

## 심사 대상
{article}
"""


def _claude(prompt: str, no_hooks_settings: Path | None) -> str:
    """단발 LLM 호출. 실패 시 빈 문자열 (호출부가 fail-closed 처리)."""
    cmd = ["claude", "--print", "--model", _MODEL]
    if no_hooks_settings and no_hooks_settings.exists():
        cmd += ["--settings", str(no_hooks_settings)]
    try:
        result = subprocess.run(
            cmd,
            input=prompt,
            capture_output=True,
            text=True,
            timeout=_TIMEOUT,
            encoding="utf-8",
            errors="replace",
        )
    except (subprocess.SubprocessError, OSError):
        return ""
    if result.returncode != 0:
        return ""
    return result.stdout.strip()


def compile_prompt(conversation: str, known_tags: list[str] | tuple[str, ...] = ()) -> str:
    return _COMPILE_PROMPT.format(
        conversation=conversation,
        fields="\n".join(f"- {name}: {scope}" for name, scope in FIELDS),
        known_tags=", ".join(known_tags) if known_tags else "(아직 없음)",
    )


def apply_field(article: str) -> tuple[str, str]:
    """G2 가 쓴 ``분야:`` 줄을 frontmatter ``type`` 으로 옮긴다.

    범례에 없는 값은 버린다 (대소문자는 무시하고 범례 표기로 맞춘다). 분야가 없으면
    frontmatter 없이 그대로 둔다 - 그래프에서 기본 type(Reference)으로 보일 뿐 글은 잃지 않는다.

    Returns:
        (게시할 article, 분야 또는 "")
    """
    field, kept = "", []
    for line in article.splitlines():
        stripped = line.strip()
        if stripped.startswith("분야:"):
            field = field or _FIELD_BY_KEY.get(stripped[3:].strip().lower(), "")
            continue
        kept.append(line)
    body = "\n".join(kept)
    if not field:
        return body, ""
    return f"---\ntype: {field}\n---\n\n{body}", field


def compile_article(
    conversation: str, no_hooks: Path | None, known_tags: list[str] | tuple[str, ...] = ()
) -> tuple[str, str]:
    """G2. 세션 기록 → 일반화된 article.

    Returns:
        (article, "") 성공 / ("", 사유) 폐기
    """
    if not conversation.strip():
        return "", "세션 기록 없음"

    out = _claude(compile_prompt(conversation, known_tags), no_hooks)
    if not out:
        return "", "G2 LLM 호출 실패"

    # 모델이 코드펜스로 감쌌으면 벗긴다
    fenced = re.match(r"^```(?:markdown|md)?\s*\n(.*)\n```\s*$", out, re.DOTALL)
    if fenced:
        out = fenced.group(1).strip()

    if out.strip().upper().startswith("SKIP") or len(out) < 80:
        return "", "기록 가치 없음 (SKIP)"
    if not out.lstrip().startswith("# "):
        return "", "G2 출력 형식 불일치"
    return out, ""


def audit_article(article: str, no_hooks: Path | None) -> tuple[bool, str]:
    """G3. article 의 반출 위반 여부 감사.

    Returns:
        (True, "") 위반 못 찾음 / (False, 사유) 폐기
    """
    out = _claude(_AUDIT_PROMPT.format(article=article), no_hooks)
    if not out:
        return False, "G3 LLM 호출 실패 (fail-closed)"

    match = re.search(r"\{.*\}", out, re.DOTALL)
    if not match:
        return False, "G3 응답 파싱 실패 (fail-closed)"
    try:
        parsed = json.loads(match.group(0))
    except json.JSONDecodeError:
        return False, "G3 JSON 파싱 실패 (fail-closed)"

    violations = parsed.get("violations")
    if not isinstance(violations, list):
        return False, "G3 스키마 불일치 (fail-closed)"
    if violations:
        codes = ", ".join(
            str(v.get("code", "?")) for v in violations if isinstance(v, dict)
        )
        return False, f"G3 위반 탐지: {codes or '미상'}"
    return True, ""


def slugify(article: str) -> str:
    """제목에서 파일명 slug 추출. **항상 비어 있지 않은 값을 반환한다.**

    컴파일 프롬프트가 한국어라 한글 전용 제목이 흔하다. ASCII 만 남기면 빈 문자열이
    되어 파일명이 전부 같은 값으로 수렴하고, 분 단위 타임스탬프와 겹치면 서로 덮어쓴다.
    그래서 G2 가 영어로 써 준 ``slug:`` 줄을 먼저 쓴다. 없거나 비면 제목에서 만들고,
    비ASCII 제목은 제목 해시로 대체한다 - 결정론이라 같은 제목이면 같은 이름이다.
    """
    def clean(text: str) -> str:
        slug = re.sub(r"[^a-zA-Z0-9\-]+", "-", text.lower())
        return re.sub(r"-{2,}", "-", slug).strip("-")[:60].strip("-")

    title = ""
    for line in article.splitlines():
        stripped = line.strip()
        if not title and stripped.startswith("# "):
            title = stripped[2:].strip()
        elif stripped.lower().startswith("slug:"):
            given = clean(stripped[5:])
            if given:
                return given
    if not title:
        return "note"

    slug = clean(title)
    if slug:
        return slug
    return "note-" + hashlib.sha1(title.encode("utf-8")).hexdigest()[:8]
