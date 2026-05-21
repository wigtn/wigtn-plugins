# Screen Specifications — {feature-name}

> **Generated from**: docs/prd/PRD_{feature-name}.md
> **Style**: {style-name} (design-discovery 추천)
> **Created**: {YYYY-MM-DD}

## Convention

각 화면은 다음 7개 슬롯을 모두 채운다:

1. **Meta**: Audience / Auth / Linked FRs / Layout / Responsive
2. **States**: §5.4.1에서 체크된 상태마다 1줄 이상
3. **Components**: 폼 필드/버튼/리스트 등 모든 UI 슬롯
4. **Microcopy**: 진입 안내, 버튼 라벨, 에러 메시지, 빈 상태 메시지
5. **Responsive**: 분기점별 레이아웃 변화
6. **Wireframe Anchor**: 04-WIREFRAME.html의 anchor
7. **Open Questions** (선택): 명세 진입 시 결정되지 않은 항목

---

## Screen: / (Landing)

| 항목 | 값 |
|---|---|
| Audience | guest, author, admin |
| Auth | Optional (Magic Link 미인증 가능) |
| Linked FRs | FR-001 |
| Layout | Hero + Email Form, max-width 480px center |
| Responsive | Desktop / Mobile |

### States
- [x] loading: Magic Link 메일 발송 중 버튼 disabled + 스피너
- [ ] empty: N/A
- [x] error: domain 거부 → 빨간 inline 메시지
- [x] success: 발송 완료 → "메일을 확인해주세요" 화면 전환
- [ ] no-permission: N/A (Landing은 public)

### Components

| Slot | Type | Required | Validation | Microcopy |
|---|---|---|---|---|
| email | input[type=email] | Yes | RFC 5322 + 도메인 whitelist | "회사 이메일을 입력하세요" |
| submit | button | Yes | - | "Magic Link 받기" |

### Microcopy
- 헤드라인: "골든셋 작성 포털"
- 서브: "SK에코플랜트 도메인 전문가 전용"
- 에러: "회사 이메일(@sk*.co.kr, @brain-crew.com)만 가능합니다"
- 성공: "메일함에서 로그인 링크를 확인하세요 (5분 이내)"

### Responsive
- Desktop (≥1024px): 중앙 정렬 480px 카드, 배경 그라데이션
- Mobile (<768px): 풀폭 카드, padding 16px

### Wireframe Anchor
→ `04-WIREFRAME.html#screen-landing`

---

## Screen: /submit (작성 폼)

| 항목 | 값 |
|---|---|
| Audience | author |
| Auth | Required (Magic Link) |
| Linked FRs | FR-002, FR-003, FR-004 |
| Layout | Single column form, max-width 720px |
| Responsive | Desktop / Tablet / Mobile |

### States
- [x] loading: 폼 데이터 fetch 중 (수정 시) 스켈레톤
- [ ] empty: N/A (작성 폼)
- [x] error: 검증 실패 → 필드별 빨간 라벨 + 422 SENSITIVE_DATA 시 상단 배너
- [x] success: 제출 완료 → /my로 리다이렉트 + 토스트
- [x] no-permission: 도메인 화이트리스트 외 → "/" 리다이렉트 + 안내

### Components

