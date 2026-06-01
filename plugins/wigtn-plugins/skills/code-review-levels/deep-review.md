# Level 3: Deep Review

시니어 엔지니어 관점의 심층 코드 리뷰입니다. 단순 코드 품질을 넘어 **런타임 동작**, **에지 케이스**, **장기적 영향**을 분석합니다.

## When to Use

- 핵심 비즈니스 로직 변경 시
- 복잡한 상태 관리 코드
- 동시성/비동기 처리 코드
- 외부 시스템 연동 코드
- 보안에 민감한 코드
- PR 리뷰어가 "자세히 봐달라"고 요청 시

## Parallel Deep Review Protocol

> **Agent Teams 병렬 실행**: Phase 2, 3, 5를 3개 에이전트로 동시 실행하여 **2x 속도 향상**을 달성합니다.

### 병렬 실행 순서

```
┌─────────────────────────────────────────────────────────────┐
│  Deep Review Parallel Execution                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Step 1: Phase 1 (Call Chain Analysis) — BLOCKING           │
│  ├── 호출 그래프를 먼저 구축해야 나머지 분석 가능           │
│  └── 완료 대기 필수                                         │
│                                                             │
│  Step 2: Phase 2, 3, 5 — PARALLEL (3개 에이전트 동시)      │
│  ├── Agent A: Edge Case Discovery (Phase 2)                │
│  │   └── null/empty/boundary/type coercion/overflow        │
│  ├── Agent B: Concurrency Analysis (Phase 3)               │
│  │   └── shared state/atomic ops/deadlock/race condition   │
│  └── Agent C: Security Deep Dive (Phase 5)                 │
│      └── OWASP Top 10 / injection / access control         │
│                                                             │
│  Step 3: Phase 4 (Tech Debt Prediction) — BLOCKING         │
│  ├── Phase 2 + Phase 3 결과가 필요                          │
│  └── 확장성/결합도/테스트 커버리지 예측                     │
│                                                             │
│  예상 속도 향상: 2x (Phase 2,3,5가 가장 시간 소모적)       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 병렬 실행 결과 병합

```yaml
merge_protocol:
  step_2_results:
    - "Agent A → Edge Cases Found (테이블)"
    - "Agent B → Concurrency Issues (시나리오)"
    - "Agent C → Security Vulnerabilities (OWASP)"
  merge_rules:
    - "severity별 통합 정렬"
    - "같은 코드 라인의 이슈 → 병합"
    - "Risk Matrix 통합 생성"
  pass_to_step_3:
    - "Edge Case 발견 수 → Tech Debt 예측 입력"
    - "Concurrency 이슈 → 확장성 평가 입력"
```

### 순차 폴백

병렬 실행 실패 시 아래 순차 프로토콜을 그대로 사용합니다.

---

## Deep Review Protocol (Sequential)

### Phase 1: Call Chain Analysis (호출 체인 분석)

**목적**: 이 코드가 시스템에서 어떻게 사용되는지 파악

```bash
# 이 함수/클래스를 호출하는 곳 찾기
Grep: "functionName\\(" 또는 "ClassName"

# 이 함수가 호출하는 외부 의존성 파악
Read: 대상 파일 → import/require 문 분석

# 데이터 흐름 추적
입력 → 변환 → 출력 경로 문서화
```

**체크리스트:**
- [ ] 이 코드의 진입점(entry points)은 몇 개인가?
- [ ] 호출자(caller)가 기대하는 계약(contract)을 충족하는가?
- [ ] 실패 시 호출자에게 어떤 영향을 미치는가?
- [ ] 순환 의존성이 존재하는가?

**출력 예시:**
```
## Call Chain Analysis

### Entry Points (3개)
1. `POST /api/users` → `UserController.create()` → **`UserService.createUser()`**
2. `CLI: user create` → `UserCommand.execute()` → **`UserService.createUser()`**
3. `Background Job` → `SyncWorker.process()` → **`UserService.createUser()`**

### Downstream Dependencies
- `UserRepository.save()` - DB 쓰기
- `EmailService.send()` - 외부 API
- `CacheService.invalidate()` - 캐시

