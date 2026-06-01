# Level 4: Architecture Review

시스템 설계 관점의 아키텍처 리뷰입니다. 개별 코드가 아닌 **모듈 간 관계**, **설계 원칙 준수**, **시스템 진화 가능성**을 분석합니다.

## When to Use

- 새로운 모듈/서비스 추가 시
- 기존 아키텍처에 큰 변경이 있을 때
- 마이크로서비스 분리/통합 결정 시
- 기술 스택 변경 검토 시
- 성능/확장성 병목 해결 시
- 분기별 아키텍처 건강도 점검 시

## Parallel Architecture Review Protocol

> **Agent Teams 병렬 실행**: Phase 2, 3, 5를 3개 에이전트로 동시 실행하여 **2x 속도 향상**을 달성합니다.

### 병렬 실행 순서

```
┌─────────────────────────────────────────────────────────────┐
│  Architecture Review Parallel Execution                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Step 1: Phase 1 (Dependency Analysis) — BLOCKING           │
│  ├── 의존성 그래프를 먼저 구축해야 나머지 분석 가능         │
│  └── 완료 대기 필수                                         │
│                                                             │
│  Step 2: Phase 2, 3, 5 — PARALLEL (3개 에이전트 동시)      │
│  ├── Agent A: SOLID Principles Analysis (Phase 2)          │
│  │   ├── S: Single Responsibility                          │
│  │   ├── O: Open/Closed                                    │
│  │   ├── L: Liskov Substitution                            │
│  │   ├── I: Interface Segregation                          │
│  │   └── D: Dependency Inversion                           │
│  │   (선택: 5개 원칙을 하위 에이전트로 추가 병렬화 가능)   │
│  ├── Agent B: Layer Violation Detection (Phase 3)          │
│  │   └── 계층 규칙 위반, 역방향 의존, 직접 참조 탐지      │
│  └── Agent C: Pattern Compliance Check (Phase 5)           │
│      └── Repository/Service/Event/CQRS 패턴 준수 검증     │
│                                                             │
│  Step 3: Phase 4 (Scalability Assessment) — BLOCKING        │
│  ├── 의존성 그래프 + SOLID 결과 + Layer 위반이 필요        │
│  └── 확장성/운영성 종합 평가                                │
│                                                             │
│  예상 속도 향상: 2x (Phase 2,3,5가 가장 시간 소모적)       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### SOLID 원칙 내부 병렬화 (선택적)

Agent A는 SOLID 5개 원칙을 추가로 병렬화할 수 있습니다:

```yaml
solid_sub_parallelization:
  enabled: false          # 기본값: 비활성 (Agent A 단독 처리)
  activation: "클래스 수 > 20개일 때 자동 활성화"
  agents:
    - "sub-agent-S: Single Responsibility"
    - "sub-agent-O: Open/Closed"
    - "sub-agent-L: Liskov Substitution"
    - "sub-agent-I: Interface Segregation"
    - "sub-agent-D: Dependency Inversion"
  merge: "5개 원칙 점수 합산 → SOLID Compliance Score"
```

### 병렬 실행 결과 병합

```yaml
merge_protocol:
  step_2_results:
    - "Agent A → SOLID Compliance Score (원칙별 점수)"
    - "Agent B → Layer Violations (위반 목록)"
    - "Agent C → Pattern Compliance (패턴별 준수율)"
  merge_rules:
    - "Architecture Health Score 통합 계산"
    - "severity별 통합 정렬"
    - "ADR 권고 사항 통합"
  pass_to_step_3:
    - "SOLID 위반 → 확장성 위험 입력"
    - "Layer 위반 → 운영성 평가 입력"
```

### 순차 폴백

병렬 실행 실패 시 아래 순차 프로토콜을 그대로 사용합니다.

---

## Architecture Review Protocol (Sequential)

### Phase 1: Dependency Analysis (의존성 분석)

**목적**: 모듈 간 의존 관계와 결합도 파악

```bash
# 의존성 그래프 생성을 위한 분석
Glob: "**/package.json" | "**/requirements.txt" | "**/go.mod"
Grep: "import|require|from" in src/**/*

