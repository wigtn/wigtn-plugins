<div align="center">

[English](README.md) | [한국어](README.ko.md)

# WIGTN Coding

**아이디어에서 배포까지, 마찰 제로**

![Version](https://img.shields.io/badge/v2.0.0-Unified_Plugin-FF6B6B?style=for-the-badge)
![Agents](https://img.shields.io/badge/12-Agents-5A67D8?style=for-the-badge)
![Skills](https://img.shields.io/badge/3-Skills-00D4AA?style=for-the-badge)
![Styles](https://img.shields.io/badge/20-Design_Styles-F59E0B?style=for-the-badge)

[![GitHub Stars](https://img.shields.io/github/stars/wigtn/wigtn-plugins-with-claude-code?style=flat-square)](https://github.com/wigtn/wigtn-plugins-with-claude-code/stargazers)
[![License](https://img.shields.io/badge/license-Apache_2.0-blue?style=flat-square)](LICENSE)
[![Contributors](https://img.shields.io/github/contributors/wigtn/wigtn-plugins-with-claude-code?style=flat-square)](https://github.com/wigtn/wigtn-plugins-with-claude-code/graphs/contributors)
[![Last Commit](https://img.shields.io/github/last-commit/wigtn/wigtn-plugins-with-claude-code?style=flat-square)](https://github.com/wigtn/wigtn-plugins-with-claude-code/commits/main)

</div>

---

## WIGTN Coding이란?

**WIGTN Coding**은 막연한 아이디어를 완성된 프로덕트로 만들어주는 단일 통합 Claude Code 플러그인입니다. 하나의 플러그인 — 접두사 없이 바로 사용.

```
"사용자 인증이 있는 SaaS 대시보드를 만들고 싶어"
  → /prd        (요구사항 정의)
  → digging     (분석)
  → /implement  (병렬 빌드)
  → /auto-commit (품질 검증 + 커밋)
```

**12개 에이전트**, **3개 명령어**, **3개 스킬**, **20개 디자인 스타일** — 팀 기반 병렬 실행으로 3-5배 속도 향상.

---

## 한눈에 보기

| 구성 | 개수 | 주요 내용 |
|------|------|----------|
| 에이전트 | 12 | 병렬 코디네이터, 아키텍처 결정, 전문 개발자 |
| 명령어 | 3 | `/prd`, `/implement`, `/auto-commit` |
| 스킬 | 3 | 코드 리뷰 레벨, 디자인 시스템 레퍼런스, 팀 메모리 프로토콜 |
| 디자인 스타일 | 20 | Editorial, Brutalist, Glassmorphism, Aurora/Gradient Mesh, Kinetic Typography 등 |
| 훅 | 4 | 위험 명령 차단, 포맷팅 알림, 패턴 준수 확인 |

---

## 설치

```bash
# 1단계 — 마켓플레이스 소스 추가 (최초 1회)
/plugin marketplace add wigtn/wigtn-plugins-with-claude-code

# 2단계 — 플러그인 설치
/install wigtn-coding
```

<details>
<summary>수동 설치 (대안)</summary>

```bash
git clone https://github.com/wigtn/wigtn-plugins-with-claude-code.git ~/.claude-plugins/wigtn
mkdir -p ~/.claude/plugins
ln -s ~/.claude-plugins/wigtn/plugins/wigtn-coding ~/.claude/plugins/

# 업데이트
git -C ~/.claude-plugins/wigtn pull
```

</details>

---

## 파이프라인

아이디어에서 커밋된 코드까지, 4단계 핵심 워크플로우:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   /prd "OAuth 기반 사용자 인증"                                   │
│   ├── PRD.md (구조화된 요구사항)                                   │
│   └── PLAN_{feature}.md (단계별 작업 계획)                         │
│                         ↓                                       │
│   digging (4-에이전트 병렬 분석)                                   │
│   ├── 완전성 — 빠진 요구사항이 있는가?                               │
│   ├── 실현가능성 — 실제로 구현 가능한가?                              │
│   ├── 보안 — 취약점은 없는가?                                      │
│   └── 일관성 — 요구사항끼리 모순은 없는가?                            │
│                         ↓                                       │
│   /implement --parallel                                         │
│   ├── DESIGN 단계 (3 에이전트 병렬)                                │
│   │   ├── PRD 탐색 + 품질 검증                                    │
│   │   ├── 아키텍처 결정 (MSA vs 모놀리스)                           │
│   │   └── 프로젝트 분석 + 갭 분석                                   │
│   ├── 디자인 결정 (프론트엔드 팀 활성 시)                             │
│   │   └── design-discovery → 스타일 선택 → 스타일 가이드 로드       │
│   ├── 사용자 승인 체크포인트                                        │
│   └── BUILD 단계 (팀 기반 병렬)                                    │
│       ├── 백엔드 팀  → backend-architect 에이전트                   │
│       ├── 프론트엔드 팀 → frontend-developer 에이전트               │
│       ├── AI 팀       → ai-agent (필요 시)                        │
│       └── 운영 팀      → devops 설정 (필요 시)                     │
│                         ↓                                       │
│   /auto-commit                                                  │
│   ├── 3-에이전트 병렬 코드 리뷰                                     │
│   ├── 품질 게이트 (점수 80+ = 자동 커밋)                            │
│   ├── 보안 제로 톨러런스 검사                                       │
│   └── 커밋 + 푸시                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 품질 게이트

| 점수 | 동작 |
|------|------|
| 80+ | 자동 커밋 |
| 60-79 | 자동 수정 후 재시도 |
| < 60 | 커밋 차단 |
| 보안 치명적 | 강제 FAIL (59점으로 제한) |

### 병렬 처리 속도 향상

| 단계 | 순차 처리 | 병렬 처리 | 속도 향상 |
|------|----------|----------|----------|
| digging | 4개 카테고리 순차 | 4 에이전트 병렬 | **4배** |
| DESIGN | 4단계 순차 | 3 에이전트 병렬 | **3배** |
| BUILD | 작업 순차 | 팀 기반 병렬 | **2-3배** |
| 리뷰 | 단일 리뷰어 | 3 에이전트 병렬 | **3배** |
| **전체 파이프라인** | **~20분** | **~6분** | **~3배** |

---

## 명령어 (3개)

| 명령어 | 설명 |
|--------|------|
| `/prd <기능>` | 기능 아이디어로부터 PRD + 단계별 작업 계획 생성 |
| `/implement <기능>` | 자동 병렬 모드 감지로 설계 + 빌드 |
| `/implement --parallel` | 팀 기반 병렬 빌드 강제 실행 |
| `/auto-commit` | 병렬 품질 리뷰 + 안전 검증 + 자동 커밋 |

> 도메인별 기능(백엔드, 프론트엔드, 모바일, AI, DevOps)은 `/implement`의 team-build-coordinator가 자동으로 전문 에이전트에 배정합니다.

---

## 에이전트 (12개)

| 에이전트 | 역할 |
|---------|------|
| `architecture-decision` | PRD 분석 후 MSA vs 모놀리식 vs 모듈러 모놀리스 결정 |
| `code-formatter` | 다중 언어 포맷팅 및 린팅 자동화 |
| `code-reviewer` | 100점 품질 점수 기반 코드 리뷰 (가독성, 유지보수성, 성능, 테스트성, 모범사례) |
| `prd-reviewer` | PRD 분석 — 4개 카테고리(완전성, 실현가능성, 보안, 일관성)에서 약점/갭/위험 발견 |
| `team-build-coordinator` | 팀 기반 병렬 빌드: 백엔드 + 프론트엔드 + AI + 운영 |
| `parallel-review-coordinator` | 3-에이전트 병렬 코드 리뷰 + 점수 병합 |
| `parallel-digging-coordinator` | 5단계 병렬 PRD 분석 파이프라인 + 품질 게이트 |
| `frontend-developer` | React 19 / Next.js 16+ 컴포넌트 및 페이지 생성, 20개 디자인 스타일 지원 |
| `design-discovery` | VS (Verbalized Sampling) 기법 기반 스타일 추천 (Web + Mobile) |
| `backend-architect` | 백엔드 패턴, API 설계, 데이터베이스 스키마, 아키텍처 결정 |
| `mobile-developer` | React Native / Expo 컴포넌트, 화면, 네이티브 모듈 생성 |
| `ai-agent` | STT (WhisperX) 및 LLM (OpenAI, Anthropic) 통합 패턴 |

---

## 스킬 (3개)

| 스킬 | 설명 |
|------|------|
| `code-review-levels` | 심층 코드 리뷰(Level 3: 호출 체인, 에지 케이스, 동시성, 보안) 및 아키텍처 리뷰(Level 4: SOLID 원칙, 의존성 분석, 계층 위반, 확장성) 참조 문서 |
| `design-system-reference` | 20개 스타일 가이드 + 공통 패턴(애니메이션, 색상, 간격). design-discovery 에이전트와 연동하여 컨텍스트 수집 및 VS 기반 스타일 추천. 안티패턴 및 구현 체크리스트 포함 |
| `team-memory-protocol` | 팀 기반 병렬 빌드의 공유 컨텍스트 관리. SHARED_CONTEXT 파일 관리, TaskCreate 연동, 에이전트 간 메모리 조율 |

---

## 디자인 스타일 (20개)

`design-system-reference` 스킬에는 전문적으로 작성된 20개의 스타일 가이드가 포함되어 있습니다. 각 스타일 가이드는 철학, 타이포그래피, 레이아웃, 색상, 컴포넌트, 모션, 안티패턴을 다룹니다.

| 스타일 | 분위기 |
|--------|--------|
| **Editorial** | 강렬한 세리프 타이포그래피의 매거진 스타일 레이아웃 |
| **Brutalist** | 날것의 대담함, 파격적 — 모든 규칙을 깨는 디자인 |
| **Glassmorphism** | 블러와 투명도를 활용한 젖빛 유리 효과 |
| **Swiss Minimal** | 깔끔한 그리드 기반 디자인, 타이포그래피 중심 |
| **Neomorphism** | 부드러운 인셋/아웃셋 그림자의 소프트 UI |
| **Bento Grid** | 모던 카드 기반 그리드 레이아웃 (Apple 스타일) |
| **Dark Mode First** | 처음부터 다크 인터페이스로 설계 |
| **Minimal Corporate** | 깔끔하고 전문적인 비즈니스 감성 |
| **Retro Pixel** | CRT 효과, 모노스페이스 폰트, 터미널 향수 |
| **Organic Shapes** | 블롭 도형, 자연스러운 곡선, 자연의 색감 |
| **Maximalist** | 대담한 타이포그래피, 강렬한 색상, 겹겹이 쌓인 복잡함 |
| **3D Immersive** | CSS 3D 변환, 패럴랙스, 깊이감 효과 |
| **Liquid Glass** | 유체 형태의 반투명 유리 효과와 동적 반사 |
| **Claymorphism** | 부드러운 3D 클레이 요소와 파스텔 톤 |
| **Minimalism** | 극도의 단순함, 여백 중심, 본질만 남기기 |
| **Neobrutalism** | 컬러풀한 악센트와 대담한 보더의 모던 브루탈리즘 |
| **Skeuomorphism** | 현실적 텍스처와 물리적 세계의 메타포 |
| **Aurora / Gradient Mesh** | 메시 그라디언트, 컬러 필드, 앰비언트 글로우 — 몽환적이고 프리미엄 |
| **Terminal / Hacker** | 모노스페이스 중심, 정보 밀도 높은, 시맨틱 컬러 — 모던 터미널 크래프트 |
| **Kinetic Typography** | 스크롤 기반 텍스트 애니메이션, 분할 리빌 — 타이포그래피 극장 |

`design-discovery` 에이전트가 VS (Verbalized Sampling) 기법을 사용하여 프로젝트에 가장 적합한 스타일을 추천합니다.

---

## 훅 (안전 & 품질)

| 훅 | 트리거 | 기능 |
|----|--------|------|
| 위험 명령 차단 | `Bash` PreToolUse | `rm -rf /`, `git push --force`, `DROP TABLE` 등 차단 |
| 파이프라인 완료 | Stop 이벤트 | 푸시 전 변경사항 검토 알림 |
| 프론트엔드 포맷팅 | `Write\|Edit` PostToolUse | `.tsx`, `.jsx`, `.css` 파일에 prettier/eslint 실행 알림 |
| 백엔드 패턴 준수 | `Write\|Edit` PostToolUse | `.ts`, `.py`, `.go` 파일에 에러 핸들링, 입력 검증, 로깅 확인 알림 |

---

## 시나리오

### 시나리오 1: 풀스택 SaaS 앱을 처음부터

> "팀 협업 기능이 있는 프로젝트 관리 도구를 만들고 싶어"

```bash
# 1단계 — 요구사항 정의
/prd 칸반 보드와 팀 협업이 있는 프로젝트 관리 도구

# 2단계 — 계획 검토 및 정제 (digging 자동 실행)
# 4-에이전트 병렬 분석으로 빈틈 발견: "누락: 실시간 동기화, 역할 권한"

# 3단계 — 병렬로 모든 것을 빌드
/implement --parallel project-management
# 백엔드 팀: API 엔드포인트, Prisma 스키마, 인증 미들웨어
# 프론트엔드 팀: 칸반 보드, 팀 뷰, 대시보드
# 운영 팀: Dockerfile, GitHub Actions CI/CD

# 4단계 — 품질 검증 및 커밋
/auto-commit
# 3명의 리뷰어 점수: 87/100 → 자동 커밋
```

### 시나리오 2: 모바일 앱 개발

> "React Native로 피트니스 트래킹 앱을 만들어줘"

```bash
/prd 운동 기록, 진행 차트, Apple Health 동기화가 있는 피트니스 트래커

/implement fitness-tracker
# 아키텍처: Expo Router + Zustand + MMKV + React Query
# 모바일 특화: 생체 인증, 햅틱 피드백, 오프라인 동기화
# 생성: 화면, 컴포넌트, 네비게이션, 네이티브 모듈 통합
```

### 시나리오 3: 디자인 주도 랜딩 페이지

> "AI 스타트업 랜딩 페이지를 만들어줘"

```bash
/prd 모던 디자인의 AI 스타트업 랜딩 페이지

/implement ai-landing
# design-discovery 에이전트 활성화 → 브랜드 성격에 대해 질문
# 추천: Glassmorphism (모던, 신뢰감) 또는 Liquid Glass (동적, 최첨단)
# 프론트엔드 팀: Hero, Features, Pricing, CTA 섹션 — 선택한 스타일 적용

/auto-commit
```

### 시나리오 4: 백엔드 API + AI 기능

> "음성 명령과 LLM 처리가 있는 전사 서비스를 만들어줘"

```bash
/prd WhisperX STT와 LLM 기반 요약이 있는 전사 서비스

/implement --parallel transcription-service
# 백엔드 팀 → backend-architect: API 엔드포인트, DB 스키마, 인증
# AI 팀 → ai-agent: WhisperX 통합, OpenAI/Anthropic API 패턴
# 프론트엔드 팀 → frontend-developer: 업로드 UI, 전사 뷰어, 대시보드
# 운영 팀: Docker 설정, CI/CD 파이프라인

/auto-commit
# 품질 게이트: 92/100 → 자동 커밋
```

### 시나리오 5: DevOps 파이프라인 구성

> "모노레포에 Docker와 CI/CD를 설정해줘"

```bash
/prd pnpm 모노레포를 위한 Docker 멀티스테이지 빌드 + GitHub Actions CI/CD

/implement devops-pipeline
# team-build-coordinator가 운영 팀 작업 배정
# 생성: Dockerfile, docker-compose.yml, .github/workflows/ci.yml
# 포함: 캐싱, 테스트 스테이지, Vercel/Railway 배포

/auto-commit
```

---

## 플러그인 구조

```
plugins/wigtn-coding/
├── .claude-plugin/
│   └── plugin.json           # 플러그인 메타데이터 (12 에이전트, 3 명령어, 3 스킬)
├── agents/                   # 12개 에이전트 정의
│   ├── architecture-decision.md
│   ├── code-formatter.md
│   ├── code-reviewer.md
│   ├── prd-reviewer.md
│   ├── team-build-coordinator.md
│   ├── parallel-review-coordinator.md
│   ├── parallel-digging-coordinator.md
│   ├── frontend-developer.md
│   ├── design-discovery.md
│   ├── backend-architect.md
│   ├── mobile-developer.md
│   └── ai-agent.md
├── commands/                 # 3개 사용자 실행 명령어
│   ├── prd.md
│   ├── implement.md
│   └── auto-commit.md
├── skills/                   # 3개 스킬 + 참조 파일
│   ├── code-review-levels/   # 심층 리뷰 (Level 3) + 아키텍처 리뷰 (Level 4)
│   │   ├── SKILL.md
│   │   ├── deep-review.md
│   │   └── architecture-review.md
│   ├── design-system-reference/  # 20개 스타일 가이드 + 공통 패턴
│   │   ├── SKILL.md
│   │   ├── README.md
│   │   ├── common/
│   │   │   ├── animations.md
│   │   │   ├── colors.md
│   │   │   └── spacing.md
│   │   └── styles/           # 20개 디자인 스타일 가이드
│   │       ├── editorial.md
│   │       ├── brutalist.md
│   │       ├── glassmorphism.md
│   │       ├── swiss-minimal.md
│   │       ├── neomorphism.md
│   │       ├── bento-grid.md
│   │       ├── dark-mode-first.md
│   │       ├── minimal-corporate.md
│   │       ├── retro-pixel.md
│   │       ├── organic-shapes.md
│   │       ├── maximalist.md
│   │       ├── 3d-immersive.md
│   │       ├── liquid-glass.md
│   │       ├── claymorphism.md
│   │       ├── minimalism.md
│   │       ├── neobrutalism.md
│   │       ├── skeuomorphism.md
│   │       ├── aurora-gradient.md
│   │       ├── terminal-hacker.md
│   │       └── kinetic-typography.md
│   └── team-memory-protocol/ # 에이전트 간 공유 컨텍스트
│       └── SKILL.md
└── hooks/
    └── hooks.json            # 4개 훅 (안전 + 품질)
```

---

## 기술 스택

| 도메인 | 기술 |
|--------|------|
| **프론트엔드** | React 19, Next.js 16+, Tailwind CSS, Radix UI, React Hook Form, Zod |
| **백엔드** | NestJS, Express, Fastify, FastAPI, Prisma, TypeORM, Drizzle |
| **모바일** | React Native 0.73+, Expo SDK 52+, Expo Router, React Navigation |
| **데이터베이스** | PostgreSQL, MySQL, MongoDB, SQLite |
| **상태 관리** | Zustand, Jotai, Redux Toolkit, React Query, MMKV |
| **테스팅** | Jest, RTL, RNTL, Playwright, Detox, Maestro, MSW |
| **DevOps** | Docker, Kubernetes, GitHub Actions, Vercel, Railway |
| **AI** | WhisperX (STT), OpenAI GPT, Anthropic Claude |
| **디자인** | 20개 스타일 시스템, VS 기반 스타일 디스커버리, HIG, Material Design 3 |

---

## 기여하기

1. 레포지토리를 **포크**합니다
2. 기능 브랜치를 **생성**합니다 (`git checkout -b feature/amazing-skill`)
3. 변경사항을 **커밋**합니다 (`git commit -m 'feat: Add amazing skill'`)
4. 브랜치에 **푸시**합니다 (`git push origin feature/amazing-skill`)
5. **Pull Request**를 생성합니다

---

## 라이선스

이 프로젝트는 **Apache License 2.0** 하에 배포됩니다 — 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

<div align="center">

**Made with Claude Code by [WIGTN Crew](https://github.com/wigtn)**

</div>
