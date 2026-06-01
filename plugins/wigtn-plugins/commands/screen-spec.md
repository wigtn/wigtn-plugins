---
argument-hint: "<feature name>"
description: |
  Generate screen specifications (IA / User Flow / Screen Spec / Wireframe / Dev Handoff) from an existing PRD.

  Trigger keywords:
  - Commands: "/screen-spec", "화면정의서 만들어줘", "화면 명세 만들어줘", "와이어프레임 만들어줘"

  - Natural language (바이브 코더 친화):
    - "화면 어떻게 생겼는지 보여줘", "UI 정의해줘"
    - "와이어프레임 그려줘", "프로토타입 만들어줘"
    - "화면별로 정리해줘", "페이지 명세 만들어줘"
    - "PRD 다음 단계", "화면 만들기 전에 정리"
---

# Screen Specification Generation

PRD를 입력으로 받아 화면정의서 5종 산출물을 생성합니다. `/prd` 다음, `/implement` 이전 단계의 **선택적 게이트**.

## Pipeline Position

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [/prd] → [prd-reviewer] → [/screen-spec] → [/implement] → [/auto-commit]  │
│                             ^^^^^^^^^^^^^^                                │
│                             현재 단계                                      │
└──────────────────────────────────────────────────────────────────────────┘
```

| 이전 단계 | 현재 | 다음 단계 |
|----------|------|----------|
| `prd-reviewer` PASS | `/screen-spec` - 화면정의서 5종 생성 | `/implement` - 코드 구현 |

## When to Use

| 조건 | `/screen-spec` 실행? |
|------|-------------------|
| PRD §5.4 Pages에 `Has FE Components: Yes` ≥1개 | ✅ 권장 |
| PRD가 백엔드/API 전용 | ❌ 스킵, 바로 `/implement` |
| PRD가 아직 없음 | ❌ 먼저 `/prd` 실행 |
| 빠른 PoC, 화면 1개 미만 | ⚠️ 생략 가능 |

## Usage

```bash
/screen-spec <feature-name>
/screen-spec <feature-name> --interview
/screen-spec <feature-name> --platform=mobile
/screen-spec <feature-name> --pages=/submit,/my
```

## Parameters

- `feature-name`: 기능명 (required, PRD 파일명과 일치)
- `--interview`: LOAD 후 단일 턴 배치 Q&A로 화면 레이어 의사결정을 끌어냄 (네비 패턴, 밀도, 에러 톤, 빈 상태, 전환 방식, 모바일 우선순위 등 5~7개)
- `--platform=<web|mobile>`: 출력 템플릿 분기. 미지정 시 PRD §1 Overview의 **모바일 시그널**(`React Native`, `RN`, `iOS`, `Android`, `네이티브`, `앱스토어`, `모바일 앱`, `mobile`) 감지로 자동 선택 — 시그널 있으면 `mobile`, 없으면 `web`. ⚠️ 단독 `앱`은 시그널 아님(`웹앱`에 오탐). 명시값이 있으면 자동 감지를 덮어쓴다.
- `--pages=<list>`: 특정 페이지만 명세 (쉼표 구분, 예: `--pages=/submit,/my`). 재실행 시 지정 파일만 덮어쓰고 나머지 산출물은 보존

> **Note**: 와이어프레임은 흑백 + 의미색만 사용하는 lo-fi 산출물이며, 스타일/브랜드/타이포 결정은 별도 단계(mockup 또는 `/implement` 직전)에서 수행한다.

## Protocol

### Phase 1: PRD Load & Validate

1. `docs/prd/PRD_<feature-name>.md` 읽기
2. 다음 항목 추출:
   - §2.3 User Roles → Role Key 목록
   - §5.4 Pages → FE 페이지 목록 (`Has FE Components: Yes`만)
   - §5.4.1 Page State Matrix → 페이지별 활성 상태
   - §5.5 User Flow → Mermaid 노드/엣지
   - §3 Functional Requirements → 페이지 ↔ FR 매핑 후보
3. **검증 실패 시 차단**:
   - PRD 파일 없음 → "먼저 `/prd <feature-name>`을 실행하세요"
   - FE 페이지 0개 → "이 PRD는 백엔드 전용입니다. `/implement`로 진행하세요"
   - §5.4.1 또는 §5.5 누락 → "PRD에 화면 메타데이터가 부족합니다. `/prd`를 다시 실행해 보강하거나 수동 보완하세요"

### Phase 2: Interview (선택, `--interview` 플래그 시에만)

PRD가 다루지 않는 화면 레이어 의사결정을 끌어낸다. 단일 메시지에 5~7개 객관식 질문을 번호 매겨 제시하고 사용자 1회 응답을 받는다.

| # | 질문 | 보기 |
|---|------|------|
| 1 | 네비게이션 패턴 | top / side / bottom / drawer |
| 2 | 정보 밀도 | compact / spacious |
| 3 | 에러 톤 | 공식적 / 친근한 |
| 4 | 빈 상태 철학 | 일러스트 + CTA / 최소 텍스트 + CTA |
| 5 | 전환 방식 | page / modal / drawer |
| 6 | 모바일 우선순위 | desktop-first / mobile-first / parity |
| 7 | 첫 화면 후크 | value-first / action-first / story-first |

응답은 03-SCREEN-SPEC.md 작성 시 명시적으로 반영. 플래그가 없으면 PRD 추론만으로 진행.

**자동 추천 힌트**: PRD에 `TBD` / `???` / 빈 셀이 5건 이상 감지되면 Phase 5 안내문에 "`--interview`로 재실행 추천" 한 줄 출력.

### Phase 3: Sequential Artifact Generation

`screen-spec` 스킬을 호출하여 5종 산출물을 순차 생성. **각 단계는 이전 단계 산출물에 의존**.

```
1. 01-IA.md          ← PRD §5.4 + §3
2. 02-USER-FLOW.md   ← PRD §5.5 확장 (분기 조건 명시)
3. 03-SCREEN-SPEC.md ← 페이지별 (Audience/Auth/States/Components/Microcopy/Responsive)
4. 04-WIREFRAME.html ← 단일 HTML, anchor 네비, 흑백 + 의미색만
5. 05-DEV-HANDOFF.md ← FR ↔ 화면 ↔ 컴포넌트 매핑
```

저장 위치: `docs/prd/screens/<feature-name>/`

**무거운 산출물 분기**: 04-WIREFRAME.html, 05-DEV-HANDOFF.md는 별도 subagent 컨텍스트에서 생성하여 메인 스레드 누적 컨텍스트를 절감한다.

### Phase 4: Frontend Review (필수 Quality Gate)

생성 완료 후 frontend-developer 에이전트를 호출하여 자동 리뷰:

| 점검 항목 | 통과 기준 |
|----------|----------|
| 접근성 (a11y) | landmark, label, aria-* 누락 없음 |
| 반응형 | 모바일 분기점이 모든 페이지에 존재 |
| AI 냄새 | 클리셰 카피, 보랏빛 그라데이션 남발 없음 |
| 마이크로카피 | §5.4.1 체크된 상태마다 카피 존재 |
| 컴포넌트 명세 | 모든 폼 필드에 validation + microcopy |

**결과 처리**:
- PASS → 다음 단계 안내
- WARN (≤3건) → 경고만 표시, 진행 가능
- FAIL (≥4건 또는 critical) → 03-SCREEN-SPEC.md 또는 04-WIREFRAME.html 재생성

### Phase 5: Next Step Guidance

```
화면정의서 5종이 생성되었습니다: docs/prd/screens/<feature>/

