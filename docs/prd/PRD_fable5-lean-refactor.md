# Prompt Lean Refactor PRD (Opus 4.8 기준)

> **Version**: 2.0
> **Created**: 2026-07-06
> **Updated**: 2026-07-07 (Opus 4.8 기준으로 재정의 — Fable 5 미가용)
> **Status**: Draft
> **Type**: 내부 프롬프트 리팩터 (No FE / No API / No DB)
> **Feature key**: `fable5-lean-refactor` (파일명 유지, 내용은 Opus 4.8 기준)

## 1. Overview

### 1.1 Problem Statement

현재 플러그인(v0.1.8)의 에이전트·커맨드·스킬 프롬프트는 이전 세대 모델을 전제로 한 **과잉 처방(over-prescription)** 을 다수 포함한다. 실사용 모델인 **Claude Opus 4.8** 도 과한 강조어·절대금지·blocking을 만나면 **과triggering·문장의 literal 준수·불필요한 tidying**으로 출력 품질이 떨어진다(공식 마이그레이션 가이드가 항목별로 경고). 지난 커밋(v0.1.8)이 "Opus 4.8용 과잉 하네스 축소"였고, 이번엔 한 단계 더 걷어내며 **Opus 4.8 고유 동작**(4.7보다 수다스러운 narration·잦은 확인 질문·서브에이전트/검색/메모리에 대한 소극성)에 맞춰 튜닝한다.

> Fable 5는 곧 미가용이라 대상에서 제외한다. 단일 **Opus 4.8 기준** — 앞서 검토한 "모델 토글 불필요" 결정이 그대로 유효(오히려 확정).

### 1.2 Goals

- 절차적 과잉 하네스를 걷어내 **Opus 4.8 출력 품질**을 높인다.
- 하드코딩된 구세대 모델 ID를 정리해 **정합성**을 확보한다.
- 플러그인의 **살아남는 가치(레퍼런스 데이터·산출물 계약·품질 게이트·워크플로)** 를 회귀 없이 보존한다.
- **Opus 4.8 강점 활용(보강)**: 문서유형 인지·리뷰 coverage-first·fresh-context 검증·명시적 위임 유도·lessons-memory.

### 1.3 Non-Goals (Out of Scope)

- **모델 토글/이중 트랙 미구현.** 단일 lean 버전(Opus 4.8 기준). Fable 미가용으로 더욱 확정.
- 레퍼런스 데이터(디자인 20종·템플릿·microcopy) 및 산출물 계약(PRD 섹션 구조·화면정의서 5종 구성) 변경 금지 — 형태만 유지.
- 품질 게이트 임계값(80/60)·보안 FAIL 규칙·커밋 전 사용자 확인 변경 금지.
- `handdrawn-diagram`, `team-memory-protocol` 구조 재설계 금지 — 단 FR-009(3중 메모리 흡수)·FR-025(lessons-memory 규칙 추가, 기존 파일 포맷 유지)는 예외.
- 신규 **커맨드/스킬 파일** 추가 금지 — 단 기존 커맨드/에이전트의 **동작 보강**(FR-020~027)과 FR-010 공용 스니펫 1건은 예외. (FR-023 verifier는 신규 파일이 아니라 implement/coordinator 인라인 단계)

### 1.4 Scope

| 포함 | 제외 |
|------|------|
| 13 에이전트 + 5 커맨드 + 5 스킬의 프롬프트 문구 정리 | 레퍼런스 데이터/템플릿 내용 |
| 과잉 강조어·reasoning 서술 지시 문구 정리 | 품질 게이트 임계값·보안 규칙 |
| 하드코딩 모델 ID 최신화 | 워크플로 파이프라인 구조 |
| 과잉 하네스(강조어·blocking·방어 timeout·자동 에스컬레이션) 제거 | 모델 런타임 선택 로직(Claude Code `/model` 소관) |
| Opus 4.8 튜닝 스니펫 추가 | 신규 기능 |
| 보강(문서유형·coverage-first·verifier·위임 유도·memory, FR-020~026) | 모델 토글/이중 트랙 |

