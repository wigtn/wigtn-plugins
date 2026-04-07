---
description: |
  Implement features based on PRD specifications.

  Trigger keywords:
  - Commands: "/implement", "구현해줘", "만들어줘", "바로 구현"

  - Natural language (바이브 코더 친화):
    - "코드 작성해줘", "개발해줘", "빌드해줘"
    - "이제 만들어", "시작해줘", "진행해줘"
    - "코딩해줘", "개발 시작", "구현 시작"
    - "바로 만들어줘", "빨리 만들어줘"
    - "작업해줘", "개발 진행해줘"

  Best used AFTER /prd and prd-reviewer.
---

# Implement

PRD에 정의된 기능을 구현합니다.

**핵심 원칙**: 설계와 구현을 분리하여, 설계 확인 후 구현을 진행합니다.

## Pipeline Position

```
┌─────────────────────────────────────────────────────────────┐
│  [/prd] → [prd-reviewer] → [/implement] → [/auto-commit]        │
│                        ^^^^^^^^^^^                          │
│                        현재 단계                             │
└─────────────────────────────────────────────────────────────┘
```

| 이전 단계 | 현재 | 다음 단계 |
|----------|------|----------|
| `prd-reviewer` - PRD 분석 완료 | `/implement` - 구현 | `/auto-commit` - 품질 검사 & 커밋 |

## Two-Phase Approach

```
┌─────────────────────────────────────────────────────────────┐
│                    /implement 워크플로우                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐                  ┌─────────────┐           │
│  │   DESIGN    │  ──  확인  ──▶  │   BUILD     │           │
│  │   (설계)    │     (Y/n)       │   (구현)    │           │
│  └─────────────┘                  └─────────────┘           │
│                                                             │
│  • PRD 분석          사용자 승인    • 코드 작성             │
│  • Task Plan 로드    필요!         • Phase별 실행          │
│  • 아키텍처 결정                   • TodoWrite 연동        │
│    (subagent)                     • 테스트/빌드 검증       │
│  • 구현 계획                       • PLAN 파일 업데이트    │
│  • 파일 구조                                               │
│                                                             │
│  ⚡ 1-Click Complete:                                       │
│  • auto_commit: true → 자동 /auto-commit 트리거           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Parallel Mode Detection

> **Agent Teams 병렬 실행**: 복잡도에 따라 자동으로 병렬 모드를 활성화하여 **3~5x 속도 향상**을 달성합니다.

### 모드 결정

```
┌─────────────────────────────────────────────────────────────┐
│  Parallel Mode Detection                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  기본값: sequential (안전)                                   │
│                                                             │
│  자동 활성화 조건 (하나라도 충족 시):                        │
│  ├── 생성/수정 파일 3개 이상                                │
│  ├── BUILD Phase 2개 이상                                   │
│  └── 2개 이상 팀 활성화 (Step 5.5 결과)                     │
│                                                             │
│  수동 제어:                                                 │
│  ├── --parallel    → 병렬 강제                              │
│  └── --sequential  → 순차 강제                              │
│                                                             │
│  모드 표시 UI:                                              │
│  ┌────────────────────────────────────────────┐             │
│  │ Mode: PARALLEL | Agents: 3 active          │             │
│  │ Switch: --sequential to disable            │             │
│  └────────────────────────────────────────────┘             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 병렬 모드 활성화 표시

```
┌────────────────────────────────────────────┐
│  ⚡ Parallel Mode: ACTIVE                  │
│  Active Agents: 3                          │
│  Strategy: DESIGN parallel + BUILD team     │
│  Disable: /implement --sequential          │
└────────────────────────────────────────────┘
```

---

## Task Plan Integration

### Task Plan 파일 검색

`/prd` 명령으로 생성된 Task Plan 파일을 자동으로 검색합니다:

**검색 경로:**
```
docs/todo_plan/PLAN_{feature-name}.md
docs/todo_plan/PLAN_*.md
```

**Task Plan 발견 시:**
```
┌─────────────────────────────────────────────────────────────┐
│  📋 Task Plan 발견                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  파일: docs/todo_plan/PLAN_user-authentication.md           │
│  상태: pending                                              │
│                                                             │
│  📊 Execution Config:                                       │
│  • auto_commit: true                                        │
│  • quality_gate: true                                       │
│                                                             │
│  📁 Phases (4개):                                           │
│  • Phase 1: 환경 설정 (3 tasks)                             │
│  • Phase 2: 핵심 기능 구현 (5 tasks)                        │
│  • Phase 3: 테스트 & 검증 (3 tasks)                         │
│  • Phase 4: 마무리 (2 tasks)                                │
│                                                             │
│  → Task Plan 기반으로 Phase별 실행을 진행합니다.            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Task Plan 없을 경우:**
- 기존 방식대로 PRD 기반 구현 계획 수립
- 구현 완료 후 Task Plan 생성 제안

## Usage

```bash
/implement 사용자 인증
/implement 플러그인 등록
/implement FR-006              # PRD 기능 ID로 직접 지정
/implement --parallel 사용자 인증   # 병렬 모드 강제 활성화
/implement --sequential 사용자 인증 # 순차 모드 강제
/implement --full-stack 사용자 인증 # 모든 팀 강제 활성화 (deprecated)
```

## Parameters

- `feature-name or FR-ID`: 기능명 또는 기능 ID (required)
- `--parallel`: 병렬 모드 강제 활성화
- `--sequential`: 순차 모드 강제 (기존 방식)
- `--full-stack`: (deprecated) 모든 팀 강제 활성화로 매핑

---

## DESIGN Phase (설계 단계)

### Parallel DESIGN (병렬 모드 시)

> 병렬 모드에서는 Steps 1-4를 3개 에이전트로 동시 실행합니다.

```
┌─────────────────────────────────────────────────────────────┐
│  Parallel DESIGN Phase (3x speedup)                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐         │
│  │ Agent A  │  │   Agent B    │  │   Agent C     │         │
│  │ PRD 검색 │  │ Architecture │  │ 프로젝트 상태 │         │
│  │ + QG확인 │  │  Decision    │  │ + Gap Analysis│         │
│  │(Step 0+1)│  │  (Step 2)    │  │  (Step 3+4)   │         │
│  └────┬─────┘  └──────┬───────┘  └──────┬────────┘         │
│       │                │                 │                  │
│       └────────────────┼─────────────────┘                  │
│                        ▼                                    │
│              ┌───────────────────┐                          │
│              │  Result Merge     │                          │
│              │  → Step 5: 구현   │                          │
│              │    계획 수립      │                          │
│              └───────────────────┘                          │
│                                                             │
│  Quality Gate BLOCKED 시 → 즉시 중단 (다른 에이전트 취소)  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**에이전트별 역할:**