산출물:
  01-IA.md             - 정보구조도 (페이지 ↔ 기능 매핑)
  02-USER-FLOW.md      - 사용자 플로우 (분기 조건 포함)
  03-SCREEN-SPEC.md    - 화면별 명세 (상태/컴포넌트/카피)
  04-WIREFRAME.html    - 클릭 가능한 HTML 와이어프레임 (흑백 + 의미색)
  05-DEV-HANDOFF.md    - 개발 인계 (FR ↔ 화면 매핑)

frontend-developer 리뷰: PASS

다음 단계
  1. 와이어프레임 확인
     open docs/prd/screens/<feature>/04-WIREFRAME.html
     브라우저로 열어 현업 피드백 받기

  2. 디테일 보강이 필요하면 (옵션)
     /screen-spec <feature> --interview
       화면 레이어 의사결정(네비/밀도/톤 등) Q&A 후 03-SCREEN-SPEC.md 재생성

  3. 특정 페이지만 재생성 (옵션)
     /screen-spec <feature> --pages=/submit

  4. 구현 시작
     /implement <feature>
       Task Plan + Screen Spec을 같이 참조하여 구현
```

## Integration Points

### `/implement`와의 연동

`/implement` 실행 시 다음 우선순위로 컨텍스트 로드:

```
1. docs/prd/PRD_<feature>.md          (필수)
2. docs/todo_plan/PLAN_<feature>.md   (필수)
3. docs/prd/screens/<feature>/        (있으면 강제 참조)
   ├── 03-SCREEN-SPEC.md  → 컴포넌트 props/state 도출
   ├── 04-WIREFRAME.html  → 레이아웃 마크업 재활용
   └── 05-DEV-HANDOFF.md  → FR ↔ 화면 매핑으로 task 분해
