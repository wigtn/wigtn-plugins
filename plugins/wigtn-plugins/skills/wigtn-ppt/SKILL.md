---
name: wigtn-ppt
description: >-
  발표·브리핑 자료를 이야기부터 설계해 편집 가능한 .pptx로 만든다. 한 문장 주장과 단계 지도(목차)를
  먼저 세운다. 장마다 주장형 제목·부제·근거·큰 숫자·출처를 정한 다음 격자·헤더 위치·글자 크기가
  고정된 16가지 레이아웃으로 배치한다. 검사기가 주제형 제목, 출처 없는 숫자, 반론 없는 제안, 넘치는 글자,
  한글 띄어쓰기 오류를 빌드 전에 막는다. 글자는 실제 텍스트, 차트는 기본 차트, 그림은 SVG까지 들어가
  PowerPoint에서 그대로 고칠 수 있다. 테마는 WIGTN Light/Dark가 기본이고 중립·외부 테마로 바꿀 수 있다.
  Triggers on: 'ppt 만들어줘', '발표자료', '발표 자료 만들어줘', '슬라이드 만들어줘', '브리핑 자료',
  '보고 자료', '컨퍼런스 발표', '사례 발표', '발표 준비', 'pptx', 'wigtn ppt', 'wigtn 발표자료', '위그튼 ppt',
  '회사 발표자료', 'presentation', 'slide deck'.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# WIGTN PPT

발표·브리핑 자료를 이야기 → 장표 → pptx → 눈으로 확인 순서로 만든다. 디자인보다 논리를 먼저 검사한다.
장표를 매번 새로 그리지 않는다. 숫자로 정해 둔 격자와 레이아웃에 내용을 채우므로 빠르다. 장마다
헤더 위치와 글자 크기도 흔들리지 않는다.

## 원칙

1. 이야기가 먼저. 한 문장 주장(`meta.thesis`)과 단계 지도가 정해지기 전에는 장표를 만들지 않는다.
2. 제목은 주장이나 질문. "개요·배경·현황"은 쓰지 않는다. 제목만 이어 읽어도 이야기가 되어야 한다.
3. 숫자에는 출처. 출처 없는 숫자는 빌드되지 않는다. 숫자를 새로 만들지 않는다.
4. 반론을 먼저. 제안 앞에 불리한 근거를 보여 준다.
5. 자리와 크기는 정해져 있다. 제목 28pt·부제 16pt·본문 14pt 이상, 왼쪽 정렬, 여백 48pt. 넘치면 줄이거나 장을 나눈다. 글자를 줄여서 맞추지 않는다.
6. 모두 편집 가능하게. 글자는 텍스트 상자, 수치는 기본 차트, 그림은 PNG + SVG.

## 참고 문서 (해당 단계에서 반드시 Read)

| 문서 | 언제 |
|---|---|
| [references/storyline.md](references/storyline.md) | 1단계. 유형별 목차 골격(talk·case·share·briefing), 장 구성, 흐름·출처·말투 규칙 |
| [references/layout.md](references/layout.md) | 2단계. 격자, 헤더·꼬리 좌표, 글자 크기표, 레이아웃 16종, 색, 차트·그림 규칙 |
| [references/deck-spec.md](references/deck-spec.md) | 1·2단계. deck.json 필드 |
| [references/brand.md](references/brand.md) | WIGTN 테마를 쓸 때. 로고·퍼플 점 규칙 |
| [references/design-guide.md](references/design-guide.md) | HTML로 낼 때만 |

## 실행

```bash
DECK="bash ${CLAUDE_PLUGIN_ROOT}/skills/wigtn-ppt/scripts/deck.sh"
$DECK check   talk/deck.json --story   # 이야기만 검사 (layout 없이)
$DECK outline talk/deck.json           # 장별 표: 구간·역할·이어받는 질문·제목·부제·근거·출처
$DECK check   talk/deck.json           # 이야기 + 배치(넘침·겹침·글자 크기) 검사
$DECK build   talk/deck.json -o talk/deck.pptx
$DECK render  talk/deck.pptx           # → talk/deck-render/ 에 PDF, slide-NN.png, sheet-N.png
```

- `deck.sh`는 `uv`가 있으면 python-pptx·fonttools를 버전 고정으로 불러 쓴다. `uv`가 없으면 이미 설치된 python3를 쓴다.
- 첫 실행에 Pretendard(SIL OFL)를 `~/.cache/wigtn-ppt/fonts`에 받는다. 줄바꿈은 이 글꼴의 실제 글자 폭으로 계산한다. 받지 못하면 보수적인 추정으로 계산하고 그렇다고 알린다.
- `render`는 LibreOffice와 poppler(`pdftoppm`)가 필요하다. 글꼴은 전용 LibreOffice 프로필에만 넣는다. 시스템에는 설치하지 않는다.
- 종료 코드: `0` 통과 · `1` 검사 실패(파일을 쓰지 않음) · `2` 입력 오류나 도구 없음.
- 작업 폴더는 발표마다 하나(`talks/<이름>/`). 그림은 그 아래 `assets/`. `.wigtn-ppt/`(변환 캐시)와 `*-render/`는 커밋하지 않는다.