| Agent | 담당 Steps | 역할 |
|-------|-----------|------|
| A | Step 0 + 1 | PRD 검색, 품질 게이트 확인 |
| B | Step 2 | 아키텍처 결정 (architecture-decision 위임) |
| C | Step 3 + 4 | 프로젝트 상태 분석, Gap Analysis |

**결과 병합 → Step 5:**
- Agent A: PRD 내용 + QG 상태
- Agent B: 아키텍처 결정 + 폴더 구조
- Agent C: 기존 코드 상태 + Gap 목록
- → 통합하여 구현 계획 수립

**Quality Gate BLOCKED 처리:**
- Agent A가 BLOCKED 판정 시 즉시 Agent B, C 중단
- 사용자에게 Critical 이슈 목록 표시
- 수정 후 재시도 안내

순차 모드에서는 아래 Step 0~6을 순서대로 실행합니다.

---

### Step 0: PRD 품질 검증 (Quality Gate)

**구현 시작 전 PRD 품질 상태를 확인합니다.**

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 PRD 품질 게이트 확인 중...                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PRD: docs/prd/PRD_user-authentication.md                   │
│  검증일: 2025-01-16                                         │
│                                                             │
│  📊 품질 상태:                                              │
│  • Critical: 0건 ✅                                         │
│  • Major: 2건 ⚠️                                            │
│  • Minor: 4건                                               │
│                                                             │
│  → 품질 게이트 통과! 구현을 진행합니다.                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**품질 게이트 판단 기준:**

| Critical 이슈 | 상태 | 액션 |
|--------------|------|------|
| **0개** | ✅ PASS | Step 1로 진행 |
| **1개 이상** | ❌ BLOCKED | 구현 중단, 수정 가이드 제공 |

**Critical 이슈가 있는 경우 (BLOCKED):**
```
❌ 품질 게이트 실패: Critical 이슈 발견

┌─────────────────────────────────────────────────────────────┐
│  🚫 구현을 진행할 수 없습니다                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PRD에 Critical 이슈가 1건 있습니다:                         │
│                                                             │
│  🔴 C-1. Rate Limiting 미정의                               │
│     위치: Section 5.1 - API Endpoints                       │
│     영향: Brute force 공격에 취약                           │
│                                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                             │
│  다음 중 하나를 선택해주세요:                                 │
│                                                             │
│  1. PRD 수정 후 다시 시도                                    │
│     → PRD 파일을 수정하고 "/implement" 다시 실행            │
│                                                             │
│  2. 강제 진행 (권장하지 않음)                                │
│     → "Critical 무시하고 진행" 입력                         │
│     → ⚠️ 보안 취약점 또는 구현 실패 위험                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**검증 데이터 소스:**
- `/prd` 실행 시 자동 저장된 prd-reviewer 분석 결과
- PRD 파일의 메타데이터 (검증 상태, 검증일)
- 수동 prd-reviewer 실행 결과

### Step 1: PRD 검색

인자로 전달된 기능명 또는 기능 ID로 PRD 검색:

**검색 경로 (자동 탐지):**
```
prd/
docs/prd/
requirements/
specs/
*.prd.md
*-requirements.md
*-spec.md
```

**검색 패턴:**
- 기능명이 포함된 PRD 파일
- FR-XXX 형식의 기능 ID
- 관련 키워드가 포함된 섹션

**PRD를 찾지 못한 경우:**
```
❌ PRD 문서를 찾을 수 없습니다.

다음 중 하나를 선택해주세요:
1. `/prd [기능명]`으로 PRD 먼저 작성
2. PRD 파일 경로 직접 지정
3. PRD 없이 바로 구현 (권장하지 않음)
```

### Step 2: 아키텍처 결정 (Subagent)

PRD 분석을 바탕으로 최적의 아키텍처를 결정합니다.

**`architecture-decision` agent 호출:**

```yaml
Input:
  prd_path: "docs/prd/user-authentication.md"
  project_path: "./"
  existing_stack: ["typescript", "prisma"]

Output:
  architecture:
    type: "modular-monolith"  # monolithic | modular-monolith | msa
    confidence: 85
  recommendations:
    tech_stack: ["NestJS", "Prisma", "PostgreSQL"]
    folder_structure: "src/modules/..."
    key_patterns: ["Repository pattern", "Event-driven"]
  warnings: ["향후 MSA 전환 고려"]