## 2. User Stories

### 2.1 Primary User

As a **플러그인 사용자(바이브 코더)**, I want **Opus 4.8 세션에서 리뷰·구현 커맨드가 과잉 하네스 없이 매끄럽게 돌고 산출물 품질이 좋기를** so that **일관된 하우스 스타일 산출물을 얻는다**.

As a **플러그인 메인테이너**, I want **과잉 하네스를 걷어내되 산출물 계약은 유지되기를** so that **현세대 모델 대응과 팀 표준 유지를 동시에 달성한다**.

### 2.2 Acceptance Criteria (Gherkin)

```
Scenario: 과잉 하네스 제거 후 리뷰 recall 유지
  Given coverage-first 재구성 적용
  When code-reviewer를 동일 코드셋에 실행
  Then 리팩터 전 대비 버그 발견 recall이 유지·향상된다

Scenario: 산출물 계약 회귀 없음
  Given lean 리팩터 적용 후
  When /prd 및 /screen-spec을 실행
  Then PRD 섹션 구조와 화면정의서 5종 구성이 이전과 동일하게 산출된다

Scenario: 하드코딩 구모델 ID 제거
  Given 리팩터 완료
  When 저장소를 grep
  Then 코드 생성용 구세대 모델 ID 하드코딩이 0건이다

Scenario: 리뷰어 오탐/미탐 fail-safe
  Given FR-021 조건부화 + strict fail-safe 적용
  When 내부 PRD와 제품 PRD를 각각 리뷰
  Then 내부 PRD엔 부당 Critical 0, 제품 PRD엔 보안 Critical 정상 발화

Scenario: 보안 강조어 화이트리스트 보존
  When FR-004 강조어 감사 grep 실행
  Then `Force FAIL`·`차단` 등 보안 게이트 라인은 수정되지 않는다
```

### 2.3 User Roles

> 내부 도구 리팩터라 역할은 얇음. Role Key만 통일 선언.

| Role Key | 한국어 명칭 | 권한 범위 | 비고 |
|----------|------------|----------|------|
| `maintainer` | 플러그인 메인테이너 | 프롬프트 파일 편집·머지 | 우리 |
| `end_user` | 플러그인 사용자 | Claude Code에서 커맨드/스킬 사용 | 현행 Opus 4.8 세션 |

## 3. Functional Requirements

> **FR-002(구 Fable cyber-classifier fallback 노트)는 Opus 4.8 재평가로 삭제.** Opus 4.8은 benign 보안 리뷰를 분류기로 거부하지 않으므로 fallback이 불필요(no-op). 번호는 이력 보존 차 공백으로 둔다.

