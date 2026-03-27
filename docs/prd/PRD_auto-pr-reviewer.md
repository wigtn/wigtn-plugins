# Auto PR Reviewer PRD

> **Version**: 1.0
> **Created**: 2026-03-26
> **Status**: Draft
> **Scale Grade**: Startup

## 1. Overview

### 1.1 Problem Statement

WIGTN 조직에서 여러 repo에 PR이 올라오면 리뷰어가 수동으로 확인해야 한다. 리뷰 대기 시간이 길어지고, 리뷰 품질이 리뷰어의 컨디션과 시간에 따라 들쭉날쭉하다. 이미 `wigtn-coding` 플러그인에 100점 품질 체계 기반의 `pr-reviewer` 에이전트가 있지만, 이를 수동으로 `/review-pr`을 실행해야만 동작한다.

**핵심 문제**: PR이 올라오면 자동으로 리뷰가 시작되는 시스템이 없다.

### 1.2 Goals

- WIGTN org의 모든 GitHub repo에 PR이 열리면 자동으로 코드 리뷰 수행
- 100점 품질 체계 기반으로 점수에 따라 자동 Approve / Request Changes / Comment
- Discord로 리뷰 결과 실시간 알림 전송
- GCP + Docker로 항상 켜져있는(always-on) 서비스 운영
- OMC(Oh My Claude Code)를 활용한 Claude Code 연동

### 1.3 Non-Goals (Out of Scope)

- 자동 코드 수정 (리뷰만, fix는 하지 않음)
- PR 자동 머지 (Approve까지만, 머지는 사람이)
- GitHub 외 다른 Git 호스팅 지원 (GitLab, Bitbucket 등)
- WhatsApp/Slack 연동 (Discord만, 추후 확장 가능)
- 비공개 repo의 코드를 외부에 전송 (모든 처리는 GCP 내부)

### 1.4 Scope

| 포함 | 제외 |
|------|------|
| WIGTN org 전체 repo PR 자동 리뷰 | 다른 org/개인 repo |
| GitHub Webhook 수신 서버 | GitHub App 마켓플레이스 배포 |
| Discord 알림 봇 | Slack/WhatsApp 연동 |
| 100점 품질 체계 리뷰 | 자동 코드 수정/머지 |
| GCP Docker 배포 | 멀티 클라우드 |
| OMC + Claude Code 리뷰 엔진 | 다른 AI 모델 지원 |

## 2. User Stories

### 2.1 PR 작성자

As a **WIGTN 조직의 개발자**, I want to **PR을 올리면 자동으로 코드 리뷰를 받고** so that **리뷰 대기 시간 없이 즉시 피드백을 받을 수 있다**.

### 2.2 리뷰어 (동료 개발자)

As a **WIGTN 조직의 리뷰어**, I want to **AI가 먼저 리뷰한 결과를 확인하고** so that **명백한 이슈는 AI가 잡아주고 나는 설계/비즈니스 로직에 집중할 수 있다**.

### 2.3 팀 리드

As a **팀 리드**, I want to **Discord에서 전체 PR 리뷰 현황을 실시간으로 확인하고** so that **코드 품질 추이와 병목을 파악할 수 있다**.

### 2.4 Acceptance Criteria (Gherkin)

```gherkin
Scenario: PR이 열리면 자동 리뷰 시작
  Given WIGTN org의 repo에 webhook이 설정되어 있고
  And Auto PR Reviewer 서비스가 실행 중일 때
  When 개발자가 PR을 열면
  Then 30초 이내에 리뷰가 시작되고
  And Discord에 "리뷰 시작" 알림이 전송된다

Scenario: 리뷰 완료 후 자동 판단
  Given PR 리뷰가 완료되었을 때
  When 품질 점수가 90점 이상이면
  Then PR에 자동으로 Approve 리뷰가 등록되고
  And Discord에 "Approved (92/100)" 알림이 전송된다

Scenario: Security Critical 이슈 발견
  Given PR 리뷰 중 Security Critical 이슈가 발견되면
  When 점수와 무관하게
  Then PR에 Request Changes 리뷰가 등록되고
  And Discord에 긴급 알림(@here)이 전송된다

Scenario: PR이 업데이트되면 재리뷰
  Given 이미 리뷰된 PR에 새 커밋이 푸시되면
  When synchronize 이벤트가 발생하면
  Then 변경된 파일에 대해 재리뷰를 수행한다
```