```

**아키텍처 결정 기준:**

| 평가 항목 | 모놀리식 | 모듈러 모놀리식 | MSA |
|----------|---------|---------------|-----|
| 도메인 수 | 1-2개 | 3-4개 | 5개+ |
| 팀 규모 | 1-3명 | 3-10명 | 10명+ |
| 프로젝트 단계 | MVP | 성장기 | 엔터프라이즈 |
| 독립 배포 필요 | X | △ | O |

**결정 결과 표시:**

```
┌─────────────────────────────────────────────────────────────┐
│  🏗️ 아키텍처 결정                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  추천 아키텍처: Modular Monolith (신뢰도: 85%)              │
│                                                             │
│  📊 분석 결과:                                              │
│  • 식별된 도메인: 인증, 사용자, 상품, 주문 (4개)            │
│  • 도메인 복잡도: Medium                                    │
│  • 확장성 요구: Medium                                      │
│                                                             │
│  📁 추천 구조:                                              │
│  src/modules/{auth,users,products,orders}/                  │
│                                                             │
│  ⚠️ 주의사항:                                               │
│  • 4개 도메인으로 향후 MSA 전환 고려                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Step 3: 프로젝트 상태 분석

**프로젝트 구조 자동 탐지:**

| 프로젝트 유형 | 소스 경로 | API 경로 | 컴포넌트 경로 |
|--------------|---------|---------|-------------|
| 일반 | `src/`, `lib/` | `src/api/` | `src/components/` |
| Next.js | `app/`, `src/app/` | `app/api/` | `components/` |
| Monorepo | `apps/*/src/` | `apps/api/` | `apps/web/src/` |
| NestJS | `src/` | `src/modules/` | - |
| Python | `src/`, `app/` | `app/api/` | - |

**확인 사항:**
- 기존 구현 여부
- 관련 파일 위치
- 사용 중인 패턴/컨벤션

### Step 4: Gap Analysis

| Status | Description | Action |
|--------|-------------|--------|
| ✅ Complete | 이미 구현됨 | 스킵 또는 업데이트 확인 |
| ⚠️ Partial | 부분 구현 | 남은 부분만 구현 |
| ❌ Not done | 미구현 | 전체 구현 |

### Step 5: 구현 계획 수립

PRD와 프로젝트 분석을 바탕으로 구현 계획을 수립합니다:

```markdown
## 구현 계획

### 생성할 파일
| 경로 | 설명 | 타입 |
|------|------|------|
| src/api/auth/login.ts | 로그인 API | Backend |
| src/api/auth/register.ts | 회원가입 API | Backend |
| src/services/AuthService.ts | 인증 서비스 | Backend |
| src/components/LoginForm.tsx | 로그인 폼 | Frontend |
| tests/auth.test.ts | 인증 테스트 | Test |

### 수정할 파일
| 경로 | 변경 내용 |
|------|----------|
| prisma/schema.prisma | User 모델 추가 |
| src/app/layout.tsx | AuthProvider 추가 |

### 구현 순서
1. Database/Schema 변경
2. Backend API 구현
3. Frontend 컴포넌트 구현
4. 테스트 작성
```

### Step 5.5: 팀 할당 (Team Allocation)

구현 계획의 파일 목록과 PRD를 분석하여 활성화할 팀을 결정합니다.

**팀 활성화 규칙:**

| 팀 | 활성화 조건 | Agent | Plugin |
|-----|-----------|-------|--------|
| Backend | api/, services/, models/, prisma/ 파일 존재 | backend-architect | wigtn-coding |
| Frontend | components/, pages/, app/, styles/ 파일 존재 | frontend-developer | wigtn-coding |
| AI Server | ai/, llm/, stt/, ml/ 파일 또는 PRD에 AI 키워드 | ai-agent | wigtn-coding |
| Ops | Dockerfile, .github/, k8s/ 파일 존재 | (없음) | wigtn-coding |

**팀 할당 표시:**

```
┌─────────────────────────────────────────────────────────────┐
│  🏗️ 팀 할당 결과                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ Backend  (5 tasks) → backend-architect                  │
│  ✅ Frontend (3 tasks) → frontend-developer                 │
│  ⬚ AI Server (0 tasks) → 비활성                            │
│  ✅ Ops      (2 tasks) → general-purpose                    │
│                                                             │
│  Active Teams: 3/4                                          │
│  Mode: TEAM PARALLEL                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

팀 할당 결과를 사용자 확인(Step 6)에 포함합니다.

### Step 5.6: 디자인 결정 (Frontend 팀 활성 시 자동)

**Frontend 팀이 활성화된 경우, BUILD 전에 디자인 방향을 결정합니다.**

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend 팀 감지 → 디자인 결정 필요                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  판단 로직:                                                 │
│                                                             │
│  1. PRD에 디자인 스타일 명시됨?                              │
│     → YES: 해당 스타일로 진행 (스킵)                        │
│     → NO: 2로                                               │
│                                                             │
│  2. PRD에 브랜드 참조 ("~처럼", "~느낌")?                   │
│     → YES: 가장 가까운 스타일 패러다임 매핑 (스킵)          │
│     → NO: 3으로                                             │
│                                                             │
│  3. 기존 프로젝트에 디자인 시스템 존재?                      │
│     → YES: 기존 시스템 따름 (스킵)                          │
│     → NO: 4로                                               │
│                                                             │
│  4. design-discovery agent 호출                              │
│     → 사용자에게 디자인 선택 질문                           │
│     → 스타일 결정 후 design-system-reference skill 로드     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**디자인 결정 흐름:**

| 조건 | 액션 | 소요 |
|------|------|------|
| PRD에 `"스타일: Glassmorphism"` 등 명시 | design-system-reference에서 해당 스타일 로드 → BUILD | 즉시 |
| PRD에 `"Stripe처럼"`, `"Linear 느낌"` 등 브랜드 참조 | 가장 가까운 스타일 패러다임 매핑 → BUILD | 즉시 |
| 기존 프로젝트에 Tailwind config, theme, 디자인 토큰 존재 | 기존 시스템 존속, 스킵 | 즉시 |
| 디자인 정보 없음 (새 프로젝트) | `design-discovery` agent 호출 → 사용자 선택 → 스타일 결정 | 질문 3-4개 |

**design-discovery agent 호출:**
```yaml
trigger: Frontend 팀 활성 AND 디자인 스타일 미정
agent: design-discovery
input:
  platform: "web" | "mobile"   # PRD에서 자동 판별
  context: PRD 요약 (타겟 유저, 프로젝트 유형)
