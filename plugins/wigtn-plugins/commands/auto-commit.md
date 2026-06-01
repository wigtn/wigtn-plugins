---
description: Analyze changes, run quality gate, and auto-commit with PR-based workflow. Trigger on "/auto-commit", "git 푸시", "git push", "자동 커밋", "커밋해줘", "변경사항 커밋", "PR 올려줘", "PR 만들어줘", or when user asks to commit their work after completing a task.
---

# Auto Commit

작업 완료 후 변경사항을 분석하고, 품질 검사를 거쳐 피처 브랜치에 커밋하고 PR을 생성합니다.

## Pipeline Position

```
┌─────────────────────────────────────────────────────────────┐
│  [/prd] → [/implement] → [/auto-commit] → PR 생성           │
│                            ^^^^^^^^^^^^    ↓                │
│                            현재 단계    동료: /review-pr     │
└─────────────────────────────────────────────────────────────┘
```

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

### PR 모드 (기본)

```
브랜치 판단 → (필요시) 피처 브랜치 생성 → 커밋 → 푸시 → PR 생성/업데이트
```

### Direct 모드 (`--direct`)

```
현재 브랜치에 직접 커밋 → 푸시 (이전 방식)
```

## Branch Strategy (핵심)

> **원칙**: 브랜치는 "작업 단위(feature/fix)" 당 1개만 생성한다. 무분별한 브랜치 생성을 방지한다.

### 브랜치 결정 플로우

```
Step 1: 현재 어떤 브랜치에 있는가?
  │
  ├─ 피처 브랜치 (main/master가 아님)
  │   │
  │   Step 1.5: 이 브랜치에 연결된 PR 상태는? ⚠️ Stale 검사
  │   │  ────────────────────────────────────────────
  │   │  gh pr list --head <current-branch> --state all
  │   │
  │   ├─ Open PR 존재
  │   │   → ✅ 현재 브랜치 재사용 (커밋 추가, PR 자동 갱신)
  │   │
  │   ├─ Merged 또는 Closed PR만 존재 ⚠️ STALE BRANCH
  │   │   → 🚫 현재 브랜치 재사용 금지
  │   │   → 닫힌 PR에 push해도 PR이 다시 열리지 않음
  │   │   → 새 브랜치를 origin/main에서 분기하여 변경사항 carry-over
  │   │   → (Stale Branch Handling 섹션 참조)
  │   │
  │   └─ PR 없음
  │       → ✅ 현재 브랜치 사용 + 새 PR 생성
  │
  └─ main 또는 master
      │
      Step 2: 파이프라인에서 왔는가? (PRD/PLAN 존재 여부)
      │
      ├─ /implement → /auto-commit 파이프라인
      │   → PRD/PLAN 파일에서 feature name 추출
      │   → `feat/<feature-name>` 브랜치 1개 생성
      │   → 해당 feature의 모든 커밋은 이 브랜치에 쌓임
      │
      └─ 단독 /auto-commit (파이프라인 밖)
          │
          Step 3: 변경사항이 하나의 작업 단위인가?
          │
          ├─ 변경된 파일들이 동일 도메인/기능
          │   → 변경 분석에서 추출한 이름으로 브랜치 1개 생성
          │
          └─ 여러 도메인에 걸친 변경
              → AskUserQuestion: 브랜치명 확인
              → "이 변경사항을 하나의 PR로 묶을까요,
                 분리해서 커밋할까요?"
```

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

# state 값 의미:
#   OPEN   → 재사용 가능
#   MERGED → STALE — 새 브랜치 필요
#   CLOSED → STALE — 새 브랜치 필요
#   (없음) → PR 없음, 새 PR 생성하면 됨

# 2. 변경된 파일이 기존 open PR의 브랜치와 겹치는지 확인
gh pr list --state open --json number,title,headRefName