# 모듈 경계 식별
Glob: "**/index.ts" | "**/__init__.py" | "**/mod.rs"
```

**체크리스트:**
- [ ] 순환 의존성(Circular Dependency)이 존재하는가?
- [ ] 의존 방향이 올바른가? (상위 → 하위)
- [ ] 불필요한 의존성이 있는가?
- [ ] 의존성 버전이 고정되어 있는가?

**의존성 매트릭스:**
```
## Dependency Matrix

### Module Dependencies

| From \ To | Core | Domain | Infra | UI | External |
|-----------|------|--------|-------|----|---------|
| Core      | -    | ❌     | ❌    | ❌ | ❌      |
| Domain    | ✅   | -      | ❌    | ❌ | ❌      |
| Infra     | ✅   | ✅     | -     | ❌ | ✅      |
| UI        | ✅   | ✅     | ✅    | -  | ❌      |

✅ = 허용된 의존
❌ = 금지된 의존 (위반 시 표시)

### Violations Found
1. 🔴 `UI → External`: UI 레이어에서 외부 API 직접 호출
   - 위치: `components/UserCard.tsx:45`
   - 수정: Infra 레이어를 통해 호출

2. 🟡 `Domain → Infra`: 도메인에서 DB 직접 접근
   - 위치: `domain/User.ts:78`
   - 수정: Repository 인터페이스 사용
```

**의존성 그래프 시각화:**
```
## Dependency Graph

┌─────────────────────────────────────────────────┐
│                    External                      │
│              (APIs, Libraries)                   │
└─────────────────────────────────────────────────┘
                       ↑
┌─────────────────────────────────────────────────┐
│                Infrastructure                    │
│     (DB, Cache, Queue, External Adapters)       │
└─────────────────────────────────────────────────┘
                       ↑
┌─────────────────────────────────────────────────┐
│                   Domain                         │
│        (Business Logic, Entities)               │
└─────────────────────────────────────────────────┘
                       ↑
┌─────────────────────────────────────────────────┐
│                    Core                          │
│         (Interfaces, DTOs, Utils)               │
└─────────────────────────────────────────────────┘

[!] 위반 발견: Domain ← UI (역방향 의존)
```

---

### Phase 2: SOLID Principles Analysis (SOLID 원칙 분석)

**목적**: 객체지향 설계 원칙 준수 여부 검증

#### S - Single Responsibility Principle (단일 책임)

**체크리스트:**
- [ ] 클래스/모듈이 하나의 책임만 가지는가?
- [ ] 변경 이유가 하나뿐인가?
- [ ] 클래스 이름이 책임을 명확히 표현하는가?

**위반 패턴:**
```
🔴 God Class
- UserService가 인증, 프로필, 알림, 결제 모두 처리
- 파일 크기: 2,500줄
- 메서드 수: 85개

권장: 도메인별 서비스 분리
- AuthService (인증)
- ProfileService (프로필)
- NotificationService (알림)
- PaymentService (결제)
```

#### O - Open/Closed Principle (개방/폐쇄)

**체크리스트:**
- [ ] 새 기능 추가 시 기존 코드 수정 없이 확장 가능한가?
- [ ] 조건문(if/switch) 대신 다형성을 사용하는가?
- [ ] 설정/전략 패턴으로 동작을 변경할 수 있는가?

**위반 패턴:**
```
🔴 Switch Statement Smell

// 현재 (위반)
function calculateDiscount(type: string) {
  switch(type) {
    case 'VIP': return 0.3;
    case 'GOLD': return 0.2;
    case 'SILVER': return 0.1;
    // 새 타입 추가 시 여기 수정 필요
  }
}

// 권장 (OCP 준수)
interface DiscountStrategy {
  calculate(): number;
}
class VIPDiscount implements DiscountStrategy { ... }
class GoldDiscount implements DiscountStrategy { ... }
```

#### L - Liskov Substitution Principle (리스코프 치환)

**체크리스트:**
- [ ] 자식 클래스가 부모를 완전히 대체할 수 있는가?
- [ ] 상속이 "is-a" 관계를 정확히 표현하는가?
- [ ] 자식이 부모의 계약을 위반하지 않는가?

**위반 패턴:**
```
🔴 Square/Rectangle Problem

