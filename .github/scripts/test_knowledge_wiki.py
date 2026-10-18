#!/usr/bin/env python3
"""knowledge-wiki 회귀 테스트 — 결정론만, 모델 호출 없음.

여기서 지키는 것은 **경계**다. G2/G3 의 LLM 품질은 검증하지 않는다.
경계가 무너지는 두 가지 방식만 막는다:

    1. 조용히 아무것도 안 함  (설정을 못 읽어 모든 세션이 거부됨)
    2. 조용히 너무 많이 함    (꺼 뒀는데 켜져 있음 / 금지 영역에 씀)

CI 에서 `python3 .github/scripts/test_knowledge_wiki.py` 로 실행한다.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT / "plugins" / "wigtn-plugins" / "scripts"))

FAILURES: list[str] = []
CHECKS = 0


def check(name: str, actual: object, expected: object) -> None:
    global CHECKS
    CHECKS += 1
    if actual != expected:
        FAILURES.append(f"{name}\n    기대: {expected!r}\n    실제: {actual!r}")


def section(title: str) -> None:
    print(f"\n── {title}")


# ═════════════════════════════════════════════════════════════
# 1. YAML 폴백 파서 — PyYAML 없는 환경에서도 리스트를 읽어야 한다
#
# 회귀 이력: 최상위 키가 {} 로 선점된 뒤 setdefault 가 그 {} 를 돌려줘
# 리스트 항목이 전부 버려졌다 → include 가 항상 비어 G0 가 모든 세션을 거부.
# 로그도 안 남아서 무증상이었다.
# ═════════════════════════════════════════════════════════════
def test_fallback_parser() -> None:
    section("YAML 폴백 파서 (PyYAML 부재 가정)")

    # sys.modules 에 None 을 박으면 `import yaml` 이 ImportError 를 낸다 (CPython 규약).
    # meta_path finder 로 막는 방법은 3.12 에서 find_module 이 제거돼 조용히 무력화된다 -
    # 그러면 PyYAML 이 설치된 러너에서 테스트가 폴백을 전혀 타지 않고도 통과한다.
    had_yaml = "yaml" in sys.modules
    saved = sys.modules.get("yaml")
    sys.modules["yaml"] = None  # type: ignore[assignment]
    try:
        from knowledge_wiki import config

        parsed = config.parse_yaml(
            "wiki:\n"
            "  path: /tmp/w\n"
            "  subdir: per-user/me\n"
            "include:\n"
            "  - /tmp/a\n"
            "  - '/tmp/b'\n"
            "exclude:\n"
            "  - /tmp/a/secret\n"
        )
        check("include 를 리스트로 읽는다", parsed.get("include"), ["/tmp/a", "/tmp/b"])
        check("exclude 를 리스트로 읽는다", parsed.get("exclude"), ["/tmp/a/secret"])
        check("중첩 dict 를 읽는다", parsed.get("wiki", {}).get("subdir"), "per-user/me")

        # 부트스트랩 템플릿 그대로도 통과해야 한다 (기본 설치 경로)
        tpl = config._DEFAULT_TEMPLATE.format(wiki="/tmp/w", user="me", home="/tmp/home")
        boot = config.parse_yaml(tpl)
        check("부트스트랩 템플릿의 include 가 비지 않는다", boot.get("include"), ["/tmp/home"])
        check(
            "부트스트랩 설정이 include 범위를 통과시킨다",
            config.scope_verdict(boot, Path("/tmp/home/proj"))[0],
            True,
        )
    finally:
        if had_yaml:
            sys.modules["yaml"] = saved
        else:
            sys.modules.pop("yaml", None)


# ═════════════════════════════════════════════════════════════
# 2. G0 스코프 게이트 — 거부가 기본값
# ═════════════════════════════════════════════════════════════
def test_scope_gate() -> None:
    section("G0 스코프 게이트")
    from knowledge_wiki import gates

    tmp = Path(tempfile.mkdtemp())
    wiki = tmp / "wiki"
    (wiki / "per-user/me").mkdir(parents=True)
    subprocess.run(["git", "init", "-q"], cwd=wiki, capture_output=True)
    work = tmp / "work"
    (work / ".git").mkdir(parents=True)
    cfg = tmp / "knowledge-wiki.yml"
    os.environ["WIGTN_WIKI_CONFIG"] = str(cfg)

    def write_config(*, enabled: str = "true", subdir: str = "per-user/me",
                     exclude: str = "", wiki_path: Path = wiki,
                     include: Path | None = None, remote: str = "") -> None:
        text = f"enabled: {enabled}\nwiki:\n  path: {wiki_path}\n  subdir: {subdir}\n"
        if remote:
            text += f"  remote: {remote}\n"
        text += f"include:\n  - {include or tmp}\n"
        if exclude:
            text += f"exclude:\n  - {exclude}\n"
        cfg.write_text(text, encoding="utf-8")

    def marker(content: str | None) -> None:
        path = work / gates.MARKER_NAME
        if content is None:
            path.unlink(missing_ok=True)
        else:
            path.write_text(content, encoding="utf-8")

    def verdict() -> bool:
        return gates.resolve_tenant(str(work))[0] is not None

    # 기본 통과 (이후 케이스가 "거부됐다"를 의미있게 만들기 위한 대조군)
    write_config()
    marker(None)
    check("include 안 + 활성 → 통과", verdict(), True)

    # 회귀: 전역 kill-switch 를 마커가 우회했다
    write_config(enabled="false")
    check("전역 enabled:false → 거부", verdict(), False)
    marker("enabled: true\n")
    check("전역 enabled:false 는 마커로 우회 불가", verdict(), False)

    # exclude 는 마커보다 강하다 (기존 계약 — 깨지지 않게 고정)
    write_config(exclude=str(work))
    check("전역 exclude 는 마커보다 강하다", verdict(), False)

    # 마커 자체의 off 스위치
    write_config()
    marker("enabled: false\n")
    check("마커 enabled:false → 거부", verdict(), False)
    marker(None)

    # include 범위 밖
    outside = Path(tempfile.mkdtemp()) / "elsewhere"
    (outside / ".git").mkdir(parents=True)
    write_config()
    check("include 범위 밖 → 거부", gates.resolve_tenant(str(outside))[0] is None, True)

    # auto-push 허용 영역 밖
    for bad in ("shared/team", "../escape", "/absolute"):
        write_config(subdir=bad)
        check(f"subdir={bad!r} → 거부", verdict(), False)
    write_config(subdir="ouroboros/self")
    check("subdir=ouroboros/ → 통과", verdict(), True)

    # 자기 오염 — 위키가 작업 repo 안
    inner = work / "wiki"
    (inner / "per-user/me").mkdir(parents=True)
    write_config(wiki_path=inner)
    check("위키가 작업 repo 안 → 거부", verdict(), False)

    # deny 경로
    write_config()
    nested = work / "node_modules" / "pkg"
    nested.mkdir(parents=True)
    check("node_modules 하위 → 거부", gates.resolve_tenant(str(nested))[0] is None, True)

    # ── push 경계 (#40) — 범위가 넓으면 축적은 하되 push 는 보류 ──
    def tenant() -> object:
        return gates.resolve_tenant(str(work))[0]

    write_config(remote="git@example.com:team/wiki.git")
    t = tenant()
    check("remote + 좁은 include → push 허용", getattr(t, "push", None), True)

    # 픽스처가 홈 밖(임시 디렉터리)이므로 루트를 넓은 범위의 대표로 쓴다.
    # 홈 자체에 대한 판정은 아래 broad_scope_reason 단위 검사에서 본다.
    write_config(remote="git@example.com:team/wiki.git", include=Path("/"))
    t = tenant()
    check("remote + 루트 전체 include → push 보류", getattr(t, "push", None), False)
    check("  보류 사유가 기록된다", bool(getattr(t, "push_hold", "")), True)
    check("  축적 자체는 계속된다", t is not None, True)

    write_config(include=Path("/"))
    check("remote 없으면 범위가 넓어도 보류 아님", getattr(tenant(), "push", None), True)

    write_config(remote="git@example.com:team/wiki.git", include=Path("/"))
    marker("enabled: true\n")
    check("마커로 명시 opt-in 한 repo 는 보류 대상 아님", getattr(tenant(), "push", None), True)
    marker(None)

    from knowledge_wiki import config as kw_config

    check(
        "broad_scope_reason: 홈 전체는 넓다",
        bool(kw_config.broad_scope_reason({"include": [str(Path.home())]})),
        True,
    )
    check(
        "broad_scope_reason: 홈 하위는 넓지 않다",
        kw_config.broad_scope_reason({"include": [str(Path.home() / "Dev")]}),
        "",
    )

    os.environ.pop("WIGTN_WIKI_CONFIG", None)


# ═════════════════════════════════════════════════════════════
# 2.5 팀 라우팅 — 팀 org repo 는 폴더 위치와 무관하게 팀 위키로
#
# 회귀 이력: 팀 공유가 include(폴더 경로)에만 걸려 있어서, 위키 주인과 같은
# 디렉터리 구조를 가진 사람만 기록이 올라갔다. 팀원 기록이 하나도 안 모였다.
# ═════════════════════════════════════════════════════════════
def test_team_routing() -> None:
    section("팀 라우팅 (remote 기준)")
    from knowledge_wiki import config, gates

    norm = config.normalize_remote
    for url in (
        "https://github.com/wigtn/wigss.git",
        "git@github.com:wigtn/wigss.git",
        "ssh://git@github.com/wigtn/wigss",
        "https://user:token@github.com/WIGTN/wigss/",
    ):
        check(f"normalize_remote({url!r})", norm(url), "github.com/wigtn/wigss")
    check("로컬 경로 remote 는 무시", norm("/srv/git/wigss.git"), "")
    check("이름이 비슷한 다른 org 는 팀이 아니다",
          norm("git@github.com:wigtn-evil/x.git").startswith(config.TEAM_ORG), False)

    tmp = Path(tempfile.mkdtemp())
    team_wiki = tmp / "home" / ".wigtn" / "wigtn-team-wiki"
    (team_wiki / f"per-user/{config.current_user()}").mkdir(parents=True)
    subprocess.run(["git", "init", "-q"], cwd=team_wiki, capture_output=True)
    subprocess.run(["git", "remote", "add", "origin", "git@github.com:wigtn/wigtn-team-wiki.git"],
                   cwd=team_wiki, capture_output=True)
    saved_path, saved_remote = config.TEAM_WIKI_PATH, config.team_wiki_remote
    config.TEAM_WIKI_PATH = team_wiki

    local_wiki = tmp / "local-wiki"
    (local_wiki / "per-user/me").mkdir(parents=True)
    subprocess.run(["git", "init", "-q"], cwd=local_wiki, capture_output=True)

    # include 는 일부러 작업 repo 와 무관한 곳을 가리킨다 (다른 디렉터리 구조의 팀원)
    elsewhere = tmp / "include-only-here"
    elsewhere.mkdir()
    work = tmp / "anywhere" / "wigss"
    work.mkdir(parents=True)
    subprocess.run(["git", "init", "-q"], cwd=work, capture_output=True)

    cfg = tmp / "knowledge-wiki.yml"
    os.environ["WIGTN_WIKI_CONFIG"] = str(cfg)

    def write_config(*, enabled: str = "true", exclude: str = "", include: Path = elsewhere,
                     wiki_path: Path = local_wiki, remote: str = "") -> None:
        text = f"enabled: {enabled}\nwiki:\n  path: {wiki_path}\n  subdir: per-user/me\n"
        if remote:
            text += f"  remote: {remote}\n"
        text += f"include:\n  - {include}\n"
        if exclude:
            text += f"exclude:\n  - {exclude}\n"
        cfg.write_text(text, encoding="utf-8")

    def set_remotes(**remotes: str) -> None:
        for name in ("origin", "upstream"):
            subprocess.run(["git", "remote", "remove", name], cwd=work, capture_output=True)
        for name, url in remotes.items():
            subprocess.run(["git", "remote", "add", name, url], cwd=work, capture_output=True)

    def tenant() -> object:
        return gates.resolve_tenant(str(work))[0]

    try:
        write_config()
        set_remotes(origin="git@github.com:someone/wigss.git")
        check("팀 밖 repo + include 밖 → 거부 (기존 동작 유지)", tenant(), None)

        set_remotes(origin="git@github.com:wigtn/wigss.git")
        t = tenant()
        check("팀 repo 는 include 밖이어도 통과", t is not None, True)
        check("  팀 위키로 간다", getattr(t, "wiki_path", None), team_wiki)
        check("  subdir 은 per-user/<사용자>", getattr(t, "subdir", None),
              f"per-user/{config.current_user()}")
        check("  push 한다", getattr(t, "push", None), True)

        set_remotes(origin="https://github.com/wigtn/wigss.git")
        check("HTTPS remote 도 팀 repo 로 본다", getattr(tenant(), "wiki_path", None), team_wiki)

        set_remotes(origin="git@github.com:someone/wigss.git",
                    upstream="git@github.com:wigtn/wigss.git")
        check("개인 fork(upstream 이 팀) 도 팀 repo 로 본다",
              getattr(tenant(), "wiki_path", None), team_wiki)

        set_remotes(origin="git@github.com:wigtn/wigss.git")
        write_config(include=Path("/"))
        check("범위가 루트 전체여도 팀 repo 는 push 보류 아님", getattr(tenant(), "push", None), True)

        write_config(exclude=str(work))
        check("전역 exclude 는 팀 라우팅보다 강하다", tenant(), None)
        write_config(exclude=str(work), include=work.parent)
        check("  exclude 면 include 판정으로도 새지 않는다", tenant(), None)

        write_config(enabled="false")
        check("전역 enabled:false 는 팀 라우팅보다 강하다", tenant(), None)

        # 이미 팀 위키를 clone 해 둔 사람에게 두 번째 사본을 만들지 않는다
        own_clone = tmp / "Dev" / "wigtn-team-wiki"
        (own_clone / "per-user/me").mkdir(parents=True)
        subprocess.run(["git", "init", "-q"], cwd=own_clone, capture_output=True)
        write_config(wiki_path=own_clone, remote="https://github.com/wigtn/wigtn-team-wiki.git")
        t = tenant()
        check("전역 설정이 팀 위키를 가리키면 그 경로를 쓴다", getattr(t, "wiki_path", None),
              own_clone)
        check("  subdir 도 전역 설정 값을 쓴다", getattr(t, "subdir", None), "per-user/me")

        # 팀 위키 repo 자신에서 한 작업은 팀 라우팅 대상이 아니다
        set_remotes(origin="git@github.com:wigtn/wigtn-team-wiki.git")
        write_config()
        check("팀 위키 repo 자신 → 팀 라우팅 안 함", tenant(), None)

        # 팀 위키를 못 얻으면(권한 없음 등) 기존 include 판정으로 넘어간다
        set_remotes(origin="git@github.com:wigtn/wigss.git")
        config.TEAM_WIKI_PATH = tmp / "not-cloned"
        config.team_wiki_remote = lambda _url: str(tmp / "missing.git")
        write_config()
        check("팀 위키 확보 실패 + include 밖 → 거부", tenant(), None)
        write_config(include=work.parent, remote="git@example.com:other/wiki.git")
        t = tenant()
        check("팀 위키 확보 실패 + include 안 → 이전처럼 로컬 위키",
              getattr(t, "wiki_path", None), local_wiki)
        check("  다른 remote 로 push 하지 않는다", getattr(t, "push", None), False)
        check("  보류 사유에 팀 위키 실패가 남는다",
              "팀 위키" in str(getattr(t, "push_hold", "")), True)
    finally:
        config.TEAM_WIKI_PATH, config.team_wiki_remote = saved_path, saved_remote
        os.environ.pop("WIGTN_WIKI_CONFIG", None)


# ═════════════════════════════════════════════════════════════
# 3. G1/G4 결정론 패턴 — 놓치면 안 되는 것만
# ═════════════════════════════════════════════════════════════
def test_deny_patterns() -> None:
    section("G1/G4 결정론 패턴")
    from knowledge_wiki import gates

    # 입력·출력 양쪽에서 반드시 잡아야 하는 것 (모델에 넣는 것 자체가 위험)
    hard = [
        ("AWS 키", "AKIAIOSFODNN7EXAMPLE 를 썼다"),
        ("provider 키", "sk-abcdefghijklmnopqrstuvwxyz012345"),
        ("GitHub 토큰", "ghp_abcdefghijklmnopqrstuvwxyz0123456789"),
        ("개인키", "-----BEGIN RSA PRIVATE KEY-----"),
        ("접속 문자열", "postgres://admin:hunter2pass@db/app"),
        ("주민번호", "901231-1234567"),
        ("Bearer", "Authorization: Bearer abcdefghijklmnopqrstuvwxyz"),
    ]
    for name, text in hard:
        check(f"G1 탐지: {name}", bool(gates.scan_input(text)), True)
        check(f"G4 탐지: {name}", bool(gates.scan(text)), True)

    # 반출물에서만 막는다. 원문에 있다고 세션을 버리지 않는다 (#35).
    output_only = [
        ("홈 절대경로", "프로젝트 파일 /Users/someone/proj/a.ts 를 수정"),
        ("개인 이메일", "문의는 person.name@example.com 으로"),
        ("사설 IP", "게이트웨이는 192.168.0.1 이다"),
        ("내부 호스트", "build.internal 에서 받는다"),
    ]
    for name, text in output_only:
        check(f"G1 통과(원문 허용): {name}", gates.scan_input(text), [])
        check(f"G4 탐지(반출 차단): {name}", bool(gates.scan(text)), True)

    # 오탐 — 어느 계층에서도 잡히면 안 된다
    clean = [
        ("일반 기술 서술", "이 라이브러리는 재시도 시 지수 백오프를 쓴다."),
        ("의사코드", "if retries > 3: raise TimeoutError"),
        ("SSH remote", "remote 는 git@github.com:team/wiki.git 이다"),
        ("noreply 주소", "커밋 트레일러의 noreply@users.example.com"),
        ("macOS 버전", "macOS 10.15.7 에서 재현됨"),
        ("Kafka 버전", "Kafka 10.2.1 클러스터에서 측정"),
        ("의존성 버전", "라이브러리 172.20.1 릴리스 노트"),
    ]
    for name, text in clean:
        check(f"오탐 없음: {name}", gates.scan(text), [])


# ═════════════════════════════════════════════════════════════
# 4. 게시 경계 — shared/ 는 코드가 막는다
# ═════════════════════════════════════════════════════════════
def test_publish_boundary() -> None:
    section("게시 경계")
    from knowledge_wiki import publish

    tmp = Path(tempfile.mkdtemp())
    for bad in ("shared", "shared/decisions", "docs"):
        ok, why = publish.write_and_push(tmp, bad, "a.md", "x", push=False)
        check(f"auto-push 금지: {bad!r}", ok, False)
        check(f"  사유가 금지 영역인가: {bad!r}", "금지 영역" in why, True)
    check(
        "per-user/ 는 허용",
        publish.write_and_push(tmp, "per-user/me", "a.md", "x", push=False)[0],
        True,
    )

    # 덮어쓰기 금지 (#39) — 같은 이름이 또 오면 접미사를 붙인다
    publish.write_and_push(tmp, "per-user/me", "dup.md", "first", push=False)
    ok, rel = publish.write_and_push(tmp, "per-user/me", "dup.md", "second", push=False)
    check("같은 파일명 재게시 성공", ok, True)
    check("  덮어쓰지 않고 새 이름을 쓴다", "dup-2.md" in rel, True)
    check(
        "  먼저 쓴 내용이 남아 있다",
        (tmp / "per-user/me/dup.md").read_text(encoding="utf-8"),
        "first",
    )


def test_slug() -> None:
    """#39 — 파일명 slug 는 절대 비지 않는다."""
    section("파일명 slug")
    from knowledge_wiki.compile import slugify

    check("ASCII 제목", slugify("# Debouncing async writes"), "debouncing-async-writes")
    check(
        "혼합 제목은 ASCII 부분을 남긴다",
        slugify("# LangGraph interrupt 패턴의 재개 조건"),
        "langgraph-interrupt",
    )
    korean = slugify("# 캐시 무효화 타이밍 문제")
    check("한글 전용 제목도 빈 값이 아니다", bool(korean), True)
    check("  note 로 수렴하지 않는다", korean != "note", True)
    check(
        "  결정론 — 같은 제목이면 같은 slug",
        slugify("# 캐시 무효화 타이밍 문제"),
        korean,
    )
    check(
        "  다른 제목이면 다른 slug",
        slugify("# 재시도 백오프 설계") != korean,
        True,
    )
    check(
        "G2 가 준 slug: 줄을 먼저 쓴다",
        slugify("# 캐시 무효화 타이밍 문제\n\n---\n태그: cache\nslug: Cache Invalidation Timing!"),
        "cache-invalidation-timing",
    )
    check("  slug: 줄이 비면 제목으로 돌아간다", slugify("# 캐시 무효화 타이밍 문제\nslug: 캐시"),
          korean)