### Risk Assessment
- Entry Point 1, 2: 동기 호출, 실패 시 즉시 에러 반환 ✅
- Entry Point 3: 비동기, 실패 시 재시도 로직 필요 ⚠️
```

---

### Phase 2: Edge Case Discovery (에지 케이스 발굴)

**목적**: 정상 경로 외의 시나리오 발굴

**체크리스트:**
- [ ] **Null/Undefined**: 입력값이 null일 때 동작은?
- [ ] **Empty**: 빈 배열, 빈 문자열, 빈 객체 처리는?
- [ ] **Boundary**: 최솟값, 최댓값, 경계값 처리는?
- [ ] **Type Coercion**: 암묵적 타입 변환 위험은?
- [ ] **Overflow**: 숫자 오버플로우/언더플로우 가능성은?
- [ ] **Unicode**: 특수 문자, 이모지, RTL 텍스트 처리는?
- [ ] **Timing**: 타임아웃, 만료, 시간대(timezone) 이슈는?
- [ ] **Concurrency**: 동시 호출 시 동작은?

**분석 템플릿:**
```
## Edge Cases Found

### 🔴 Critical
| Case | Input | Expected | Actual | Impact |
|------|-------|----------|--------|--------|
| Null user ID | `null` | 400 Bad Request | NullPointerException | 서버 크래시 |

### 🟡 Major
| Case | Input | Expected | Actual | Impact |
|------|-------|----------|--------|--------|
| Empty array | `[]` | 빈 결과 반환 | IndexOutOfBounds | 500 에러 |

### 🟢 Minor
| Case | Input | Expected | Actual | Impact |
|------|-------|----------|--------|--------|
| Unicode name | `"🎉"` | 정상 저장 | DB 인코딩 에러 | 데이터 손실 가능 |
```

---

### Phase 3: Concurrency & Race Conditions (동시성 분석)

**목적**: 멀티스레드/비동기 환경에서의 안전성 검증

**체크리스트:**
- [ ] **Shared State**: 여러 요청이 공유하는 상태가 있는가?
- [ ] **Atomic Operations**: 읽기-수정-쓰기가 원자적인가?
- [ ] **Lock Contention**: 락 경합으로 인한 성능 저하 가능성은?
- [ ] **Deadlock**: 교착 상태 가능성은?
- [ ] **Starvation**: 특정 요청이 계속 대기할 가능성은?
- [ ] **Double Processing**: 동일 작업 중복 실행 가능성은?

**동시성 시나리오 분석:**
```
## Concurrency Analysis

### Scenario 1: 동시 업데이트
- 상황: 같은 사용자가 동시에 프로필 업데이트
- 위험: Lost Update (나중 요청이 이전 요청 덮어쓰기)
- 현재 코드: ❌ 낙관적 락 없음
- 권장: Optimistic Locking with version field

### Scenario 2: 비동기 작업 경쟁
- 상황: 결제 완료 콜백이 주문 생성보다 먼저 도착
- 위험: 존재하지 않는 주문에 결제 적용
- 현재 코드: ⚠️ 순서 보장 없음
- 권장: 이벤트 소싱 또는 상태 머신 도입
```

**언어별 동시성 패턴:**

| Language | 주의 패턴 | 권장 패턴 |
|----------|----------|----------|
| JavaScript | 전역 변수, 클로저 공유 상태 | 불변 객체, 메시지 패싱 |
| Python | GIL 외 공유 상태 | threading.Lock, asyncio.Lock |
| Go | map 동시 접근 | sync.Mutex, channel |
| Java | 비동기화 컬렉션 | ConcurrentHashMap, synchronized |

---

### Phase 4: Technical Debt Prediction (기술 부채 예측)

**목적**: 현재 코드가 미래에 야기할 문제 예측

**체크리스트:**
- [ ] **Scalability**: 데이터 10배 증가 시 동작은?
- [ ] **Extensibility**: 새 요구사항 추가 시 수정 범위는?
- [ ] **Coupling**: 이 코드 변경 시 영향받는 모듈 수는?
- [ ] **Knowledge Silo**: 이 코드를 이해하는 사람이 몇 명인가?
- [ ] **Test Coverage**: 핵심 경로가 테스트되고 있는가?

**부채 예측 매트릭스:**
```
## Technical Debt Forecast

### 6개월 후 예상 문제
| 영역 | 현재 상태 | 예상 문제 | 선제 조치 |
|------|----------|----------|----------|
| 성능 | 10ms 응답 | 데이터 증가로 1s+ | 인덱스 추가, 페이지네이션 |
| 확장성 | 단일 DB | 샤딩 필요 | ID 전략 재설계 |
| 유지보수 | 500줄 함수 | 버그 수정 어려움 | 함수 분리 |

