---
description: Analyze changes, run quality gate, and auto-commit with PR-based workflow. Trigger on "/auto-commit", "git 푸시", "git push", "자동 커밋", "커밋해줘", "변경사항 커밋", "PR 올려줘", "PR 만들어줘", or when user asks to commit their work after completing a task.
---

# Auto Commit

작업 완료 후 변경사항을 분석하고, 품질 검사를 거쳐 피처 브랜치에 커밋하고 PR을 생성합니다.

## Pipeline Position

| 이전 단계 | 현재 | 다음 단계 |
|----------|------|----------|
| `/implement` - 구현 완료 | `/auto-commit` - 품질 검사 & PR | `/review-pr` - 동료 리뷰 |

## Usage

```bash
/auto-commit                      # 품질 검사 + 브랜치 생성 + PR (기본)
/auto-commit --direct             # main에 직접 커밋 (이전 방식)
/auto-commit --no-push            # 커밋만, 푸시/PR 안함
/auto-commit --no-review          # 품질 검사 스킵 (권장하지 않음)
/auto-commit --message "메시지"   # 수동 메시지 지정
/auto-commit --branch "이름"      # 브랜치명 직접 지정
/auto-commit --no-parallel-review # 순차 리뷰 강제 (병렬 비활성화)
/auto-commit --draft              # Draft PR로 생성
```

## Parameters

- `--direct`: main/현재 브랜치에 직접 커밋 (PR 생성 안함, 이전 방식)
- `--no-push`: 커밋만 하고 푸시하지 않음
- `--no-review`: 품질 검사 스킵 (긴급 핫픽스용)
- `--message`: 커밋 메시지 직접 지정
- `--branch`: 피처 브랜치명 직접 지정 (기본: 자동 생성)
- `--no-parallel-review`: 병렬 리뷰 비활성화, 순차 리뷰 강제
- `--draft`: Draft PR로 생성 (리뷰 준비 전)

## Workflow Mode

- **PR 모드 (기본)**: 브랜치 판단 → (필요시) 피처 브랜치 생성 → 커밋 → 푸시 → PR 생성/업데이트
- **Direct 모드 (`--direct`)**: 현재 브랜치에 직접 커밋 → 푸시 (이전 방식)

## Branch Strategy (핵심)

> **원칙**: 브랜치는 "작업 단위(feature/fix)" 당 1개만 생성한다. 무분별한 브랜치 생성을 방지한다.

### 브랜치 결정 플로우

1. **현재 피처 브랜치(main/master 아님)에 있음** → 먼저 Stale 검사 (`gh pr list --head <branch> --state all`):
   - **Open PR 존재** → 현재 브랜치 재사용 (커밋 추가 시 PR 자동 갱신)
   - **Merged/Closed PR만 존재** → ⚠️ STALE. 재사용 금지 (닫힌 PR에 push해도 다시 열리지 않음). origin/main에서 새 브랜치 분기 후 변경사항 carry-over (Stale Branch Handling 참조)
   - **PR 없음** → 현재 브랜치 사용 + 새 PR 생성
2. **main/master에 있음** → 파이프라인 여부 판단:
   - **/implement → /auto-commit 파이프라인** (PRD/PLAN 존재) → PRD/PLAN에서 feature name 추출, `feat/<feature-name>` 브랜치 1개 생성, 해당 feature 커밋을 여기에 누적
   - **단독 호출** → 변경사항이 한 작업 단위면 변경 분석에서 추출한 이름으로 브랜치 1개 생성. 여러 도메인에 걸치면 AskUserQuestion으로 "하나의 PR로 묶을지 / 분리할지" 및 브랜치명 확인

### 브랜치 재사용 규칙