## 3. Functional Requirements

| ID | Requirement | Priority | Dependencies |
|----|------------|----------|--------------|
| FR-001 | GitHub Webhook 수신 서버: PR `opened`, `synchronize`, `reopened` 이벤트 처리 | P0 (Must) | - |
| FR-002 | WIGTN org 전체 repo에 대한 Organization Webhook 설정 | P0 (Must) | FR-001 |
| FR-003 | PR diff 가져오기 및 변경 파일 분석 | P0 (Must) | FR-001 |
| FR-004 | OMC + Claude Code 기반 코드 리뷰 실행 (`pr-reviewer` 에이전트) | P0 (Must) | FR-003 |
| FR-005 | 100점 품질 체계 기반 점수 산출 (5-Category) | P0 (Must) | FR-004 |
| FR-006 | 점수 기반 자동 GitHub 리뷰 제출 (Approve / Request Changes / Comment) | P0 (Must) | FR-005 |
| FR-007 | Critical/Major 이슈에 대한 인라인 코멘트 | P0 (Must) | FR-005 |
| FR-008 | Discord 알림: 리뷰 시작/완료/긴급 | P0 (Must) | FR-005 |
| FR-009 | Webhook Secret 기반 요청 검증 (HMAC-SHA256) | P0 (Must) | FR-001 |
| FR-010 | 리뷰 큐잉: 동시 다수 PR 요청 시 순차 처리 | P1 (Should) | FR-001 |
| FR-011 | Repo별 리뷰 설정 오버라이드 (`.github/auto-review.yml`) | P1 (Should) | FR-004 |
| FR-012 | 리뷰 결과 로그 저장 (SQLite/JSON) | P1 (Should) | FR-005 |
| FR-013 | Draft PR 스킵 (옵션) | P1 (Should) | FR-001 |
| FR-014 | 특정 라벨이 붙은 PR 스킵 (`no-ai-review`) | P1 (Should) | FR-001 |
| FR-015 | 리뷰 재요청 트리거: PR 코멘트에 `/re-review` 입력 시 재리뷰 | P2 (Could) | FR-001 |
| FR-016 | 주간/월간 리뷰 통계 Discord 리포트 | P2 (Could) | FR-012 |

## 4. Non-Functional Requirements

### 4.0 Scale Grade

**Startup (소규모 서비스)**

| 지표 | 예상치 |
|------|--------|
| WIGTN org repo 수 | 10-50개 |
| 일일 PR 수 | 10-100건 |
| 동시 리뷰 요청 | 1-5건 |
| 월간 리뷰 총량 | 300-3,000건 |

### 4.1 Performance SLA

| 지표 | 목표값 |
|------|--------|
| Webhook 응답 시간 | < 1초 (202 Accepted) |
| 리뷰 시작까지 지연 | < 30초 |
| 리뷰 완료 시간 (Level 2) | < 5분 / PR |
| Discord 알림 지연 | < 5초 |
| 큐 처리량 | 10 PR/시간 (순차) |

### 4.2 Availability SLA

| 항목 | 값 |
|------|-----|
| Uptime 목표 | 99% (월 7.3시간 다운타임 허용) |
| 장애 시 동작 | Webhook 미처리 PR은 수동 `/review-pr`로 대체 |
| 자동 복구 | Docker restart policy: `unless-stopped` |

### 4.3 Data Requirements

| 항목 | 값 |
|------|-----|
| 리뷰 로그 크기 | 월 ~50MB (JSON 로그) |
| 보존 기간 | 6개월 |
| 코드 데이터 | 디스크에 저장하지 않음 (메모리에서만 처리) |

