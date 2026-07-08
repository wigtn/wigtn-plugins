# Mobile Multi-Agent Orchestrator Handoff

작성일: 2026-06-29  
상태: 제품 아이디어/사업 검증용 handoff  
작성 맥락: Codex + Claude Code 등 AI 코딩 에이전트를 모바일/웹에서 통합 제어하는 신규 제품 검토
수정 메모: 2026-06-29 기준 경쟁 재검토 후, 개인용 모바일 리모컨이 아니라 팀/기업용 보안 운영 control plane으로 포지션 조정

## 1. 요약

WIGTN이 검토 중인 제품은 단순한 AI 연구 도구가 아니라, 팀이 여러 AI 코딩 에이전트를 GitHub/Linear/CI 워크플로 위에서 안전하게 운영하도록 돕는 상위 레이어 앱이다.

핵심 포지션:

> WIGTN은 소스코드를 고객 인프라 밖으로 내보내지 않으면서, 여러 AI 코딩 에이전트를 GitHub/Linear/CI 워크플로 위에서 안전하게 지휘하고, 정책/감사/자동화로 운영까지 책임지는 팀용 AI 개발 control plane이다.

2026년 기준으로 AI 코딩 에이전트 앱은 이미 많다. OpenAI Codex, Claude Code, Omnara, Devin, Factory Droid, Codegen, Google Jules, Cursor Background Agents, Replit Agent, Vibe Kanban, VibeTunnel 등이 존재한다. 따라서 "모바일에서 AI 코딩 에이전트를 제어한다"는 전제만으로는 차별화가 어렵다.

차별화 가설은 모바일이 아니라 다음에 있다.

- self-hosted runner로 소스코드가 고객 인프라 밖으로 나가지 않게 한다.
- 조직 정책으로 어떤 agent가 어떤 repo/file/action을 수행할 수 있는지 통제한다.
- 모든 agent 작업을 audit log, PR, check, approval flow로 남긴다.
- CI 실패, PR 리뷰, dependency update, 보안 패치 같은 운영 자동화를 팀 단위로 제공한다.
- BYOK/자체 계정 연결을 기본 모델로 검토해 라이선스와 API 재판매 리스크를 줄인다.

## 2. 문제 정의

현재 사용자는 Codex, Claude Code, Cursor, Devin, GitHub Copilot, OpenCode, Aider 등 여러 AI 코딩 도구를 따로 사용한다. 각 도구는 강력하지만 실제 개발 업무로 연결하려면 사용자가 직접 많은 일을 해야 한다.

- repo 열기
- 작업 지시
- 중간 로그 확인
- 실패 시 재시도
- 테스트 실행
- diff 확인
- branch/commit/PR 생성
- 리뷰 요청
- 후속 수정 요청
- 모바일에서 상태 확인

WIGTN 앱의 역할은 이 과정을 다음처럼 단순화하는 것이다.

- 작업 맡기기
- 상태 확인하기
- 결과 검토하기
- 승인하거나 추가 지시하기

사용자가 구매하는 것은 "AI 모델"이 아니라 "완료된 개발 작업을 신뢰할 수 있게 받는 흐름"이다.

## 3. 2026년 기준 시장 지형

### 3.1 직접 경쟁/유사 제품

