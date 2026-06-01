# Screen Spec Skill — Refactor Plan

> **Status**: Planning (작업 착수 전)
> **Scope**: `plugins/wigtn-coding/skills/screen-spec/` + `plugins/wigtn-coding/commands/screen-spec.md`
> **목표**: 자기 모순 해소, 플랫폼 확장, 토큰 최적화, Mermaid 안정화

---

## 1. Executive Summary

현재 `screen-spec` 스킬은 명세상 **lo-fi wireframe**을 표방하지만 실제로는 디자인 토큰을 주입해 mid-fi mockup을 만들고 있으며, 템플릿에 특정 프로젝트 도메인 데이터가 박혀 있고, Mermaid 예시에 문법 버그가 있어 렌더링이 깨진다. 또한 웹 단일 플랫폼에만 대응하고 PRD 추론만으로 화면을 만들어 디테일이 떨어지는 한계가 있다.

이 문서는 발견된 **10개 문제점**과 그에 대한 **6개 액션 아이템**을 정리한다.

---

## 2. 문제점 카탈로그

### 2.1 디자인 철학 모순 (High)

| 항목 | 현상 | 위치 |
|---|---|---|
| Wireframe ≠ Mockup | "lo-fi 원칙"을 선언하면서 design-discovery 스타일 토큰(컬러/타이포/그림자)을 와이어프레임에 주입 → 결과물이 mid-fi mockup에 가까움 | SKILL.md:18, 71~92 + 04-WIREFRAME.html:8~28 |
| Phase 4 위상 불일치 | SKILL.md에선 frontend-developer 리뷰가 "안티패턴: 건너뛰지 않는다(필수)"로 기술 / commands에선 "Optional Quality Gate"로 기술 | SKILL.md:314 vs commands/screen-spec.md:105 |

**임팩트**: 리뷰어가 레이아웃이 아니라 컬러를 보고 피드백, 디자인 결정이 와이어프레임 단계에서 조기 고착화.

### 2.2 템플릿 도메인 오염 (High)

01-IA / 02-USER-FLOW / 03-SCREEN-SPEC / 04-WIREFRAME / 05-DEV-HANDOFF 전부 특정 프로젝트("골든셋 / SK에코플랜트 / @brain-crew.com / 슬라이드 7 / Supabase / harry@brain-crew.com")로 채워져 있다.

**임팩트**: 외부 사용자가 보일러플레이트로 잘못 복사 시 도메인 오염. 플러그인 배포 성격과 충돌.

### 2.3 Mermaid 문법 버그 (High)

Mermaid 노드 shape 규칙:
- `[text]` = 직사각형
- `[/text/]` = 사다리꼴(trapezoid)
- `[/text]` = **미완성 → 파싱 에러**
- `[(text)]` = cylinder
- `{(text)}` = **존재하지 않는 shape → 파싱 에러**

#### 발견된 실제 버그

| 파일 | 라인 | 문제 코드 | 진단 |
|---|---|---|---|
| SKILL.md | 124 | `Submit[/submit]` | 닫힘 없는 `[/text]`, **파싱 에러** |
| SKILL.md | 126 | `Save{(DB 저장)}` | 존재하지 않는 shape, **파싱 에러** |
| SKILL.md | 128 | `MyList[/my]` | 닫힘 없는 `[/text]`, **파싱 에러** |
| templates/02-USER-FLOW.md | 22 | `Submit[/submit 페이지/]` | 사다리꼴로 잘못 렌더링 (의도: 직사각형) |
| templates/02-USER-FLOW.md | 27 | `MyList[/my 목록/]` | 동일 |
| templates/02-USER-FLOW.md | 40 | `Edit[/submit?id= 페이지/]` | 사다리꼴 + `?=` 특수문자, 일부 파서 에러 |

#### 잠재 위험

- `01-IA.md`의 `mindmap` — 환경별 지원 편차 큼. 노드 첫 글자 `/`가 shape modifier로 오해될 수 있음.
- 한글 + 특수문자(`(`, `)`, `?`, `:`) 조합은 일부 렌더러에서 불안정.

### 2.4 플랫폼 한정 (Mid)

