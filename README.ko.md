<div align="center">

[English](README.md) | [한국어](README.ko.md) | [中文](README.cn.md)

# WIGTN Coding

**하나의 플러그인. 12개 에이전트. 아이디어에서 프로덕션까지.**

![Version](https://img.shields.io/badge/v2.0.0-Unified_Plugin-FF6B6B?style=for-the-badge)
![Agents](https://img.shields.io/badge/12-Agents-5A67D8?style=for-the-badge)
![Commands](https://img.shields.io/badge/3-Commands-38B2AC?style=for-the-badge)
![Skills](https://img.shields.io/badge/3-Skills-00D4AA?style=for-the-badge)
![Styles](https://img.shields.io/badge/20-Design_Styles-F59E0B?style=for-the-badge)

[![GitHub Stars](https://img.shields.io/github/stars/wigtn/wigtn-plugins-with-claude-code?style=flat-square)](https://github.com/wigtn/wigtn-plugins-with-claude-code/stargazers)
[![License](https://img.shields.io/badge/license-Apache_2.0-blue?style=flat-square)](LICENSE)
[![Contributors](https://img.shields.io/github/contributors/wigtn/wigtn-plugins-with-claude-code?style=flat-square)](https://github.com/wigtn/wigtn-plugins-with-claude-code/graphs/contributors)
[![Last Commit](https://img.shields.io/github/last-commit/wigtn/wigtn-plugins-with-claude-code?style=flat-square)](https://github.com/wigtn/wigtn-plugins-with-claude-code/commits/main)

</div>

---

## 뭘 하는 플러그인인가

WIGTN Coding은 Claude Code 플러그인입니다. 만들고 싶은 걸 설명하면, 12개의 전문 에이전트가 나머지를 처리합니다 — 요구사항, 아키텍처, 코드, 리뷰, 커밋까지, 전부 병렬로.

```
/prd "OAuth 기반 SaaS 대시보드"  →  PRD + 작업 계획 30초 만에 생성
/implement --parallel            →  백엔드 + 프론트엔드 + AI + 운영 팀이 동시 빌드
/auto-commit                     →  3-에이전트 리뷰, 품질 게이트, 80점 이상이면 자동 커밋
```

---

## 빠른 시작

```bash
# 설치
/plugin marketplace add wigtn/wigtn-plugins-with-claude-code
/install wigtn-coding

# 체험 — 이게 전체 워크플로우입니다
/prd 모던 디자인의 AI 스타트업 랜딩 페이지
/implement ai-landing
/auto-commit
```

끝입니다. 플러그인이 PRD 생성, 4카테고리 품질 분석, 아키텍처 결정, 디자인 스타일 선택, 병렬 빌드, 코드 리뷰, 커밋까지 전부 처리합니다.

---

## 파이프라인

```
  /prd                    /implement                    /auto-commit
   │                         │                              │
   ▼                         ▼                              ▼
┌──────────┐  ┌──────────────────────────────┐  ┌─────────────────────┐
│ PRD.md   │  │ DESIGN (3 에이전트 병렬)      │  │ 3-에이전트 리뷰     │
│ PLAN.md  │  │  ├─ PRD 품질 검증            │  │  ├─ 가독성           │
│          │  │  ├─ 아키텍처 결정             │  │  ├─ 성능             │
│ digging  │  │  └─ 갭 분석                  │  │  └─ 보안             │
│ (4-에이전│  │                              │  │                     │
│ 트 병렬  │  │ 디자인 결정                   │  │ 점수 ≥ 80 → 커밋    │
│ 분석)    │  │  └─ 스타일 선택 (FE 시)      │  │ 점수 60-79 → 수정   │
│          │  │                              │  │ 점수 < 60 → 차단    │
│          │  │ BUILD (팀 병렬)              │  │                     │
│          │  │  ├─ 백엔드                   │  │ 보안 치명적          │
│          │  │  ├─ 프론트엔드               │  │  → 강제 FAIL        │
│          │  │  ├─ AI 서버                  │  │                     │
│          │  │  └─ 운영                     │  │                     │
└──────────┘  └──────────────────────────────┘  └─────────────────────┘
```

각 단계는 가능한 곳에서 병렬 실행됩니다. 전체 파이프라인: ~6분 (순차 시 ~20분).

---

## 명령어

| 명령어 | 기능 |
|--------|------|
| `/prd <기능>` | 기능 아이디어로부터 PRD + 단계별 작업 계획 생성 |
| `/implement <기능>` | 자동 병렬 모드 감지, 설계 + 빌드 |
| `/auto-commit` | 3-에이전트 병렬 리뷰 → 품질 게이트 → 커밋 + PR |

---

<details>
<summary><b>에이전트 (12개)</b> — 클릭하여 펼치기</summary>

### 코디네이터

| 에이전트 | 역할 |
|---------|------|
| `team-build-coordinator` | 백엔드, 프론트엔드, AI, 운영 팀을 병렬 배정 |
| `parallel-review-coordinator` | 3개 리뷰 에이전트 실행, 점수 병합 |
| `parallel-digging-coordinator` | 4카테고리 PRD 분석 파이프라인 |
| `architecture-decision` | MSA vs 모놀리식 vs 모듈러 모놀리스 |

### 개발자

| 에이전트 | 역할 |
|---------|------|
| `frontend-developer` | React 19, Next.js 16+, 20개 디자인 스타일 |
| `backend-architect` | API 설계, 데이터베이스 스키마, 백엔드 패턴 |
| `mobile-developer` | React Native / Expo, 네이티브 모듈 |
| `ai-agent` | WhisperX STT, OpenAI/Anthropic 통합 |

### 품질

| 에이전트 | 역할 |
|---------|------|
| `code-reviewer` | 5개 카테고리 100점 만점 품질 평가 |
| `prd-reviewer` | 완전성, 실현가능성, 보안, 일관성에서 갭 탐지 |
| `code-formatter` | 다중 언어 자동 포맷팅 및 린트 수정 |
| `design-discovery` | VS 기법 기반 Web/Mobile 스타일 추천 |

</details>

<details>
<summary><b>스킬 (3개)</b> — 클릭하여 펼치기</summary>

| 스킬 | 제공하는 것 |
|------|-----------|
| `code-review-levels` | 심층 리뷰 (Level 3: 호출 체인, 에지 케이스, 동시성) 및 아키텍처 리뷰 (Level 4: SOLID, 계층 위반, 확장성) |
| `design-system-reference` | 20개 스타일 가이드 — 타이포그래피, 색상, 컴포넌트, 모션, 안티패턴. design-discovery와 연동하여 컨텍스트 기반 추천 |
| `team-memory-protocol` | 병렬 빌드 중 에이전트 간 공유 컨텍스트(SHARED_CONTEXT) 관리 |

</details>

<details>
<summary><b>디자인 스타일 (20개)</b> — 클릭하여 펼치기</summary>

각 스타일 가이드는 철학, 타이포그래피, 레이아웃, 색상, 컴포넌트, 모션, 안티패턴 체크리스트를 포함합니다.

| 스타일 | 분위기 |
|--------|--------|
| Editorial | 매거진 레이아웃, 강렬한 세리프 타이포그래피 |
| Brutalist | 날것의 대담함, 파격적 |
| Glassmorphism | 블러와 투명도의 젖빛 유리 효과 |
| Swiss Minimal | 그리드 기반, 타이포그래피 중심 |
| Neomorphism | 소프트 UI, 인셋/아웃셋 그림자 |
| Bento Grid | 카드 기반 그리드 (Apple 스타일) |
| Dark Mode First | 처음부터 다크 인터페이스로 설계 |
| Minimal Corporate | 깔끔한 비즈니스 감성 |
| Retro Pixel | CRT 효과, 모노스페이스, 터미널 향수 |
| Organic Shapes | 블롭, 자연 곡선, 대지 색감 |
| Maximalist | 대담한 타이포, 강렬한 색상, 레이어드 |
| 3D Immersive | CSS 3D 변환, 패럴랙스, 깊이감 |
| Liquid Glass | 유체 반투명 유리, 동적 반사 |
| Claymorphism | 부드러운 3D 클레이, 파스텔 톤 |
| Minimalism | 극도의 단순, 여백 중심 |
| Neobrutalism | 컬러풀 악센트, 대담한 보더 |
| Skeuomorphism | 현실적 텍스처, 물리적 메타포 |
| Aurora / Gradient Mesh | 메시 그라디언트, 앰비언트 글로우, 몽환적 |
| Terminal / Hacker | 모노스페이스 중심, 정보 밀도 높은, 시맨틱 컬러 |
| Kinetic Typography | 스크롤 기반 텍스트 애니메이션, 분할 리빌 |

`design-discovery` 에이전트가 VS (Verbalized Sampling) 기법으로 프로젝트에 최적의 스타일을 추천합니다.

</details>

<details>
<summary><b>훅 (4개)</b> — 클릭하여 펼치기</summary>

| 훅 | 트리거 | 기능 |
|----|--------|------|
| 위험 명령 차단 | `Bash` PreToolUse | `rm -rf /`, `git push --force`, `DROP TABLE` 차단 |
| 파이프라인 완료 | Stop | 푸시 전 변경사항 검토 알림 |
| 프론트엔드 포맷팅 | `Write\|Edit` PostToolUse | `.tsx`, `.jsx`, `.css` 파일 prettier/eslint 알림 |
| 백엔드 패턴 준수 | `Write\|Edit` PostToolUse | `.ts`, `.py`, `.go` 파일 에러 핸들링, 입력 검증, 로깅 확인 |

</details>

---

## 시나리오

<details>
<summary><b>풀스택 SaaS 처음부터</b></summary>

```bash
/prd 칸반 보드와 팀 협업이 있는 프로젝트 관리 도구
# → 4-에이전트 분석: "누락: 실시간 동기화, 역할 권한"

/implement --parallel project-management
# 백엔드: API 엔드포인트, Prisma 스키마, 인증 미들웨어
# 프론트엔드: 칸반 보드, 팀 뷰, 대시보드
# 운영: Dockerfile, GitHub Actions CI/CD

/auto-commit
# 3 리뷰어 → 87/100 → 자동 커밋
```

</details>

<details>
<summary><b>React Native 모바일 앱</b></summary>

```bash
/prd 운동 기록, 진행 차트, Apple Health 동기화가 있는 피트니스 트래커

/implement fitness-tracker
# Expo Router + Zustand + MMKV + React Query
# 생체 인증, 햅틱 피드백, 오프라인 동기화
```

</details>

<details>
<summary><b>디자인 주도 랜딩 페이지</b></summary>

```bash
/prd 모던 디자인의 AI 스타트업 랜딩 페이지

/implement ai-landing
# design-discovery 활성화 → Glassmorphism 또는 Liquid Glass 추천
# 프론트엔드 팀: Hero, Features, Pricing, CTA — 선택된 스타일 적용
```

</details>

<details>
<summary><b>백엔드 API + AI 기능</b></summary>

```bash
/prd WhisperX STT와 LLM 요약이 있는 전사 서비스

/implement --parallel transcription-service
# 백엔드 → API + DB + 인증
# AI → WhisperX + OpenAI/Anthropic 패턴
# 프론트엔드 → 업로드 UI + 전사 뷰어
```

</details>

---

## 기술 스택

| 도메인 | 기술 |
|--------|------|
| 프론트엔드 | React 19, Next.js 16+, Tailwind CSS, Radix UI |
| 백엔드 | NestJS, Express, FastAPI, Prisma, Drizzle |
| 모바일 | React Native 0.73+, Expo SDK 52+ |
| AI | WhisperX, OpenAI GPT, Anthropic Claude |
| DevOps | Docker, Kubernetes, GitHub Actions |
| 디자인 | 20개 스타일 시스템, VS 기반 디스커버리, HIG, MD3 |

---

## 기여하기

```bash
git checkout -b feature/amazing-skill
# 변경사항 작성
git commit -m 'feat: Add amazing skill'
git push origin feature/amazing-skill
# PR 생성
```

---

## 라이선스

Apache License 2.0 — [LICENSE](LICENSE) 참조.

---

<div align="center">

**Built by [WIGTN Crew](https://github.com/wigtn)**

</div>
