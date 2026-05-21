# Dev Handoff — {feature-name}

> **Generated from**: 01-IA.md + 02-USER-FLOW.md + 03-SCREEN-SPEC.md + 04-WIREFRAME.html
> **Target**: `/implement {feature-name}`
> **Created**: {YYYY-MM-DD}

## 1. FR ↔ Screen ↔ Component Mapping

| FR | Description | Screens | Components | Estimated Tasks |
|----|------------|---------|-----------|----------------|
| FR-001 | Magic Link 인증 | `/`, auth gate on `/submit`,`/my`,`/admin` | LoginForm, AuthGate | 1. Supabase Auth 설정 / 2. 도메인 화이트리스트 검증 / 3. AuthGate HOC |
| FR-002 | 작성 폼 | `/submit` | GoldenSetForm, FieldDynamic, FormSection | 1. 폼 마크업 / 2. 동적 bullet / 3. 폼 상태관리 |
| FR-003 | 필드 검증 | `/submit` | useFormValidation, ServerValidationBanner | 1. zod 스키마 / 2. 422 에러 처리 |
| FR-004 | 인라인 가이드 | `/submit` | ReferencePanel, GuideCallout | 1. 우측 패널 (Desktop) / 2. 모달 (Mobile) |
| FR-005 | 본인 목록 | `/my` | MyList, EditButton, EmptyState | 1. 테이블 (Desktop) / 2. 카드 (Mobile) / 3. status-aware 잠금 |
| FR-006 | 관리자 화면 | `/admin` | AdminTable, FilterBar, BulkAction | 1. 필터 / 2. 테이블 / 3. 일괄 상태 변경 |
| FR-007 | 익스포트 | `/admin` | ExportButton, AnonymizeToggle, ExportModal | 1. JSON/CSV 변환 / 2. 익명화 옵션 / 3. 다운로드 트리거 |
| FR-008 | status 워크플로 | DB + `/admin` | StatusSelect | 1. 마이그레이션 enum / 2. 상태 변경 API |
| FR-009 | 첨부 업로드 | `/submit` | FileUpload | 1. Supabase Storage / 2. 5MB 제한 |
| FR-010 | 반응형 | All | useBreakpoint | 1. 분기점 utility / 2. /admin Desktop-only 가드 |

### Coverage Check
- 모든 FR 매핑됨: ✓ (FR-001~FR-010)
- 모든 화면이 1+ FR과 연결: ✓
- 화면에 매핑되지 않은 FR: 없음

## 2. Component Inventory

### Reusable (다른 기능에서도 재사용 가능)
- `LoginForm` — Magic Link 이메일 입력
- `AuthGate` — 인증 필요 페이지 래퍼
- `EmptyState` — 빈 상태 표준 컴포넌트
- `useBreakpoint` — 반응형 hook
- `useFormValidation` — zod 기반 폼 검증

### Feature-specific
- `GoldenSetForm` — /submit 메인 폼
- `FieldDynamic` — 동적 bullet 입력
- `ReferencePanel` — 4대 원칙 + reference Q&A
- `MyList` — 본인 작성 목록
- `AdminTable` — 관리자 테이블
- `ExportModal` — 익스포트 옵션 모달

## 3. State Management

| Scope | Library | Note |
|-------|---------|------|
| Auth | Supabase client (built-in) | session, user |
| Form | react-hook-form + zod | /submit |
| Server data | TanStack Query (or SWR) | /my, /admin 목록 |
| UI state (modal, toast) | jotai or zustand | 가벼운 전역 |

## 4. Data Fetching Patterns

| Screen | API | Strategy |
|--------|-----|----------|
| `/` | `supabase.auth.signInWithOtp` | mutation |
| `/submit` (신규) | `POST /api/v1/golden-set` | mutation + optimistic |
| `/submit?id=x` | `GET /api/v1/golden-set/{id}` | query |
| `/my` | `GET /api/v1/golden-set/my` | query + filter |
| `/admin` | `GET /api/v1/admin/golden-set` | query + pagination |

## 5. Routing

```
app/
├── page.tsx                    # /
├── submit/page.tsx             # /submit
├── my/page.tsx                 # /my
├── admin/page.tsx              # /admin
└── admin/stats/page.tsx        # /admin/stats (P2)
```

Auth middleware: `middleware.ts` — `/submit`, `/my`, `/admin/*` 보호.

## 6. Suggested Implementation Order

Task Plan(`docs/todo_plan/PLAN_{feature-name}.md`)에 반영할 순서:

1. **Phase 1: Foundation**
   - Next.js 14 + Tailwind 부트스트랩
   - Supabase 프로젝트 + 마이그레이션
   - Magic Link 인증

2. **Phase 2: Author Path**
   - `/submit` 폼 + 검증
   - `/my` 목록
   - 인라인 가이드 (Reference Panel)

3. **Phase 3: Admin Path**
   - `/admin` 테이블 + 필터
   - 익스포트 (JSON/CSV)
   - 익명화 옵션

4. **Phase 4: Polish**
   - 반응형 마무리
   - 에러 처리 / 빈 상태
   - 첨부 파일 업로드 (P1)

## 7. Open Questions Carried Over

01-IA.md, 02-USER-FLOW.md, 03-SCREEN-SPEC.md에서 결정되지 않은 항목 통합:

- [ ] /admin → /admin/stats 진입점 (사이드바 vs 탭)
- [ ] /admin 모바일: desktop-only 안내 화면 디자인
- [ ] Magic Link 만료 시 분기 흐름
- [ ] 폼 자동 저장 주기
- [ ] 폼 이탈 unsaved warning
- [ ] /admin 페이지네이션 vs 무한 스크롤
- [ ] 일괄 상태 변경 confirm modal

**규칙**: 이 질문들은 `/implement` 진행 중 즉시 결정하거나, 결정 보류 시 코드 주석으로 TODO 표시.

## 8. Acceptance Mapping for /implement

`/implement`가 PRD Acceptance Criteria(§2.2)를 task로 분해할 때 참조:

| Scenario | Implementation Tasks |
|----------|---------------------|
| Scenario A | FR-001 + FR-002 + FR-003 tasks |
| Scenario B | FR-004 tasks |
| Scenario C | FR-006 + FR-007 tasks |
| Scenario D | FR-005 + FR-008 tasks (status-aware lock) |
| Scenario E | FR-004 (microcopy in /submit) |