### 4.4 Recovery

| 항목 | 값 |
|------|-----|
| RTO (복구 시간) | 1시간 |
| RPO (복구 시점) | 리뷰 로그 손실 허용 (재리뷰 가능) |
| 백업 | Docker volume의 리뷰 로그만 |

### 4.5 Security

| 항목 | 구현 |
|------|------|
| Webhook 검증 | HMAC-SHA256 (GitHub Secret) |
| GitHub 인증 | GitHub App 또는 PAT (fine-grained) |
| Claude API 키 | 환경변수 (Secret Manager 권장) |
| Discord Bot Token | 환경변수 (Secret Manager 권장) |
| 네트워크 | GCP 방화벽: 443/HTTPS만 인바운드 |
| 코드 보안 | PR diff는 메모리에서만 처리, 디스크 미저장 |
| 감사 로그 | 모든 리뷰 요청/결과 로깅 |

## 5. Technical Design

### 5.1 System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  GitHub (WIGTN Org)                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                           │
│  │ Repo A  │ │ Repo B  │ │ Repo C  │  ...                      │
│  └────┬────┘ └────┬────┘ └────┬────┘                           │
│       └───────────┼───────────┘                                 │
│                   │ Organization Webhook                        │
│                   │ (PR opened/synchronize/reopened)             │
└───────────────────┼─────────────────────────────────────────────┘
                    │ HTTPS POST
                    ▼
┌──────────────────────────────────────────────────────────────────┐
│  GCP (Docker)                                                    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Webhook Server (Node.js / Express)                        │  │
│  │  - HMAC-SHA256 검증                                        │  │
│  │  - 이벤트 파싱 & 필터링                                    │  │
│  │  - 리뷰 큐에 등록                                          │  │
│  └──────────────────────┬─────────────────────────────────────┘  │
│                         │                                        │
│                         ▼                                        │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Review Queue (BullMQ + Redis)                             │  │
│  │  - FIFO 순서 보장                                          │  │
│  │  - 재시도 (3회)                                            │  │
│  │  - 동시성 제어 (concurrency: 2)                            │  │
│  └──────────────────────┬─────────────────────────────────────┘  │
│                         │                                        │
│                         ▼                                        │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Review Worker                                             │  │
│  │                                                            │  │
│  │  1. gh pr diff <PR> → diff 가져오기                        │  │
│  │  2. OMC + Claude Code 실행                                 │  │
│  │     → pr-reviewer 에이전트 호출                            │  │
│  │     → 100점 품질 체계 평가                                 │  │
│  │  3. 결과 파싱                                              │  │
│  │  4. gh pr review → GitHub에 리뷰 제출                      │  │
│  │  5. Discord 알림 전송                                      │  │
│  │  6. 리뷰 로그 저장                                         │  │
│  └────────────┬───────────────────────┬───────────────────────┘  │
│               │                       │                          │
│               ▼                       ▼                          │
│  ┌──────────────────┐    ┌──────────────────┐                    │
│  │  GitHub API      │    │  Discord Bot     │                    │
│  │  (gh CLI / REST) │    │  (Webhook/Bot)   │                    │
│  └──────────────────┘    └──────────────────┘                    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Review Log Store (SQLite)                                 │  │
│  │  - PR 메타데이터, 점수, 이슈 목록, 타임스탬프              │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 5.2 Component Details

#### 5.2.1 Webhook Server

| 항목 | 값 |
|------|-----|
| Runtime | Node.js 22+ |
| Framework | Express (또는 Hono) |
| Port | 3000 (내부) → 443 (외부, HTTPS) |
| 인증 | HMAC-SHA256 webhook secret 검증 |

#### 5.2.2 Review Queue

| 항목 | 값 |
|------|-----|
| Queue | BullMQ |
| Backend | Redis (GCP Memorystore 또는 Docker Redis) |
| Concurrency | 2 (동시 리뷰 2개) |
| Retry | 3회, exponential backoff |
| Timeout | 10분 / job |