| 상황 | 동작 |
|------|------|
| 피처 브랜치 + Open PR 존재 | 현재 브랜치 재사용 (PR에 커밋 추가) |
| 피처 브랜치 + Merged/Closed PR ⚠️ | **Stale 처리** — origin/main에서 새 브랜치 분기, 변경사항 carry-over |
| 피처 브랜치 + PR 없음 | 현재 브랜치 사용, 새 PR 생성 |
| main에서 같은 feature 반복 호출 | 첫 호출 시 만든 open PR 브랜치 재사용 |
| `--branch` 옵션으로 명시 | 해당 이름 사용 (이미 있고 stale이면 새로 분기) |
| 이전 /implement에서 생성된 브랜치 | 해당 브랜치로 checkout (stale 검사 후) |

### 브랜치 재사용 감지 방법

```bash
# 1. 현재 브랜치의 PR 상태 확인 (Stale 판정 핵심)
current_branch=$(git branch --show-current)
gh pr list --head "$current_branch" --state all --json number,state,title --limit 1
# state: OPEN→재사용 / MERGED·CLOSED→STALE(새 브랜치 필요) / 없음→새 PR 생성

# 2. 변경된 파일이 기존 open PR 브랜치와 겹치는지 확인
gh pr list --state open --json number,title,headRefName

# 3. PRD/PLAN(PLAN_{feature}.md, PRD.md)의 feature name과 매칭되는 브랜치 존재 여부 확인
```

### Stale Branch Handling

> **왜 필요한가**: GitHub에서 PR이 squash-merge / closed 처리되면, 같은 브랜치에 추가 push를 해도 자동으로 새 PR이 열리지 않는다. 같은 피처 브랜치를 계속 재사용하면 후속 커밋들이 어느 PR에도 보이지 않는 "orphan" 상태가 된다. 사용자 입장에선 "왜 PR이 안 뜨지?"가 되는 핵심 버그.

**감지:**

```bash
PR_STATE=$(gh pr list \
  --head "$current_branch" \
  --state all \
  --json state \
  --jq '.[0].state // empty' \
  --limit 1)

case "$PR_STATE" in
  MERGED|CLOSED) is_stale=true ;;
  *)             is_stale=false ;;
esac
```

**처리 절차 (자동, 사용자 확인 없이 안전한 경로 선택):**

```bash
if [ "$is_stale" = true ]; then
  # 1. 사용자에게 알림 (안내만, 차단 아님)
  echo "⚠️  Current branch '$current_branch' has a $PR_STATE PR (#$PR_NUMBER)."
  echo "    The branch is stale — pushing here will not reopen the PR."
  echo "    Creating a fresh branch from origin/main and carrying over your changes."

  # 2. 변경사항 임시 stash (working tree 보존)
  git stash push -u -m "auto-commit-stale-carryover-$(date +%s)"

  # 3. 최신 main 동기화
  git fetch origin
  default_branch=$(git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@')

  # 4. 새 브랜치명 결정 (기존 이름에 -followup, 충돌 시 suffix 추가)
  new_branch="${current_branch%-followup}-followup"
  while git show-ref --verify --quiet "refs/heads/$new_branch"; do
    new_branch="${new_branch}-$(date +%s | tail -c 4)"
  done

  # 5. origin/main 위에서 새 브랜치 생성
  git checkout -b "$new_branch" "origin/$default_branch"

  # 6. stash 적용 (변경사항 carry-over)
  git stash pop
fi
```

**경계 사례:**

- **Stash pop 충돌**: 자동 적용 안되면 사용자 안내 후 수동 해결 요청
- **이미 commit된 변경이 stale 브랜치에 있음**: `git cherry-pick`으로 새 브랜치로 이동. 옮길 커밋 = `git log origin/main..HEAD` 중 squash-merge에 포함되지 않은 것
- **Merged vs Closed**: 둘 다 stale 처리 (closed without merge도 추가 push가 의미 없음)

### 브랜치 명명 규칙

| 커밋 타입 | 브랜치 접두사 | 예시 |
|----------|-------------|------|
| `feat` | `feat/` | `feat/user-auth` |
| `fix` | `fix/` | `fix/login-error` |
| `refactor` | `refactor/` | `refactor/api-cleanup` |
| `docs` | `docs/` | `docs/api-guide` |
| `test` | `test/` | `test/auth-coverage` |
| `chore` | `chore/` | `chore/deps-update` |