output:
  style: "aurora-gradient"     # 선택된 스타일
  theme: "dark"                # 라이트/다크
  animation_level: "moderate"  # none/minimal/moderate/rich
  density: "balanced"          # compact/balanced/spacious
```

**결정된 디자인을 BUILD에 전달:**
```yaml
frontend_design:
  style: "aurora-gradient"
  style_guide_path: "styles/aurora-gradient.md"
  common_modules:
    - "common/colors.md"
    - "common/animations.md"
    - "common/spacing.md"
  theme: "dark"
  animation_level: "moderate"
```

> **IMPORTANT**: `frontend-developer` agent는 BUILD 시작 전에 반드시
> 결정된 스타일 가이드 파일과 관련 common 모듈을 읽어야 합니다.
> 스타일 가이드 없이 Frontend 코드를 작성하면 안 됩니다.

**디자인 결정 표시:**

```
┌─────────────────────────────────────────────────────────────┐
│  🎨 디자인 결정                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  스타일: Aurora / Gradient Mesh                              │
│  테마: Dark                                                  │
│  애니메이션: Moderate                                        │
│  밀도: Balanced                                              │
│                                                             │
│  → design-system-reference 로드 완료                        │
│  → frontend-developer agent에 전달 예정                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Step 6: 사용자 확인 (CHECKPOINT)

**설계 완료 후 반드시 사용자 확인을 받습니다:**

```
┌─────────────────────────────────────────────────────────────┐
│  📋 구현 계획이 준비되었습니다                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  기능: 사용자 인증                                          │
│  PRD: docs/prd/user-authentication.md                       │
│                                                             │
│  📁 생성할 파일 (5개)                                       │
│  • src/api/auth/login.ts                                    │
│  • src/api/auth/register.ts                                 │
│  • src/services/AuthService.ts                              │
│  • src/components/LoginForm.tsx                             │
│  • tests/auth.test.ts                                       │
│                                                             │
│  ✏️ 수정할 파일 (2개)                                       │
│  • prisma/schema.prisma                                     │
│  • src/app/layout.tsx                                       │
│                                                             │
│  🏗️ 팀 할당 (3개 팀 활성)                                   │
│  • Backend: 5 tasks → backend-architect                     │
│  • Frontend: 3 tasks → frontend-developer                   │
│  • Ops: 2 tasks → general-purpose                           │
│                                                             │
│  🎨 디자인 (Frontend 활성 시)                                │
│  • 스타일: Aurora / Gradient Mesh                            │
│  • 테마: Dark | 애니메이션: Moderate | 밀도: Balanced        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  이 계획대로 구현을 진행할까요?                              │
│                                                             │
│  → "진행" : 바로 구현 시작                                  │
│  → "상세 검토" : prd-reviewer로 파일별 분석 후 진행            │
│  → "수정 필요" : 계획 수정                                  │
│  → "취소" : 구현 취소                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**AskUserQuestion 사용:**
```yaml
question: "이 계획대로 구현을 진행할까요?"
options:
  - label: "진행 (Recommended)"
    description: "바로 구현 시작"
  - label: "상세 검토"
    description: "prd-reviewer 에이전트로 파일별 상세 분석 후 진행"
  - label: "수정 필요"
    description: "계획 수정 후 재확인"
  - label: "취소"
    description: "구현 취소"
```

### "상세 검토" 선택 시 (Optional Deep Dive)

사용자가 "상세 검토"를 선택하면 `prd-reviewer` 에이전트을 호출하여 파일별 상세 분석을 진행합니다:

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 상세 검토 진행 중...                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [1/5] src/api/auth/login.ts                                │
│  ├── 예상 구현: POST /api/auth/login                        │
│  ├── 의존성: AuthService, JWT                               │
│  └── ⚠️ 질문: Rate limiting 필요 여부?                      │
│                                                             │
│  [2/5] src/api/auth/register.ts                             │
│  ├── 예상 구현: POST /api/auth/register                     │
│  ├── 의존성: AuthService, Email validation                  │
│  └── ⚠️ 질문: 이메일 인증 프로세스 포함?                    │
│                                                             │
│  [3/5] src/services/AuthService.ts                          │
│  ├── 예상 구현: 인증 로직, 토큰 관리                         │
│  └── ✅ 이슈 없음                                           │
│                                                             │
│  ...                                                        │
└─────────────────────────────────────────────────────────────┘
```

**prd-reviewer 에이전트 호출:**
```yaml
input:
  context: "implementation_review"
  files:
    - path: "src/api/auth/login.ts"
      purpose: "로그인 API"
      type: "Backend"
    - path: "src/api/auth/register.ts"
      purpose: "회원가입 API"
      type: "Backend"
  prd_path: "docs/prd/user-authentication.md"

output:
  - file: "src/api/auth/login.ts"
    questions:
      - "Rate limiting 적용 필요?"
      - "로그인 실패 횟수 제한?"
    risks: []
  - file: "src/api/auth/register.ts"
    questions:
      - "이메일 인증 필수?"
    risks:
      - "이메일 중복 체크 로직 필요"
```