#### 5.2.3 Review Worker

| 항목 | 값 |
|------|-----|
| 실행 방식 | OMC CLI → Claude Code CLI 호출 |
| 리뷰 엔진 | `wigtn-coding` 플러그인의 `pr-reviewer` 에이전트 |
| 리뷰 레벨 | Level 2 (Standard) 기본, repo별 오버라이드 가능 |
| 출력 | 구조화된 리뷰 결과 (JSON) |

#### 5.2.4 Discord Bot

| 항목 | 값 |
|------|-----|
| 방식 | Discord Webhook (단순 알림) + Bot (명령 응답) |
| 채널 | `#pr-reviews` (리뷰 결과), `#pr-alerts` (긴급) |
| 명령 | `/review-stats` (통계), `/re-review <PR>` (재리뷰) |

### 5.3 API Specification

#### `POST /webhook/github`

**Description**: GitHub Organization Webhook 수신 엔드포인트

**Authentication**: HMAC-SHA256 (X-Hub-Signature-256 헤더)

**Headers**:
| Header | Required | Description |
|--------|----------|-------------|
| X-Hub-Signature-256 | Yes | HMAC-SHA256 서명 |
| X-GitHub-Event | Yes | 이벤트 타입 (pull_request) |
| X-GitHub-Delivery | Yes | Delivery ID (중복 방지) |
| Content-Type | Yes | application/json |

**Request Body** (GitHub PR event payload):
```json
{
  "action": "opened | synchronize | reopened",
  "number": 123,
  "pull_request": {
    "title": "Add user authentication",
    "user": { "login": "developer" },
    "head": { "ref": "feat/user-auth", "sha": "abc123" },
    "base": { "ref": "main" },
    "draft": false,
    "labels": [{ "name": "enhancement" }],
    "additions": 234,
    "deletions": 12,
    "changed_files": 5
  },
  "repository": {
    "full_name": "wigtn/repo-name",
    "clone_url": "https://github.com/wigtn/repo-name.git"
  },
  "organization": {
    "login": "wigtn"
  }
}
```

**Response 202 Accepted**:
```json
{
  "status": "queued",
  "jobId": "review-123-abc",
  "message": "PR review queued"
}
```

**Error Responses**:
| Status | Code | Message | Description |
|--------|------|---------|-------------|
| 400 | INVALID_PAYLOAD | Invalid webhook payload | 페이로드 파싱 실패 |
| 401 | INVALID_SIGNATURE | Signature verification failed | HMAC 검증 실패 |
| 422 | SKIPPED | PR skipped (draft/label) | Draft PR 또는 no-ai-review 라벨 |
| 500 | INTERNAL_ERROR | Internal server error | 서버 오류 |

#### `GET /health`

**Description**: 헬스 체크 엔드포인트

**Response 200 OK**:
```json
{
  "status": "healthy",
  "uptime": 86400,
  "queue": {
    "waiting": 2,
    "active": 1,
    "completed": 150,
    "failed": 3
  },
  "lastReview": "2026-03-26T10:30:00Z"
}
```

### 5.4 Review Decision Matrix

| 점수 | 등급 | GitHub Action | Discord 알림 |
|------|------|--------------|-------------|
| 90-100 | A+/A | `--approve` | `:white_check_mark: Approved (92/100)` |
| 80-89 | B+/B | `--approve` + suggestions | `:white_check_mark: Approved with suggestions (85/100)` |
| 70-79 | C+/C | `--comment` | `:warning: Needs improvement (74/100)` |
| 60-69 | D | `--request-changes` | `:x: Changes requested (65/100)` |
| < 60 | F | `--request-changes` | `:x: Significant changes needed (48/100)` |
| Security Critical | - | `--request-changes` (강제) | `:rotating_light: @here Security issue!` |

### 5.5 Discord Message Format

#### 리뷰 시작