| ID | Requirement | Priority | Dependencies |
|----|------------|----------|--------------|
| FR-001 | reasoning를 응답 텍스트로 서술/재현/설명하라는 지시 정리 (A6). Opus 4.8엔 refusal 위험 없음 — **verbosity 정리 목적**으로 격하 | P2 | 전 파일 감사 |
| FR-003 | 하드코딩 구세대 모델 ID 최신화/의미화 (A7, 주로 ai-agent) | P0 | - |
| FR-004 | 명령형 강조어(`반드시/MUST/CRITICAL/절대/ALWAYS/필수`) 남발 제거·평서문화 (A1; 공식이 Opus 4.5~4.8 과triggering 경고). **carve-out: FR-015 화이트리스트는 제거 대상에서 제외** | P0 | FR-015 |
| FR-005 | blocking 순차 강제("Phase N 완료 대기 필수", "EACH step") → 병렬 위임 허용 (A4). **유지 경계는 FR-016** | P0 | 파일 인벤토리, FR-016 |
| FR-006 | 불가능 시나리오 방어 + 절대금지 목록("하지 말아야 할 것") 제거/완화 (A2·A3; Opus 4.8 literal 준수 + no-tidying). **carve-out: FR-015 적용** | P1 | FR-004, FR-015 |
| FR-007 | 방어적 timeout / conservative default(15/20, 60–120초) 완화 (A5). Opus 4.8도 high effort에서 길어짐(Fable만큼 극단은 아님) | P1 | - |
| FR-008 | 자동 에스컬레이션("3+ 파일/섹션이면 자동 병렬") 제거 → 모델 판단 (A8) | P1 | - |
| FR-009 | `team-build-coordinator` 3중 메모리 → `team-memory-protocol` 하나로 일원화 | P1 | FR-005 |
| FR-010 | **Opus 4.8 튜닝 스니펫 프리앰블**: no-tidying·경계(불필요 액션 금지)·작은결정 자율성(4.8이 더 자주 물음)·narration 침묵 기본값(4.8이 더 수다스러움)·검색/도구·서브에이전트 트리거링(4.8이 소극적). 장시간 커맨드 우선 적용 | P1 | - |
| FR-011 | `design-system-reference`의 "Never/Always" 도덕톤 완화(데이터 유지; 공식: Opus 4.8은 짧은 anti-slop 넛지로 충분) | P2 | - |
| FR-012 | evidence mandate 강제성 완화(파일:라인 근거 요구 자체는 유지) | P2 | FR-001 |
| FR-013 | **보존 대상 회귀 방지**: 레퍼런스 데이터·산출물 계약·품질 게이트·보안 FAIL·커밋 확인·`handdrawn-diagram`·`team-memory-protocol` 불변 보장 | P0 | 전 FR |
| FR-014 | **판별 규칙 부록화**: "구세대 모델 ID" 목록과 "reasoning 서술 지시 문구" 패턴을 §8 부록에 grep 가능한 형태로 명시(§7 "0건" 지표 검증 가능화) | P1 | FR-001, FR-003 |
| FR-015 | **강조어 carve-out 화이트리스트**: 보안 FAIL 규칙·커밋 전 확인·quality gate 임계값의 강제력을 표현하는 강조어/금지문(`Force FAIL`, `explicit block`, `차단`, 커밋 확인 게이트 등)은 FR-004/006 제거 대상에서 **제외**. 감사 grep은 이 블록을 화이트리스트 처리 | P0 | - |
| FR-016 | **순차성 유지 경계**: FR-005 제거 대상은 "방어적/무의미한 대기"에 한정. **유지 대상 = 게이트·의존성 기반 순서**(quality gate 통과 후 커밋, FR 의존성 순서 개발, Linear 이슈 단위 순차, 병렬 coordinator의 결과 병합) | P0 | - |
| FR-027 | **에이전트 frontmatter `effort` 재보정**: 코딩/에이전틱(현 medium 4개: ai-agent·backend·frontend·mobile) → **high**(코딩은 intelligence-sensitive); 리뷰/coordinator(현 high 8개)는 유지하되 FR-010 narration-침묵과 결합해 high의 verbosity 상쇄; code-formatter는 low 유지. task 성격 기준 per-agent 재보정 | P1 | FR-010 |

> 의존성 주의: FR-015/016은 **선행 정의**(의존 없음), FR-013(보존 검증 게이트)이 이들을 포함·검증하는 방향(FR-013 → 전 FR). 순환 아님.

### 3.1 보강 요구사항 (Opus 4.8 활용)

> "제거"가 아니라 Opus 4.8 강점·권장을 적극 활용하는 **추가/수정**. 안전·제거(FR-001~016)와 독립적으로 뒤 Phase에서 진행 가능. (FR-002·FR-017~019는 의도적 번호 공백)