**상세 검토 완료 후:**
- 식별된 질문에 대한 답변 수집
- 답변 기반으로 구현 계획 보완
- 다시 사용자 확인 → BUILD Phase 진행

---

## BUILD Phase (구현 단계)

사용자 확인 후 실제 코드 작성을 진행합니다.

### Team BUILD (팀 기반 병렬)

> 병렬 모드에서는 `team-build-coordinator`를 호출하여 팀별 병렬 빌드를 수행합니다.
> DESIGN Phase의 Step 5.5에서 결정된 팀 할당을 기반으로 실행합니다.

```
┌─────────────────────────────────────────────────────────────┐
│  Team BUILD Phase (2-3x speedup)                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  team-build-coordinator 호출                                │
│       │                                                     │
│       ▼                                                     │
│  Phase 0: Setup                                             │
│  ├── SHARED_CONTEXT_{feature}.md 생성                       │
│  ├── MEMORY.md 읽기 (프로젝트 컨벤션 파악)                  │
│  └── TaskCreate 등록 (팀별 Task)                             │
│       │                                                     │
│       ▼                                                     │
│  Phase 1: Foundation (조건부)                               │
│  └── Backend 스키마/타입 선행 (다른 팀 의존 시)             │
│       │                                                     │
│       ▼                                                     │
│  Phase 2: 병렬 팀 실행                                      │
│  ├── Backend:  backend-architect subagent                   │
│  ├── Frontend: frontend-developer subagent                  │
│  ├── AI Server: ai-agent subagent (해당 시)                 │
│  └── Ops: general-purpose subagent (해당 시)                │
│       │                                                     │
│       ▼                                                     │
│  Phase 3: 통합 검증                                         │
│  ├── API 계약 준수 확인                                     │
│  ├── 타입 일관성 확인                                       │
│  └── 파일 충돌 검사                                         │
│       │                                                     │
│       ▼                                                     │
│  Phase 4: 빌드/테스트 검증                                  │
│  ├── typecheck / test / build                               │
│  └── Auto Memory 업데이트                                    │
│                                                             │
│  조율: SHARED_CONTEXT + TaskCreate + Auto Memory            │
│  오류 처리: 실패 팀만 순차 재시도, 독립 팀은 계속          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**팀 빌드 진행 상황 표시:**

```
⚡ Team BUILD 진행 중... (Phase 2/4)

[Team: BACKEND] ⏳ 진행 중 (3/5 tasks)
  ├── [BE-001] ✅ prisma/schema.prisma (2.1s)
  ├── [BE-002] ✅ src/api/auth/login.ts (3.4s)
  ├── [BE-003] ⏳ src/api/auth/register.ts...
  ├── [BE-004] ⏸️ src/services/AuthService.ts
  └── [BE-005] ⏸️ src/middleware/auth.ts

[Team: FRONTEND] ⏳ 진행 중 (1/3 tasks)
  ├── [FE-001] ✅ src/components/LoginForm.tsx (4.2s)
  ├── [FE-002] ⏳ src/components/RegisterForm.tsx...
  └── [FE-003] ⏸️ src/app/auth/page.tsx

[Team: OPS] ✅ 완료 (2/2 tasks, 2.3s)
  ├── [OP-001] ✅ Dockerfile (1.5s)
  └── [OP-002] ✅ .github/workflows/ci.yml (2.3s)

📊 전체: 6/10 tasks (60%) | Active Teams: 2/3
🔗 Shared Context: docs/shared/SHARED_CONTEXT_user-auth.md
```

**팀 할당 모드:**

| 플래그 | 동작 |
|--------|------|
| `--parallel` | 팀 기반 병렬 강제 (기존과 동일 UX) |
| `--sequential` | 팀 순차 실행 (Backend → Frontend → AI → Ops) |
| `--full-stack` | deprecated 알림 + 모든 팀 강제 활성화로 매핑 |

순차 모드에서는 아래 Step 1~5를 순서대로 실행합니다.

---

### Step 1: Phase별 실행 (Task Plan 기반)

**Task Plan이 있는 경우**, Phase 단위로 순차 실행합니다:

```
┌─────────────────────────────────────────────────────────────┐
│  🚀 Phase 1: 환경 설정 시작                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  TodoWrite 업데이트:                                        │
│  ├── [in_progress] 프로젝트 구조 생성                       │
│  ├── [pending] 의존성 설치                                  │
│  └── [pending] 설정 파일 작성                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Phase 실행 프로세스:**

```
For each Phase in Task Plan:
  1. TodoWrite에 Phase tasks 등록 (status: pending)
  2. 첫 번째 task를 in_progress로 변경
  3. Task 실행
  4. Task 완료 시:
     - TodoWrite: completed로 변경
     - PLAN 파일: [ ] → [x] 체크
  5. 다음 task로 이동
  6. Phase 완료 시:
     - PLAN 파일: Phase status 업데이트
     - Progress 섹션 업데이트
  7. 다음 Phase로 이동
```

**PLAN 파일 실시간 업데이트:**

```markdown
### Phase 1: 환경 설정
- [x] 프로젝트 구조 생성          ← 완료
- [x] 의존성 설치                 ← 완료
- [ ] 설정 파일 작성              ← 진행 중

## Progress
| Metric | Value |
|--------|-------|
| Total Tasks | 3/13 |
| Current Phase | Phase 1: 환경 설정 |
| Status | in_progress |

## Execution Log
| Timestamp | Phase | Task | Status |
|-----------|-------|------|--------|
| 2025-01-16 10:30 | Phase 1 | 프로젝트 구조 생성 | ✅ completed |
| 2025-01-16 10:32 | Phase 1 | 의존성 설치 | ✅ completed |
| 2025-01-16 10:35 | Phase 1 | 설정 파일 작성 | ⏳ in_progress |
```