```
🔍 PR 리뷰 시작
━━━━━━━━━━━━━━━━━━━━
📦 wigtn/repo-name #123
📝 Add user authentication
👤 @developer
📊 5 files (+234, -12)
⏳ 리뷰 중...
```

#### 리뷰 완료

```
✅ PR 리뷰 완료
━━━━━━━━━━━━━━━━━━━━
📦 wigtn/repo-name #123
📝 Add user authentication
👤 @developer

📊 Quality Score: 85/100 (B+)
┌──────────────────┬───────┐
│ Readability      │ 18/20 │
│ Maintainability  │ 16/20 │
│ Performance      │ 15/20 │
│ Testability      │ 18/20 │
│ Best Practices   │ 18/20 │
└──────────────────┴───────┘

✅ Decision: APPROVED
⚠️ 1 Major issue, 2 Minor suggestions

🔗 https://github.com/wigtn/repo-name/pull/123
```

#### 긴급 알림

```
🚨 @here Security Issue Detected!
━━━━━━━━━━━━━━━━━━━━
📦 wigtn/repo-name #123
📝 Add user authentication
👤 @developer

🔴 Critical: SQL injection vulnerability
   📄 src/api/auth.ts:45

❌ Decision: CHANGES REQUESTED
📊 Score: 59/100 (Security Override)

🔗 https://github.com/wigtn/repo-name/pull/123
```

### 5.6 Repo-Level Configuration (`.github/auto-review.yml`)

```yaml
# .github/auto-review.yml (repo별 오버라이드)
auto-review:
  enabled: true                    # false로 비활성화
  level: 2                         # 리뷰 레벨 (1-4)
  auto-approve: true               # 자동 Approve 활성화
  auto-approve-threshold: 90       # 자동 Approve 최소 점수
  skip-draft: true                 # Draft PR 스킵
  skip-labels:                     # 스킵할 라벨
    - no-ai-review
    - wip
  paths-ignore:                    # 리뷰 제외 경로
    - "docs/**"
    - "*.md"
    - ".github/**"
  discord:
    channel: "pr-reviews"          # 알림 채널 (기본)
    mention-on-critical: true      # Critical 시 @here
```

### 5.7 Database Schema (SQLite)

```sql
CREATE TABLE reviews (
  id TEXT PRIMARY KEY,              -- UUID
  pr_number INTEGER NOT NULL,
  repo_full_name TEXT NOT NULL,     -- wigtn/repo-name
  pr_title TEXT NOT NULL,
  pr_author TEXT NOT NULL,
  head_sha TEXT NOT NULL,

  -- Scores
  score_total INTEGER,
  score_readability INTEGER,
  score_maintainability INTEGER,
  score_performance INTEGER,
  score_testability INTEGER,
  score_best_practices INTEGER,
  grade TEXT,                       -- A+, A, B+, B, C+, C, D, F

  -- Decision
  decision TEXT NOT NULL,           -- APPROVE, COMMENT, REQUEST_CHANGES
  security_override BOOLEAN DEFAULT FALSE,

  -- Issues
  issues_critical INTEGER DEFAULT 0,
  issues_major INTEGER DEFAULT 0,
  issues_minor INTEGER DEFAULT 0,
  issues_info INTEGER DEFAULT 0,

  -- Meta
  review_level INTEGER DEFAULT 2,
  duration_ms INTEGER,
  created_at TEXT DEFAULT (datetime('now')),

  -- Status
  status TEXT DEFAULT 'completed'   -- queued, in_progress, completed, failed
);

CREATE INDEX idx_reviews_repo ON reviews(repo_full_name);
CREATE INDEX idx_reviews_created ON reviews(created_at);
```

## 6. Implementation Phases

### Phase 1: MVP (Core Pipeline)

**목표**: PR이 올라오면 리뷰하고 GitHub에 결과를 남기는 최소 파이프라인