## 워크플로우

### 0단계: 입력 (AskUserQuestion 한 번)

한 번에 묶어서 묻는다. 대화나 자료에서 이미 알 수 있는 것은 묻지 않는다.

1. **유형과 시간**: 컨퍼런스 발표(`talk`) / 사례 발표, 프로덕션 경험(`case`) / 사내 공유(`share`) / 보고·브리핑(`briefing`), 몇 분
2. **청중**: 누가 듣는가, 무엇을 이미 아는가
3. **테마**: `wigtn-light`(밝은 발표장, 문서로 돌려 볼 때) / `wigtn-dark`(무대) / `neutral`(남의 행사, 브랜드 없이) / 테마 파일 경로
4. **재료**: 직접 잰 결과·데이터·그림이 있는지, 꼭 넣을 숫자와 출처

표지 정보(발표자·소속·행사·날짜)도 함께 받는다. 한 문장 주장은 묻기보다 재료를 읽고 먼저 제안해서 확인받는다.

### 1단계: 이야기 (deck.json의 뼈대)

1. `references/storyline.md`를 읽는다.
2. `meta`, `map.stages`, `terms`, 그리고 장마다 `role`·`title`·`lead`·`answers`·`source`·`tags`·`plant`/`payoff`·`notes`만 쓴다. layout과 그림은 아직 쓰지 않는다.
3. `$DECK check deck.json --story`가 오류 0이 될 때까지 고친다.
4. `$DECK outline deck.json` 표를 사용자에게 보여 주며 한 번 확인받는다. 같이 볼 것:
   - 제목 열만 읽으면 이야기가 되는가
   - 반론이 실제로 나올 반론인가
   - 마무리 문장이 한 문장 주장과 같은 말을 하는가

이 단계에서 고치는 비용이 가장 싸다. 장표를 만든 뒤에 흐름을 바꾸면 거의 다시 만든다.

### 2단계: 장표 (layout과 내용)

1. `references/layout.md`와 `references/deck-spec.md`를 읽는다.
2. 장마다 `layout`을 고른다(layout.md 4절의 역할별 추천). 같은 layout이 네 장 넘게 이어지지 않게 섞는다.
3. 그림을 준비한다.
   - 수치: `visual.kind: "chart"`에 데이터를 그대로 넣는다. 강조할 막대 하나만 `highlight`.
   - 구조·흐름: `architecture-diagram` 스킬로 PNG를 만들어 `kind: "diagram"`으로 넣는다.
   - 비유 그림·아이콘: SVG를 직접 그려 `assets/`에 둔다. 색은 `{{accent}}`처럼 테마 이름으로 쓴다. viewBox는 칸 비율에 맞춘다(근거 장 왼쪽 칸은 508×330). 숫자는 넣지 않는다.
   - 아직 없는 그림: `kind: "placeholder"`로 자리만 잡고 배치를 먼저 본다.
4. `$DECK check deck.json`이 오류 0이 될 때까지 고친다. 오류는 장 번호와 필드를 가리킨다.

| 오류 | 고치는 법 |
|---|---|
| `title: 2줄입니다` | 제목을 30자 안으로. 덜 중요한 말은 부제로 |
| `lead: 2줄입니다` | 부제를 52자 안으로 |
| `side: 내용 높이가 자리를 넘습니다` | 블록을 줄이거나 장을 나눈다. 글자 크기는 줄이지 않는다 |
| `숫자나 차트가 있는데 출처가 없습니다` | 출처를 적는다. 직접 잰 값은 `직접 측정 · 날짜 · 표본` |
| `영문·숫자 뒤 조사 앞에 띄어쓰기` | `RAG 의` → `RAG의` |
| `제안 앞에 반론 장이 없습니다` | 불리한 근거 장(`counter`)을 제안 앞에 넣는다 |

### 3단계: 빌드와 확인 (필수)

1. `$DECK build deck.json -o deck.pptx`
2. `$DECK render deck.pptx` 후 `sheet-N.png`(12장씩 모은 그림)를 Read로 본다. 걸리는 장은 `slide-NN.png`를 크게 본다.
3. 눈으로 볼 것:
   - 장마다 시선이 처음 닿는 곳이 그 장의 큰 숫자나 강조 막대인가
   - 강조색이 한 장에 두 군데를 넘지 않는가. 초점(accent)과 위험(risk)이 섞이지 않았는가
   - SVG 그림의 색이 테마와 맞는가, 그림 속 글자가 읽히는가
   - 빈 칸이나 한쪽으로 쏠린 장이 없는가
