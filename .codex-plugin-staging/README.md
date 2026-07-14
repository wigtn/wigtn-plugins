<div align="center">

# WIGTN Plugins for Codex

**Codex의 자율성은 그대로. WIGTN의 제품 개발 노하우는 필요한 순간에만.**

![Version](https://img.shields.io/badge/version-0.1.0-6C5CE7?style=for-the-badge)
![Skills](https://img.shields.io/badge/skills-8-00B894?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-Codex-111827?style=for-the-badge)
![License](https://img.shields.io/badge/license-Apache--2.0-0984E3?style=for-the-badge)

</div>

---

## 왜 WIGTN for Codex인가요?

Codex는 코드 탐색, 설계 판단, 구현과 기본 리뷰를 이미 잘합니다. WIGTN 플러그인은 그 능력을 무거운 절차로 감싸지 않습니다. 대신 PRD, 화면정의, 인수조건 검증, 안전한 릴리스처럼 **제품 개발에 반복적으로 필요한 작업 계약**만 스킬로 제공합니다.

```text
일반 코딩 요청     → Codex가 평소처럼 자유롭게 처리
제품 워크플로 요청 → 가장 작은 WIGTN 스킬이 자동 선택
전체 구현 요청     → $verified-delivery를 명시했을 때만 실행
```

핵심 원칙은 간단합니다.

- 평소에는 가볍게: 일반 수정에 PRD나 팀 배정을 강제하지 않습니다.
- 점수보다 증거: 파일, 라인, 테스트 결과와 실행 로그로 판단합니다.
- 프로젝트 우선: 일반론보다 저장소의 기존 패턴과 디자인 언어를 먼저 읽습니다.
- 권한은 명확하게: 요청 없이 커밋, 푸시, PR, 배포를 실행하지 않습니다.

---

## 빠른 시작

Codex에서 이 저장소의 마켓플레이스를 추가한 뒤 `wigtn-plugins-with-codex`를 설치하세요. 설치 후에는 별도 명령을 외울 필요 없이 자연어로 요청하면 됩니다.

```text
"OAuth 로그인 기능 PRD 뽑아줘"
"이 PRD로 화면정의서 만들어줘"
"요구사항이 실제 구현에 반영됐는지 검증해줘"
"변경사항 검증하고 커밋해줘"
```

특정 스킬을 확실히 지정하고 싶다면 `$스킬명`으로 호출할 수 있습니다.

```text
$wigtn-plugins-with-codex:product-spec OAuth 로그인 PRD 만들어줘
$wigtn-plugins-with-codex:verified-delivery 이 기능 구현하고 검증해줘
```

---

## 전체 워크플로

```text
아이디어
  │
  ▼
product-spec ───────── PRD 생성·검토·딥다이브
  │
  ├── screen-spec ──── IA·사용자 흐름·화면 명세·와이어프레임
  │        │
  │        └── design-direction ── 프로젝트 네이티브 디자인 방향
  │
  ▼
verified-delivery ──── 명시 호출 기반 구현·로컬 검증
  │
  ▼
acceptance-verifier ── 요구사항 ↔ 코드·테스트 증거 매핑
  │
  ▼
release-readiness ──── 안전한 커밋·푸시·PR
```

문서나 발표가 필요할 때는 `handdrawn-diagram`, `wigtn-presentation`을 독립적으로 사용할 수 있습니다.

---

## 포함된 8개 스킬

| 스킬 | 하는 일 | 자연어 호출 예시 | 호출 정책 |
|---|---|---|---|
| `product-spec` | 구현 가능한 PRD 생성, 리뷰, 딥다이브 | “PRD 뽑아줘” | 자동 |
| `screen-spec` | IA, User Flow, 화면 명세, lo-fi HTML 와이어프레임, 개발 핸드오프 | “화면정의서 만들어줘” | 자동 |
| `acceptance-verifier` | PRD 요구사항과 코드·실행 테스트 증거를 연결해 충족 여부 판정 | “요구사항 반영됐는지 검증해줘” | 자동 |
| `design-direction` | 기존 디자인 시스템을 먼저 읽고 신규 UI 방향 제안 | “이 UI 디자인 방향 잡아줘” | 자동·제한적 |
| `verified-delivery` | 구현부터 테스트·타입체크·빌드까지 전체 전달 루프 실행 | `$verified-delivery로 구현해줘` | **명시 호출 전용** |
| `release-readiness` | 변경 범위를 보존하며 검증, 커밋, 푸시, PR 수행 | “커밋해줘”, “PR 올려줘” | 자동·제한적 |
| `handdrawn-diagram` | Mermaid handDrawn 소스와 검증된 SVG·PNG 생성 | “손그림 아키텍처 만들어줘” | 자동 |
| `wigtn-presentation` | WIGTN 잉크 네이비와 퍼플 점을 적용한 브랜드 발표자료 생성 | “WIGTN 발표자료 만들어줘” | 자동·제한적 |

### 자동 호출과 명시 호출

대부분의 스킬은 요청 의도가 설명과 일치할 때 Codex가 자동으로 선택합니다. `verified-delivery`만 예외입니다. 일반적인 코딩 요청이 의도치 않게 전체 전달 파이프라인으로 커지는 것을 막기 위해 `$verified-delivery`를 명시해야 합니다.

---

## Claude Code 버전과 무엇이 다른가요?

이 플러그인은 기존 Claude Code 플러그인을 디렉터리째 복사한 포팅이 아니라, Codex에 맞춘 선택적 재설계입니다.

| Claude Code 플러그인 | Codex 플러그인 |
|---|---|
| 13개 역할 에이전트와 5개 슬래시 명령 | 하나의 책임을 가진 8개 스킬 |
| 고정된 병렬 팀 오케스트레이션 | Codex의 기본 탐색·구현 판단 활용 |
| `/prd`, `/implement`, `/auto-commit` | 자연어 자동 선택과 `$스킬명` 명시 호출 |
| 숫자 기반 품질 게이트 | 코드·테스트·실행 결과 기반 증거 |
| 전체 파이프라인 중심 | 필요한 순간에만 열리는 얇은 워크플로 |

Claude 전용 도구 이름, 고정 서브에이전트 fan-out, 자동 모델 라우팅, 자동 의존성 설치와 파괴적 롤백은 포함하지 않습니다. 자세한 설계 배경은 [마이그레이션 문서](docs/MIGRATION.md)를 참고하세요.

---

## 저장소 구조

```text
.
├── .agents/plugins/marketplace.json
├── docs/
│   ├── PRD.md
│   ├── EVALS.md
│   └── MIGRATION.md
├── plugins/wigtn-plugins-with-codex/
│   ├── .codex-plugin/plugin.json
│   ├── scripts/
│   └── skills/
│       ├── product-spec/
│       ├── screen-spec/
│       ├── acceptance-verifier/
│       ├── design-direction/
│       ├── verified-delivery/
│       ├── release-readiness/
│       ├── handdrawn-diagram/
│       └── wigtn-presentation/
├── scripts/
└── tests/
```

---

## 검증

매니페스트, 스킬 구조, 정책과 트리거 계약을 한 번에 검사합니다.

```bash
./scripts/validate.sh
```

평가 케이스까지 실행하려면:

```bash
./scripts/run-evals.sh
```

트리거 fixture는 결정론적인 계약 검사입니다. 실제 자연어 자동 선택은 설치 후 새 Codex 작업에서 별도로 smoke test 해야 합니다.

---

## 안전 설계

- 일반 코딩에 제품 워크플로를 강제하지 않습니다.
- `verified-delivery`는 명시적으로 호출해야 합니다.
- 사용자 요청 없이 커밋, 푸시, PR, 이슈 생성 또는 배포를 하지 않습니다.
- 저장소의 기존 변경사항을 사용자 작업으로 취급하고 보존합니다.
- MCP, 앱, lifecycle hook, 자동 Sol/Terra/Luna 라우팅을 MVP에 번들하지 않습니다.

---

## 라이선스

[Apache License 2.0](LICENSE)