```

화면정의서가 있으면 `/implement`는 추측 대신 명세를 그대로 따른다.

### `prd-reviewer`와의 연동

prd-reviewer가 §5.4.1 / §5.5 누락을 critical로 막아주면, `/screen-spec`은 항상 안정된 입력을 받음.

## Examples

### 일반적인 웹앱 (FE 4페이지)

```
입력: /screen-spec <feature>

분석:
- PRD §2.3: roles = [author, admin]
- PRD §5.4: FE 페이지 = [/, /submit, /my, /admin] (4개)
- PRD §5.4.1: /submit는 no-permission 상태 활성

생성:
- docs/prd/screens/<feature>/
  ├── 01-IA.md         (4페이지 × 12 FR 매핑)
  ├── 02-USER-FLOW.md  (3개 플로우)
  ├── 03-SCREEN-SPEC.md (4페이지 × 평균 5상태)
  ├── 04-WIREFRAME.html (흑백 + 의미색, 1280px / 375px)
  └── 05-DEV-HANDOFF.md

frontend-developer 리뷰: PASS (WARN 1건: /admin 모바일 미정의 → 명시적 desktop-only 표기 권장)

다음 단계 안내:
→ open docs/prd/screens/<feature>/04-WIREFRAME.html
→ /implement <feature>
```

### 디테일 보강이 필요한 경우

```
입력: /screen-spec <feature> --interview

LOAD 직후 단일 메시지로 7개 질문 일괄 제시 →
사용자가 번호로 답변 → 03-SCREEN-SPEC.md 작성에 반영.
```

### 백엔드 전용 PRD

```
입력: /screen-spec <feature>

분석:
- PRD §5.4: FE 페이지 0개 (모두 API/Job)

차단:
"이 PRD는 백엔드 전용입니다. /screen-spec은 FE 페이지가 있을 때만 사용합니다.
→ /implement <feature> 으로 바로 진행하세요."
```

## Rules

1. **PRD First**: PRD 없이 `/screen-spec`을 실행하지 않는다
2. **Single Source of Truth**: Role Key, FR ID, 페이지 Route는 PRD에서 그대로 인용
3. **Lo-fi Wireframe**: 와이어프레임은 흑백 + 의미색만. 브랜드/타이포/액센트 컬러 금지
4. **State Coverage**: §5.4.1에 체크된 모든 상태에 마이크로카피 또는 UI 처리 명세 필수
5. **Skip If No FE**: 백엔드 전용이면 명시적으로 차단
6. **Style Out of Scope**: 디자인 스타일 결정은 `/screen-spec` 책임 밖. mockup 또는 `/implement` 직전 단계에서 수행

## Auto-Trigger

`/prd` 완료 + PRD §5.4에 FE 페이지가 있으면 자동으로 `/screen-spec` 사용을 제안한다 (`/prd` Phase 7에서 처리).
