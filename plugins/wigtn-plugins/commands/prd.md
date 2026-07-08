---
description: |
  Generate structured PRD documents from vague feature requests.

  Trigger keywords:
  - Commands: "/prd", "PRD 작성해줘", "기능 정의서", "요구사항 문서"

  - Natural language (바이브 코더 친화):
    - "~하는거 만들고 싶어", "~하는 기능 필요해"
    - "~할 수 있게 해줘", "~하는 앱 만들어줘"
    - "~하는 서비스 기획해줘", "이런 거 가능해?"
    - "아이디어가 있는데", "기능 추가하고 싶어"
    - "~하는 사이트 만들어줘", "~하는 시스템 구축해줘"
---

# PRD Generation

모호한 기능 요청을 구조화된 PRD 문서로 변환합니다.

## Pipeline Position

파이프라인: `/prd` (현재 단계) → `prd-reviewer` → `/screen-spec` (FE 페이지가 있을 때만 권장) → `/implement` → `/auto-commit`

| 이전 단계 | 현재 | 다음 단계 |
|----------|------|----------|
| 프로젝트 시작 | `/prd` - PRD 문서 생성 | `prd-reviewer` - PRD 분석 & 개선 → (FE 있으면) `/screen-spec` - 화면정의서 |

## Trigger Recognition

### 자연어 패턴 인식

사용자가 다음과 같은 패턴으로 말하면 PRD 생성을 시작합니다:

| 패턴 | 예시 |
|------|------|
| "~하는거 만들고 싶어" | "로그인하는거 만들고 싶어" |
| "~하는 기능 필요해" | "결제하는 기능 필요해" |
| "~할 수 있게 해줘" | "사진 업로드할 수 있게 해줘" |
| "~하는 앱/사이트 만들어줘" | "쇼핑몰 사이트 만들어줘" |
| "아이디어가 있는데" | "아이디어가 있는데 들어볼래?" |
| "이런 거 가능해?" | "실시간 채팅 이런 거 가능해?" |

### 복잡도 판단

사용자 입력을 분석하여 복잡도에 따라 분기한다:

- **간단한 기능** (단일 CRUD, 버튼 추가 등) → "바로 구현할까요, PRD 먼저 작성할까요?" 질문
- **복잡한 기능** (인증, 결제, 다중 도메인 등) → PRD 작성 권장 안내

## Usage

```bash
/prd user-authentication
/prd plugin-marketplace --detail=full
```

## Parameters

- `feature-name`: 기능명 (required)
- `--detail`: 상세 수준 (basic | full, default: full)

## Protocol

### Phase 1: Context Gathering

**0. 문서유형 결정 (먼저)**
   - 요청 맥락에서 문서유형을 판정한다(모호하면 AskUserQuestion): `product-feature` | `internal-backend` | `refactor`.
     - **product-feature**: 최종 사용자용 제품/기능(FE 있음). 전체 섹션 활성.
     - **internal-backend**: 내부·백엔드·API·배치(FE 없음). §5.4 Pages·§5.4.1·§5.5 = N/A, Scale Grade·SLA·API는 활성.
     - **refactor**: 리팩터·마이그레이션·내부 도구(런타임 사용자 없음). Scale Grade·SLA(§4.0~4.4)·§5.4 계열 = N/A, §4.5 Security·§4.6 Quality는 유지.
   - 판정이 모호하면 `product-feature`로 기본 처리한다 — 섹션 누락이 오히려 위험하므로 넓게 잡는다.
   - 결정 유형을 PRD 헤더 `> **Type**:`에 명시한다 (prd-reviewer의 조건부 Critical 판정 입력).

1. **프로젝트 구조 분석**
   - Glob으로 프로젝트 구조 탐색
   - 기존 PRD 파일 검색 (`prd/`, `docs/prd/`, `requirements/`)
   - package.json, requirements.txt 등에서 기술 스택 확인