| ID | Requirement | Priority | Dependencies |
|----|------------|----------|--------------|
| FR-020 | **/prd 문서유형 모드**: `product-feature` / `internal-backend` / `refactor` 분기. 유형에 따라 §5.4·Scale Grade·SLA·API 섹션을 자동 표시/N-A (제품·FE 락 해소; 본 PRD 작성 중 직접 확인된 갭) | P1 | - |
| FR-021 | **prd-reviewer Critical 트리거 조건부화**: auth·rate-limiting·GDPR·§5.4 누락 등은 runtime/API/FE가 존재할 때만 발동 (비제품 PRD 오탐 버그 수정 — 본 세션에서 실증). **fail-safe: 유형 판정이 모호하면 strict(제품) 모드로 기본 처리, FR-020 문서유형 미선언 시 strict 폴백 — 오탐 수정이 보안 미탐을 유발하지 않도록** | P1 | FR-008, FR-020 |
| FR-022 | **리뷰 계열 coverage-first 재구성**: findings 전량 + confidence/severity로 보고, 필터링은 하류 단계로 분리 (**공식 Opus 4.7/4.8 code-review 가이드**; 리터럴 severity 필터로 인한 recall 하락 방지). 대상: code-reviewer·pr-reviewer·parallel-review-coordinator·review-pr | P1 | FR-012 |
| FR-023 | **fresh-context verifier 단계**: 장시간 커맨드(implement·coordinators)에 별도 컨텍스트 검증 서브에이전트 도입 (공식: self-critique보다 우수, 모델 무관) | P1 | FR-024 |
| FR-024 | **명시적 위임 유도** (⚠️ Fable 대비 방향 반전): Opus 4.8은 서브에이전트·위임에 **소극적**이라, coordinator/implement에 "적절할 때 위임하라"는 명시적 가이드를 **추가**한다(억제가 아니라 촉진). blocking 제거는 FR-005. async 오케스트레이션 강조는 완화. **FR-008과 화해: 정량 자동 트리거(3+)는 제거하되 "독립적이고 병렬 이득이 크면 위임"하라는 판단 기준은 남긴다 — FR-024가 상위 규칙** | P1 | FR-005, FR-008, FR-016 |
| FR-025 | **team-memory-protocol lessons-memory 강화**: 파일당 1교훈·요약 top·왜 중요했는지·중복금지·오답삭제 + 과거 세션 reflect 부트스트랩. Opus 4.8도 memory에 소극적이라 촉진 가치 있음(Fable만큼 큰 이득은 아니라 우선순위 하향) | P2 | FR-009 |
| FR-026 | **/screen-spec 비전-검증(선택·스트레치)**: 생성한 HTML 와이어프레임을 렌더→이미지로 §5.4.1 상태·스펙과 대조 검증 (Opus 4.8 vision + self-verify) | P2 | FR-023 |

## 4. Non-Functional Requirements

### 4.0 Scale Grade

**N/A** — 런타임 사용자·DAU·트래픽이 없는 내부 프롬프트 리팩터. Scale Grade / SLA / Availability / Recovery 전 항목 해당 없음.

### 4.5 Security

- 리팩터가 **보안 FAIL 규칙**(점수 무관 차단)을 약화시키지 않아야 함(FR-013).
- Opus 4.8은 benign 보안 리뷰를 분류기로 거부하지 않으므로 별도 refusal fallback 불필요 (구 FR-002 삭제).
- FR-021 조건부화가 **제품 PRD의 보안 Critical 미탐**을 만들지 않도록 strict 기본값 유지.

### 4.6 Quality (핵심 비기능 요구)

- **출력 계약 회귀 0**: `/prd`·`/screen-spec`·`/implement`·`/auto-commit`·리뷰 산출물의 구조가 이전과 동일해야 함.
- **문서 정합성**: 라인 수 축소 후에도 파이프라인 흐름(Pipeline Position)·게이트 임계값 문서가 서로 모순되지 않아야 함.

## 5. Technical Design

### 5.1 API Specification

**N/A** — API 없음.

### 5.2 Database Schema

**N/A** — DB 없음.

### 5.3 Architecture

변경 파일 인벤토리 (편집 대상):

