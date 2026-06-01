# Opus 4.8 대응 — wigtn-coding 수정 방향 (확정본)

> 대상 모델: **Claude Opus 4.8** (`claude-opus-4-8`, 2026-05-28 출시)
> 상태: 코드 검증 완료 → 실행 항목 적용됨. #3·#4는 검토 후 드롭.
> 결론 요약: **실행 4건(#1 모델테이블+버전/카운트 동기화, #2 effort, #5·#6 설계, #7 백로그), 드롭 2건(#3·#4).**

---

## 0. 배경 — 4.8 변경 중 플러그인에 실제로 닿는 것

| 변경 | 영향 |
|---|---|
| **Effort가 주 레버** (low/medium/high/xhigh/max, 4.8 기본 = high) | 예전엔 프롬프트 scaffolding이 하던 일을 effort가 함. 코딩은 xhigh 권장 |
| **Adaptive thinking이 유일 모드** | 수동 `thinking:{budget_tokens}`는 400 에러. → 우리 코드엔 없음(점검 완료) |
| **Honesty 업그레이드** | 자기 코드 결함 4배 덜 통과 + 불확실하면 거부/플래그 |
| **Dynamic Workflows** (research preview) | CC 네이티브 병렬 서브에이전트(≤16 동시/≤1000 총). v2.1.154+, Max/Team/Ent |
| **Mid-conversation system messages** | 실행 중 지시 주입을 캐시 안 깨고. API/SDK 레벨 |
| **temperature/top_p/top_k 제거**, **1M 컨텍스트 기본**, **fast mode 저렴** | — |

> 점검 결과: 하드코딩 model ID(추천 테이블 제외)·수동 thinking·sampling 파라미터 **없음**. 런타임 breakage 0.

---

## 1. [완료] 모델 ID + 버전/카운트 동기화

**1-A. ai-agent.md 추천 테이블 갱신 (전 프로바이더).**
구버전 `gpt-4o`·`claude-sonnet-4`·`gemini-2.0-flash`(2026-06-01 종료) 등이 전 프로바이더에서 깨져 있었음. 갱신:
- 빠름/저비용 → `claude-haiku-4-5` / `gpt-5.5-instant` / `gemini-3.5-flash`
- 균형 → `claude-sonnet-4-6` / `gpt-5.5` / `gemini-3.5-flash`
- 고정밀 → `claude-opus-4-8` / `gpt-5.5-pro` / `gemini-3.5-pro`
- 추천 테이블에 **"시점 예시 — 배포 시점 최신으로 교체"** 주석 추가 (재staleness 방지)

**1-B. 버전 0.1.7로 통일.** 기존: CLAUDE.md 2.0.0 / 루트 plugin.json 2.0.0 / marketplace.json 2.1.0 혼재 → 전부 `0.1.7`. wigtn-coding plugin.json에 version 필드 신규 명시.

**1-C. 카운트 드리프트 동기화.** agents 12→13, 루트 매니페스트 설명의 "3 commands/3·4 skills/12+ styles" → "5 commands/5 skills/20 styles", README.cn Skills 4→5.

> 적용 파일: `agents/ai-agent.md`, `CLAUDE.md`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `plugins/wigtn-coding/.claude-plugin/plugin.json`, `README{,.ko,.cn}.md`.

---

## 2. [완료] Effort 보정 — 13개 에이전트

전 13개가 `model: inherit` + effort 0건이라 세션 기본(high)으로 균일 동작했음. 성격별 보정:

| effort | 에이전트 | 근거 |
|---|---|---|
| **xhigh** | code-reviewer, prd-reviewer, pr-reviewer | 판단·재현율 헤비, 4.8 honesty 시너지 |
| **xhigh** | architecture-decision, backend-architect | 설계 추론 |
| **xhigh** | frontend-developer, mobile-developer, ai-agent | 코딩은 xhigh 시작 권장 |
| **high** | design-discovery | 탐색·옵션 생성 |
| **high** | parallel-digging-coordinator, parallel-review-coordinator, team-build-coordinator | 오케스트레이션·합성 판단 (헤비 작업은 서브에이전트에 위임) |
| **low** | code-formatter | 기계적, 토큰 절약 |

> 검증: 설치된 CC 버전에 따라 effort frontmatter 활성 여부가 다를 수 있음. 미지원 시 무시(graceful)되어 위험 낮음. 실제 Task 호출로 반영 여부 관찰 권장. (트래킹: anthropics/claude-code #31536)

---

## 3. [드롭] ~~auto-commit 80점 임계값 재보정~~

검토 결과 **active task에서 제외**. 이유:
- 80은 애초에 4.7로도 경험적 보정된 값이 아님(라운드 넘버) → 보정 기준선이 허상.
- 점수는 모델 주관값. 4.8이 엄격해져 더 막으면 calibration 붕괴가 아니라 **게이트가 정확해진 것**.
- adaptive thinking으로 점수 노이즈 → 10~20 PR 표본 분포는 정보량 낮음.
- 과차단은 4.8 첫 실사용에서 바로 드러남 → 사전 측정 스터디 불필요.

또한 원안의 "확신 강제 문구 완화"는 **대상이 코드에 0건**(grep 확인)이라 할 일 없음.

> **남은 것(watch only):** 4.8 전환 후 auto-commit pass율을 실사용에서 관찰, 눈에 띄게 과차단되면 그때만 임계값 손댄다. 절차적 must(`config 먼저`·`보안 다운그레이드 금지`)는 유지.

---

## 4. [드롭] ~~부정→긍정 프레이밍~~

완전 제외. 이유: #3이 "유지하라"고 한 절차적 must(`포맷 충돌 절대 금지`·`보안 절대 다운그레이드`)와 **충돌**하고, frontend/mobile 핵심 지침은 **이미 긍정형**. 가치 대비 노이즈.

---

## 5. [설계 회의] 병렬 코디네이터 vs Dynamic Workflows

대상: `parallel-digging-coordinator`, `parallel-review-coordinator`, `team-build-coordinator`.
DW가 동일 작업을 네이티브로 하지만 **research preview + v2.1.154+ + Max/Team/Ent 게이트** → 지금 제거 불가(폴백 필요).

방향: **(1)** 지금 뜯지 않음 **(2)** 커스텀 fan-out·동시성·재시도를 *더* 정교화하지 않음(플랫폼이 흡수) **(3)** 코디네이터 책임을 wigtn 고유 가치로 재정의(도메인 분해·SHARED_CONTEXT·품질게이트·한국어 UX) **(4)** 능력 감지 후 DW 위임 / 폴백 분기 **(5)** GA 모니터링.

---

## 6. [설계 회의] SHARED_CONTEXT vs Mid-conversation System Messages

Mid-conversation system message는 **API/SDK 레벨** → 플러그인 .md frontmatter로 설정 불가.
방향: **(1)** 플러그인에서 손수 흉내내지 않음 **(2)** 현실 레버 = Hooks로 근사 **(3)** DW에 fan-out 위임하면 캐시 보존형 중간 주입 이점을 *공짜로* 수혜 **(4)** SDK 경로는 현재 범위 밖.

---

## 7. [백로그] 1M 컨텍스트 기본

4.8 기본 1M. 우리 컨텍스트 전략(Phase 0 디스커버리, 스킬 분할)은 200k 가정으로 보수적 → 과도한 분할만 점진 완화.

---

## 실행 체크리스트

- [x] **#1** ai-agent 모델 테이블 + 버전 0.1.7 통일 + 카운트 드리프트 동기화
- [x] **#2** 에이전트 13개 effort 보정
- [ ] **#3** ~~드롭~~ → watch only (4.8 전환 후 pass율 관찰)
- [ ] **#4** ~~드롭~~
- [ ] **#5** 설계 회의 — 코디네이터 DW 폴백 구조 재설계
- [ ] **#6** 설계 회의 — SHARED_CONTEXT를 hooks/DW 경유로
- [ ] **#7** 백로그 — 1M 기준 컨텍스트 분할 완화