2. **기존 코드 분석** (해당 시)
   - API 엔드포인트 패턴 (`src/api/`, `app/api/`)
   - 프론트엔드 구조 (`src/app/`, `src/components/`)
   - 데이터베이스 스키마 (`prisma/schema.prisma`, `models/`)

3. **프로젝트 규모 파악**
   - AskUserQuestion으로 Scale Grade 질문 (Section 4.0 참고)
   - 선택된 등급에 따라 NFR 기본값 자동 설정
   - 구체적 DAU/동시접속 수치 추가 질문 (선택)

### Phase 2: PRD Generation

다음 템플릿을 사용하여 PRD를 작성합니다:

```markdown
# [Feature Name] PRD

> **Version**: 1.0
> **Created**: YYYY-MM-DD
> **Status**: Draft
> **Type**: product-feature | internal-backend | refactor  (Phase 1-0에서 결정)

## 1. Overview

### 1.1 Problem Statement
[해결하려는 문제가 무엇인가?]

### 1.2 Goals
- [목표 1]
- [목표 2]

### 1.3 Non-Goals (Out of Scope)
- [명시적으로 하지 않을 것]

### 1.4 Scope
| 포함 | 제외 |
|------|------|
| ... | ... |

## 2. User Stories

### 2.1 Primary User
As a [사용자 유형], I want to [행동] so that [이유/이점].

### 2.2 Acceptance Criteria (Gherkin)
Scenario: [시나리오명]
  Given [전제 조건]
  When [행동]
  Then [결과]

### 2.3 User Roles

> **목적**: 역할을 영문 문자열로 통일 선언. 이후 페이지 권한·API authorization·`/screen-spec` Audience 매핑의 단일 키로 사용.

| Role Key | 한국어 명칭 | 권한 범위 | 비고 |
|----------|------------|----------|------|
| `guest` | 비로그인 사용자 | public 페이지만 | 해당 시 |
| `author` | 일반 사용자 | 본인 데이터 read/write | RLS 적용 |
| `admin` | 관리자 | 전체 read/update | service_role |

**규칙**:
- Role Key는 **영문 소문자 단일 단어** (`super_admin`처럼 snake_case 허용)
- 이후 모든 페이지/API 명세에서 이 키를 그대로 인용
- 역할이 1개뿐이면 (`author`만) 테이블은 생략 가능, 단 본문에 한 번은 명시

## 3. Functional Requirements

| ID | Requirement | Priority | Dependencies |
|----|------------|----------|--------------|
| FR-001 | [요구사항 설명] | P0 (Must) | - |
| FR-002 | [요구사항 설명] | P1 (Should) | FR-001 |

## 4. Non-Functional Requirements

### 4.0 Scale Grade (규모 등급)

프로젝트 규모를 파악하여 적정 기술 수준을 설정합니다.
AskUserQuestion으로 사용자에게 질문합니다. 기본값: **Hobby**.

> **문서유형 조건**: `refactor` 유형은 런타임 사용자가 없으므로 §4.0~4.4를 "N/A" 한 줄로 마감한다. `product-feature`·`internal-backend`만 아래 질문을 진행한다.

```yaml
question: "이 프로젝트의 예상 규모는 어느 정도인가요?"
options:
  - label: "Hobby (사이드 프로젝트)"
    description: |
      혼자 또는 2명이 만드는 프로젝트. 포트폴리오, 학습용, 해커톤,
      사내 도구 등. 사용자 수백 명 이하.
      예: 개인 블로그, 사내 출석 체크 앱, 친구들끼리 쓰는 앱
      → 서버 1대면 충분, 무료 호스팅 활용 가능
  - label: "Startup (소규모 서비스)"
    description: |
      2-5명이 만드는 초기 서비스. 실제 사용자를 받기 시작한 단계.
      일일 사용자 수천 명. 매출이 발생하기 시작.
      예: 초기 SaaS, 소규모 커뮤니티, 동네 배달 앱, 스타트업 MVP
      → 안정적인 DB + 기본 모니터링 필요
  - label: "Growth (성장기 서비스)"
    description: |
      5-15명이 운영하는 성장 중인 서비스. 사용자가 빠르게 늘고 있음.
      일일 사용자 수만 명. 트래픽 급증 대비 필요.
      예: 중견 SaaS, 커머스 플랫폼, 실시간 서비스, 시리즈 A-B 스타트업
      → 오토스케일링, 캐싱, 메시지 큐 필요
  - label: "Enterprise (대규모 서비스)"
    description: |
      15명 이상이 운영하는 대규모 서비스. 24/7 무중단 운영 필수.
      일일 사용자 10만 명 이상. 글로벌 서비스 또는 금융/의료급 안정성.
      예: 대형 커머스, 핀테크, 글로벌 SaaS, 공공 서비스
      → 멀티 리전, 분산 시스템, 전문 DevOps 필요