| 영역 | 현재 | 모바일(RN) 시 필요 |
|---|---|---|
| Wireframe | HTML + Tailwind CDN | JSX / NativeWind 또는 다른 모형 |
| 라우팅 | URL 라우트(`/submit`) | Stack/Tab/Drawer 네비 |
| Breakpoint | 1024 / 768 (CSS) | iPhone SE / 15 / iPad |
| 패턴 | hover, sticky, modal | safe area, bottom sheet, pull-to-refresh |

CLAUDE.md상 `design-discovery`와 `mobile-developer`는 모바일 지원이 명시되어 있으나, `screen-spec`만 웹으로 치우쳐 있다.

### 2.5 입력 디테일 부족 (Mid)

`/screen-spec`은 PRD를 그대로 추론해 산출물을 만든다. PRD에는 없지만 화면정의서에는 필수인 의사결정이 추론으로 처리됨:

- 네비게이션 패턴 (top / side / bottom / drawer)
- 밀도 선호 (compact / spacious)
- 에러 톤 (공식 / 친근)
- 빈 상태 철학 (일러스트형 / CTA only)
- 전환 방식 (modal / page / drawer)
- 모바일 vs 데스크탑 우선순위

이런 항목은 PRD 스코프 밖이라 추론하면 절반은 빗나간다.

### 2.6 부수 이슈 (Low~Mid)

| # | 항목 | 위치 | 비고 |
|---|---|---|---|
| a | 04-WIREFRAME.html 자체가 자체 룰("200줄 초과 시 분할") 위반 | 269줄 / SKILL.md:240 | |
| b | orphan reference: bc-frontend 가이드는 본 레포에 없음 | references/handoff-checklist.md:42 | |
| c | 재실행(re-run) 머지 정책 미정의 — 부분 재생성 시 머지 vs 덮어쓰기 불명 | SKILL.md:298~306 | |
| d | Python 의사코드 호출 예시가 실제 도구 호출 컨벤션과 불일치 | SKILL.md:75~88, 274~288 | |
| e | lo-fi 마크업이 a11y 미흡 (`<section id>`만, `aria-labelledby` 없음) | 04-WIREFRAME.html 전체 | |
| f | `--style` 인자 키 유효성 검증 절차 없음 | commands:54 / SKILL.md:91 | |
| g | `Has FE Components` 컬럼은 prd.md:266에 정식 정의되어 있으나, screen-spec 진입 시 입력 검증 단계가 명시되지 않음 | commands:38, 65 / SKILL.md:51 | 경미 |
| h | 토큰 사용량 미관리 — Q&A 도입 시 라운드트립 N배 증가 위험 | (구조적) | |

---

## 3. 수정 방향 — 6개 액션 아이템

### A1. 흑백 Wireframe 강제 + STYLE 단계 분리 (High)

**무엇**: 04-WIREFRAME.html에서 design-discovery 스타일 토큰 주입을 제거. 와이어프레임은 **흑백 + 의미색만** (빨강=error, 초록=success, 파랑=info, 회색=중립).

**왜**: 와이어프레임 단계는 *레이아웃/계층/플로우* 검증용. 컬러/타이포는 다음 단계인 mockup에서 다뤄야 리뷰 노이즈를 줄이고 디자인 결정이 코드로 흘러가기 전 별도로 검증된다.

**어떻게**:
- 04-WIREFRAME.html에서 `--wf-*` 토큰을 grayscale로 고정, design-discovery 결과 주입 코드 제거
- SKILL.md의 Phase 2 STYLE은 `/screen-spec` 책임 밖으로 빼서 별도 단계화 (`/style-select` 신설 또는 `/implement` 직전 단계로 이관)
- commands/screen-spec.md에서 `--style` 인자 제거, 대신 안내 메시지로 후속 단계 노출

### A2. `--interview` 옵션 추가 (Mid)

**무엇**: 기본은 PRD 추론 모드, `--interview` 플래그 사용 시 5~7개의 화면 레이어 Q&A를 **단일 턴 배치 질문**으로 진행.

**왜**: PRD 스코프 밖이지만 화면정의서엔 필수인 의사결정을 명시적으로 끌어내기 위함. 기본 추론 모드를 유지하는 이유는 `/prd` + `prd-reviewer` 게이트를 거친 PRD는 충분히 정형화되어 있고, 바이브 코더의 빠른 흐름을 깨지 않기 위함.