- **에이전트(13)**: ai-agent, architecture-decision, backend-architect, code-formatter, code-reviewer, design-discovery, frontend-developer, mobile-developer, parallel-digging-coordinator, parallel-review-coordinator, pr-reviewer, prd-reviewer, team-build-coordinator *(전원 FR-027 `effort` 재보정 대상)*
- **커맨드(5)**: prd, implement, screen-spec, auto-commit, review-pr
- **스킬(총 5개 중 편집 4 · `handdrawn-diagram` 불변)**: code-review-levels, design-system-reference, screen-spec, team-memory-protocol
- **신설물 1개**: 기존 `commands/references/` 디렉터리 하위에 Opus 4.8 튜닝 스니펫 파일 1개(FR-010) — 13개 에이전트가 프리앰블에 요지 인라인 + 파일 링크 참조
- **FR-023 verifier**: 신규 에이전트 파일 아님 — implement/coordinator **인라인 단계**로 구현 (CI manifest guard 영향 없음)

### 5.4 Pages

**N/A (No FE)** — UI 페이지 없음. `Has FE Components: No` → `/screen-spec` 건너뛰고 `/implement`로 직행.

## 6. Implementation Phases

### Phase 1: 정합성·준비 (P0)
- [ ] FR-003: 하드코딩 모델 ID 최신화/의미화
- [ ] FR-015: 강조어 carve-out 화이트리스트 확정 (§8.3) — FR-004/006 착수 **전** 선행
- [ ] FR-016: 순차성 유지 경계 확정 — FR-005 착수 **전** 선행
**Deliverable**: 모델 ID 정합 + 감사 화이트리스트/경계 확정

### Phase 2: 핵심 하네스 제거 (P0)
- [ ] FR-004: 강조어 남발 제거·평서문화 (전 파일, carve-out 준수)
- [ ] FR-005: blocking 순차 강제 → 병렬 위임 허용 (coordinator·커맨드 우선, 유지 경계 준수)
**Deliverable**: 큰 coordinator/커맨드(team-build-coordinator, implement, parallel-*) lean화

### Phase 3: 과잉 방어 제거 (P1)
- [ ] FR-006: 불가능 시나리오 방어 + 절대금지 목록 제거/완화
- [ ] FR-007: 방어적 timeout 완화
- [ ] FR-008: 자동 에스컬레이션 제거
- [ ] FR-009: 3중 메모리 → team-memory-protocol 일원화
**Deliverable**: 남은 에이전트 lean화 완료

### Phase 4: 톤 완화·Opus 튜닝 (P1/P2)
- [ ] FR-010: Opus 4.8 튜닝 스니펫 프리앰블 추가·참조 연결
- [ ] FR-011: design-system 도덕톤 완화
- [ ] FR-012: evidence mandate 강제성 완화
- [ ] FR-001: reasoning 서술 지시 문구 정리 (P2, verbosity)
**Deliverable**: Opus 4.8 고유 동작에 맞춘 튜닝 반영

### Phase 5: 보강 (Opus 4.8 활용, P1)
- [ ] FR-020: /prd 문서유형 모드
- [ ] FR-021: prd-reviewer Critical 트리거 조건부화 (오탐 버그) + fail-safe
- [ ] FR-022: 리뷰 계열 coverage-first 재구성
- [ ] FR-024: 명시적 위임 유도 (implement·coordinators; 방향 반전)
- [ ] FR-023: fresh-context verifier 단계
- [ ] FR-025: team-memory-protocol lessons-memory 강화
- [ ] FR-026: /screen-spec 비전-검증 (선택·스트레치)
**Deliverable**: Opus 4.8 활용(문서유형 인지·coverage-first·위임·verifier·memory·vision) 반영

### Phase 6: 검증 (P0)
- [ ] FR-014: 판별 규칙 부록(§8) 최종 확정
- [ ] FR-013: 보존 대상 회귀 체크(grep + 산출물 스모크: 각 커맨드 1회 실행해 계약 유지 확인)
- [ ] 라인 축소율 측정, reasoning 서술 지시 문구 0건 grep, 구모델 ID 0건 grep
- [ ] **품질 A/B 스팟체크**: 대표 커맨드 1개를 동일 입력으로 리팩터 전/후 실행해 산출물 품질 비교 (핵심 목표 검증)
- [ ] **문서·버전 정합성**: version 0.1.8→0.1.9, CLAUDE.md/README 갱신, CI manifest guard 통과
**Deliverable**: 회귀 없음 확인 + 릴리스 노트(v0.1.9)