### 리팩토링 우선순위
1. 🔴 **높음**: 동시성 이슈 (즉시)
2. 🟡 **중간**: 함수 분리 (다음 스프린트)
3. 🟢 **낮음**: 네이밍 개선 (여유 시)
```

---

### Phase 5: Security Deep Dive (보안 심층 분석)

**목적**: OWASP Top 10 및 일반 보안 취약점 검사

**체크리스트:**

**A01 - Broken Access Control:**
- [ ] 인증 없이 접근 가능한 경로는?
- [ ] 권한 검사가 모든 진입점에서 수행되는가?
- [ ] IDOR(Insecure Direct Object Reference) 가능성은?

**A02 - Cryptographic Failures:**
- [ ] 민감 데이터가 평문 저장/전송되는가?
- [ ] 약한 암호화 알고리즘 사용은?
- [ ] 하드코딩된 키/비밀번호는?

**A03 - Injection:**
- [ ] SQL Injection 가능성은?
- [ ] Command Injection 가능성은?
- [ ] XSS (Cross-Site Scripting) 가능성은?
- [ ] Template Injection 가능성은?

**A04 - Insecure Design:**
- [ ] Rate limiting이 적용되어 있는가?
- [ ] 실패 시 안전한 기본값(fail-safe)인가?
- [ ] 비즈니스 로직 우회 가능성은?

**보안 분석 출력:**
```
## Security Analysis

### Vulnerabilities Found

| Severity | Type | Location | Description | Remediation |
|----------|------|----------|-------------|-------------|
| 🔴 Critical | SQL Injection | line 45 | 사용자 입력 직접 쿼리 | Parameterized query 사용 |
| 🟡 High | Missing Auth | line 12 | 권한 검사 누락 | @RequireAuth 데코레이터 추가 |
| 🟢 Medium | Sensitive Log | line 78 | 비밀번호 로깅 | 마스킹 처리 |

### Security Score: 65/100 ⚠️
- 즉시 수정 필요: 1건
- 권장 수정: 2건
```

---

## Deep Review Output Format

```markdown
# Deep Review Report

## Overview
- **Target**: `src/services/PaymentService.ts`
- **Review Level**: Level 3 (Deep)
- **Reviewer Focus**: Concurrency, Security

## Executive Summary
결제 처리 로직에서 **동시성 이슈**와 **보안 취약점**이 발견되었습니다.
프로덕션 배포 전 수정이 필요합니다.

## Findings by Category

### 1. Call Chain Analysis
[분석 결과...]

### 2. Edge Cases (5건 발견)
[에지 케이스 목록...]

### 3. Concurrency Issues (2건)
[동시성 이슈...]

### 4. Technical Debt
[기술 부채 예측...]

### 5. Security (3건)
[보안 취약점...]

## Risk Matrix

| Category | Severity | Count | Action Required |
|----------|----------|-------|-----------------|
| Security | Critical | 1 | 즉시 수정 |
| Concurrency | High | 2 | 배포 전 수정 |
| Edge Cases | Medium | 3 | 권장 수정 |
| Tech Debt | Low | 2 | 백로그 등록 |

## Recommendations

### Must Fix (배포 차단)
1. SQL Injection 취약점 수정

### Should Fix (1주 내)
1. 동시성 제어 추가
2. 에지 케이스 처리

### Nice to Have
1. 함수 분리로 가독성 개선

## Approval Status
- [ ] 🔴 배포 불가 - Critical 이슈 존재
- [x] 🟡 조건부 승인 - High 이슈 수정 후 재검토
- [ ] 🟢 승인 - 배포 가능
```

---

## Deep Review Checklist Summary

```
Deep Review Checklist (Level 3)

□ Call Chain Analysis
  □ 모든 진입점 식별
  □ 다운스트림 의존성 파악
  □ 실패 영향 범위 분석

□ Edge Cases
  □ Null/Empty 처리
  □ 경계값 처리
  □ 타입/인코딩 이슈

□ Concurrency
  □ 공유 상태 식별
  □ 원자성 검증
  □ 락/경쟁 조건 분석

□ Technical Debt
  □ 확장성 예측
  □ 변경 영향도 분석
  □ 리팩토링 필요성 평가

□ Security
  □ 인증/인가 검증
  □ 인젝션 취약점 검사
  □ 민감 데이터 처리 검토
```