4. deck.json을 고쳐 다시 빌드한다. pptx를 손으로 고치지 않는다. 다음 빌드에서 사라진다.

이미지를 볼 수 없는 환경이면 눈으로 확인하는 단계를 건너뛰었다고 말한다. 끝났다고 하지 않는다.

### 4단계: 전달

```
생성 완료
- pptx: talks/<이름>/deck.pptx   (발표자 노트 포함: 장마다 말할 것 + 넘어가는 말)
- pdf:  talks/<이름>/deck-render/deck.pdf
- 이야기 표: talks/<이름>/outline.md   ($DECK outline deck.json -o outline.md)
- 남은 경고: …
- 발표할 컴퓨터에 Pretendard가 없으면 글꼴이 바뀝니다 (무료, github.com/orioncactus/pretendard)
```

## 참고 이미지로 만들 때 (객체 단위 다시 짜기)

사용자가 장표 그림(시안, 스크린샷, 다른 도구로 만든 이미지)을 주면, 그림 한 장을 통째로 붙이지 않고 객체 단위로 나눈다.

1. 이미지를 Read로 보고 객체를 나눈다. 글자, 도형(면·선·화살표), 그림(일러스트·아이콘), 차트로 구분한다.
2. 글자 → `free.elements`의 `text`. 크기는 이미지에서 재지 않고 layout.md의 `role`로 정한다. 이미지 속 한글은 틀렸을 수 있으니 원문을 다시 쓴다.
3. 도형 → `rect`·`round`·`oval`·`line`. 색은 테마 이름 중 가장 가까운 것으로 정한다.
4. 그림 → 해당 부분만 잘라 PNG로 저장(Pillow), 또는 단순한 모양이면 SVG로 다시 그려 `image`로 넣는다.
5. 차트처럼 보이는 것 → 이미지에서 숫자를 읽어 내지 않는다. 원래 데이터를 받아 `chart`로 넣는다.
6. 좌표는 960×540pt 기준. 제목·부제·꼬리는 `free`에서도 `title`·`lead`·`source`를 쓰면 표준 자리에 들어간다.

## HTML로 낼 때

사용자가 HTML(브라우저 발표)을 원해도 1–2단계는 그대로 한다. 3단계 대신 [design-guide.md](references/design-guide.md)와 [brand.md](references/brand.md)로 단일 HTML을 만든다. 격자와 글자 크기는 layout.md의 pt × 4/3을 1280×720px 캔버스에 쓴다.

## 테마와 로고

- 내장 테마: `themes/wigtn-light.json`, `themes/wigtn-dark.json`, `themes/neutral.json`. 다른 회사·행사 테마는 같은 형식의 JSON을 이 저장소 밖에 두고 경로로 쓴다(`--theme ~/talk-themes/event.json`). 이 플러그인은 공개 저장소라서 남의 브랜드 파일을 커밋하지 않는다.
- 테마에 필요한 색 이름: `bg` `surface` `surface2` `text` `text2` `muted` `line` `accent` `accent_deep` `risk` `chart_base` `on_accent`.
- WIGTN 로고 PNG는 팀 전용이라 커밋하지 않는다. 작업 폴더, `assets/logo/`, `docs/images/` 순서로 찾는다. 없으면 글자 워드마크(`WIGTn` + 퍼플 점)로 대신한다. 자세한 규칙은 [brand.md](references/brand.md).

## 파일

```
wigtn-ppt/
├── SKILL.md
├── references/  storyline.md · layout.md · deck-spec.md · brand.md · design-guide.md(HTML)
├── scripts/     deck.sh(실행) · deck.py(CLI) · story.py(이야기 검사) · layout.py(격자·레이아웃)
│                writer.py(pptx 작성) · fonts.py(글꼴·글자 폭)
├── themes/      wigtn-light.json · wigtn-dark.json · neutral.json
├── examples/    talk.json · briefing.json · assets/search-flow.svg
└── assets/logo/ README.md (PNG는 팀 로컬)
```

## 체크리스트

- [ ] 0단계: 유형·시간·청중·테마·재료를 한 번에 확인
- [ ] 1단계: `check --story` 오류 0, `outline` 표를 사용자와 확인
- [ ] 2단계: layout·그림 채움, `check` 오류 0
- [ ] 3단계: build → render → sheet PNG를 눈으로 확인 → 고쳐서 다시
- [ ] 4단계: pptx·pdf·outline·남은 경고·글꼴 안내 전달