**어떻게**:
- 새 Phase 1.5 INTERVIEW 추가 (`--interview`일 때만)
- 질문 셋: 네비 패턴 / 밀도 / 에러 톤 / 빈 상태 / 전환 / 모바일 우선 / 핵심 후크
- **단일 메시지에 5~7개 질문을 번호 매겨** 제시 → 사용자 1회 응답 → 다음 단계
- Phase 5 안내문에 "더 디테일하게 뽑고 싶으면 `--interview`로 재실행" 한 줄
- PRD에 `TBD`/`???`/빈 셀이 임계치(5건 이상) 이상이면 자동 추천 힌트 표시

### A3. `--platform=web|mobile` 분기 (Mid)

**무엇**: 플랫폼 인자로 와이어프레임 출력과 네비/Breakpoint 메타를 분기.

**왜**: 상위 80%(IA/User Flow/Screen Spec/Dev Handoff의 구조)는 플랫폼 무관, 차이는 04-WIREFRAME과 네비 메타에 집중. 분기 비용보다 공통화 이득이 큼.

**어떻게**:
- `templates/web/` `templates/mobile/` 디렉토리 분리, 공통 템플릿은 `templates/common/`
- 모바일 템플릿 추가:
  - 04-WIREFRAME.html → 04-WIREFRAME-mobile.html (NativeWind 시뮬레이션, iPhone 15 / SE 프레임)
  - 네비 메타: Stack / Tab / Drawer
  - Breakpoint: 375 / 414 / 768 (iPad)
- 기본값 `--platform=web`, 명시적 `--platform=mobile`로 모바일 모드
- Phase 1 LOAD에서 PRD §1 overview의 키워드("앱", "RN", "mobile") 감지 시 모바일 모드 추천 힌트

### A4. 무거운 아티팩트(04, 05) subagent 분리 (Mid)

**무엇**: 04-WIREFRAME(가장 큰 출력)과 05-DEV-HANDOFF(매핑 다수)를 별도 subagent 컨텍스트로 분기 실행.

**왜**: 메인 스레드에서 5개 아티팩트를 순차 생성하면 마지막 아티팩트 시점에 누적 컨텍스트가 PRD + IA + USER-FLOW + SCREEN-SPEC + WIREFRAME(30~50KB)이 됨. subagent로 분기하면 메인 스레드 누적이 절감되고, 산출물만 결과로 받아옴.

**어떻게**:
- Phase 3.4 (04-WIREFRAME)와 Phase 3.5 (05-DEV-HANDOFF)를 subagent 호출로 변경 (subagent_type은 `general-purpose` 또는 신설)
- 입력으로 01~03 결과물만 전달 (PRD는 subagent가 재읽기), 출력은 파일 경로만 반환
- prompt caching 활용을 위해 PRD 읽기는 첫 단계에 고정

### A5. Mermaid 문법 안정화 (High)

**무엇**: 모든 Mermaid 블록에 안정 문법 적용.

**룰**:
1. **라우트(`/`) 또는 특수문자(`?`, `=`, `:`, `(`, `)`) 포함 텍스트는 항상 큰따옴표로 감싸기**
   - Before: `Submit[/submit]` → After: `Submit["/submit"]`
   - Before: `MyList[/my 목록/]` → After: `MyList["/my 목록"]`
2. **존재하지 않는 shape 금지**
   - `{(text)}` → `[(text)]` (cylinder) 또는 `{"text"}` (diamond)
3. **mindmap → flowchart 전환 검토** (mindmap은 환경별 지원 편차가 커서 안정성 떨어짐)
4. **테스트**: 모든 Mermaid 블록을 mermaid-cli로 검증하는 가이드를 SKILL.md에 추가

**파일별 작업**:
- SKILL.md:124, 126, 128 — 위 룰 적용
- templates/02-USER-FLOW.md:22, 27, 40 — 위 룰 적용
- templates/01-IA.md — mindmap을 flowchart LR로 전환 후보 (또는 mindmap 유지 시 노드 텍스트 큰따옴표 강제)

### A6. 부수 정리 (Low~Mid)