# ═════════════════════════════════════════════════════════════
# 5. 동기화 — 팀원 여럿이 같은 위키에 push 한다
#
# 회귀 이력: pull 하는 코드가 없어서 두 번째로 push 한 사람은 항상 거부됐다.
# 커밋은 로컬에 남고 로그에는 "push 실패" 한 줄뿐이라 팀원 기록이 조용히 안 모였다.
# ═════════════════════════════════════════════════════════════
def test_sync() -> None:
    section("동기화 (여러 팀원 push)")
    from knowledge_wiki import publish

    for key in ("GIT_AUTHOR_NAME", "GIT_COMMITTER_NAME"):
        os.environ.setdefault(key, "kw-test")
    for key in ("GIT_AUTHOR_EMAIL", "GIT_COMMITTER_EMAIL"):
        os.environ.setdefault(key, "kw-test@example.invalid")

    def git(*args: str, cwd: Path) -> str:
        return subprocess.run(["git", *args], cwd=cwd, capture_output=True, text=True).stdout

    tmp = Path(tempfile.mkdtemp())
    remote = tmp / "wiki.git"
    subprocess.run(["git", "init", "-q", "--bare", "-b", "main", str(remote)], capture_output=True)
    seed = tmp / "seed"
    subprocess.run(["git", "clone", "-q", str(remote), str(seed)], capture_output=True)
    (seed / "README.md").write_text("wiki\n", encoding="utf-8")
    git("add", "README.md", cwd=seed)
    git("commit", "-q", "-m", "init", cwd=seed)
    git("push", "-q", "origin", "HEAD:main", cwd=seed)

    alice, bob = tmp / "alice", tmp / "bob"
    for clone in (alice, bob):
        subprocess.run(["git", "clone", "-q", str(remote), str(clone)], capture_output=True)

    ok, rel = publish.write_and_push(alice, "per-user/alice", "a.md", "# a\n")
    check("먼저 push 한 사람은 그대로 성공", (ok, rel), (True, "per-user/alice/a.md"))
    ok, rel = publish.write_and_push(bob, "per-user/bob", "b.md", "# b\n")
    check("나중에 push 한 사람도 rebase 후 성공", (ok, rel), (True, "per-user/bob/b.md"))
    remote_files = git("ls-tree", "-r", "--name-only", "main", cwd=remote).split()
    check("  remote 에 두 사람 글이 모두 있다",
          sorted(f for f in remote_files if f.startswith("per-user/")),
          ["per-user/alice/a.md", "per-user/bob/b.md"])

    check("sync 가 팀원 글을 받아 온다", publish.sync(alice, push=True), "pull 완료")
    check("  받은 글이 워킹카피에 있다", (alice / "per-user/bob/b.md").is_file(), True)

    # 지난 세션에 push 못 한 커밋은 다음 세션 sync 가 보낸다
    publish.write_and_push(alice, "per-user/alice", "c.md", "# c\n", push=False)
    result = publish.sync(alice, push=True)
    check("밀린 커밋을 sync 가 push 한다", "1건 push" in result, True)
    check("  remote 에 반영됐다",
          "per-user/alice/c.md" in git("ls-tree", "-r", "--name-only", "main", cwd=remote), True)

    publish.write_and_push(alice, "per-user/alice", "d.md", "# d\n", push=False)
    check("push 보류면 pull 만 한다", publish.sync(alice, push=False), "pull 완료 (push 보류)")
    check("  remote 에 가지 않는다",
          "per-user/alice/d.md" in git("ls-tree", "-r", "--name-only", "main", cwd=remote), False)

    # 사람이 위키를 고치는 중이면 손대지 않는다
    (bob / "README.md").write_text("editing\n", encoding="utf-8")
    check("추적 파일 변경 중이면 pull 생략", "생략" in publish.sync(bob, push=True), True)
    check("  변경이 그대로 남는다", (bob / "README.md").read_text(encoding="utf-8"), "editing\n")