| 제품 | 형태 | Codex | Claude Code | 모바일/웹 제어 | 메모 |
|---|---|---:|---:|---:|---|
| OpenAI Codex | 공식 agent/CLI/웹/앱 계열 | O | X | 일부 O | Codex 단독 경험 |
| Claude Code on the web / remote control | 공식 Claude Code 원격 제어 | X | O | O | Claude 단독 경험 |
| Omnara | agent command center 계열 | 일부/검증 필요 | 일부/검증 필요 | O | 개인용/모바일 agent control 경쟁 후보, 실사용 검증 필요 |
| GitHub Agent HQ | GitHub issue/PR 중심 control layer | 부분 O | 부분 O | O | GitHub 중심 |
| Vibe Kanban | 오픈소스 웹 UI | O | O | 웹으로 가능 | 멀티 CLI agent 칸반, 유지보수 리스크 |
| VibeTunnel | 웹/폰 터미널 리모컨 | O | O | O | terminal control layer |
| Claude Squad | 터미널 TUI | O | O | SSH로 가능 | tmux + git worktree 기반 |
| Devin | 상용 AI SWE SaaS | 자체 | 자체 | O | 자체 에이전트 중심 |
| Factory Droid | 상용 AI SWE/agent workforce | 자체 | 자체/모델 연동 | O | 엔터프라이즈 지향 |
| Codegen | 상용 PR/issue 자동화 SaaS | 자체 | 자체/모델 연동 | O | repo 작업 자동화 |
| Google Jules | 웹 기반 async coding agent | X | X | O | Google agent 단독 |
| Cursor Background Agents | IDE/cloud agent | 모델 기반 | 모델 기반 | 일부 O | Cursor 생태계 |

### 3.2 판단

"앱이 없다"는 표현은 부정확하다. 2026년에는 AI 코딩 agent 앱과 웹 서비스가 이미 많다.

정확한 빈칸은 "모바일 제어"가 아니라 다음이다.

> 보안 민감한 팀/기업이 자기 인프라 안에서 여러 AI 코딩 에이전트를 정책 기반으로 운영하고, 감사 가능하게 자동화하는 control plane.

### 3.3 기존 제품의 주요 약점 가설

실사용 검증이 필요하지만, WIGTN이 파고들 수 있는 약점은 다음이다.

| 제품군 | 강점 | 잠재 약점 | WIGTN 기회 |
|---|---|---|---|
| 벤더 네이티브 원격 기능 | 공식 지원, 쉬운 UX | 단일 agent/단일 벤더 중심 | 여러 agent를 조직 정책으로 통제 |
| Omnara/모바일 command center | 모바일 제어, 개인 생산성 | 개인용 UX 중심일 가능성, enterprise policy/audit 약할 수 있음 | 팀/기업 보안 운영 레이어 |
| GitHub Agent HQ | GitHub 네이티브, issue/PR UX | GitHub 중심, Linear/Slack/자체 runner/비GitHub CI 확장성 검증 필요 | GitHub 외 워크플로와 self-hosted runner |
| Devin/Factory/Codegen/Jules | 완성형 AI SWE 경험 | 자체 agent/자체 플랫폼 중심, 외부 Claude Code/Codex 조합 선택권 제한 가능 | agent-neutral control plane |
| Cursor/Replit/Windsurf 계열 | IDE/개발 경험 강함 | IDE 또는 특정 플랫폼 종속 | repo 운영/정책/감사/자동화 중심 |
| Vibe Kanban/VibeTunnel/Claude Squad | 멀티 agent 조작 가능 | 파워유저/로컬 도구 성격, 기업 운영 기능 약함 | managed + self-hosted + audit + policy |

검증 질문:

- Omnara가 조직 단위 정책, audit log, self-hosted runner, BYOK, file-level exclusion, PR approval policy를 제공하는가?
- GitHub Agent HQ가 GitHub 바깥의 Linear/Slack/외부 CI/self-hosted runner까지 일관되게 지휘하는가?
- Devin/Factory/Codegen이 고객이 원하는 agent를 선택하게 해주는가, 아니면 자체 agent 플랫폼으로 lock-in하는가?
- 기존 제품들이 "코드가 고객 인프라 밖으로 안 나간다"를 강하게 보장하는가?
- 기존 제품들이 예약 자동화, 정책 위반 차단, 비용 한도, 승인 단계, 감사 로그를 한 제품 안에서 제공하는가?

### 3.4 경쟁 제품 공통 약점 가설

아래 항목은 시장 조사와 실사용 검증이 필요한 가설이다. 다만 WIGTN의 차별화 방향을 잡기에는 충분히 강한 문제 영역이다.

