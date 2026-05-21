# User Flow — {feature-name}

> **Generated from**: docs/prd/PRD_{feature-name}.md §5.5
> **Created**: {YYYY-MM-DD}
> **Status**: Draft

## Flow A: 작성자 — 신규 골든셋 제출

> Acceptance Criteria 매핑: Scenario A, B, E

```mermaid
flowchart TD
  Start([현업 진입]) --> Email[이메일 입력]
  Email --> SendLink{Magic Link 발송}
  SendLink -->|domain whitelist OK| LinkSent[메일 발송 안내]
  SendLink -->|domain 거부| NoPerm[no-permission 안내]
  LinkSent --> Click[메일 링크 클릭]
  Click --> Submit[/submit 페이지/]
  Submit --> Guide[인라인 가이드 노출]
  Guide --> Fill[필드 입력]
  Fill --> Validate{클라이언트 검증}
  Validate -->|FAIL| Fill
  Validate -->|PASS| ServerValidate{서버 검증}
  ServerValidate -->|422 SENSITIVE_DATA| Fill
  ServerValidate -->|400 INVALID_INPUT| Fill
  ServerValidate -->|201 OK| Toast[성공 토스트]
  Toast --> MyList[/my 목록/]
```

## Flow B: 작성자 — 본인 항목 수정

> Acceptance Criteria 매핑: Scenario D

```mermaid
flowchart TD
  Start([/my 진입]) --> List[목록 표시]
  List --> Click[항목 클릭]
  Click --> CheckStatus{status 확인}
  CheckStatus -->|submitted| Edit[/submit?id= 페이지/]
  CheckStatus -->|reviewed/approved| Locked[수정 불가 안내]
  Edit --> Save{저장}
  Save -->|성공| List
  Save -->|FAIL| Edit
```

## Flow C: PM — 익스포트

> Acceptance Criteria 매핑: Scenario C

```mermaid
flowchart TD
  Start([/admin 진입]) --> CheckRole{admin role?}
  CheckRole -->|No| Redirect[/ 로 리다이렉트]
  CheckRole -->|Yes| List[전체 목록]
  List --> Filter[상태=approved 필터]
  Filter --> ExportBtn[JSON Export 클릭]
  ExportBtn --> Modal[익명화 옵션 모달]
  Modal --> Download((JSON 다운로드))
```

## Flow Coverage Check

| Acceptance Criteria | Flow |
|--------------------|------|
| Scenario A | Flow A |
| Scenario B | Flow A (Guide 노드) |
| Scenario C | Flow C |
| Scenario D | Flow B |
| Scenario E | Flow A (Guide 노드) |

**규칙**:
- 모든 Acceptance Criteria가 1+ Flow에 매핑되어야 함
- 매핑되지 않는 시나리오 → Flow를 추가하거나 시나리오가 모호

## Branch Conditions Reference

| 분기 노드 | 조건 | 처리 |
|----------|------|------|
| Magic Link 발송 | `email.domain in whitelist` | OK / no-permission |
| 클라이언트 검증 | `question.length >= 10 && answer_points.length >= 3 && source_pages.length >= 1` | PASS / FAIL |
| 서버 검증 | 민감 정보 정규식 매치 | 422 / 400 / 201 |
| status 확인 | `status in ['draft', 'submitted']` | 수정 가능 / 잠금 |
| admin role | `user.role === 'admin'` | 허용 / 리다이렉트 |

## Open Questions

- [ ] Magic Link 만료 시 흐름이 어디서 분기되는가?
- [ ] 폼 입력 중 자동 저장은 별도 Flow인가?