# ═════════════════════════════════════════════════════════════
# 6. 회상 — 쓰는 위키에서만, 관련 있을 때만, 짧게
# ═════════════════════════════════════════════════════════════
_ARTICLE = """# {title}

> {summary}

## 배경
{body}

---
태그: {tags}

<!-- project: demo · generated: 20261018-000000 UTC -->
"""


def test_recall() -> None:
    section("회상 (UserPromptSubmit)")
    from knowledge_wiki import config, gates, recall

    check("한글은 2글자 조각", recall.tokenize("캐시 무효화"), ["캐시", "무효", "효화"])
    check("영문은 소문자 단어, 불용어 제외", recall.tokenize("The Next.js cache"),
          ["next", "js", "cache"])

    tmp = Path(tempfile.mkdtemp())
    wiki = tmp / "wiki"
    notes = {
        "per-user/alice/ruleset.md": ("GitHub ruleset을 지우면 보호 규칙이 통째로 사라진다",
                                      "ruleset 삭제는 묶인 규칙을 모두 없앤다",
                                      "브랜치 보호와 ruleset 은 따로 동작한다.", "GitHub, ruleset"),
        "per-user/bob/nextjs.md": ("Next.js 개발 서버 캐시와 청크 로딩 에러",
                                   "dev 와 build 가 같은 출력 폴더를 쓰면 청크가 꼬인다",
                                   "개발 서버를 끄고 .next 를 지운다.", "Next.js, 캐시"),
        "shared/runbooks/latex.md": ("LaTeX 표 레이아웃 깨짐 해결", "표 폭은 linewidth 기준으로",
                                     "tabularx 를 쓴다.", "LaTeX"),
    }
    for rel, (title, summary, body, tags) in notes.items():
        path = wiki / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(_ARTICLE.format(title=title, summary=summary, body=body, tags=tags),
                        encoding="utf-8")
    (wiki / "shared/README.md").write_text("# 공유 영역\n\n> 설명\n", encoding="utf-8")
    (wiki / "ouroboros/host").mkdir(parents=True)
    (wiki / "ouroboros/host/spec.md").write_text("# ruleset 봇 출력\n", encoding="utf-8")
    subprocess.run(["git", "init", "-q"], cwd=wiki, capture_output=True)

    entries = recall.load_entries(wiki)
    check("per-user/·shared/ 의 글만 읽는다 (README·ouroboros 제외)",
          sorted(e.rel for e in entries), sorted(notes))
    first = next(e for e in entries if e.rel == "per-user/alice/ruleset.md")
    check("  제목·요약·태그·project 를 본문에서 읽는다",
          (first.title, first.summary, first.tags, first.project),
          (notes[first.rel][0], notes[first.rel][1], ["GitHub", "ruleset"], "demo"))

    hits = recall.search(entries, "main 브랜치 ruleset 삭제해도 괜찮을까?")
    check("관련 글이 1등", hits[0][1].rel if hits else None, "per-user/alice/ruleset.md")
    check("관련 없는 요청은 아무것도 안 붙인다", recall.search(entries, "오늘 점심 뭐 먹지"), [])
    check("검색어 하나짜리는 붙이지 않는다", recall.search(entries, "ruleset"), [])

    long_entries = [recall.Entry(rel=f"per-user/x/{i}.md", title="제목" * 40,
                                 summary="요약" * 200, tags=[], project="") for i in range(3)]
    check("주입 길이 상한", len(recall.render(wiki, long_entries)) <= recall._MAX_CHARS, True)

    # 테넌트 판정 — 이 repo 가 쓰는 위키에서만 읽는다
    work = tmp / "team" / "repo"
    work.mkdir(parents=True)
    subprocess.run(["git", "init", "-q"], cwd=work, capture_output=True)
    cfg = tmp / "knowledge-wiki.yml"
    os.environ["WIGTN_WIKI_CONFIG"] = str(cfg)
    saved_state = config._STATE_DIR
    config._STATE_DIR = tmp / "state"

    def write_config(include: Path, exclude: str = "") -> None:
        text = (f"wiki:\n  path: {wiki}\n  subdir: per-user/me\n"
                f"include:\n  - {include}\n")
        if exclude:
            text += f"exclude:\n  - {exclude}\n"
        cfg.write_text(text, encoding="utf-8")

    def ask(prompt: str = "main 브랜치 ruleset 삭제해도 괜찮을까?", session: str = "s1") -> str:
        return recall.recall({"prompt": prompt, "cwd": str(work), "session_id": session})

    try:
        write_config(include=work.parent)
        shown = ask()
        check("범위 안 repo → 주입", "per-user/alice/ruleset.md" in shown, True)
        check("  같은 세션에서 같은 글은 다시 안 붙인다", ask(), "")
        check("  다른 세션이면 다시 붙인다", "ruleset.md" in ask(session="s2"), True)

        write_config(include=tmp / "elsewhere")
        check("범위 밖 repo → 주입 안 함", ask(session="s3"), "")
        write_config(include=work.parent, exclude=str(work))
        check("exclude repo(예: 고용주) → 주입 안 함", ask(session="s4"), "")

        # 회상은 clone 을 기다리지 않는다 (동기 훅)
        missing = tmp / "not-cloned"
        cfg.write_text(f"wiki:\n  path: {missing}\n  subdir: per-user/me\n"
                       f"  remote: {tmp / 'nowhere.git'}\n"
                       f"include:\n  - {work.parent}\n", encoding="utf-8")
        check("clone=False 는 위키가 없으면 거부", gates.resolve_tenant(str(work), clone=False)[0],
              None)
        check("  clone 을 시도하지 않는다", missing.exists(), False)
    finally:
        config._STATE_DIR = saved_state
        os.environ.pop("WIGTN_WIKI_CONFIG", None)


