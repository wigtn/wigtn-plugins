# Task Plan: fable5-lean-refactor (Opus 4.8 기준)

> **Generated from**: docs/prd/PRD_fable5-lean-refactor.md (v2.0, Opus 4.8 기준)
> **Created**: 2026-07-06
> **Updated**: 2026-07-07
> **Status**: pending

## Execution Config

| Option | Value | Description |
|--------|-------|-------------|
| `auto_commit` | false | 프롬프트 대공사라 사람 리뷰 후 커밋 권장 |
| `commit_per_phase` | true | Phase별 커밋(리뷰 용이 + 롤백 쉬움) |
| `quality_gate` | true | /auto-commit 품질 검사 |
| `branch` | refactor/prompt-over-harness | 현재 브랜치에서 이어감 |

## Phases

### Phase 1: 정합성·준비 (P0)
- [x] FR-003 하드코딩 모델 ID 최신화/의미화 (ai-agent 등) — 구모델/타사 ID 0건
- [x] FR-015 강조어 carve-out 화이트리스트 확정 (§8.3) — PRD §8.3 확정, 전 Phase 32줄 불변 검증
- [x] FR-016 순차성 유지 경계 확정 (게이트·의존성 순서 유지) — PRD FR-016 확정, 게이트/의존성 순서 보존

### Phase 2: 핵심 하네스 제거 (P0)
- [x] FR-004 강조어 남발 제거·평서문화 (전 파일, carve-out 준수)
- [x] FR-005 blocking 순차 강제 → 병렬 위임 (team-build-coordinator, implement, parallel-* 우선; 유지 경계 준수)

### Phase 3: 과잉 방어 제거 (P1)
- [x] FR-006 불가능 시나리오 방어 + 절대금지 목록 제거/완화 (frontend/mobile-developer, code-formatter, backend-architect)
- [x] FR-007 방어적 timeout 완화 (parallel-*)
- [x] FR-008 자동 에스컬레이션 제거 (code-reviewer, pr-reviewer, prd-reviewer, review-pr)
- [x] FR-009 team-build-coordinator 3중 메모리 → team-memory-protocol 일원화

### Phase 4: 톤 완화·Opus 튜닝 (P1/P2)
- [x] FR-010 Opus 4.8 튜닝 스니펫(no-tidying·경계·작은결정 자율성·narration 침묵·트리거링) 프리앰블 신설 + 참조 연결
- [x] FR-011 design-system-reference "Never/Always" 도덕톤 완화
- [x] FR-012 evidence mandate 강제성 완화 (code-reviewer, parallel-review-coordinator)
- [x] FR-027 에이전트 effort frontmatter 재보정 (medium 개발에이전트 4개 → high; FR-010 narration-침묵 결합)
- [x] FR-001 reasoning 서술 지시 문구 정리 (P2, verbosity) — 감사 결과 0건, 이미 충족

### Phase 5: 보강 (Opus 4.8 활용, P1)
- [x] FR-020 /prd 문서유형 모드(product/internal/refactor)
- [x] FR-021 prd-reviewer Critical 트리거 조건부화 + strict fail-safe (오탐 버그)
- [x] FR-022 리뷰 계열 coverage-first 재구성 (code-reviewer/pr-reviewer/parallel-review/review-pr)
- [x] FR-024 명시적 위임 유도 (implement, parallel-*, team-build-coordinator; ⚠️ Fable 대비 방향 반전 — 촉진)
- [x] FR-023 fresh-context verifier 단계 추가
- [x] FR-025 team-memory-protocol lessons-memory 강화
- [x] FR-026 /screen-spec 비전-검증 (선택·스트레치)