## 7. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| coordinator/커맨드 분량 축소 | 30–50% | 리팩터 전후 라인 diff |
| 리뷰/개발 에이전트 분량 축소 | 20–30% | 라인 diff |
| reasoning 서술 지시 문구 | 0건 (best-effort·비차단) | grep 감사 (verbosity 정리; FR-001 P2) |
| 하드코딩 구세대 모델 ID | 0건 | grep 감사 |
| 산출물 계약 회귀 | 0건 | 각 커맨드 스모크 실행 |
| 보안 FAIL 규칙·커밋 확인 유지 | 100% | 코드 리뷰 확인 |
| prd-reviewer 비제품 PRD 오탐 | 0건 | 내부/리팩터 PRD 리뷰 시 부당 Critical 없음 |
| 제품 PRD 보안 Critical 미탐 | 0건 | FR-021 fail-safe 회귀 테스트 |
| 리뷰 recall(버그 발견) | 유지·향상 | coverage-first 전후 동일 코드셋 비교 |
| 리팩터 전/후 산출물 품질 | code-reviewer 스코어 Δ ≥ 0 | 대표 커맨드 산출물을 전/후 code-reviewer 100점 채점 비교 (+ §8.5 체크리스트) |

## 8. Appendix — 판별 규칙 (FR-014 / FR-015)

### 8.1 구세대 모델 ID grep 대상 (FR-003 → "0건" 검증)
- 폐기/구세대 ID: `claude-opus-4-7`, `claude-opus-4-6`, `claude-opus-4-5`, `claude-opus-4-1`, `claude-opus-4-0`, `claude-3-*`, `gpt-5.5`(또는 구버전), `gemini-3.5-*`
- 현행 유지 허용: `claude-opus-4-8`(기준), `claude-sonnet-4-6`, `claude-haiku-4-5` — 단 하드코딩보다 의미 기반("최신 고성능/저비용 모델") 우선

### 8.2 reasoning 서술 지시 문구 패턴 (FR-001 → "0건" 검증; Opus엔 refusal 아닌 verbosity)
- 제거 대상 패턴: "사고 과정을 설명/서술/재현하라", "네 추론을 응답에 적어라", "reasoning을 보여줘라", "think out loud in the response", "show your reasoning"
- **안전(유지):** "파일:라인/PRD 섹션 등 **외부 증거** 인용" — 내부 추론 서술이 아니므로 제외

### 8.3 강조어 carve-out 화이트리스트 (FR-015 → grep 제외 대상)
- 보존 문자열/블록: `Force FAIL`, `explicit block`, 보안 "차단" 규칙, quality gate 임계값(80/60) 서술, `/auto-commit` 커밋 전 사용자 확인 게이트
- 규칙: FR-004/006 강조어 감사 시 위 블록이 포함된 라인은 수정하지 않는다

### 8.4 계약 회귀 스모크 체크리스트 (FR-013 → pass/fail)
- [ ] `/prd`: PRD 필수 섹션 헤더(§1~7) 산출
- [ ] `/screen-spec`: 화면정의서 5종(IA/Flow/Spec/Wireframe/Handoff) 파일 생성
- [ ] `/auto-commit`: quality gate 임계값(80/60) + 커밋 전 확인 동작
- [ ] 리뷰 계열: 보안 Critical → 점수 무관 FAIL 유지
- [ ] (기존 CI 매니페스트 가드와 연계)

### 8.5 품질 A/B 체크리스트 (핵심 목표 검증 — §7)
- [ ] narration: 도구 호출 사이 불필요 서술 감소 (전/후)
- [ ] 확인 질문: 작은 결정 자문 횟수 감소 (전/후)
- [ ] 계약 필드: 산출물 필수 섹션/필드 100% 충족
- [ ] code-reviewer 스코어 Δ ≥ 0
- [ ] FR-021 회귀 픽스처: auth/rate-limiting 요하는 제품형 샘플 PRD 1개 고정 → strict 폴백 시 보안 Critical 정상 발화