#### 3.4.1 비용 폭발과 통제 부재

AI coding agent는 단일 completion 도구가 아니라 repo 탐색, shell 실행, 재시도, 리뷰, 수정, 병렬 agent fan-out을 수행한다. 따라서 비용이 "프롬프트 1회" 단위가 아니라 "작업 1건" 단위로 폭발할 수 있다.

사용자가 겪는 문제:

- 한 작업이 수십~수백 번의 model/tool request로 확장된다.
- agent가 재귀적으로 재시도하거나 여러 모델을 fan-out하면 비용 예측이 어렵다.
- 조직 관리자는 repo/team/user/job 단위 사용량을 실시간으로 보기 어렵다.
- 월간 예산 초과 전 자동 정지, 경고, 승인 요청이 부족하다.

WIGTN 차별화:

- org/team/repo/user/schedule/task 단위 budget cap
- 실시간 cost meter
- 작업 시작 전 예상 비용 범위 표시
- 비용 초과 예상 시 자동 pause
- 고비용 agent fan-out은 사전 승인
- cost anomaly detection
- BYOK/Bring Your Own Account 사용량 분리 표시

제품 기능 이름 후보:

```text
Cost Guard
Agent Budget Firewall
Runaway Agent Kill Switch
```

#### 3.4.2 머지 안전성 문제

AI agent가 PR을 많이 만들수록 리뷰 비용과 머지 위험은 줄지 않고 오히려 증가할 수 있다. 특히 agent가 "green CI"를 만들기 위해 테스트를 삭제하거나, lint를 우회하거나, `|| true` 같은 패턴을 추가하는 경우를 탐지해야 한다.

사용자가 겪는 문제:

- 컴파일과 테스트는 통과하지만 비즈니스 로직이 틀린 코드
- 권한 체크 누락, edge case 누락, off-by-one 같은 조용한 오류
- 테스트 삭제/완화, mock 과다 사용, lint skip, flaky test 무시
- 사람이 모든 AI PR을 직접 꼼꼼히 리뷰해야 함

WIGTN 차별화:

- CI 조작 탐지
- 테스트 삭제/완화 탐지
- security-sensitive diff 탐지
- 독립 verifier agent cross-review
- PR merge 전 evidence report
- risk score
- 변경 파일별 근거, 테스트 근거, 남은 리스크 표시
- agent가 만든 변경과 verifier가 만든 판단을 분리

제품 기능 이름 후보:

```text
Verifier Gate
Evidence-Based Merge Report
CI Tamper Detection
```

#### 3.4.3 프라이버시/컴플라이언스 구멍

보안 민감 조직은 "agent가 코드를 잘 짠다"보다 "코드가 어디로 가는가", "누가 어떤 권한으로 실행했는가", "감사 가능한가"를 먼저 본다.

사용자가 겪는 문제:

- GitHub.com 전용이거나 특정 SCM만 지원
- GHES/GitLab/Bitbucket/on-prem 지원 부족
- source retention, prompt retention, log retention 정책이 불명확
- org-level RBAC, SSO, audit log, approval policy가 부족
- E2EE/self-hosted runner/source retention 0 보장이 약함

WIGTN 차별화:

- self-hosted runner first
- source retention 0
- 원본 파일 내용 cloud 전송 금지 모드
- audit log export
- SSO/SAML/SCIM
- org/repo/path/action/model 단위 policy
- GitHub/GitLab/Bitbucket/GHES 확장 전략
- BYOK/private model gateway
- `.wigtnignore` + org-level content exclusion

제품 기능 이름 후보:

```text
Source-Zero Mode
Private Runner
Agent Policy Engine
Compliance Audit Trail
```

#### 3.4.4 가짜 클라우드와 벤더 잠금

일부 제품은 원격 제어 UX는 제공하지만 실제 실행은 사용자의 노트북/터미널 상태에 의존하거나, 특정 벤더 agent/model에 잠겨 있을 수 있다.

사용자가 겪는 문제:

- 노트북이 sleep 상태면 작업이 멈춤
- cloud 이전이 수동이거나 기능 제한이 있음
- 로컬 Docker/터미널 세션 관리가 필요함
- 단일 agent/vendor/model만 사용 가능
- agent 비교, 체이닝, fallback이 어려움

WIGTN 차별화:

- always-on managed runner
- self-hosted runner
- agent-neutral orchestration
- Codex/Claude/other agents compare/chain/fallback
- runner health check
- interrupted run resume
- cross-agent result comparison

제품 기능 이름 후보:

```text
Always-On Runner
Agent Mesh
Multi-Agent Fallback
```

## 4. 제품 컨셉

제품 한 문장:

> WIGTN은 소스코드를 고객 인프라 밖으로 내보내지 않으면서, 여러 AI 코딩 에이전트를 GitHub/Linear/CI 워크플로 위에서 안전하게 지휘하고, 정책/감사/자동화로 운영까지 책임지는 팀용 AI 개발 control plane이다.

오케스트레이터의 본질:

- 코드를 직접 잘 짜는 AI가 아니라, 일을 해석하고 적절한 agent에게 맡기는 상위 관리자
- agent 실행을 감시하고, 실패하면 복구하고, 결과물을 사람이 판단 가능한 형태로 정리
- 보안 정책, 비용 한도, 민감 파일 제외, 테스트/빌드 검증, PR 생성, 감사 로그까지 담당
- 모바일은 승인/알림/상태 확인 채널이지 핵심 포지션이 아니다.

## 5. 사용자 첫 경험

초기 UX는 반드시 단순해야 한다. 사용자가 GitHub CLI, Claude Code, Codex CLI를 로컬에 설치하게 만들면 진입 장벽이 높다.

개인/Pro용 첫 경험:

```text
1. WIGTN 앱 접속
2. "GitHub로 시작하기" 클릭
3. GitHub 권한 승인
4. 접근할 repo 선택
5. 기본 agent 선택: Auto / Codex / Claude / 둘 다 비교
6. 작업 입력
7. PR 결과 받기
```

예시 화면:

```text
무엇을 바꿀까요?
[ 로그인 페이지 모바일 깨짐 고쳐줘                 ]

대상 repo
[ hyeonman/wigvo-v2                      ]

작업 방식
[ Auto 추천 ] [ Codex ] [ Claude ] [ 둘 다 비교 ]

[ 작업 시작 ]
```

사용자에게 "GitHub App 설치"라고 표현하면 로컬 설치로 오해할 수 있다. UX 문구는 "GitHub 연결", "repo 접근 허용", "GitHub 권한 승인" 정도가 적절하다.

팀/기업용 첫 경험은 다르게 설계한다.

```text
1. GitHub org 연결
2. repo 또는 team 범위 선택
3. self-hosted runner 또는 managed runner 선택
4. 기본 정책 선택
   - 소스코드 외부 전송 금지
   - PR 생성까지만 허용
   - main push 금지
   - secret/file exclusion 기본 적용
5. Linear/Slack/CI 연결
6. 첫 자동화 템플릿 선택
   - PR Auto Review
   - Nightly CI Fix
   - Weekly Maintenance
```

팀/기업 고객에게는 "작업 입력창"보다 "정책/승인/감사 가능한 운영 흐름"이 먼저 보여야 한다.

## 6. 실행 흐름

MVP의 기본 실행 방식은 PR 중심이어야 한다.

```text
1. 사용자 작업 생성
2. WIGTN control plane이 runner 생성
3. 사용자가 허용한 repo 임시 clone
4. 새 branch 생성
5. agent 실행
6. 코드 수정
7. lint/test/build 실행
8. diff 요약 생성
9. branch push
10. PR 생성
11. 사용자에게 모바일/웹 알림
```

main branch 직접 push는 기본 금지한다. 모든 변경은 branch + PR로 남기는 것이 신뢰와 안전성에 유리하다.