### Step 2: 코드 작성 (Task Plan 없는 경우)

**기존 방식 - 구현 순서:**
1. **Database/Schema** (필요 시)
   - 스키마 변경/추가
   - 마이그레이션 생성

2. **Backend/API**
   - 엔드포인트 구현
   - 서비스 로직
   - DTO/Validation

3. **Frontend/UI**
   - 페이지/컴포넌트
   - 상태 관리
   - API 연동

4. **Tests** (해당 시)
   - 유닛 테스트
   - 통합 테스트

### Step 3: 구현 진행 상황 표시

```
⏳ 구현 진행 중... (Phase 2/4)

[Phase 2: 핵심 기능 구현]
[1/5] ✅ prisma/schema.prisma - User 모델 추가 완료
[2/5] ✅ src/api/auth/login.ts - 로그인 API 완료
[3/5] ⏳ src/api/auth/register.ts - 회원가입 API 작성 중...
[4/5] ⏸️ src/services/AuthService.ts - 대기 중
[5/5] ⏸️ src/components/LoginForm.tsx - 대기 중

📊 전체 진행률: 6/13 tasks (46%)
```

### Step 4: 검증

```bash
# TypeScript 타입 체크 (해당 시)
npm run typecheck

# 테스트 실행 (해당 시)
npm test

# 빌드 확인
npm run build
```

### Step 5: 구현 완료 및 자동 커밋 트리거

**모든 Phase 완료 시:**

```
✅ 모든 Phase가 완료되었습니다!

┌─────────────────────────────────────────────────────────────┐
│  📋 구현 결과                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ Phase 1: 환경 설정 (3/3 tasks)                          │
│  ✅ Phase 2: 핵심 기능 구현 (5/5 tasks)                     │
│  ✅ Phase 3: 테스트 & 검증 (3/3 tasks)                      │
│  ✅ Phase 4: 마무리 (2/2 tasks)                             │
│                                                             │
│  📊 Total: 13/13 tasks completed                            │
│                                                             │
│  검증 결과:                                                  │
│  ✅ TypeScript 타입 체크 통과                                │
│  ✅ 테스트 통과 (4/4)                                        │
│  ✅ 빌드 성공                                                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ⚡ 1-Click Complete                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Task Plan 설정: auto_commit = true                         │
│                                                             │
│  → /auto-commit 자동 실행 중...                             │
│  → 품질 검사 후 자동 커밋됩니다.                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**auto_commit 트리거 조건:**

| 조건 | 액션 |
|------|------|
| `auto_commit: true` + 모든 Phase 완료 | `/auto-commit` 자동 실행 |
| `auto_commit: false` | 수동 커밋 안내 |
| `commit_per_phase: true` | Phase 완료 시마다 중간 커밋 |

**PLAN 파일 최종 상태:**

```markdown
## Progress
| Metric | Value |
|--------|-------|
| Total Tasks | 13/13 |
| Current Phase | - |
| Status | ✅ completed |

## Execution Log
| Timestamp | Phase | Task | Status |
|-----------|-------|------|--------|
| ... | ... | ... | ... |
| 2025-01-16 11:45 | - | /auto-commit | ✅ triggered |
| 2025-01-16 11:46 | - | Quality Gate | ✅ passed (92/100) |
| 2025-01-16 11:46 | - | Git Commit | ✅ abc1234 |
```

---

## Code Pattern Discovery

### API 엔드포인트 발견
```bash
# 기존 API 패턴 찾기
Glob: "**/api/**/*.{ts,js,py}"
Grep: "@router|@Controller|router\."
```

### 컴포넌트 패턴 발견
```bash
# 기존 컴포넌트 패턴 찾기
Glob: "**/components/**/*.{tsx,jsx}"
Grep: "export (default )?function|export const"
```

### 데이터베이스 스키마 발견
```bash
# Prisma
Glob: "**/prisma/schema.prisma"

# SQLAlchemy
Glob: "**/models/*.py"

# TypeORM
Glob: "**/entities/*.ts"
```

---

## Validation Checklist

구현 완료 후 확인:
- [ ] 타입 에러 없음
- [ ] 빌드 성공
- [ ] 기존 테스트 통과
- [ ] 기존 기능에 영향 없음
- [ ] PRD 요구사항 충족

---

## Integration Points

### 호출하는 에이전트

| 에이전트 | 역할 | 호출 조건 |
|----------|------|----------|
| `architecture-decision` | 아키텍처 결정 | DESIGN Phase (항상) |
| `team-build-coordinator` | 팀 기반 병렬 빌드 조율 | BUILD Phase (병렬 모드) |
| `parallel-digging-coordinator` | 병렬 prd-reviewer (상세 검토 시) | DESIGN 상세 검토 선택 시 |
| `backend-architect` | Backend 코드 생성 | Team BUILD (Backend 팀) |
| `frontend-developer` | Frontend 코드 생성 | Team BUILD (Frontend 팀) |
| `ai-agent` | AI/ML 코드 생성 | Team BUILD (AI Server 팀) |

### 이전 단계에서 받는 입력

```
/prd + prd-reviewer 결과물:
- 검증된 PRD 문서
- 기능 요구사항 (FR-XXX)
- 비기능 요구사항 (NFR-XXX)
- API 명세 (상세)
- 식별된 리스크 및 대응 방안
```

### 다음 단계로 전달하는 출력

```
/auto-commit에 전달:
- 새로 생성된 파일 목록
- 수정된 파일 목록
- 구현된 기능 목록
- 검증 결과 (타입체크, 테스트, 빌드)
- 실행 모드 (parallel/sequential) 및 소요 시간
```

---

## Auto-Trigger

구현 완료 시 자동으로 auto-commit 사용을 제안:

```
💡 구현이 완료되었습니다.

   다음 단계:
   → `/auto-commit`으로 품질 검사 후 커밋
   → 코드 리뷰를 통해 품질 게이트 통과 확인

   또는 추가 작업:
   → 다른 기능 구현: `/implement [기능명]`
   → 테스트 추가 작성