**이름 생성 규칙:**
- `--branch` 옵션이 있으면 해당 이름 사용
- PRD/PLAN에서 feature name 추출 가능하면 그것 사용
- 없으면 커밋 타입 + 변경 요약에서 자동 생성
- 영문 소문자, 하이픈 구분, 30자 이내 (예: `feat/add-user-authentication-api`)

## Protocol

### Step 1: 상태 확인 및 브랜치 판단

```bash
git fetch origin                              # 최신 변경사항 가져오기
current_branch=$(git branch --show-current)
git status
git diff --stat
git diff --stat HEAD                          # 스테이징 안된 파일 포함
git remote -v

# ⚠️ Stale 검사 — 현재 브랜치에 머지/닫힌 PR이 있는가? (Stale Branch Handling 참조)
gh pr list --head "$current_branch" --state all --json number,state,title --limit 1

# 다른 브랜치 재사용 판단용 open PR 목록
gh pr list --state open --json number,title,headRefName

# PRD/PLAN 파일 확인 (feature name 추출)
ls PLAN_*.md PRD.md 2>/dev/null
```

**브랜치 판단:**
1. `--direct` → Direct 모드, 브랜치 판단 스킵
2. 피처 브랜치: Stale 검사 먼저 (머지/닫힌 PR이면 새 브랜치 분기) → Open PR이면 재사용 → PR 없으면 그대로 사용 + 새 PR
3. main/master: 기존 open PR 브랜치 재사용 가능 여부 확인 → 불가 시 새 브랜치명 결정 (PRD/PLAN or 변경 분석)

**Remote:** 연결된 remote가 여러 개면 push 전 사용자 확인 필요. remote 이름·URL 기록.

**Stale 자동 처리 원칙:** 판정 즉시 사용자 확인 없이 새 브랜치 분기 (낮은 위험, 높은 가치). 단, 결과 보고서에서 어느 브랜치를 어떻게 만들었는지 명확히 알림.

### Step 2: 품질 검사 (Quality Gate)

> **연동**: `code-reviewer` 에이전트로 변경된 코드를 평가합니다.
> **리뷰 규모 조정 (fan-out은 변경 규모에 비례)**: 리뷰어 수를 파일 개수가 아니라 **실제 변경 규모**에 맞춘다. 3줄 diff에 3-way 리뷰어는 순수 낭비다.
> - **단일 리뷰** (기본): 변경이 작을 때 — 파일 ≤5개 **그리고** blast radius LOW(공개 API/시그니처 변경 없음). `code-reviewer` 1개로 처리.
> - **병렬 리뷰** (`parallel-review-coordinator`): 변경이 클 때 — 파일 6개+ **또는** blast radius MEDIUM/HIGH(공개 API·시그니처 변경, caller 다수, 다중 모듈). `--no-parallel-review`로 순차 강제, `--parallel-review`로 강제 활성.

**병렬 구성**: 3개 에이전트가 분담 — Agent A(Readability+Maintainability), Agent B(Performance+Testability), Agent C(Best Practices+Security). 각자 findings를 severity+confidence로 보고하고, Merge 단계에서 findings를 통합해 롤업으로 판정한다.

**평가 항목**: Readability, Maintainability, Performance, Testability, Best Practices (5축 findings 수집)

#### 품질 기준 (병렬/순차 공통) — findings 롤업으로 결정

> 게이트는 **findings 롤업(결정론적)**으로 정한다. 합산 100점은 참고 표시값이며 커밋 여부를 좌우하지 않는다 (같은 코드가 78/85로 튀어 통과/차단이 갈리는 노이즈 제거).