```

**Scale Grade 요약 테이블:**

| 등급 | 일일 사용자(DAU) | 동시접속 | 데이터량 | 추천 인프라 비용 |
|------|-----------------|---------|---------|----------------|
| **Hobby** | < 1,000 | < 100 | < 1GB | 무료~$20/월 |
| **Startup** | 1,000 ≤ DAU < 10,000 | 100 ≤ CC < 1,000 | 1-10GB | $20-100/월 |
| **Growth** | 10,000 ≤ DAU < 100,000 | 1,000 ≤ CC < 10,000 | 10-100GB | $100-1,000/월 |
| **Enterprise** | ≥ 100,000 | ≥ 10,000 | ≥ 100GB | $1,000+/월 |

> **경계값 원칙**: DAU 정확히 1,000명이면 Startup, 10,000명이면 Growth, 100,000명이면 Enterprise.

**추가 질문** (Scale Grade 선택 후, 선택 사항):
- "예상 일일 활성 사용자(DAU) 수를 알고 계신가요?" (구체적 숫자 입력 유도)
- "피크 시간대에 몇 명이 동시에 접속할 것 같나요?"
- "서비스가 1시간 멈추면 어떤 영향이 있나요?" (Availability 감 잡기용)

### 4.1 Performance SLA

| 지표 | 목표값 |
|------|--------|
| Response Time (p95) | [예: < 200ms] |
| Throughput (RPS) | [예: 100 RPS] |

> **Scale Grade별 가이드:**
> - Hobby/Startup: p95 < 500ms, RPS < 100이면 충분
> - Growth: p95 < 200ms, RPS 100-1,000 권장
> - Enterprise: p95 < 100ms, RPS 1,000+ 및 부하 테스트 필수

### 4.2 Availability SLA

| 등급 | 추천 Uptime | 허용 다운타임(월) |
|------|------------|-----------------|
| Hobby | 95% | 36시간 |
| Startup | 99% | 7.3시간 |
| Growth | 99.9% | 43.8분 |
| Enterprise | 99.99% | 4.3분 |

### 4.3 Data Requirements

| 항목 | 값 |
|------|-----|
| 현재 데이터량 | [예: 100MB] |
| 월간 증가율 | [예: 10%] |
| 데이터 보존 기간 | [예: 1년] |

> Scale Grade별 참고: Hobby < 1GB, Startup 1-10GB, Growth 10-100GB, Enterprise 100GB+

### 4.4 Recovery (해당 시)

| 항목 | 설명 | 기본값 (Hobby/Startup) |
|------|------|----------------------|
| RTO (복구 시간) | 장애 발생 후 서비스 복구까지 허용 시간 | 미지정 시 24시간 |
| RPO (복구 시점) | 허용 가능한 데이터 손실 시간 범위 | 미지정 시 24시간 |

### 4.5 Security
- Authentication: Required/Optional
- Data encryption: At rest / In transit

## 5. Technical Design

### 5.1 API Specification
[상세 API 명세 - 아래 API Specification Detail 섹션 참고]

### 5.2 Database Schema
[스키마 변경 사항]

### 5.3 Architecture Diagram
[필요 시 아키텍처 다이어그램]

### 5.4 Pages

> **목적**: FE 페이지 인벤토리. `/screen-spec`의 입력. `internal-backend`·`refactor` 유형(또는 백엔드 전용 PRD)이면 "N/A" 한 줄로 마감.

| Route | Audience | Auth | Linked FRs | Has FE Components | Primary State | Responsive |
|-------|----------|------|-----------|-------------------|---------------|-----------|
| `/` | guest, author | Optional | FR-001 | Yes | success | Desktop / Mobile |
| `/submit` | author | Required | FR-002, FR-003 | Yes | success / error | Desktop / Mobile |
| `/admin` | admin | Required | FR-006, FR-007 | Yes | success | Desktop only |
| `/api/v1/*` | - | Required | FR-001~ | **No** (API) | - | - |

**규칙**:
- `Audience`는 §2.3 Role Key를 그대로 사용
- `Has FE Components: Yes`인 행이 **1개 이상**이면 §5.4.1·§5.5를 작성합니다
- `Has FE Components: No` (API/Job 등)는 §5.4.1·§5.5 생략 가능

### 5.4.1 Page State Matrix

> **목적**: 각 페이지에 존재하는 상태를 명시. `/screen-spec`에서 화면별 상태 명세로 확장됨.
> **조건부**: §5.4에 `Has FE Components: Yes` 행이 1개 이상일 때만 작성.

| Route | loading | empty | error | success | no-permission | 비고 |
|-------|---------|-------|-------|---------|---------------|------|
| `/` | ✓ | - | ✓ | ✓ | - | Magic Link 검증 중 loading |
| `/submit` | ✓ | - | ✓ | ✓ | ✓ | 도메인 화이트리스트 외 → no-permission |
| `/my` | ✓ | ✓ | ✓ | ✓ | ✓ | 작성 0건 시 empty |
| `/admin` | ✓ | ✓ | ✓ | ✓ | ✓ | admin role 아니면 no-permission |

**상태 정의**:
- `loading`: 데이터 fetch 중 (스피너/스켈레톤)
- `empty`: 정상 응답이지만 결과 0건 (예: "아직 작성한 항목이 없습니다")
- `error`: 4xx/5xx 응답 또는 클라이언트 검증 실패
- `success`: 정상 응답 + 결과 ≥1건
- `no-permission`: 인증은 됐으나 권한 부족 (admin 전용 페이지를 author가 접근 등)

**규칙**: 체크된 상태(✓)마다 `/screen-spec`에서 1줄 이상 마이크로카피 또는 UI 처리 명시 요구.

### 5.5 User Flow

> **목적**: 페이지 간 이동과 분기 조건. §2.2 Acceptance Criteria의 시나리오를 노드로 표현.
> **조건부**: §5.4에 `Has FE Components: Yes` 행이 1개 이상일 때만 작성.

```mermaid
flowchart TD
  Start([사용자 진입]) --> Landing[/ 페이지/]
  Landing -->|이메일 입력| MagicLink{Magic Link 발송}
  MagicLink -->|도메인 OK| Submit[/submit 페이지/]
  MagicLink -->|도메인 거부| NoPerm[no-permission 안내]
  Submit -->|폼 제출| Validate{필드 검증}
  Validate -->|FAIL| Submit
  Validate -->|PASS| MyList[/my 목록]
  MyList -->|admin 권한| Admin[/admin 페이지/]
```

다중 플로우가 필요하면 `## Flow A: 작성자`, `## Flow B: 관리자`처럼 분리.

## 6. Implementation Phases

### Phase 1: MVP
- [ ] Task 1
- [ ] Task 2
**Deliverable**: [산출물]

### Phase 2: Enhancement
- [ ] Task 3
**Deliverable**: [산출물]

## 7. Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| [지표] | [목표값] | [측정 방법] |
```

### Phase 3: API Specification Detail

PRD 내 API 명세는 다음 형식으로 **상세하게** 작성합니다.

**API 유형 선택:**
프로젝트 요구사항에 따라 적절한 API 형식을 선택합니다:

| API 유형 | 적합한 경우 | 특징 |
|----------|-------------|------|
| **REST** | CRUD 작업, 리소스 기반 API | 범용적, 캐싱 용이 |
| **GraphQL** | 복잡한 데이터 관계, 프론트엔드 주도 | 유연한 쿼리, 오버페칭 방지 |
| **gRPC** | 마이크로서비스 간 통신, 고성능 필요 | 바이너리 프로토콜, 타입 안전 |
| **WebSocket** | 실시간 양방향 통신 | 지속 연결, 푸시 알림 |

**상세 템플릿**: 선택한 API 유형의 상세 템플릿은 `${CLAUDE_PLUGIN_ROOT}/commands/references/prd-api-templates.md` 를 읽어서 사용한다. (REST / GraphQL / gRPC / WebSocket / OpenAPI 템플릿 + 로그인 예시 포함)

기본 REST 엔드포인트는 다음 골격만으로도 충분하다 (복잡한 경우만 위 참고 파일 로드):

```markdown
#### `[METHOD] /api/v1/[resource]`
- **Description**: [설명]
- **Auth**: Required / Optional / None
- **Request**: [필드 + 타입 + required 여부]
- **Response 200**: [반환 데이터 형태]
- **Errors**: [status / code / 조건 (예: 400 INVALID_INPUT, 401 UNAUTHORIZED)]
```

### Phase 4: Output Location

PRD 파일 저장 위치 확인 (AskUserQuestion 사용):

```
question: "PRD 파일을 어디에 저장할까요?"
options:
  - label: "prd/"
    description: "prd 폴더에 저장"
  - label: "docs/prd/"
    description: "docs/prd 폴더에 저장 (권장)"
  - label: "루트"
    description: "[feature-name]-prd.md로 저장"
```

### Phase 5: Task Plan Generation

PRD 작성 완료 후, 실행 계획(Task Plan)을 자동으로 생성합니다.

**저장 위치**: `docs/todo_plan/PLAN_{feature-name}.md`

**Task Plan 템플릿**:

```markdown
# Task Plan: {feature-name}

> **Generated from**: docs/prd/PRD_{feature-name}.md
> **Created**: YYYY-MM-DD
> **Status**: pending

## Execution Config

| Option | Value | Description |
|--------|-------|-------------|
| `auto_commit` | true | 완료 시 자동 커밋 |
| `commit_per_phase` | false | Phase별 중간 커밋 여부 |
| `quality_gate` | true | /auto-commit 품질 검사 |

## Phases

### Phase 1: 환경 설정
- [ ] 프로젝트 구조 생성
- [ ] 의존성 설치
- [ ] 설정 파일 작성

### Phase 2: 핵심 기능 구현
- [ ] 데이터 모델 정의
- [ ] API 엔드포인트 구현
- [ ] 비즈니스 로직 작성

### Phase 3: 테스트 & 검증
- [ ] 단위 테스트 작성
- [ ] 통합 테스트 실행
- [ ] 에러 핸들링 검증

### Phase 4: 마무리
- [ ] 코드 정리 및 리팩토링
- [ ] 문서 업데이트

## Progress

| Metric | Value |
|--------|-------|
| Total Tasks | 0/N |
| Current Phase | - |
| Status | pending |

## Execution Log

| Timestamp | Phase | Task | Status |
|-----------|-------|------|--------|
| - | - | - | - |
```

**Task Plan 생성 규칙**:

1. PRD의 `Implementation Phases` 섹션을 기반으로 Phase 생성
2. 각 Phase의 Task는 PRD의 Functional Requirements와 매핑
3. 의존성 순서대로 Task 배치
4. Execution Config는 기본값 사용 (사용자가 나중에 수정 가능)

### Phase 6: PRD 자동 검증 (Quality Gate)

PRD 작성 완료 후 **자동으로 prd-reviewer 에이전트을 실행**하여 품질을 검증합니다.

**자동 검증 프로세스:** prd-reviewer가 4개 카테고리(완전성 / 실현 가능성 / 보안 / 일관성)를 검사하고, 카테고리별 Critical / Major / Minor 이슈 수를 집계한 결과 테이블을 출력한다.

**품질 게이트 (100점 만점):** 평가 후 100점 만점 점수를 산출한다. 단 **보안 Critical 이슈가 1건이라도 있으면 점수와 무관하게 BLOCK**한다.

**검증 결과에 따른 분기:**

| Critical 이슈 | 상태 | 다음 액션 |
|--------------|------|----------|
| **0개** | ✅ PASS | `/implement` 진행 가능 |
| **1개 이상** | ❌ BLOCKED | 수정 필요, 가이드 제공 |

**Critical 이슈가 있는 경우** — 검증 실패를 알리고, 각 Critical 이슈를 다음 형식으로 제시한 뒤 `/implement` 진행을 차단한다:
- **위치**: [PRD 섹션]
- **문제**: [무엇이 누락/잘못됐는지]
- **영향**: [방치 시 리스크]
- **개선안**: [구체적 수정 방향]

해결 후 "PRD 수정 완료" 또는 `/prd` 재실행으로 재검증한다.

**Critical 이슈가 없는 경우** — 검증 통과를 알리고 Major(구현 중 해결 가능) / Minor(선택적 개선) 이슈 수를 요약한 뒤, `/implement`로 구현을 시작할 수 있음을 안내한다. Major 이슈는 상세 리포트에서 확인하도록 안내한다.

### Phase 7: 다음 단계 안내

PRD 및 Task Plan 작성 완료 후 검증 결과 + **PRD에 FE 페이지 유무**에 따라 안내합니다.

**판단 룰**: §5.4 Pages 테이블에서 `Has FE Components: Yes` 행이 1개 이상이면 `/screen-spec` 권장, 아니면 곧바로 `/implement`.

생성된 PRD 경로, Task Plan 경로, 품질 검증 결과(PASS/Critical 건수), 감지된 FE 페이지 수를 먼저 보고한 뒤 분기별 안내를 출력한다.

**FE 페이지가 있는 경우** (대부분) — 화면정의서를 먼저 만들면 `/implement` 품질이 올라감을 안내한다:
- **권장**: `/screen-spec {feature-name}` — IA / User Flow / 화면별 상태·컴포넌트 명세, 클릭 가능한 HTML 와이어프레임, design-discovery 20종 스타일 선택
- **바로 구현**: `/implement {feature-name}` (화면 디테일은 구현 중 결정)

**백엔드/API 전용인 경우**:
- `/implement {feature-name}` → Task Plan 기반 Phase별 자동 실행
- **1-Click Complete (End-to-End 자동화)**: Task Plan의 `auto_commit: true` 설정 시 모든 Phase 완료 후 자동으로 `/auto-commit` 실행
- **Major/Minor 이슈 확인**: "상세 검토 결과 보여줘" 또는 "prd-reviewer 리포트"

## Priority Levels (MoSCoW)

| Priority | Label | Description |
|----------|-------|-------------|
| **P0** | Must Have | 없으면 출시 불가 |
| **P1** | Should Have | 가능하면 포함 |
| **P2** | Could Have | 있으면 좋음 |
| **P3** | Won't Have | 이번 릴리스에서 제외 |

## INVEST Criteria for User Stories

| Principle | Description |
|-----------|-------------|
| **I**ndependent | 독립적으로 개발 가능 |
| **N**egotiable | 범위 협상 가능 |
| **V**aluable | 사용자 가치 제공 |
| **E**stimable | 공수 추정 가능 |
| **S**mall | 스프린트에 맞는 크기 |
| **T**estable | 명확한 테스트 기준 |

## Quality Checklist

PRD 작성 후 확인:
- [ ] 목적이 명확하게 정의되었는가?
- [ ] 모든 사용자 스토리에 수용 기준이 있는가?
- [ ] **§2.3 User Roles에 Role Key가 영문 문자열로 통일 선언되었는가?**
- [ ] Scale Grade(규모 등급)가 설정되었는가?
- [ ] SLA/SLO 기준(Performance, Availability)이 Scale Grade에 맞게 정의되었는가?
- [ ] 비기능 요구사항이 측정 가능한가?
- [ ] API 명세가 Request/Response/Error 모두 포함하는가?
- [ ] **§5.4 Pages에 모든 페이지의 Audience/Auth/Linked FRs가 채워졌는가?**
- [ ] **FE 페이지가 있으면 §5.4.1 Page State Matrix가 작성되었는가?**
- [ ] **FE 페이지가 있으면 §5.5 User Flow (Mermaid)가 1개 이상 있는가?**
- [ ] 우선순위가 명확한가?
- [ ] 의존성이 식별되었는가?

## Integration Points

### 다음 단계로 전달하는 출력

```
prd-reviewer 에이전트에 전달:
- PRD 마크다운 파일 경로
- Scale Grade (규모 등급) 및 SLA/SLO 기준
- 기능 요구사항 목록 (FR-XXX)
- 비기능 요구사항 목록 (NFR-XXX)
- API 명세 (상세)
- 기술 설계 초안
```

## Auto-Trigger

PRD 작성 완료 시 자동으로 prd-reviewer 사용을 제안:

```
💡 PRD 작성이 완료되었습니다.

   권장: 구현 전 `prd-reviewer` 에이전트로 계획을 검토하세요.
   - 누락된 요구사항 발견
   - 보안 취약점 식별
   - 기술적 리스크 평가

   "PRD 검토해줘" 또는 바로 "/implement [기능명]"
```

## Rules

1. **Specific**: "카테고리별 필터링 가능" (O) / "검색 가능" (X)
2. **Measurable**: "응답시간 < 200ms" (O) / "빠른 응답" (X)
3. **Testable**: 명확한 수용 기준
4. **Independent**: 요구사항 간 의존성 최소화
5. **API 명세 완전성**: Request, Response, Error 모두 정의

## Examples

### 새 프로젝트 PRD 생성

```
입력: /prd 사용자 인증

분석:
- 프로젝트 구조 탐색
- 기술 스택 확인 (Next.js, Prisma)

생성:
- docs/prd/user-authentication.md 작성
- FR-001 ~ FR-010 정의
- API 엔드포인트 상세 설계 (Request/Response/Error)
- 데이터베이스 스키마 설계

다음 단계 안내:
→ "PRD 검토해줘" (prd-reviewer 에이전트)
→ "/implement 사용자 인증"
```

### 자연어 입력 처리

```
입력: "로그인하는거 만들고 싶어"

인식:
- 패턴 매칭: "~하는거 만들고 싶어"
- 기능 추출: "로그인"

응답:
"로그인 기능을 만들어 드릴게요!

 어떻게 진행할까요?

 1. 📋 PRD 먼저 작성 (권장)
    - 요구사항 정리
    - API 명세 설계
    - 구현 계획 수립

 2. ⚡ 바로 구현
    - 기본 JWT 인증으로 빠르게 구현

 → PRD 작성: 'PRD 작성해줘'
 → 바로 구현: '바로 만들어줘'"
```