```

---

## Rules

1. **설계-구현 분리**
   - 설계 완료 후 반드시 사용자 확인
   - 확인 없이 구현 진행 금지

2. **기존 코드 수정 시**
   - 먼저 Read로 현재 구현 확인
   - 기존 패턴/컨벤션 준수
   - 불필요한 변경 최소화

3. **새 파일 생성 시**
   - 기존 파일 구조 참고
   - 적절한 경로에 생성
   - 네이밍 컨벤션 준수

4. **에러 발생 시**
   - 즉시 수정
   - 롤백이 필요하면 사용자에게 알림

---

## Error Recovery Protocol (에러 복구 프로토콜)

구현 중 발생할 수 있는 오류 상황과 복구 방법을 정의합니다.

### 1. 아키텍처 결정 실패

**상황**: `architecture-decision` 에이전트가 응답하지 않거나 오류 발생

```
⚠️ 아키텍처 결정 에이전트 응답 실패

복구 옵션:
┌─────────────────────────────────────────────────────────────┐
│  1. 기본 아키텍처로 진행                                     │
│     → Modular Monolith (가장 안전한 선택)                   │
│                                                             │
│  2. 수동 선택                                               │
│     → 아키텍처 유형을 직접 지정                             │
│     → "Monolithic", "Modular Monolith", "MSA" 중 선택       │
│                                                             │
│  3. 재시도                                                  │
│     → 에이전트 호출 재시도                                  │
└─────────────────────────────────────────────────────────────┘
```

**복구 절차**:
1. 에이전트 상태 확인 (3회 재시도)
2. 실패 시 기본값 제안 (Modular Monolith)
3. 사용자에게 선택권 제공

### 2. Phase 중간 실패

**상황**: 특정 Phase 실행 중 오류 발생 (빌드 실패, 테스트 실패 등)

```
❌ Phase 2 실행 중 오류 발생

┌─────────────────────────────────────────────────────────────┐
│  📍 실패 지점                                                │
├─────────────────────────────────────────────────────────────┤
│  Phase: Phase 2 - 핵심 기능 구현                            │
│  Task: src/api/auth/register.ts 작성                        │
│  진행률: 6/13 tasks (46%)                                   │
│                                                             │
│  오류 내용:                                                  │
│  TypeScript Error: Cannot find module 'bcrypt'              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  💡 자동 복구 시도                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [1] 의존성 설치 시도: npm install bcrypt @types/bcrypt     │
│  [2] 재컴파일: npm run typecheck                            │
│                                                             │
│  → 자동 복구 성공! 계속 진행합니다.                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**자동 복구 가능한 오류:**

| 오류 유형 | 자동 복구 방법 |
|----------|---------------|
| 의존성 누락 | `npm install` / `pip install` 자동 실행 |
| 타입 오류 (단순) | 타입 수정 후 재컴파일 |
| 린트 오류 | `code-formatter` 에이전트 호출 |
| 포트 충돌 | 대체 포트 자동 할당 |

**자동 복구 불가능한 오류:**
```
❌ 자동 복구 실패

┌─────────────────────────────────────────────────────────────┐
│  수동 개입이 필요합니다                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  오류: Database connection refused                          │
│  원인: PostgreSQL 서버가 실행되지 않음                       │
│                                                             │
│  해결 방법:                                                  │
│  1. PostgreSQL 서버 시작: brew services start postgresql    │
│  2. 연결 정보 확인: .env 파일의 DATABASE_URL                 │
│  3. 해결 후 재개: "계속 진행" 또는 "/implement --resume"    │
│                                                             │
│  💾 진행 상태가 저장되었습니다:                              │
│  → PLAN 파일: 현재 Phase/Task 기록됨                        │
│  → 재개 시 실패 지점부터 계속 진행                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3. PLAN 파일 동기화 오류

**상황**: PLAN 파일과 실제 구현 상태가 불일치

```
⚠️ PLAN 파일 동기화 불일치 감지

┌─────────────────────────────────────────────────────────────┐
│  PLAN 파일 상태 vs 실제 상태                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PLAN 파일: 6/13 tasks 완료                                 │
│  실제 파일: src/api/auth/login.ts 이미 존재 ✅              │
│             src/api/auth/register.ts 이미 존재 ✅           │
│                                                             │
│  → 2개 task가 이미 완료된 것으로 보입니다.                   │
│                                                             │
│  옵션:                                                      │
│  1. PLAN 파일 자동 업데이트 (권장)                          │
│  2. 기존 파일 덮어쓰기                                      │
│  3. 수동 확인 후 진행                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**동기화 복구 절차**:
1. 파일 시스템 스캔으로 실제 상태 확인
2. PLAN 파일과 비교
3. 불일치 항목 표시 및 자동 업데이트 제안

### 4. 빌드/테스트 실패

**상황**: 구현 완료 후 검증 단계에서 실패