| 롤업 조건 | 상태 | 액션 |
|----------|------|------|
| critical ≥1 (high/med conf) | **FAIL** | ❌ 커밋 중단, 수동 수정 안내 |
| critical 0 AND (major ≥1 OR minor ≥5) | **WARN** | ⚠️ Step 3 (code-formatter 개선 후 재평가) |
| critical 0 AND major 0 AND minor <5 | **PASS** | ✅ Step 4로 진행 (바로 커밋) |

- **Security 차단 규칙**: Security Critical은 critical의 부분집합 → 항상 FAIL(점수 무관 차단). zero-tolerance 유지.
- **confidence 반영**: confidence low인 critical은 major로 강등하되 "사람 확인 필요" 플래그를 붙인다(오탐이 무조건 차단으로 이어지지 않도록).
- **findings 보고 규칙**: 모든 finding에 파일·라인·이유·severity·confidence를 함께 제시한다. 근거 없는 감점·차단 금지.

결과는 **findings 롤업(critical/major/minor 건수 + 판정)**을 먼저 보고하고, 5축 참고 점수를 뒤에 표로 덧붙인다.

### Step 3: 자동 개선 (조건부)

> **연동**: 품질 미달(60-79점) 시 `code-formatter` 에이전트를 호출합니다.

- ESLint/Prettier 자동 수정, import 정리, 포맷팅 통일 후 롤업 재계산.
- 재계산이 PASS(critical 0, major 0, minor <5)면 커밋 진행.
- 자동 개선 후에도 major/critical가 남으면(포맷터로 안 고쳐지는 로직·설계 이슈) 수동 수정 필요 항목(파일·라인·이유)을 나열하고 커밋 중단. 수정 후 다시 `/auto-commit` 실행 안내.

### Step 3.5: 게이트 통과 기록 (하드 게이트 연동) — PASS 경로에서만

> **왜**: 품질 게이트는 프롬프트 지시라 컨텍스트가 차면 조용히 스킵될 수 있다. hook(`hooks.json` PreToolUse)이 커밋을 실제로 차단하려면, "게이트가 방금 PASS했다"는 **검증 아티팩트**가 필요하다. 이 단계는 롤업이 **PASS**로 확정됐을 때만 실행한다(FAIL/WARN-잔존이면 실행하지 않음 → 아티팩트 없음 → 커밋 hook 차단).

```bash
# 롤업이 PASS로 확정된 경우에만 실행한다. 아티팩트는 git repo 루트(toplevel)에 둔다
# — hook이 하위 디렉토리에서 커밋해도 동일 위치를 조회하도록(cwd 결합 방지).
ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo .)
grep -qxF '.wigtn/' "$ROOT/.git/info/exclude" 2>/dev/null || echo '.wigtn/' >> "$ROOT/.git/info/exclude"  # 커밋 혼입 방지 (tracked .gitignore 미변경)
mkdir -p "$ROOT/.wigtn"
echo "PASS $(git rev-parse --short HEAD 2>/dev/null || echo INITIAL) $(git rev-parse --abbrev-ref HEAD 2>/dev/null)" > "$ROOT/.wigtn/gate-pass"  # mtime = PASS 시각. hook이 30분 신선도로 검증

# 객관 체크 자동 스캐폴딩 (PASS 날조 방어를 기본-on으로): checks.sh가 없고 빠른 검증 명령이
# 감지되면 생성한다. hook이 커밋 직전 직접 실행 → 모델이 못 꾸미는 exit code에 게이트를 바인딩.
# 느린 전체 테스트는 커밋을 지연시키므로 기본 스캐폴드는 typecheck/lint만(빠름). 팀은 파일을 편집/삭제해 opt-out.
if [ ! -e "$ROOT/.wigtn/checks.sh" ]; then
  CHK=""
  if [ -f "$ROOT/package.json" ]; then
    grep -q '"typecheck"' "$ROOT/package.json" && CHK="${CHK}npm run typecheck\n"
    grep -q '"lint"' "$ROOT/package.json" && CHK="${CHK}npm run lint\n"
  elif [ -f "$ROOT/tsconfig.json" ]; then
    CHK="npx --no-install tsc --noEmit\n"
  fi
  if [ -n "$CHK" ]; then
    printf '#!/usr/bin/env bash\n# WIGTN 객관 게이트 (auto-scaffolded). hook이 커밋 직전 실행, non-zero면 차단.\n# 기본은 빠른 체크만 — 전체 테스트를 강제하려면 아래에 `npm test` 등을 추가.\n# 이 게이트를 끄려면 이 파일을 삭제한다.\nset -e\n%b' "$CHK" > "$ROOT/.wigtn/checks.sh"
    chmod +x "$ROOT/.wigtn/checks.sh"
  fi
fi
```