# 3. PRD/PLAN 파일에서 feature name 추출
#    → PLAN_{feature}.md 또는 PRD.md의 feature name과 매칭되는
#       브랜치가 이미 있는지 확인
```

### Stale Branch Handling

> **왜 필요한가**: GitHub에서 PR이 squash-merge / closed 처리되면, 같은 브랜치에 추가 push를 해도 자동으로 새 PR이 열리지 않는다. 같은 피처 브랜치를 계속 재사용하면 그 후속 커밋들은 어느 PR에도 보이지 않는 "orphan" 상태가 된다. 사용자 입장에선 "왜 PR이 안 뜨지?"가 되는 핵심 버그.

**감지 방법:**

```bash
# 현재 브랜치의 PR 이력 조회
PR_STATE=$(gh pr list \
  --head "$current_branch" \
  --state all \
  --json state \
  --jq '.[0].state // empty' \
  --limit 1)

# PR_STATE가 MERGED 또는 CLOSED면 Stale로 판정
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

  # 4. 새 브랜치명 결정 (기존 브랜치명에 -followup 또는 새 이름)
  new_branch="${current_branch%-followup}-followup"  # 또는 변경 분석 기반
  # 충돌 회피: 이미 있으면 -2, -3 ... 추가
  while git show-ref --verify --quiet "refs/heads/$new_branch"; do
    new_branch="${new_branch}-$(date +%s | tail -c 4)"
  done

  # 5. origin/main 위에서 새 브랜치 생성
  git checkout -b "$new_branch" "origin/$default_branch"

  # 6. stash 적용 (변경사항 carry-over)
  git stash pop
