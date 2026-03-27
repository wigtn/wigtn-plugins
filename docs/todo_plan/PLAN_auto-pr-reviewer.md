# Task Plan: auto-pr-reviewer

> **Generated from**: docs/prd/PRD_auto-pr-reviewer.md
> **Created**: 2026-03-26
> **Status**: pending

## Execution Config

| Option | Value | Description |
|--------|-------|-------------|
| `auto_commit` | true | 완료 시 자동 커밋 |
| `commit_per_phase` | true | Phase별 중간 커밋 (별도 서비스이므로) |
| `quality_gate` | true | /auto-commit 품질 검사 |

## Phases

### Phase 1: MVP (Core Pipeline)
- [ ] 프로젝트 초기화 (Node.js + TypeScript + ESLint + Prettier)
- [ ] Webhook 서버 구현 (Express, HMAC-SHA256 검증)
- [ ] PR 이벤트 필터링 (opened/synchronize/reopened)
- [ ] GitHub API 연동 (gh CLI wrapper: diff 가져오기, 리뷰 제출)
- [ ] OMC + Claude Code 리뷰 실행 워커 (child_process spawn)
- [ ] 리뷰 결과 파싱 (100점 → 판단 매핑)
- [ ] 인라인 코멘트 생성 (Critical/Major)
- [ ] Dockerfile + docker-compose.yml
- [ ] GCP 배포 스크립트

### Phase 2: Queue + Discord
- [ ] Redis 컨테이너 추가 (docker-compose)
- [ ] BullMQ 큐 시스템 (Producer/Consumer)
- [ ] 동시성 제어 (concurrency: 2) + 재시도 (3회)
- [ ] Discord Webhook 알림 (시작/완료/긴급)
- [ ] Discord Embed 메시지 포맷팅
- [ ] Draft PR / 라벨 기반 스킵 로직
- [ ] 헬스 체크 엔드포인트 (`GET /health`)
- [ ] Delivery ID 중복 방지

### Phase 3: Configuration + Logging
- [ ] `.github/auto-review.yml` 파싱 (repo별 설정)
- [ ] SQLite 스키마 생성 + 리뷰 로그 저장
- [ ] `/re-review` 코멘트 이벤트 처리 (issue_comment webhook)
- [ ] 리뷰 이력 조회 API (`GET /reviews/:repo`)
- [ ] Docker Compose 통합 (서버 + Redis + 워커)

### Phase 4: Analytics + Polish
- [ ] 주간/월간 리뷰 통계 집계 로직
- [ ] Discord Bot: `/review-stats` 명령
- [ ] 에러 알림 (리뷰 실패 시 Discord 알림)
- [ ] GCP Cloud Logging 연동
- [ ] GCP Uptime Check 설정
- [ ] README + 설정 가이드 문서

## Progress

| Metric | Value |
|--------|-------|
| Total Tasks | 0/30 |
| Current Phase | - |
| Status | pending |

## Execution Log

| Timestamp | Phase | Task | Status |
|-----------|-------|------|--------|
| - | - | - | - |