| Slot | Type | Required | Validation | Microcopy |
|---|---|---|---|---|
| question_type | radio | Yes | enum [general, faq] | "FAQ: 월 5건 이상 반복 + 답이 명확한 질문" |
| category | select | Yes | enum [공법표준화, 구조기술기준, CS사례, 기타] | - |
| question | textarea | Yes | ≥10자 | "어제 받은 질문처럼 자연스럽게" |
| answer_points | dynamic-textarea[] | Yes | ≥3 bullet, 각 ≥5자 | "100% 완벽한 정답일 필요 X. 핵심 bullet 3~5개" |
| source_doc | input | Yes | - | "예: 공법표준화_R1.pdf" |
| source_pages | tag-input | Yes | int[] ≥1 | "쉼표/엔터로 구분: 4, 15, 41" |
| source_team | input | Yes | - | "답변 부서명" |
| attachment | file-upload | No | image/*, max 5MB | "근거 페이지 스크린샷 (선택)" |
| submit | button | Yes | - | "제출하기" |

### Microcopy
- 진입 안내: "작성에 평균 10분 소요됩니다. 임시저장 가능."
- 인라인 가이드 (4대 원칙): 슬라이드 7 reference Q&A 4건과 함께 우측 패널 (Desktop) 또는 상단 collapsible (Mobile)
- 422 배너: "민감 정보(이메일/내부 URL/API 키)가 포함된 것 같습니다. 확인 후 다시 제출하세요"
- 작성 부담 완화 (answer_points 옆): "지금 작성한 정답 요지는 W6 채점 룰 합의 라운드에서 다시 검토됩니다"

### Responsive
- Desktop (≥1024px): 2열 (좌 720px 폼 / 우 360px reference 패널 sticky)
- Tablet (768-1023): 1열, reference는 상단 `<details>` 접힘
- Mobile (<768): 1열, reference는 우측 하단 floating button → 모달

### Wireframe Anchor
→ `04-WIREFRAME.html#screen-submit`

### Open Questions
- [ ] 임시저장 자동 주기 (30초? 1분?)
- [ ] 폼 이탈 시 unsaved warning 모달 표시 여부

---

## Screen: /my (본인 작성 목록)

| 항목 | 값 |
|---|---|
| Audience | author |
| Auth | Required |
| Linked FRs | FR-005 |
| Layout | Table or Card grid, max-width 1024px |
| Responsive | Desktop / Mobile |

### States
- [x] loading: 목록 fetch 중 스켈레톤 행 5개
- [x] empty: "아직 작성한 항목이 없습니다" + "첫 골든셋 작성하기" CTA
- [x] error: fetch 실패 → 빈 상태 + "다시 시도" 버튼
- [x] success: 카드/행 리스트
- [x] no-permission: 비로그인 → / 리다이렉트

### Components

| Slot | Type | Required | Validation | Microcopy |
|---|---|---|---|---|
| filter_status | select | No | enum | "전체 / 작성중 / 제출 / 검토중 / 승인" |
| row.question | text | - | - | (작성 내용 미리보기 80자) |
| row.status_badge | badge | - | - | status별 색상 |
| row.edit_btn | button | - | submitted까지만 활성 | "수정" |

### Microcopy
- 헤드라인: "내가 작성한 골든셋"
- 빈 상태: "현업 전문가의 첫 골든셋을 작성해주세요"
- 잠금 상태: "검토중이거나 승인된 항목은 수정할 수 없습니다. PM에게 문의하세요."

### Responsive
- Desktop (≥1024px): 표 형식 (Question / Status / Created / Action)
- Mobile (<768): 카드 그리드

### Wireframe Anchor
→ `04-WIREFRAME.html#screen-my`

---

## Screen: /admin (PM 관리 화면)

| 항목 | 값 |
|---|---|
| Audience | admin |
| Auth | Required + admin role |
| Linked FRs | FR-006, FR-007 |
| Layout | Filter bar + Table + Action bar, full-width |
| Responsive | **Desktop only** (Tablet 이상) |

### States
- [x] loading: 테이블 fetch 중 스켈레톤
- [x] empty: "아직 제출된 항목이 없습니다"
- [x] error: fetch 실패 → 재시도
- [x] success: 페이지네이션 테이블
- [x] no-permission: admin role 아님 → / 리다이렉트 + 토스트

### Components

| Slot | Type | Required | Validation | Microcopy |
|---|---|---|---|---|
| filter_dept | multi-select | No | - | "부서 선택" |
| filter_status | multi-select | No | enum | "상태 선택" |
| filter_category | select | No | enum | "카테고리" |
| row.checkbox | checkbox | - | - | 일괄 선택 |
| row.status | select | - | enum | inline 변경 |
| row.action | dropdown | - | - | "수정 / 거절 / 메모" |
| export_btn | button | - | - | "JSON Export" / "CSV Export" |
| anonymize_toggle | checkbox | No | - | "익명화 (author_email 마스킹)" |

### Microcopy
- 익스포트 모달: "LangSmith dataset 포맷으로 다운로드합니다"
- 거절 사유: "거절 사유를 입력하세요. 작성자에게 노출됩니다."

### Responsive
- Desktop (≥1280px): 전체 표시
- Tablet (768-1279): 일부 컬럼 숨김 (Created, Updated)
- Mobile (<768): "PC에서 접속하세요" 안내 화면

### Wireframe Anchor
→ `04-WIREFRAME.html#screen-admin`

### Open Questions
- [ ] 페이지네이션 vs 무한 스크롤
- [ ] 일괄 상태 변경 시 confirm modal 필요?