- **아티팩트 의미**: 파일의 **mtime**이 곧 "게이트 PASS 시각"이다. hook은 `find "$ROOT/.wigtn/gate-pass" -mmin -30`으로 **30분 이내 PASS**만 유효 처리한다 — 지난 세션의 오래된 통과나, 게이트를 건너뛴 커밋을 막는다. `$ROOT`는 hook·auto-commit 양쪽 모두 `git rev-parse --show-toplevel`로 해석하므로 하위 디렉토리 cwd에서도 일치한다.
- **재작성 금지**: 이 파일은 오직 이 단계(PASS 확정)에서만 쓴다. Step 6에서 커밋 직전에 `touch`하거나 미리 생성하지 않는다 — 그러면 하드 게이트가 무의미해진다.
- **커밋 후 자동 무효화**: 다음 게이트 실행 전까지 mtime이 늙으므로 재사용되지 않는다. 별도 삭제 로직 불필요.

> **객관 체크 게이트 (기본-on, PASS 날조 방어)**: gate-pass는 결국 프롬프트가 쓰는 아티팩트라 모델이 리뷰를 날조하고 써버릴 수 있다("리뷰가 일어났고 PASS했음"만 강제, "리뷰가 좋았음"은 아님). 이를 닫기 위해 위 Step 3.5가 **빠른 검증 명령을 감지하면 `.wigtn/checks.sh`를 자동 생성**한다 — hook이 커밋 직전 이를 **직접 실행**해 non-zero면 차단한다. 테스트/타입체크의 exit code는 모델이 못 꾸미므로, 게이트가 "리뷰가 좋았음"이 아니라 **"객관 검증이 실제로 통과했음"**을 강제한다.
> - **기본 동작**: `package.json`에 `typecheck`/`lint` 스크립트(또는 `tsconfig.json`)가 있으면 자동 스캐폴딩 → 별도 설정 없이 날조 방어가 켜진다. 감지 실패 시 파일 없음 → 기존 무마찰(false-block 없음).
> - **opt-out / 커스터마이즈**: `.wigtn/checks.sh`를 편집(전체 테스트 `npm test` 추가 등)하거나 삭제. 한 번 존재하면 auto-commit이 덮어쓰지 않는다.
> - **주의**: hook에서 **동기 실행**되므로 checks.sh는 빠른 것(타입체크·lint·핵심 테스트)으로 유지한다. 느린 전체 스위트는 커밋을 지연시킨다.

### Step 4: 변경 분석 및 타입 결정

| 변경 패턴 | 커밋 타입 | 예시 |
|----------|----------|------|
| `agents/`, `.claude/agents/` | `feat(agent)` | Agent 추가/수정 |
| `skills/`, `.claude/skills/` | `feat(skill)` | Skill 추가/수정 |
| `commands/`, `.claude/commands/` | `feat(command)` | Command 추가/수정 |
| `rules/`, `.claude/rules/` | `chore(rules)` | Rule 수정 |
| `hooks/`, `.claude/hooks/` | `feat(hook)` | Hook 추가/수정 |
| `docs/`, `*.md` (문서) | `docs` | 문서 변경 |
| `src/`, `lib/`, `app/` | `feat` | 소스 코드 |
| `tests/`, `*.test.*`, `*.spec.*` | `test` | 테스트 |
| `package.json`, `*-lock.*`, `requirements.txt` | `chore(deps)` | 의존성 |
| `Dockerfile`, `docker-compose.*`, `*.yaml` (k8s) | `chore(infra)` | 인프라 |
| 버그 수정 키워드 (fix, bug, error) | `fix` | 버그 수정 |
| 리팩토링 키워드 (refactor, cleanup) | `refactor` | 구조 개선 |