## 7. 결과물 표시 방식

사용자에게 raw terminal log를 먼저 보여주면 안 된다. 기본 결과물은 "업무 결과 보고서"여야 한다.

완료 화면 예시:

```text
작업 완료
로그인 모바일 레이아웃 수정

변경 요약
- LoginForm 레이아웃 overflow 수정
- 모바일 breakpoint에서 버튼 spacing 조정
- 관련 테스트 2개 추가

검증
- Build 통과
- Test 통과
- Typecheck 통과

변경
5 files changed
+128 -43

[미리보기] [Diff] [PR 열기]
[추가 요청하기]
```

실행 중 화면은 단계 중심으로 보여준다.

```text
분석 중
관련 파일 찾는 중
수정 중
테스트 실행 중
실패 원인 수정 중
PR 생성 중
```

고급 사용자는 "터미널 보기"를 눌러 로그를 볼 수 있게 한다.

## 8. 프리뷰와 검증

프론트엔드 작업:

- runner에서 dev server 실행
- preview URL 제공
- before/after screenshot 생성
- desktop/mobile viewport 캡처

백엔드/API 작업:

- endpoint 테스트 결과 제공
- status code, response shape, failure case 요약

라이브러리/리팩터링:

- public API 변경 여부
- 테스트 결과
- bundle size 변화
- migration 필요 여부

## 9. 오케스트레이터의 역할

오케스트레이터는 다음 책임을 가진다.

```text
1. 작업 해석
   예: "로그인 페이지 모바일 깨짐 고쳐줘"
   -> UI bugfix, frontend, low/medium risk

2. repo 준비
   clone, branch 생성, dependency install, project type 감지

3. agent 선택
   Codex 1차 구현, Claude 리뷰
   또는 Codex/Claude 병렬 실행 후 비교

4. context 제한
   민감 파일 제외, 관련 파일만 agent에 제공, 큰 파일/secret 차단

5. 실행 감독
   timeout, 무한 루프, 비용 초과, 테스트 실패, 권한 오류 감시

6. 검증
   lint, typecheck, test, build, e2e, screenshot, API check

7. 결과 정리
   변경 요약, 리스크, 테스트 결과, PR 링크 생성

8. 후속 루프
   사용자 추가 요청을 같은 PR/branch에 추가 commit으로 반영
```

### 9.1 1급 기능으로 올릴 것

기존 설계에서 "감시"나 "검증"으로 묶었던 기능을 제품의 핵심 차별화 기능으로 올린다.

1. Cost Guard

```text
- 작업 시작 전 예상 비용 범위
- 실행 중 실시간 비용 meter
- org/team/repo/user/task/schedule 단위 cap
- fan-out 전 승인
- 초과 시 자동 pause/kill
- 비용 리포트와 anomaly alert
```

2. Verifier Gate

```text
- agent output과 verifier 판단 분리
- 테스트 삭제/완화 탐지
- lint/typecheck/CI 우회 탐지
- 보안 민감 코드 변경 탐지
- 독립 cross-review
- merge 전 evidence report
```

3. Policy Engine

```text
- 어떤 agent가 어떤 repo/path/action을 수행할 수 있는지 제한
- main push 금지
- PR 생성까지만 허용
- 특정 파일/디렉터리 LLM 전송 금지
- 자동 merge 금지 또는 조건부 허용
- 비용/시간/토큰/runner minute 제한
```

4. Compliance Audit Trail

```text
- 누가
- 언제
- 어떤 repo에서
- 어떤 agent/model/provider로
- 어떤 권한과 정책 아래
- 어떤 파일을 바꾸고
- 어떤 테스트/검증을 통과했는지 기록
```

## 10. 데이터 프라이버시와 코드 저장 전략

중앙 서버에 고객 소스코드를 영구 저장하는 구조는 피해야 한다. 권장 아키텍처는 다음이다.