class Rectangle {
  setWidth(w) { this.width = w; }
  setHeight(h) { this.height = h; }
}

class Square extends Rectangle {
  setWidth(w) { this.width = w; this.height = w; } // LSP 위반!
}

// rect.setWidth(5); rect.setHeight(10);
// Rectangle: area = 50
// Square: area = 100 (예상과 다름!)
```

#### I - Interface Segregation Principle (인터페이스 분리)

**체크리스트:**
- [ ] 인터페이스가 작고 집중적인가?
- [ ] 클라이언트가 사용하지 않는 메서드에 의존하지 않는가?
- [ ] 하나의 거대 인터페이스 대신 여러 작은 인터페이스를 사용하는가?

**위반 패턴:**
```
🔴 Fat Interface

// 위반
interface UserRepository {
  find(id): User;
  save(user): void;
  delete(id): void;
  findByEmail(email): User;
  findByPhone(phone): User;
  exportToCSV(): string;      // 리포지토리 책임 아님
  sendNotification(): void;   // 리포지토리 책임 아님
}

// 권장: 인터페이스 분리
interface UserReader { find(id): User; }
interface UserWriter { save(user): void; delete(id): void; }
interface UserSearcher { findByEmail(email): User; findByPhone(phone): User; }
```

#### D - Dependency Inversion Principle (의존성 역전)

**체크리스트:**
- [ ] 고수준 모듈이 저수준 모듈에 직접 의존하지 않는가?
- [ ] 추상화(인터페이스)에 의존하는가?
- [ ] 의존성 주입이 적용되어 있는가?

**위반 패턴:**
```
🔴 Direct Dependency

// 위반
class OrderService {
  private db = new MySQLDatabase();  // 구체 클래스에 직접 의존

  save(order) {
    this.db.insert('orders', order);
  }
}

// 권장: DIP 준수
class OrderService {
  constructor(private repository: OrderRepository) {}  // 인터페이스에 의존

  save(order) {
    this.repository.save(order);
  }
}
```

**SOLID 점수표:**
```
## SOLID Compliance Score

| Principle | Score | Status | Issues |
|-----------|-------|--------|--------|
| Single Responsibility | 6/10 | ⚠️ | 2 God Classes |
| Open/Closed | 8/10 | ✅ | 1 Switch smell |
| Liskov Substitution | 10/10 | ✅ | None |
| Interface Segregation | 5/10 | ⚠️ | 3 Fat Interfaces |
| Dependency Inversion | 7/10 | ⚠️ | 5 Direct dependencies |

**Total SOLID Score: 72/100**
```

---

### Phase 3: Layer Violation Detection (계층 위반 탐지)

**목적**: 아키텍처 계층 규칙 준수 여부 검증

**표준 계층 구조:**
```
┌────────────────────────────────────────┐
│           Presentation Layer           │
│    (Controllers, Views, API Routes)    │
├────────────────────────────────────────┤
│           Application Layer            │
│      (Use Cases, App Services)         │
├────────────────────────────────────────┤
│             Domain Layer               │
│    (Entities, Domain Services,         │
│     Value Objects, Domain Events)      │
├────────────────────────────────────────┤
│          Infrastructure Layer          │
│   (Repositories, External Services,    │
│    Persistence, Messaging)             │
└────────────────────────────────────────┘
```

**위반 탐지 규칙:**

| From | To | 허용 | 위반 시 문제 |
|------|----|----|------------|
| Presentation | Application | ✅ | - |
| Presentation | Domain | ⚠️ | 결합도 증가 |
| Presentation | Infrastructure | ❌ | 테스트 어려움 |
| Application | Domain | ✅ | - |
| Application | Infrastructure | ✅ (Interface) | 구현체 직접 참조 시 위반 |
| Domain | Infrastructure | ❌ | DIP 위반 |
| Domain | Application | ❌ | 역방향 의존 |

**위반 탐지 출력:**
```
## Layer Violations