### Step 5: 커밋 메시지 형식

```
<type>(<scope>): <subject>

<body>

Quality Score: XX/100
Co-Authored-By: Claude <noreply@anthropic.com>
```

- **Subject**: 50자 이내, 동사 원형으로 시작(Add/Update/Fix/Remove), 마침표 없음
- **Body**: 변경된 주요 파일/기능 나열, 72자 줄바꿈
- **`Quality Score:` 줄은 게이트가 실제로 실행됐을 때만 넣는다.** 하드 게이트 hook은 이 줄을 "게이트를 거친 파이프라인 커밋" 신호로 본다 → `.wigtn/gate-pass` 아티팩트가 없으면 차단한다.
  - **`--no-review`(게이트 스킵)**: `Quality Score:` 줄을 **넣지 않고** 대신 `Quality Gate: SKIPPED (--no-review)`로 표기한다. 신호가 없으므로 hook을 우회한다(긴급 핫픽스 경로 보존).

### Step 5.5: Safety Guard (최종 확인)

> **필수**: Quality Gate 통과 후, 커밋 전에 반드시 AskUserQuestion으로 사용자 확인을 받습니다.

**PR 모드 (기본):**

```yaml
question: "모든 검사가 통과되었습니다. PR을 생성할까요?"
header: "Pull Request"
options:
  - label: "PR 생성 (Recommended)"
    description: "피처 브랜치에 커밋하고 PR을 생성합니다"
  - label: "Draft PR 생성"
    description: "Draft 상태의 PR을 생성합니다"
  - label: "커밋만 (PR 나중에)"
    description: "브랜치에 커밋만 하고 PR은 나중에 생성"
  - label: "취소"
    description: "커밋하지 않고 중단합니다"
```

**Direct 모드 (`--direct`):**

```yaml
question: "모든 검사가 통과되었습니다. 최종 커밋을 진행할까요?"
header: "Commit"
options:
  - label: "커밋 진행 (Recommended)"
    description: "변경사항을 커밋하고 푸시합니다"
  - label: "커밋만 (푸시 안함)"
    description: "로컬에만 커밋하고 푸시는 나중에"
  - label: "취소"
    description: "커밋하지 않고 중단합니다"
```

확인 시 변경 요약(파일 수/증감, 커밋 타입, 메시지, 대상 브랜치)과 변경 파일 목록을 함께 보여준 뒤 질문한다.

**응답 처리:**

| 선택 | 액션 |
|------|------|
| PR 생성 | Step 6 → Step 6.5 → Step 7 (브랜치 + 커밋 + PR) |
| Draft PR 생성 | Step 6 → Step 6.5 → Step 7 (`--draft` 플래그 추가) |
| 커밋만 | Step 6 → Step 7 (브랜치 + 커밋, PR 스킵) |
| 취소 | 커밋 중단, 변경사항 유지 |

### Step 6: 브랜치 및 커밋

**PR 모드 (기본)** — Step 1에서 결정된 브랜치 전략에 따라 분기:

```bash
# Case A: 이미 피처 브랜치에 있음 → 그대로 사용 (아무것도 안함)
# Case B: main에 있고 재사용할 브랜치 있음 → git checkout <existing-branch>
# Case C: main에 있고 새 브랜치 필요 → git checkout -b <branch-name>

git add -A
git commit -m "$(cat <<'EOF'
<generated message>

Quality Score: XX/100
Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

**Direct 모드 (`--direct`)** — 브랜치 분기 없이 현재 브랜치에 커밋:

```bash
git add -A
git commit -m "$(cat <<'EOF'
<generated message>