- [ ] 프로젝트 초기화 (Node.js + TypeScript)
- [ ] Webhook 서버 구현 (Express, HMAC 검증)
- [ ] GitHub API 연동 (PR diff 가져오기, 리뷰 제출)
- [ ] OMC + Claude Code 리뷰 실행 워커
- [ ] 점수 기반 자동 판단 로직 (Approve / Request Changes / Comment)
- [ ] 인라인 코멘트 (Critical/Major)
- [ ] Docker 컨테이너화
- [ ] GCP 배포 (Cloud Run 또는 GCE)

**Deliverable**: WIGTN org에 webhook 연결, PR 시 자동 리뷰 + GitHub 코멘트

### Phase 2: Queue + Discord

**목표**: 안정적인 큐잉과 Discord 알림

- [ ] Redis + BullMQ 큐 시스템
- [ ] 동시성 제어 (concurrency: 2)
- [ ] 재시도 로직 (3회, exponential backoff)
- [ ] Discord Webhook 알림 (시작/완료/긴급)
- [ ] Draft PR / 라벨 기반 스킵
- [ ] 헬스 체크 엔드포인트

**Deliverable**: 안정적인 큐 처리 + Discord 실시간 알림

### Phase 3: Configuration + Logging

**목표**: Repo별 커스터마이징과 로그 분석

- [ ] `.github/auto-review.yml` 파싱 및 적용
- [ ] SQLite 리뷰 로그 저장
- [ ] `/re-review` 코멘트 트리거
- [ ] Duplicate 요청 방지 (Delivery ID 체크)
- [ ] Docker Compose (서버 + Redis + 워커)

**Deliverable**: Repo별 설정, 리뷰 이력 조회 가능

### Phase 4: Analytics + Polish

**목표**: 통계와 안정성 개선

- [ ] 주간/월간 리뷰 통계 Discord 리포트
- [ ] Discord Bot 명령어 (`/review-stats`)
- [ ] 에러 알림 (리뷰 실패 시 Discord 알림)
- [ ] GCP 모니터링 (Cloud Logging, Uptime Check)
- [ ] 문서화 (README, 설정 가이드)

**Deliverable**: 운영 가능한 완성 서비스

## 7. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| 리뷰 자동 처리율 | > 95% PR 자동 리뷰 | 리뷰 로그 / 전체 PR 수 |
| 리뷰 완료 시간 | < 5분 (Level 2) | 리뷰 로그 duration_ms |
| 리뷰 정확도 | Critical 이슈 미탐율 < 5% | 사람 리뷰와 비교 |
| 가용성 | 99% uptime | GCP Uptime Check |
| Discord 알림 지연 | < 5초 | 로그 타임스탬프 비교 |
| 개발자 만족도 | > 4/5점 | 월간 설문 |

## 8. Tech Stack Summary

| Component | Technology |
|-----------|-----------|
| Language | TypeScript (Node.js 22+) |
| Web Framework | Express (또는 Hono) |
| Queue | BullMQ + Redis |
| Review Engine | OMC + Claude Code CLI + wigtn-coding pr-reviewer |
| GitHub | gh CLI + GitHub REST API (Octokit) |
| Discord | Discord.js (Bot) + Webhook (알림) |
| Database | SQLite (better-sqlite3) |
| Container | Docker + Docker Compose |
| Hosting | GCP (Cloud Run 또는 GCE e2-medium) |
| CI/CD | GitHub Actions |
| Secrets | GCP Secret Manager |
| Monitoring | GCP Cloud Logging + Uptime Check |

## 9. Cost Estimate (Monthly)

| Item | Estimated Cost |
|------|---------------|
| GCP GCE e2-medium (2 vCPU, 4GB) | ~$25/month |
| GCP Memorystore Redis (basic, 1GB) | ~$35/month (또는 Docker Redis: $0) |
| Claude API (Anthropic) | ~$50-200/month (PR 양에 따라) |
| Domain + SSL (Let's Encrypt) | $0-12/year |
| **Total** | **~$60-260/month** |

> Docker Redis를 사용하면 GCP 비용을 $25/month로 줄일 수 있음.
> Claude Max subscription 사용 시 API 비용 절감 가능.