```text
모바일 앱 / 웹 대시보드
  -> WIGTN Control Plane
      - 작업 상태
      - repo 연결 정보
      - agent 선택
      - PR/branch/task metadata
      - 최소 로그
  -> Ephemeral Runner
      - GitHub repo 임시 clone
      - Codex / Claude Code / agent 실행
      - diff, test result, PR 생성
      - TTL 후 workspace 삭제
```

저장 원칙:

- 원본 소스코드는 기본적으로 영구 저장하지 않음
- 작업용 clone은 임시 runner에만 존재
- 결과는 PR/diff/test report 중심으로 저장
- 로그와 프롬프트는 짧은 TTL 적용
- Team/Enterprise는 self-hosted runner를 핵심 기능으로 제공

권장 제한:

| 항목 | 추천 |
|---|---:|
| SaaS가 직접 보관하는 repo 원본 | 가능하면 0GB |
| 작업용 임시 clone | repo당 1-5GB까지 지원 |
| MVP soft cap | repo 1GB |
| MVP hard cap | repo 5GB |
| 영구 저장 인덱스 | 원본 repo의 1-10% 이내 |
| 대형 파일 | 기본 제외 |

민감 파일 기본 제외:

```text
.env
.env.*
*.pem
*.key
*.p12
*.pfx
id_rsa
secrets.*
credentials.*
node_modules/
dist/
build/
target/
vendor/
coverage/
*.sqlite
*.db
*.dump
*.csv
*.parquet
```

고객이 `.wigtnignore`로 추가 제외 경로를 지정할 수 있어야 한다.

### 10.1 Self-hosted runner 우선 검증

경쟁 차별화가 프라이버시라면 self-hosted runner를 "나중"으로 미루면 안 된다. PoC #2에서 반드시 검증한다.

목표:

```text
WIGTN Cloud
  - 작업 생성
  - 정책 저장
  - 상태/알림/감사 로그
  - PR 링크 관리

Customer Runner
  - repo clone
  - agent 실행
  - dependency install
  - test/build
  - branch push / PR 생성
  - workspace cleanup
```

보안 원칙:

- runner outbound 연결만 허용하는 구조 검토
- WIGTN Cloud가 고객 네트워크로 직접 inbound 접근하지 않음
- repo token은 runner에 저장하거나 고객 secret manager에서 주입
- logs는 redaction 후 metadata 중심으로 전송
- 원본 파일 내용은 기본 전송 금지
- 필요한 경우 diff 통계와 PR 링크만 WIGTN Cloud에 저장

PoC 성공 기준:

- 고객 머신/서버 안에서 작업이 끝난다.
- WIGTN Cloud에는 원본 소스코드가 저장되지 않는다.
- 모바일/웹에서는 상태, 요약, 검증 결과, PR 링크를 볼 수 있다.
- audit log로 누가/언제/어떤 agent에게/어떤 권한으로 작업시켰는지 추적 가능하다.

## 11. GitHub 연결 UX

사용자는 GitHub를 로컬에 설치하지 않는다. 필요한 것은 GitHub 웹 권한 승인이다.

```text
1. WIGTN 앱에서 GitHub로 로그인
2. GitHub 권한 승인 화면
3. 접근 허용할 repo 선택
4. 완료
```

구현은 OAuth만 쓰기보다 GitHub App이 적절하다.

필요 권한 예시:

- Contents: read/write
- Pull requests: read/write
- Issues: read/write
- Checks: read/write
- Metadata: read

기본적으로 secrets 접근은 금지한다.

## 12. 플랜 구조

라이선스/사업모델은 MVP 아키텍처 전에 결정해야 한다. 특히 Claude Code/Codex 구독이나 API 사용권을 재판매할 수 있는지, 사용자가 본인 계정으로 연결해야 하는지에 따라 제품 구조와 가격이 달라진다.

권장 기본값:

- BYOK/Bring Your Own Account를 기본 가정으로 둔다.
- WIGTN 번들 크레딧은 개인/체험 플랜에 한정하거나 별도 법무 검토 후 제공한다.
- Team/Enterprise는 고객의 OpenAI/Anthropic/Vercel/OpenRouter 계정 또는 사내 gateway를 연결하게 한다.
- WIGTN은 "모델 재판매"가 아니라 runner, policy, audit, workflow automation, orchestration에 과금한다.

### 12.1 개인/무료 플랜

```text
GitHub 로그인
-> repo 선택
-> WIGTN 기본 agent 사용
-> PR 생성
```

목표는 세팅을 최소화하는 것이다.

### 12.2 Pro 플랜

```text
GitHub 로그인
-> OpenAI/Anthropic 계정 연결
-> Codex/Claude 선택 가능
-> 병렬 비교 가능
-> 더 긴 작업/더 많은 runner minutes
```

### 12.3 Team/Enterprise 플랜

```text
GitHub org 연결
-> self-hosted runner 설치
-> Linear/Slack 연결
-> 보안 정책 설정
-> audit log
-> BYOK / provider policy 설정
```

기업 고객에게는 self-hosted runner가 핵심이다. 코드는 고객 환경 안에서 clone/수정/test되고, WIGTN cloud는 명령/상태/metadata만 관리한다.

## 13. 자동 스케줄러

스케줄러는 핵심 기능 후보이다. 제품이 "지금 AI에게 시키는 버튼"을 넘어 개발 운영 도구가 되려면 자동화가 필요하다.

MVP 템플릿:

```text
1. Nightly Fix
   매일 밤 CI/lint/test 실패를 확인하고 수정 PR 생성

2. PR Auto Review
   새 PR이 열리면 Claude/Codex가 리뷰하고 코멘트

3. Weekly Maintenance
   매주 dependency, TODO, type error, dead code 정리 제안

4. Cost Watch
   예산 소진 속도, 고비용 job, runaway agent를 감시하고 자동 정지
```

자동화 수준:

| Level | 설명 |
|---:|---|
| 0 | 알림만 |
| 1 | 분석 리포트 생성 |
| 2 | 수정 PR 생성 |
| 3 | 리뷰 반영 commit 추가 |
| 4 | 자동 merge |

기본값은 Level 2까지만 허용하는 것이 안전하다. 자동 merge는 별도 정책으로만 켠다.

스케줄러 생성 UX:

```text
자동 작업 만들기

언제 실행할까요?
[ 매일 ] [ 매주 ] [ PR 열릴 때 ] [ CI 실패 시 ]

무엇을 할까요?
[ 실패한 테스트 고치기 ]
[ PR 리뷰하기 ]
[ dependency 업데이트 ]
[ 타입 에러 정리 ]

어디까지 자동으로 할까요?
[ 리포트만 ] [ PR 생성까지 ] [ 수정 commit까지 ]

[ 스케줄 저장 ]
```

## 14. MVP 범위

초기 MVP는 다음만 포함하는 것이 적절하다.

필수:

- GitHub login/connect
- repo 선택
- 자연어 작업 생성
- managed ephemeral runner
- branch 생성
- agent 실행
- test/build 실행
- 변경 요약
- PR 생성
- 모바일/웹 작업 상태 화면
- 추가 요청을 같은 PR에 반영

권장:

- Auto/Codex/Claude/Compare 선택
- 민감 파일 자동 제외
- `.wigtnignore`
- basic preview/screenshot
- PR auto review
- nightly CI fix template

PoC #2로 당길 것:

- self-hosted runner
- org policy 최소 버전
- audit log 최소 버전
- cost guard 최소 버전
- verifier gate 최소 버전

나중:

- Linear/Slack integration
- BYOK
- automatic merge
- 여러 agent의 결과 비교 UI 고도화

## 15. 주요 리스크

### 15.1 사용자 세팅 복잡도

로컬 CLI 설치, API key 입력, runner 설치를 첫 경험에 넣으면 이탈 가능성이 높다.

대응:

- MVP는 GitHub 연결만으로 시작
- Claude/Codex 계정 연결은 Pro/advanced로 분리
- self-hosted runner는 enterprise 옵션

### 15.2 코드 프라이버시

고객 소스코드를 WIGTN 서버에 영구 저장하면 법무/보안 장벽이 높아진다.

대응:

- ephemeral runner
- source retention 0 원칙
- log TTL
- `.wigtnignore`
- self-hosted runner
- provider별 retention policy 노출

### 15.3 기존 제품과의 경쟁

Omnara, GitHub Agent HQ, Claude Code remote control, OpenAI Codex, Devin, Factory, Codegen, Jules 등 이미 강한 경쟁자가 존재한다.

대응:

- "또 하나의 개인용 모바일 agent 리모컨"이나 "또 하나의 AI SWE"가 아니라 "팀/기업용 보안 운영 control plane"으로 포지셔닝
- 기존 agent 생태계를 대체하지 않고 연결
- self-hosted runner, policy, audit, approvals, scheduled operations를 차별화

### 15.4 결과 신뢰성

AI가 만든 변경을 사용자가 신뢰하지 못하면 제품 가치가 낮아진다.

대응:

- 항상 PR 기반
- tests/build/checks 표시
- before/after preview
- risk label
- Claude/Codex cross-review
- 사용자 승인 전 merge 금지

### 15.5 비용 신뢰성

AI coding agent 작업은 비용이 예측 불가능하면 조직 도입이 어렵다. 특히 병렬 agent, 반복 수정, 긴 context, browser/test loop가 결합되면 사용자가 체감하는 비용 리스크가 커진다.

대응:

- 모든 작업에 budget envelope 필요
- 기본 cap 없이는 fan-out 금지
- 예상 비용과 실제 비용 비교
- org admin dashboard
- schedule별 월간 비용 한도
- 초과 시 자동 중단

## 16. 추천 다음 단계

1. Omnara와 GitHub Agent HQ를 실제로 사용해 보고, WIGTN이 못 박을 차별점 한 문장을 검증한다.
2. 라이선스/사업모델을 먼저 결정한다: BYOK/Bring Your Own Account 기본인지, WIGTN API 비용 번들인지 확정한다.
3. GitHub App 기반 repo 연결 PoC를 만든다.
4. ephemeral runner에서 repo clone -> branch -> 간단 수정 -> PR 생성까지 end-to-end PoC를 만든다.
5. self-hosted runner PoC를 바로 이어서 만든다. 고객 인프라 밖으로 원본 코드가 나가지 않는 것을 증명한다.
6. Cost Guard PoC를 만든다. 작업별 예상 비용, 실시간 비용, hard cap, 자동 중단을 검증한다.
7. Verifier Gate PoC를 만든다. 테스트 삭제/완화, lint 우회, `|| true`, 보안 민감 변경 탐지를 검증한다.
8. 최소 org policy/audit log를 붙인다.
9. 결과 화면은 terminal log가 아니라 업무 결과 보고서 형식으로 검증한다.
10. 스케줄러는 `PR Auto Review`, `Nightly CI Fix`, `Cost Watch` 세 템플릿부터 검증한다.

## 17. 최종 판단

기술적으로 가능하다. 다만 제품의 성공은 agent 성능 자체보다 다음에 달려 있다.

- 세팅이 쉬운가
- 코드 프라이버시를 납득시킬 수 있는가
- 결과를 PR/preview/test report로 신뢰 가능하게 보여주는가
- 사용자가 모바일에서 "개발 일을 맡겼다"는 경험을 받는가
- 기존 agent 앱을 대체하지 않고 지휘하는 포지션을 명확히 잡는가

권장 포지션:

> WIGTN은 소스코드를 고객 인프라 밖으로 내보내지 않으면서, 여러 AI 코딩 에이전트를 GitHub/Linear/CI 워크플로 위에서 안전하게 지휘하고, 정책/감사/자동화로 운영까지 책임지는 팀용 AI 개발 control plane이다.