Quality Score: XX/100
Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### Step 6.5: 푸시 및 PR 생성

**PR 모드 (기본):**

```bash
# 1. 피처 브랜치 푸시 (-u로 upstream 설정)
git push -u origin <branch-name>

# 2. PR 생성
gh pr create --title "<커밋 메시지 subject>" --body "$(cat <<'EOF'
## Summary
<변경 요약 1-3줄>

## Changes
<변경된 파일/기능 목록>

## Quality Gate
- Score: XX/100 (Grade)
- Status: PASS

## Test Plan
- [ ] 테스트 항목들...

---
🤖 Generated with Claude Code (`/auto-commit`)
EOF
)"
```

- **Draft PR**: `gh pr create --draft --title "..." --body "..."`
- **이미 PR 존재 시** (피처 브랜치 추가 커밋): `gh pr list --head <branch-name> --json number,title`로 확인 후 있으면 `git push`만 (PR 자동 업데이트)

**Direct 모드 (`--direct`)** — `--no-push`가 없고 remote가 2개 이상일 때만 push 선택 실행:

- Remote 1개: `git push`
- Remote 2개 이상: 사용자에게 어느 remote에 push할지 확인 (origin만 / 모든 remote / push 안함). tracking branch가 설정된 remote를 기본값으로 제안.

### Step 7: 결과 출력

커밋·푸시·PR 결과를 간결히 보고한다. 포함 내용:
- Quality Gate 상태와 점수 (근거 findings 동반)
- 사용/생성된 브랜치, 커밋 해시·메시지, push 대상, 생성된 PR 번호·URL
- 변경 통계 (파일 수, 증감 라인) 및 주요 변경 파일
- 다음 단계 안내: `/review-pr <PR번호>`

**Stale Branch 자동 처리 시 추가 표시** — stale 감지 사실(이전 브랜치 + PR 상태), 새로 만든 브랜치(off origin/main), carry-over한 uncommitted 파일·커밋 수, 이전 브랜치를 더 이상 쓰지 말라는 안내.

**Direct 모드**: 브랜치/PR 항목 없이 커밋 해시·메시지, push 대상, 변경 통계·파일만 출력.

## Quality Gate Flow

1. 변경사항 수집 + 브랜치 확인
2. `code-reviewer` findings 수집 (severity + confidence)
3. findings 롤업으로 분기 (결정론적):
   - **PASS** (critical 0, major 0, minor <5) → **Step 3.5에서 게이트 통과 아티팩트(`.wigtn/gate-pass`) 기록** → Step 5.5 Safety Guard로 진행
   - **WARN** (critical 0, major ≥1 또는 minor ≥5) → `code-formatter` 자동 개선 → 롤업 재계산 → PASS면 Step 3.5 기록 후 Safety Guard, major 잔존이면 STOP(수동 수정)
   - **FAIL** (critical ≥1) → STOP (수동 수정) — 아티팩트 미기록 → 커밋 hook 차단
   - **Security Critical** → critical의 부분집합 → FAIL → STOP

> **하드 게이트 (hook 강제)**: `hooks.json`의 PreToolUse가 `git commit`을 가로채, 메시지에 `Quality Score:`가 있는데 30분 이내 `.wigtn/gate-pass`가 없으면 커밋을 **차단(exit 2)**한다. 게이트가 프롬프트라 스킵돼도 하네스가 커밋을 막는다. 수동 커밋(신호 없음)·`--no-review`(신호 제거)는 영향받지 않는다.
4. Safety Guard에서 AskUserQuestion("PR 생성?") → 선택에 따라:
   - PR 생성 → BRANCH + COMMIT + PUSH + PR
   - Draft PR → BRANCH + COMMIT + PUSH + Draft PR
   - 커밋만 → BRANCH + COMMIT only
   - 취소 → STOP (변경 유지)

