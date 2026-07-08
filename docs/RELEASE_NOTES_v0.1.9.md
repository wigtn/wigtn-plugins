# Release Notes — v0.1.9 (draft)

> Opus 4.8 기준 프롬프트 lean 리팩터 2차. 과잉 하네스를 한 단계 더 걷어내고 Opus 4.8 고유 동작에 맞춰 튜닝하며, 모델 강점을 활용하는 보강을 추가한다. **동작·산출물 계약·품질 게이트·보안 규칙은 회귀 없이 보존.**

## Highlights

- **과잉 하네스 축소**: 명령형 강조어 남발을 평서문화하고, 방어적 blocking·timeout 예산·자동 에스컬레이션을 걷어냄. 보안 게이트·커밋 확인 등 32개 carve-out 라인은 전 과정 불변.
- **Opus 4.8 튜닝 프리앰블 신설**: `commands/references/opus48-tuning.md`(no-tidying·경계·작은결정 자율성·narration 침묵·검색/도구·위임 트리거링) + 13개 에이전트 프리앰블 링크.
- **정합성**: 하드코딩 구세대 모델 ID 0건(타사 버전 → 티어 의미 기반), reasoning 서술 지시 문구 0건.
- **보강**: /prd 문서유형 모드, prd-reviewer 오탐 수정(+strict fail-safe), 리뷰 coverage-first, fresh-context verifier, lessons-memory, /screen-spec vision 검증(선택).

## Changes

### 하네스 제거 (Phase 2–3)
- **FR-004** 강조어 평서문화 (전 20파일). 기술 스펙 `필수`·carve-out은 보존.
- **FR-005** blocking 순차 강제("완료 대기 필수"/"EACH step"/"— BLOCKING") → 병렬 위임 허용. 게이트·의존성 순서는 유지.
- **FR-006** 개발 에이전트의 부정 명령형 "하지 말아야 할 것" 목록 → 평서 원칙.
- **FR-007** parallel-*·code-reviewer의 방어적 timeout 초예산(15/20·30~120초) 제거 → failure-driven graceful degradation.
- **FR-008** 리뷰 계열 "변경 파일 3개 이상 → 자동 병렬" 정량 트리거 제거 → 모델 판단.
- **FR-009** team-build-coordinator의 3-Layer 메모리 중복 정의 → `team-memory-protocol` 참조로 일원화.

### 톤 완화·Opus 튜닝 (Phase 4)
- **FR-010** Opus 4.8 튜닝 스니펫 신설 + 13 에이전트 링크.
- **FR-011** design-system-reference "Never/Always" 도덕톤 완화 (스타일 데이터는 불변).
- **FR-012** evidence mandate 강제성 완화 (파일:라인 근거 요구 자체는 유지).
- **FR-027** 개발 에이전트 4종(ai/backend/frontend/mobile) `effort` medium → high.
- **FR-001** reasoning 서술 지시 문구 감사 — 0건(이미 충족).
- **FR-003** 하드코딩 구세대/타사 모델 ID → 티어 의미 기반 표현.

### Opus 4.8 활용 보강 (Phase 5)
- **FR-020** /prd 문서유형 모드(`product-feature`/`internal-backend`/`refactor`) — 유형별 §4.0 Scale·§5.4 Pages 조건부 N/A. 모호 시 product-feature(strict) 기본.
- **FR-021** prd-reviewer Critical 조건부화(auth·rate-limiting·GDPR·§5.4 누락은 런타임/API/FE 존재 시에만) + **strict fail-safe**(유형 모호 시 제품 모드로 보안 Critical 정상 발화).
- **FR-022** 리뷰 4종 coverage-first — findings 전량 + `severity`+`confidence` 병기, 필터링은 하류로.
- **FR-023** fresh-context verifier 단계(implement Step 4.5 + Team BUILD Phase 3) — 빌드와 독립된 컨텍스트로 PRD/계약 대조.
- **FR-024** 명시적 위임 유도(implement·coordinators) — ⚠️ 방향 반전(억제→촉진).
- **FR-025** team-memory-protocol lessons-memory 강화(항목당 1교훈·왜·오답삭제·Phase 0 reflect 부트스트랩).
- **FR-026** /screen-spec `--verify-vision`(선택·스트레치) — 와이어프레임 렌더→이미지로 §5.4.1 상태 대조.

## 보존 확인 (회귀 없음)
- 품질 게이트 임계값(80/60), 보안 Critical 점수 무관 차단, 커밋/PR 전 사용자 확인 — carve-out 32줄 byte-불변.
- 산출물 계약: PRD §1~7, 화면정의서 5종(IA/Flow/Spec/Wireframe/Handoff), 리뷰 100점 체계.
- 매니페스트: 13 agents / 5 commands / 5 skills, CI validate 통과, 버전 정합(0.1.9).

## Upgrade
플러그인 재설치/갱신만으로 적용. 사용자 워크플로 변경 없음(`/model`·effort는 Claude Code 소관).