### Critical Violations (3건)
1. **Domain → Infrastructure**
   - File: `domain/entities/User.ts:23`
   - Code: `import { PrismaClient } from '@prisma/client'`
   - Impact: 도메인이 ORM에 의존, 테스트/교체 어려움
   - Fix: Repository 인터페이스 도입

2. **Presentation → Infrastructure**
   - File: `controllers/UserController.ts:45`
   - Code: `const redis = new Redis()`
   - Impact: 컨트롤러가 캐시 구현에 의존
   - Fix: CacheService 주입

### Warnings (2건)
1. **Presentation → Domain (직접 참조)**
   - File: `routes/api.ts:12`
   - Code: `import { User } from '../domain/entities'`
   - Suggestion: DTO 사용 권장
```

---

### Phase 4: Scalability & Operability Assessment (확장성/운영성 평가)

**목적**: 프로덕션 환경에서의 운영 가능성 평가

#### Scalability (확장성)

**체크리스트:**
- [ ] **Stateless**: 서버가 상태를 저장하지 않는가?
- [ ] **Horizontal Scaling**: 인스턴스 추가로 확장 가능한가?
- [ ] **Database Scaling**: 읽기/쓰기 분리, 샤딩 준비가 되어 있는가?
- [ ] **Cache Strategy**: 캐싱 전략이 적절한가?
- [ ] **Async Processing**: 무거운 작업이 비동기로 처리되는가?

**확장성 점검표:**
```
## Scalability Assessment

### Current State
| Metric | Value | Target | Gap |
|--------|-------|--------|-----|
| Max Concurrent Users | 1,000 | 10,000 | 10x |
| Response Time (p99) | 500ms | 100ms | 5x |
| DB Connections | 100 | 1,000 | 10x |

### Bottlenecks Identified
1. 🔴 **Session Storage**: 메모리 기반 세션
   - Impact: 서버 재시작 시 세션 손실, 스케일아웃 불가
   - Solution: Redis 세션 스토어

2. 🟡 **Synchronous API Calls**: 외부 API 동기 호출
   - Impact: 응답 시간 증가, 연쇄 장애
   - Solution: 비동기 처리 + Circuit Breaker

3. 🟡 **Single Database**: 단일 DB 인스턴스
   - Impact: 읽기/쓰기 병목
   - Solution: Read Replica 도입
```

#### Operability (운영성)

**체크리스트:**
- [ ] **Observability**: 로깅, 메트릭, 트레이싱이 적용되어 있는가?
- [ ] **Health Checks**: 헬스체크 엔드포인트가 있는가?
- [ ] **Graceful Shutdown**: 정상 종료가 구현되어 있는가?
- [ ] **Configuration**: 환경별 설정 분리가 되어 있는가?
- [ ] **Secrets Management**: 비밀 정보가 안전하게 관리되는가?

**운영성 점검표:**
```
## Operability Assessment

### Observability
| Area | Status | Tool | Coverage |
|------|--------|------|----------|
| Logging | ✅ | Winston | 90% |
| Metrics | ⚠️ | Prometheus | 40% |
| Tracing | ❌ | - | 0% |

### Reliability
| Area | Status | Notes |
|------|--------|-------|
| Health Check | ✅ | /health, /ready |
| Graceful Shutdown | ⚠️ | HTTP만, Background Job 미처리 |
| Circuit Breaker | ❌ | 외부 API 호출에 미적용 |
| Retry Logic | ⚠️ | 일부만 적용 |