### Phase 6: 검증 (P0)
- [x] FR-014 판별 규칙 부록(§8) 최종 확정 — 측정 grep이 §8.1/§8.2 패턴과 일치, 부록 확정
- [x] FR-013 보존 대상 회귀 체크 (§8.4 스모크 체크리스트 pass/fail) — carve-out 32줄 불변, 매니페스트 13/5/5, 계약 섹션 존재
- [x] 라인 축소율 / reasoning 문구 0건(§8.2) / 구모델 ID 0건(§8.1) 측정 — reasoning 0건·구모델 0건 달성
- [ ] 품질 A/B 스팟체크: 대표 커맨드 전/후 동일 입력 산출물 비교 — **수동(런타임 실행 필요)**, 커밋 후 별도 수행 권장
- [x] 문서·버전 정합성: v0.1.9, CLAUDE.md/README, CI manifest guard — validate_plugin.py 통과
- [x] 릴리스 노트 v0.1.9 초안 — docs/RELEASE_NOTES_v0.1.9.md

## Progress

| Metric | Value |
|--------|-------|
| Total Tasks | 26/27 (모든 FR 완료 · 품질 A/B 스팟체크만 수동 잔여) |
| Current Phase | Phase 6 완료 |
| Status | ready-to-commit |

## Execution Log

| Timestamp | Phase | Task | Status |
|-----------|-------|------|--------|
| 2026-07-07 | Phase 2 | FR-004 강조어 평서문화 (20파일) | done |
| 2026-07-07 | Phase 2 | FR-005 blocking→병렬 위임 (coordinator·커맨드·skill) | done |
| 2026-07-07 | Phase 3 | FR-006 절대금지 목록→평서 원칙 (dev agent 4종) | done |
| 2026-07-07 | Phase 3 | FR-007 방어적 timeout 예산 제거→failure-driven degradation (parallel-* 2종) | done |
| 2026-07-07 | Phase 3 | FR-008 3+ 자동 에스컬레이션 제거→모델 판단 (리뷰 4종) | done |
| 2026-07-07 | Phase 3 | FR-009 team-build 3-Layer 중복 정의→team-memory-protocol 참조 일원화 | done |
| 2026-07-07 | Phase 4 | FR-010 opus48-tuning.md 신설 + 13 에이전트 프리앰블 링크 | done |
| 2026-07-07 | Phase 4 | FR-011 design-system Never/Always 도덕톤 완화 (5줄) | done |
| 2026-07-07 | Phase 4 | FR-012 evidence mandate 강제성 완화 (code-reviewer, parallel-review) | done |
| 2026-07-07 | Phase 4 | FR-027 effort 재보정 (ai/backend/frontend/mobile medium→high) | done |
| 2026-07-07 | Phase 4 | FR-001 reasoning 서술 지시 문구 감사 (0건, 이미 충족) | done |
| 2026-07-08 | Phase 5 | FR-020 /prd 문서유형 모드 (Phase 1-0 결정 + Type 헤더 + §4.0/§5.4 조건부) | done |
| 2026-07-08 | Phase 5 | FR-021 prd-reviewer Critical 조건부화 + strict fail-safe | done |
| 2026-07-08 | Phase 5 | FR-022 coverage-first 보고 + confidence 필드 (리뷰 4종) | done |
| 2026-07-08 | Phase 5 | FR-024 명시적 위임 유도 (implement + coordinators preamble) | done |
| 2026-07-08 | Phase 5 | FR-023 fresh-context verifier (implement Step 4.5 + Team BUILD Phase 3) | done |
| 2026-07-08 | Phase 5 | FR-025 lessons-memory 강화 (항목당 1교훈·왜·오답삭제·Phase0 reflect) | done |
| 2026-07-08 | Phase 5 | FR-026 /screen-spec vision 검증 (--verify-vision, 선택) | done |
| 2026-07-08 | Phase 1 | FR-003 하드코딩/타사 모델 ID → 티어 의미 기반 (구모델 0건) | done |
| 2026-07-08 | Phase 6 | FR-014/013 부록 확정 + 계약 회귀 스모크 (carve-out·매니페스트·계약) | done |
| 2026-07-08 | Phase 6 | 측정: reasoning 0건·구모델 ID 0건, 버전 0.1.9 정합, CI 가드 통과 | done |
| 2026-07-08 | Phase 6 | 릴리스노트 v0.1.9 초안 (docs/RELEASE_NOTES_v0.1.9.md) | done |