fi
```

**경계 사례 (edge cases) 처리:**

- **Stash pop 충돌**: stash가 새 브랜치에 자동 적용 안되면 사용자 안내 후 수동 해결 요청
- **이미 commit된 변경이 stale 브랜치에 있음**: `git cherry-pick` 으로 해당 커밋들도 새 브랜치로 옮김. 옮겨야 할 커밋 = `git log origin/main..HEAD`의 커밋 중 squash-merge에 포함되지 않은 것
- **Merged PR과 Closed PR 구분**: 둘 다 stale로 처리 (closed without merge도 추가 push가 의미 없음)

**사용자 알림 메시지 (Step 7 결과 출력 시):**

```
⚠️  Stale branch detected
   Previous branch: feat/old-name (PR #42 MERGED)
✓  Created fresh branch: feat/old-name-followup (off origin/main)
✓  Carried over 3 uncommitted file(s)
✓  Carried over 6 commit(s) via cherry-pick
```

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
- 영문 소문자, 하이픈으로 구분, 30자 이내
- 예: `feat/add-user-authentication-api`

## Protocol

### Step 1: 상태 확인 및 브랜치 판단

```bash
# 원격 저장소에서 최신 변경사항 가져오기 (필수)
git fetch origin

# 현재 브랜치 확인
current_branch=$(git branch --show-current)

# 상태 확인
git status

# 변경 통계
git diff --stat

# 스테이징 안된 파일 포함
git diff --stat HEAD

# Remote 목록 확인
git remote -v

# ⚠️ Stale 검사 — 현재 브랜치에 머지/닫힌 PR이 있는가?
# (Branch Strategy → Stale Branch Handling 섹션 참조)
gh pr list --head "$current_branch" --state all --json number,state,title --limit 1

# Open PR 목록 확인 (다른 브랜치의 재사용 판단용)
gh pr list --state open --json number,title,headRefName

# PRD/PLAN 파일 확인 (feature name 추출)
ls PLAN_*.md PRD.md 2>/dev/null
```

**브랜치 판단 (Branch Strategy 참조):**
1. `--direct` 옵션 → Direct 모드, 브랜치 판단 스킵
2. 피처 브랜치에 있음:
   - **Stale 검사 먼저** — 머지/닫힌 PR이 있으면 origin/main에서 새 브랜치 분기 (Stale Branch Handling 섹션)
   - Open PR 있음 → 현재 브랜치 재사용
   - PR 없음 → 현재 브랜치 사용, 새 PR 생성
3. main/master에 있음 → 기존 open PR 브랜치 재사용 가능 여부 확인
4. 재사용 불가 → 새 브랜치명 결정 (PRD/PLAN or 변경 분석)

**Remote 확인:**
- 연결된 remote가 여러 개인 경우 나중에 push 전 사용자 확인 필요
- remote 이름과 URL을 기록해둠

**Stale 자동 처리 원칙:**
- Stale 판정 즉시 사용자 확인 없이 새 브랜치를 분기 (낮은 위험, 높은 유저 가치)
- 단, **결과 보고서에서 명확히 알림** — 어느 브랜치를 어떻게 만들었는지 표시

### Step 2: 품질 검사 (Quality Gate)

> **연동**: `code-reviewer` 에이전트를 사용하여 변경된 코드를 평가합니다.
> **병렬 모드**: 변경 파일 3개 이상일 때 자동으로 `parallel-review-coordinator`를 호출합니다.

#### Parallel Quality Gate (변경 파일 3개+)

```
┌─────────────────────────────────────────────────────────────┐
│  Parallel Quality Gate                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  변경 파일: 5개 (병렬 리뷰 자동 활성화)                     │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Agent A  │  │ Agent B  │  │ Agent C  │                  │
│  │Read+Main │  │Perf+Test │  │BP+Securi │                  │
│  │  /40     │  │  /40     │  │ty /20+🔒 │                  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                  │
│       │              │              │                       │
│       └──────────────┼──────────────┘                       │
│                      ▼                                      │
│              ┌──────────────┐                               │
│              │ Score Merge  │                               │
│              │ + Security   │                               │
│              │   Override   │                               │
│              └──────────────┘                               │
│                                                             │
│  → `--no-parallel-review`로 순차 강제 가능                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**병렬 리뷰 결과 테이블:**

```markdown
## Parallel Review Result

| Agent | Category | Score | Duration |
|-------|----------|-------|----------|
| A | Readability | 18/20 | 4.2s |
| A | Maintainability | 16/20 | - |
| B | Performance | 15/20 | 5.1s |
| B | Testability | 17/20 | - |
| C | Best Practices | 17/20 | 3.8s |
| C | Security | OK | - |
| **Total** | **All** | **83/100** | **5.1s** |

Sequential Estimate: 15.3s | Speedup: 3.0x
```

#### 품질 기준 (병렬/순차 공통)

| 점수 | 등급 | 액션 |
|------|------|------|
| **80점 이상** | A/B | ✅ Step 4로 진행 (바로 커밋) |
| **60-79점** | C | ⚠️ Step 3으로 진행 (자동 개선 시도) |
| **60점 미만** | D/F | ❌ 커밋 중단, 수동 수정 안내 |

**Security Zero-Tolerance:** Security Critical 이슈 발견 시 점수 무관 59점 이하 강제 → 커밋 차단

**평가 항목:**
- Readability (가독성)
- Maintainability (유지보수성)
- Performance (성능)
- Testability (테스트 가능성)
- Best Practices (모범 사례)

```markdown
## Quality Gate Result

| 항목 | 점수 | 상태 |
|------|------|------|
| Readability | 18/20 | ✅ |
| Maintainability | 16/20 | ✅ |
| Performance | 15/20 | ⚠️ |
| Testability | 17/20 | ✅ |
| Best Practices | 17/20 | ✅ |
| **Total** | **83/100** | **✅ PASS** |

→ 품질 기준 충족, 커밋을 진행합니다.
```

### Step 3: 자동 개선 (조건부)

> **연동**: 품질 미달 시 `code-formatter` 에이전트를 호출합니다.

**60-79점인 경우:**

```
⚠️ 품질 점수가 기준에 미달합니다 (72/100)

자동 개선을 시도합니다...

🔧 code-formatter 에이전트 호출:
  - ESLint/Prettier 자동 수정
  - import 정리
  - 포맷팅 통일

재평가 중...

✅ 개선 후 점수: 81/100
→ 품질 기준 충족, 커밋을 진행합니다.
```

**자동 개선 후에도 미달 시:**

```
❌ 자동 개선 후에도 품질 기준 미달 (68/100)

수동 수정이 필요한 항목:
1. [Major] src/utils/helper.ts:45 - 복잡도 높은 함수
2. [Major] src/api/user.ts:23 - 에러 처리 누락

커밋을 중단합니다.
수정 후 다시 `/auto-commit`을 실행해주세요.
```

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

**Subject 규칙:**
- 50자 이내
- 동사 원형으로 시작 (Add, Update, Fix, Remove)
- 마침표 없음

**Body 규칙:**
- 변경된 주요 파일/기능 나열
- 72자 줄바꿈

### Step 5.5: Safety Guard (최종 확인)

> **필수**: Quality Gate 통과 후, 커밋 전에 반드시 사용자 확인을 받습니다.

**AskUserQuestion 호출 (PR 모드 — 기본):**

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

**AskUserQuestion 호출 (Direct 모드 — `--direct`):**

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

**확인 화면 (PR 모드):**

```
┌─────────────────────────────────────────────────────────────┐
│  ✅ Quality Gate: PASSED (85/100)                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 변경 요약:                                               │
│  • 파일: 5개 변경 (+234, -12)                               │
│  • 타입: feat(auth)                                         │
│  • 메시지: Add user authentication API                      │
│  • 브랜치: feat/user-auth (자동 생성)                       │
│                                                             │
│  📋 변경 파일:                                               │
│  • src/api/auth/login.ts (new)                              │
│  • src/api/auth/register.ts (new)                           │
│  • src/services/AuthService.ts (new)                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  🛡️ Safety Guard                                            │
│                                                             │
│  모든 검사가 통과되었습니다.                                 │
│  PR을 생성할까요?                                            │
│                                                             │
│  → PR 생성 (Recommended)                                    │
│  → Draft PR 생성                                            │
│  → 커밋만 (PR 나중에)                                        │
│  → 취소                                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**응답 처리:**

| 선택 | 액션 |
|------|------|
| PR 생성 | Step 6 → Step 6.5 → Step 7 (브랜치 + 커밋 + PR) |
| Draft PR 생성 | Step 6 → Step 6.5 → Step 7 (`--draft` 플래그 추가) |
| 커밋만 | Step 6 → Step 7 (브랜치 + 커밋, PR 스킵) |
| 취소 | 커밋 중단, 변경사항 유지 |

### Step 6: 브랜치 및 커밋

#### PR 모드 (기본)

```bash
# 1. Step 1에서 결정된 브랜치 전략에 따라 분기

# Case A: 이미 피처 브랜치에 있음 → 그대로 사용
# (아무것도 안함)

# Case B: main에 있고, 재사용할 브랜치가 있음 → checkout
git checkout <existing-branch>

# Case C: main에 있고, 새 브랜치 필요 → 생성
git checkout -b <branch-name>

# 2. 모든 변경사항 스테이징
git add -A

# 3. 커밋 (HEREDOC으로 메시지 전달)
git commit -m "$(cat <<'EOF'
<generated message>

Quality Score: 82/100
Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

#### Direct 모드 (`--direct`)

```bash
# 모든 변경사항 스테이징
git add -A

# 커밋 (HEREDOC으로 메시지 전달)
git commit -m "$(cat <<'EOF'
<generated message>

Quality Score: 82/100
Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### Step 6.5: 푸시 및 PR 생성

#### PR 모드 (기본)

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

**Draft PR인 경우:**
```bash
gh pr create --draft --title "..." --body "..."
```

**이미 PR이 존재하는 경우 (피처 브랜치에서 추가 커밋):**
```bash
# PR이 이미 있는지 확인
gh pr list --head <branch-name> --json number,title

# 있으면 푸시만 (PR은 자동으로 업데이트됨)
git push
```

#### Direct 모드 (`--direct`)

> **조건**: `--no-push` 옵션이 없고, remote가 2개 이상일 때만 선택 실행

**Remote가 1개인 경우:**
```bash
git push
```

**Remote가 2개 이상인 경우:**

사용자에게 확인 요청:

```markdown
여러 개의 remote가 감지되었습니다:

| Remote | URL |
|--------|-----|
| origin | https://github.com/user/repo.git |
| upstream | https://github.com/original/repo.git |

어떤 remote에 push하시겠습니까?
- **origin만** (기본)
- **모든 remote에 push**
- **push 안함**
```

### Step 7: 결과 출력

#### PR 모드 (기본)

```
✅ Quality Gate: PASSED (82/100)

✓ Branch: feat/user-auth (created)
✓ Committed: abc1234
  feat(auth): Add user authentication API
✓ Pushed to origin/feat/user-auth
✓ PR created: #42

🔗 https://github.com/user/repo/pull/42

📊 Changes:
  - 5 files changed
  - +234 insertions, -12 deletions

📋 Files:
  - src/api/auth/login.ts (new)
  - src/api/auth/register.ts (new)
  - src/services/AuthService.ts (new)
  - src/types/auth.ts (new)
  - tests/auth.test.ts (new)

💡 동료에게 리뷰 요청: /review-pr 42
```

#### PR 모드 — Stale Branch 자동 처리 시

```
✅ Quality Gate: PASSED (88/100)

⚠️  Stale branch detected
   Previous branch: feat/old-name (PR #42 MERGED at 2026-05-02)
   → push해도 머지된 PR은 다시 열리지 않으므로 새 브랜치를 만듭니다.

✓ Branch: feat/old-name-followup (created off origin/main)
✓ Carried over: 3 uncommitted file(s) + 6 commit(s)
✓ Committed: def5678
  fix(auth): Fix token refresh logic
✓ Pushed to origin/feat/old-name-followup
✓ PR created: #43

🔗 https://github.com/user/repo/pull/43

💡 이전 브랜치(feat/old-name)는 더 이상 사용하지 마세요.
```

#### Direct 모드 (`--direct`)

```
✅ Quality Gate: PASSED (82/100)

✓ Committed: abc1234
  feat(auth): Add user authentication API
✓ Pushed to origin/main

📊 Changes:
  - 5 files changed
  - +234 insertions, -12 deletions

📋 Files:
  - src/api/auth/login.ts (new)
  - src/api/auth/register.ts (new)
  - src/services/AuthService.ts (new)
  - src/types/auth.ts (new)
  - tests/auth.test.ts (new)
```

## Quality Gate Flow

```
                    ┌─────────────────┐
                    │  변경사항 수집   │
                    │  + 브랜치 확인  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  code-reviewer  │
                    │  품질 점수 평가  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌─────────┐    ┌─────────┐    ┌─────────┐
        │ ≥80점   │    │ 60-79점 │    │ <60점   │
        │  PASS   │    │  WARN   │    │  FAIL   │
        └────┬────┘    └────┬────┘    └────┬────┘
             │              │              │
             │              ▼              │
             │    ┌─────────────────┐      │
             │    │ code-formatter  │      │
             │    │   자동 개선     │      │
             │    └────────┬────────┘      │
             │              │              │
             │         재평가              │
             │              │              │
             │    ┌────────┴────────┐      │
             │    │                 │      │
             │    ▼                 ▼      │
             │  ≥80점            <80점     │
             │    │                 │      │
             ▼    ▼                 ▼      ▼
        ┌─────────────┐       ┌─────────────┐
        │ 🛡️ Safety   │       │    STOP     │
        │    Guard    │       │  수동 수정   │
        └──────┬──────┘       └─────────────┘
               │
               ▼
        ┌─────────────────┐
        │ AskUserQuestion │
        │ "PR 생성?"       │
        └────────┬────────┘
                 │
     ┌───────────┼───────────┐───────────┐
     │           │           │           │
     ▼           ▼           ▼           ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐
│ PR 생성 │ │ Draft   │ │ 커밋만  │ │  취소  │
│         │ │ PR 생성 │ │         │ │        │
└────┬────┘ └────┬────┘ └────┬────┘ └───┬────┘
     │           │           │           │
     ▼           ▼           ▼           ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐
│ BRANCH  │ │ BRANCH  │ │ BRANCH  │ │  STOP  │
│ COMMIT  │ │ COMMIT  │ │ COMMIT  │ │ (유지) │
│ PUSH+PR │ │PUSH+Draft│ │  only  │ └────────┘
└─────────┘ └─────────┘ └─────────┘
```

### Direct 모드 (`--direct`) Flow

```
Quality Gate PASS → AskUserQuestion "커밋?"
  → 커밋 진행: COMMIT + PUSH (현재 브랜치)
  → 커밋만: COMMIT only
  → 취소: STOP
```

## Integration Points

### 호출하는 스킬/에이전트

| 구성요소 | 역할 | 호출 조건 |
|----------|------|----------|
| `code-reviewer` 에이전트 | 품질 점수 평가 | 항상 (--no-review 제외) |
| `parallel-review-coordinator` | 병렬 리뷰 조율 | 변경 파일 3개+ (--no-parallel-review 제외) |
| `code-formatter` 에이전트 | 자동 코드 개선 | 점수 60-79점일 때 |

### 외부 도구

| 도구 | 용도 | 모드 |
|------|------|------|
| `gh pr create` | PR 생성 | PR 모드 |
| `gh pr list` | 기존 PR 확인 | PR 모드 |
| `git checkout -b` | 피처 브랜치 생성 | PR 모드 |
| `git push -u` | 브랜치 푸시 + upstream 설정 | PR 모드 |

### 이전 단계에서 받는 입력

```
/implement 명령 결과물:
- 새로 생성된 파일들
- 수정된 파일들
- 구현된 기능 목록 (PRD 기반)
```

### 다음 단계

```
/auto-commit 완료 후:
- PR URL 출력
- 동료에게 리뷰 요청: /review-pr <PR번호>
```

## Examples

### PR 생성 (기본 모드)

```
입력: /auto-commit

분석:
- src/components/Button.tsx 변경
- tests/Button.test.tsx 추가

품질 검사:
- code-reviewer 실행 → 85/100 ✅

결과:
✅ Quality Gate: PASSED
✓ Branch: feat/update-button (created)
✓ Committed: abc1234
  feat: Update Button component and add tests
✓ Pushed to origin/feat/update-button
✓ PR created: #42
🔗 https://github.com/user/repo/pull/42

💡 동료에게 리뷰 요청: /review-pr 42
```

### Direct 모드 (이전 방식)

```
입력: /auto-commit --direct

분석:
- src/components/Button.tsx 변경
- tests/Button.test.tsx 추가

품질 검사:
- code-reviewer 실행 → 85/100 ✅

결과:
✅ Quality Gate: PASSED
✓ Committed: abc1234
  feat: Update Button component and add tests
✓ Pushed to origin/main
```

### 자동 개선 후 PR

```
입력: /auto-commit

분석:
- src/utils/helper.ts 변경

품질 검사:
- code-reviewer 실행 → 72/100 ⚠️

자동 개선:
- code-formatter 실행
- ESLint 오류 3건 수정
- import 정리

재평가:
- code-reviewer 재실행 → 84/100 ✅

결과:
✅ Quality Gate: PASSED (after auto-fix)
✓ Branch: fix/improve-helpers (created)
✓ Committed: def5678
  fix: Improve helper utilities
✓ PR created: #43
🔗 https://github.com/user/repo/pull/43
```

### 품질 미달로 중단

```
입력: /auto-commit

분석:
- src/api/complex.ts 변경

품질 검사:
- code-reviewer 실행 → 55/100 ❌

결과:
❌ Quality Gate: FAILED

수동 수정 필요:
1. [Critical] Line 45: SQL 인젝션 취약점
2. [Major] Line 78: 에러 처리 누락
3. [Major] Line 102: 하드코딩된 비밀번호

커밋이 중단되었습니다.
위 항목을 수정 후 다시 시도해주세요.
```

### 피처 브랜치에서 추가 커밋

```
입력: /auto-commit (이미 feat/user-auth 브랜치에 있을 때)

분석:
- src/api/auth.ts 수정

품질 검사:
- code-reviewer 실행 → 88/100 ✅

결과:
✅ Quality Gate: PASSED
✓ Committed: ghi9012
  fix(auth): Fix token refresh logic
✓ Pushed to origin/feat/user-auth
✓ PR #42 updated (기존 PR에 커밋 추가)
```

### Stale Branch 자동 복구 (이번에 새로 추가된 시나리오)

```
입력: /auto-commit
컨텍스트: 어제 PR #42 머지됨. 그 이후 같은 브랜치에 6개 커밋 추가됨.
         사용자: "왜 GitHub에 PR 안 뜨지?"

Step 1 출력:
  current_branch: feat/user-auth
  PR 이력 조회: gh pr list --head feat/user-auth --state all
    → #42 (MERGED, 2026-05-02)
  ⚠️  Stale 판정 — 닫힌 PR에 push해도 PR은 다시 열리지 않음

자동 복구:
  → git stash push -u (uncommitted 보존)
  → git checkout -b feat/user-auth-followup origin/main
  → git stash pop
  → git cherry-pick <orphan commits>

품질 검사:
- code-reviewer 실행 → 91/100 ✅

결과:
⚠️  Stale branch detected → feat/user-auth-followup 자동 생성
✓ Carried over: 2 uncommitted + 6 orphan commits
✓ Committed: ghi9012
✓ Pushed to origin/feat/user-auth-followup
✓ PR #43 created
🔗 https://github.com/user/repo/pull/43

💡 사용자가 더 이상 "왜 PR 안 뜨지?" 묻지 않게 됨.
```

## Rules

1. **Safety Guard 필수**: Quality Gate 통과 후 커밋/PR 전 반드시 AskUserQuestion으로 사용자 확인
2. **PR 모드 기본**: 별도 옵션 없으면 피처 브랜치 + PR 생성이 기본 동작
3. **민감한 파일 확인**: `.env`, `credentials`, `secrets` 등은 커밋하지 않음
4. **대규모 변경**: 100개 이상 파일 변경 시 확인 요청
5. **충돌 감지**: 푸시 실패 시 pull --rebase 제안
6. **빈 커밋 방지**: 변경사항 없으면 커밋하지 않음
7. **품질 우선**: 기본적으로 품질 검사 수행 (긴급 시 --no-review)
8. **브랜치 재사용 (조건부)**: 피처 브랜치에 있고 **Open PR이 연결된 경우에만** 재사용. PR이 없으면 그대로 사용 가능.
9. **Stale Branch 차단** ⚠️: 현재 피처 브랜치의 PR이 **MERGED 또는 CLOSED** 상태면 그 브랜치는 stale. 절대 재사용 금지 — origin/main에서 새 브랜치 분기 후 변경사항 carry-over. (Branch Strategy → Stale Branch Handling 참조)
10. **기존 PR 확인**: 같은 브랜치에 open PR이 이미 있으면 새 PR 생성하지 않고 커밋만 추가
11. **Multiple Remote 처리** (Direct 모드):
    - remote가 2개 이상이면 push 전 사용자에게 반드시 확인
    - tracking branch가 설정된 remote를 기본값으로 제안

## Skip Quality Gate

긴급 핫픽스 등 품질 검사를 건너뛰어야 할 때:

```bash
/auto-commit --no-review --direct --message "hotfix: 긴급 버그 수정"
```

⚠️ **경고**: 품질 검사 스킵은 권장하지 않습니다. 가능하면 `/review-pr`로 리뷰를 받으세요.