### Configuration
| Area | Status | Risk |
|------|--------|------|
| Env Separation | ✅ | - |
| Secrets in Env | ⚠️ | Vault 미사용 |
| Feature Flags | ❌ | 하드코딩된 조건문 |
```

---

### Phase 5: Pattern Compliance (패턴 준수 여부)

**목적**: 프로젝트에서 채택한 아키텍처 패턴 준수 검증

**공통 패턴 체크리스트:**

#### Repository Pattern
- [ ] 데이터 접근이 Repository를 통해 이루어지는가?
- [ ] Repository가 인터페이스로 정의되어 있는가?
- [ ] 도메인 객체가 직접 ORM에 의존하지 않는가?

#### Service Layer Pattern
- [ ] 비즈니스 로직이 Service에 집중되어 있는가?
- [ ] Controller가 얇은가? (thin controller)
- [ ] Transaction 경계가 Service에서 관리되는가?

#### Event-Driven Pattern (해당 시)
- [ ] 이벤트가 도메인 변경을 표현하는가?
- [ ] 이벤트 핸들러가 멱등성을 가지는가?
- [ ] 이벤트 순서에 의존하지 않는가?

#### CQRS Pattern (해당 시)
- [ ] 읽기/쓰기 모델이 분리되어 있는가?
- [ ] Query가 상태를 변경하지 않는가?
- [ ] Command가 결과를 반환하지 않는가?

---

## Architecture Review Output Format

```markdown
# Architecture Review Report

## Overview
- **Scope**: 전체 시스템 / 특정 모듈
- **Review Level**: Level 4 (Architecture)
- **Architecture Style**: Layered / Hexagonal / Microservices

## Executive Summary
시스템 아키텍처는 전반적으로 **양호**하나, **계층 위반** 3건과
**SOLID 원칙 위반** 5건이 발견되었습니다. 확장성 측면에서
세션 관리와 DB 스케일링 전략 개선이 필요합니다.

## Architecture Health Score

| Category | Score | Grade |
|----------|-------|-------|
| Dependency Management | 75/100 | B |
| SOLID Compliance | 72/100 | C+ |
| Layer Integrity | 68/100 | C |
| Scalability | 60/100 | D |
| Operability | 70/100 | C |
| **Overall** | **69/100** | **C** |

## Key Findings

### 1. Dependency Analysis
[의존성 매트릭스 및 그래프...]

### 2. SOLID Violations (5건)
[각 원칙별 위반 사항...]

### 3. Layer Violations (3건)
[계층 위반 목록...]

### 4. Scalability Concerns
[확장성 병목 지점...]

### 5. Operability Gaps
[운영성 개선 필요 사항...]

## Architecture Decision Records (ADR) Recommendations

### ADR-001: 세션 스토어 마이그레이션
- **Status**: Proposed
- **Context**: 현재 메모리 기반 세션으로 스케일아웃 불가
- **Decision**: Redis 세션 스토어로 전환
- **Consequences**:
  - 스케일아웃 가능
  - 세션 공유 가능
  - Redis 운영 비용 추가

### ADR-002: Repository 패턴 도입
- **Status**: Proposed
- **Context**: Domain이 직접 ORM에 의존
- **Decision**: Repository 인터페이스 도입
- **Consequences**:
  - 테스트 용이성 향상
  - DB 교체 가능
  - 보일러플레이트 증가

## Roadmap

### Immediate (이번 스프린트)
1. 🔴 Critical 계층 위반 수정

### Short-term (1개월)
1. 🟡 SOLID 위반 리팩토링
2. 🟡 세션 스토어 마이그레이션

### Long-term (분기)
1. 🟢 Observability 강화
2. 🟢 CQRS 패턴 도입 검토

## Approval Status
- [ ] 🔴 아키텍처 재검토 필요
- [x] 🟡 조건부 승인 - 로드맵 이행 필요
- [ ] 🟢 승인 - 현 아키텍처 유지
```

---

## Architecture Review Checklist Summary

```
Architecture Review Checklist (Level 4)

□ Dependency Analysis
  □ 순환 의존성 검사
  □ 의존 방향 검증
  □ 불필요한 의존성 식별

□ SOLID Principles
  □ Single Responsibility
  □ Open/Closed
  □ Liskov Substitution
  □ Interface Segregation
  □ Dependency Inversion

□ Layer Integrity
  □ 계층 규칙 정의 확인
  □ 위반 사항 탐지
  □ 수정 방안 제시

□ Scalability
  □ Stateless 여부
  □ 수평 확장 가능성
  □ 병목 지점 식별

□ Operability
  □ Observability (Logging/Metrics/Tracing)
  □ Health Checks
  □ Configuration Management
  □ Graceful Shutdown

□ Pattern Compliance
  □ 채택 패턴 식별
  □ 준수 여부 검증
  □ 개선 권고
```