_STATE_PROBE = r"""
import json, sys
from pathlib import Path
sys.path.insert(0, sys.argv[1])
from knowledge_wiki import accumulate, config

cursor = accumulate._cursor_for("/somewhere/session-abc.jsonl")
other = accumulate._cursor_for("/somewhere/session-xyz.jsonl")
print(json.dumps({
    "cursor": str(cursor) if cursor else "",
    "distinct": bool(cursor and other and cursor != other),
    "stable": str(accumulate._cursor_for("/somewhere/session-abc.jsonl")) == str(cursor),
    "no_hooks": str(accumulate._no_hooks_settings() or ""),
    "state": str(config.state_dir() or ""),
}))
"""


def test_state_isolation() -> None:
    """#36 — 커서·중첩 설정은 위키 repo 밖(머신 로컬 상태)에 있어야 한다."""
    section("상태 격리 (위키 repo 오염 방지)")

    home = Path(tempfile.mkdtemp())
    env = {**os.environ, "HOME": str(home), "USERPROFILE": str(home)}
    env.pop("WIGTN_WIKI_CONFIG", None)
    scripts = str(REPO_ROOT / "plugins" / "wigtn-plugins" / "scripts")

    result = subprocess.run(
        [sys.executable, "-c", _STATE_PROBE, scripts],
        capture_output=True, text=True, env=env, timeout=60,
    )
    if result.returncode != 0:
        FAILURES.append(f"상태 격리 프로브 실행 실패\n    {result.stderr.strip()[:300]}")
        return

    data = json.loads(result.stdout.strip().splitlines()[-1])
    state = home / ".wigtn" / "state"
    check("state_dir 이 홈 아래 .wigtn/state", data["state"], str(state))
    check("커서가 state 아래", data["cursor"].startswith(str(state / "cursors")), True)
    check("transcript 마다 커서가 다르다", data["distinct"], True)
    check("같은 transcript 는 같은 커서", data["stable"], True)
    check("no-hooks 설정도 state 아래", data["no_hooks"], str(state / "no-hooks.json"))

    # 위키 repo 에는 article 말고 아무것도 생기지 않는다
    wiki = home / ".wigtn" / "wiki"
    strays = (
        sorted(p.name for p in wiki.rglob(".transcript_cursor")) if wiki.exists() else []
    ) + (sorted(p.name for p in wiki.rglob(".no-hooks.json")) if wiki.exists() else [])
    check("위키 repo 에 상태 파일이 생기지 않는다", strays, [])


def main() -> int:
    test_fallback_parser()
    test_scope_gate()
    test_team_routing()
    test_deny_patterns()
    test_publish_boundary()
    test_slug()
    test_sync()
    test_recall()
    test_state_isolation()

    print()
    if FAILURES:
        print(f"knowledge-wiki 회귀 테스트 실패 — {len(FAILURES)}/{CHECKS}건\n")
        for f in FAILURES:
            print(f"  ✗ {f}")
        return 1
    print(f"knowledge-wiki 회귀 테스트 통과 — 검사 {CHECKS}건, 실패 0건.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