**Direct 모드 (`--direct`)**: Quality Gate PASS → AskUserQuestion("커밋?") → 커밋 진행(COMMIT+PUSH, 현재 브랜치) / 커밋만(COMMIT only) / 취소(STOP)

## Integration Points

### 호출하는 스킬/에이전트

| 구성요소 | 역할 | 호출 조건 |
|----------|------|----------|
| `code-reviewer` 에이전트 | findings 수집·게이트 | 항상 (--no-review 제외) |
| `parallel-review-coordinator` | 병렬 리뷰 조율 | 파일 6개+ 또는 blast radius MEDIUM/HIGH (--no-parallel-review 제외) |
| `code-formatter` 에이전트 | 자동 코드 개선 | 점수 60-79점일 때 |

### 외부 도구

| 도구 | 용도 | 모드 |
|------|------|------|
| `gh pr create` | PR 생성 | PR 모드 |
| `gh pr list` | 기존 PR 확인 | PR 모드 |
| `git checkout -b` | 피처 브랜치 생성 | PR 모드 |
| `git push -u` | 브랜치 푸시 + upstream 설정 | PR 모드 |

### 단계 연결

- **입력 (from /implement)**: 새로 생성/수정된 파일들, 구현된 기능 목록(PRD 기반)
- **출력 (to /review-pr)**: PR URL → 동료에게 `/review-pr <PR번호>`로 리뷰 요청

## Rules

1. **Safety Guard 필수**: Quality Gate 통과 후 커밋/PR 전 반드시 AskUserQuestion으로 사용자 확인
2. **PR 모드 기본**: 별도 옵션 없으면 피처 브랜치 + PR 생성이 기본 동작
3. **민감한 파일 확인**: `.env`, `credentials`, `secrets` 등은 커밋하지 않음
4. **대규모 변경**: 100개 이상 파일 변경 시 확인 요청
5. **충돌 감지**: 푸시 실패 시 pull --rebase 제안
6. **빈 커밋 방지**: 변경사항 없으면 커밋하지 않음
7. **품질 우선**: 기본적으로 품질 검사 수행 (긴급 시 --no-review)
8. **브랜치 재사용 (조건부)**: 피처 브랜치에 있고 **Open PR이 연결된 경우에만** 재사용. PR이 없으면 그대로 사용 가능.
9. **Stale Branch 차단** ⚠️: 현재 피처 브랜치의 PR이 **MERGED 또는 CLOSED**면 stale. 재사용 금지 — origin/main에서 새 브랜치 분기 후 carry-over (Stale Branch Handling 참조)
10. **기존 PR 확인**: 같은 브랜치에 open PR이 이미 있으면 새 PR 생성하지 않고 커밋만 추가
11. **Multiple Remote 처리** (Direct 모드): remote가 2개 이상이면 push 전 반드시 사용자 확인, tracking branch가 설정된 remote를 기본값으로 제안
12. **점수 근거 동반**: 보고하는 모든 Quality Score에는 구체적 findings를 함께 제시한다 (근거 없는 숫자 금지)
13. **하드 게이트 아티팩트**: 롤업 PASS 시에만 Step 3.5에서 `.wigtn/gate-pass`를 기록한다. 커밋 hook이 이 아티팩트로 게이트 실행을 강제하므로, 게이트를 우회하려 파일을 미리 만들거나 `touch`하지 않는다.

## Skip Quality Gate

긴급 핫픽스 등 품질 검사를 건너뛰어야 할 때:

```bash
/auto-commit --no-review --direct --message "hotfix: 긴급 버그 수정"
```

- `--no-review`는 게이트를 실행하지 않으므로 커밋 메시지에 `Quality Score:` 줄을 넣지 않는다(대신 `Quality Gate: SKIPPED (--no-review)`). 하드 게이트 hook은 `Quality Score:` 신호가 없는 커밋을 통과시키므로 이 경로가 정상 동작한다.

⚠️ **경고**: 품질 검사 스킵은 권장하지 않습니다. 가능하면 `/review-pr`로 리뷰를 받으세요.