```
❌ 검증 실패

┌─────────────────────────────────────────────────────────────┐
│  📊 검증 결과                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  TypeScript: ❌ 3 errors                                    │
│  Tests: ❌ 2/4 passed                                       │
│  Build: ⏸️ (이전 단계 실패로 스킵)                          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  🔧 자동 수정 시도                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [TypeScript 오류]                                          │
│  ├── Error 1: 자동 수정 ✅                                  │
│  ├── Error 2: 자동 수정 ✅                                  │
│  └── Error 3: 수동 수정 필요 ❌                             │
│                                                             │
│  [테스트 실패]                                              │
│  ├── auth.test.ts:45 - Expected 200, got 401                │
│  └── auth.test.ts:78 - Timeout exceeded                     │
│                                                             │
│  💡 권장 조치:                                              │
│  1. Error 3 수동 수정: src/services/AuthService.ts:123      │
│  2. 테스트 케이스 검토: tests/auth.test.ts:45, 78           │
│  3. 수정 후 "검증 재실행" 또는 "/auto-commit"              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**검증 실패 복구 흐름:**
```
검증 실패
    ↓
자동 수정 가능? ──Yes──→ 자동 수정 → 재검증
    │
    No
    ↓
수동 수정 가이드 제공
    ↓
사용자 수정
    ↓
"검증 재실행" 또는 "/auto-commit"
```

### 5. 작업 중단 및 재개

**상황**: 사용자가 작업 중단 또는 세션 종료

```
💾 작업 상태 저장됨

┌─────────────────────────────────────────────────────────────┐
│  진행 상태                                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  기능: user-authentication                                  │
│  Phase: 2/4 - 핵심 기능 구현                                │
│  Task: 5/13 완료                                            │
│  마지막 저장: 2025-01-16 10:45                              │
│                                                             │
│  저장된 파일:                                               │
│  • docs/todo_plan/PLAN_user-authentication.md               │
│  • .claude/session/implement_user-authentication.json       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  재개 방법                                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  다음 세션에서:                                             │
│  → "/implement user-authentication" 실행                    │
│  → 자동으로 마지막 지점부터 재개                            │
│                                                             │
│  처음부터 다시 시작:                                        │
│  → "/implement user-authentication --restart"               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**재개 시 확인 사항:**
1. PLAN 파일에서 마지막 완료 task 확인
2. 실제 파일 상태와 비교
3. 불일치 있으면 동기화 후 재개

### 6. 롤백 프로토콜

**상황**: 구현 결과가 기존 기능을 망가뜨림

```
🔙 롤백이 필요합니다

┌─────────────────────────────────────────────────────────────┐
│  문제 감지: 기존 테스트 4개 실패                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  영향받은 테스트:                                           │
│  • tests/user.test.ts - 기존 사용자 API 테스트              │
│  • tests/integration.test.ts - 통합 테스트                  │
│                                                             │
│  원인: AuthService 변경이 UserService에 영향                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  롤백 옵션                                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 부분 롤백 (권장)                                        │
│     → AuthService 변경만 되돌리기                           │
│     → 다른 구현은 유지                                      │
│                                                             │
│  2. Phase 롤백                                              │
│     → Phase 2 전체 되돌리기                                 │
│     → Phase 1 상태로 복원                                   │
│                                                             │
│  3. 전체 롤백                                               │
│     → /implement 시작 전 상태로 복원                        │
│     → git reset --hard HEAD~N                               │
│                                                             │
│  4. 수동 수정                                               │
│     → 영향받은 파일만 직접 수정                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**롤백 실행:**
```bash
# Phase 단위 롤백
git stash -m "implement_phase2_backup"
git checkout HEAD~3 -- src/services/AuthService.ts

# 전체 롤백
git reset --soft HEAD~N
git stash
```

### Recovery Summary

| 오류 유형 | 자동 복구 | 사용자 개입 | 롤백 가능 |
|----------|----------|------------|----------|
| 의존성 누락 | ✅ | - | - |
| 타입 오류 (단순) | ✅ | - | - |
| 타입 오류 (복잡) | - | ✅ | - |
| 테스트 실패 | - | ✅ | ✅ |
| 빌드 실패 | △ | ✅ | ✅ |
| 외부 서비스 오류 | - | ✅ | - |
| PLAN 불일치 | ✅ | - | - |
| 기존 기능 손상 | - | ✅ | ✅ |

---

## Examples

### PRD 기반 구현

```
입력: /implement 사용자 인증

=== DESIGN Phase ===

PRD 확인:
- docs/prd/user-authentication.md 발견
- prd-reviewer 분석 완료 확인 ✅
- Critical 이슈 없음 ✅

구현 계획 수립:
- 생성 파일 5개
- 수정 파일 2개
- 구현 순서 정의

사용자 확인 요청:
"이 계획대로 구현을 진행할까요?"

=== BUILD Phase (사용자 승인 후) ===

구현:
- src/api/auth/login.ts 생성
- src/api/auth/register.ts 생성
- src/services/AuthService.ts 생성
- src/components/LoginForm.tsx 생성
- tests/auth.test.ts 생성

검증:
- TypeScript ✅
- 테스트 ✅
- 빌드 ✅

다음 단계 안내:
→ `/auto-commit`
```

### 자연어 입력 처리

```
입력: "이제 만들어줘"

인식:
- 패턴 매칭: "이제 만들어줘"
- 이전 대화에서 기능 확인: "사용자 인증"

진행:
- /implement 사용자 인증 실행
- DESIGN → 사용자 확인 → BUILD
```

### PRD 없이 구현 시도

```
입력: /implement 알림 기능

PRD 확인:
- ❌ PRD 문서 없음

안내:
⚠️ PRD 없이 구현하면 요구사항 누락 위험이 있습니다.

권장: `/prd 알림 기능`으로 먼저 PRD를 작성하세요.
계속하려면: "PRD 없이 진행"이라고 말씀해주세요.
```