| 항목 | 작업 |
|---|---|
| 템플릿 placeholder화 | 5개 템플릿의 도메인 데이터를 `{feature-name}`, `{role}`, `{primary-fr}` 등 placeholder로 교체. 도메인 예시는 `examples/golden-set-collector/`로 분리(또는 삭제) |
| Phase 4 위상 통일 | SKILL.md와 commands 양쪽을 "필수 quality gate"로 통일. WARN/FAIL 기준은 handoff-checklist 그대로 |
| Orphan reference 제거 | references/handoff-checklist.md:42 "bc-frontend" 라인 삭제 또는 일반화 |
| 04-WIREFRAME.html 200줄 이내로 축소 | 도메인 예시 제거 + placeholder 적용으로 자연 감소 예상 |
| Python 의사코드 정리 | SKILL.md:75~88, 274~288을 자연어 가이드로 변환 ("design-discovery 에이전트를 호출하여 ..." 식) |
| Lo-fi a11y 마크업 보강 | 04-WIREFRAME.html `<section>`에 `aria-labelledby="screen-<id>-title"` 추가, 헤딩에 id 매칭 |
| `--style` 가드 | A1에서 제거 예정이라 별도 작업 불필요 (옵션 자체 제거) |
| `Has FE Components` 검증 단계 명시화 | SKILL.md Phase 1 LOAD 검증 게이트에 "FE 페이지 0개 시 stop" 룰이 이미 있음 — placeholder화 작업 중 명시적으로 한 줄 추가 |
| Re-run 머지 정책 | SKILL.md에 "부분 재생성 시: 해당 파일은 전체 덮어쓰기, 다른 파일은 보존" 한 단락 추가 |

---

## 4. 작업 순서

| # | 액션 | 우선 | 예상 영향 | 의존성 |
|---|---|---|---|---|
| 1 | A1 흑백 wireframe + STYLE 분리 | 🔴 High | 04-WIREFRAME, SKILL.md, commands | 없음 |
| 2 | A2 `--interview` 추가 | 🟡 Mid | SKILL.md, commands | 없음 |
| 3 | A3 `--platform` 분기 | 🟡 Mid | templates/ 재구성 | A1 후(템플릿 정리됨) |
| 4 | A4 subagent 분리 | 🟡 Mid | SKILL.md Phase 3.4, 3.5 | A1 후 |
| 5 | A5 Mermaid 안정화 | 🔴 High | SKILL.md, 02-USER-FLOW, 01-IA | 없음 (병행 가능) |
| 6 | A6 부수 정리 | 🟢 Low~Mid | 전체 | 위 작업과 병행 |

**병행 가능성**: A1 / A5는 독립적이므로 동시 진행 가능. A3 / A4는 A1 이후. A6는 각 작업에 분산해서 함께 처리.

---

## 5. 완료 기준 (Definition of Done)

- [ ] 04-WIREFRAME.html이 흑백 + 의미색으로만 렌더링됨
- [ ] design-discovery 호출이 `/screen-spec`에서 빠지고 별도 단계로 이관 또는 제거됨
- [ ] `--interview` 플래그 동작 — 단일 턴 배치 질문 → 응답 반영
- [ ] `--platform=web|mobile` 동작 — 모바일 템플릿 출력
- [ ] 04, 05 산출물이 subagent 컨텍스트에서 생성됨
- [ ] 모든 Mermaid 블록이 mermaid-cli 또는 GitHub 렌더러에서 에러 없이 표시
- [ ] 템플릿에서 "골든셋 / SK에코플랜트 / Supabase / harry@" 등 도메인 키워드 0건
- [ ] Phase 4 위상이 SKILL.md와 commands에서 동일하게 기술됨
- [ ] `bc-frontend` 등 orphan reference 0건
- [ ] 04-WIREFRAME.html ≤ 200줄
- [ ] 재실행 머지 정책이 SKILL.md에 한 단락 이상 명시됨

---

## 6. 비범위 (Out of Scope)

- `/prd` 자체의 변경 (Has FE Components 컬럼 포맷 등은 그대로 사용)
- `prd-reviewer` 로직 변경
- 새로운 design-discovery 스타일 추가
- 다국어 지원 (지금처럼 한국어 유지)
- 실제 라이브 mermaid-cli 자동 테스트 인프라 구축 (수동 검증으로 충분)
