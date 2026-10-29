# deck.json 필드

발표 하나 = `deck.json` 하나. 이야기(1단계)와 장표 내용(2단계)을 같은 파일에 차례로 채운다.
완성된 예: [`examples/talk.json`](../examples/talk.json)(18분 발표, 16장, 거의 모든 layout),
[`examples/briefing.json`](../examples/briefing.json)(8분 브리핑, 5장).

## 맨 위

```json
{
  "meta":   { … },
  "map":    { "stages": [ … ] },
  "terms":  [ { "term": "Hit@5", "def": "…" } ],
  "slides": [ … ]
}
```

### meta

| 필드 | 필수 | 뜻 |
|---|---|---|
| `type` | ✓ | `talk` · `share` · `briefing` |
| `title` | ✓ | 발표 제목(표지) |
| `thesis` | ✓ | 한 문장 주장, 70자 안 |
| `audience` | 권장 | 청중 |
| `minutes` | 권장 | 발표 시간(분). 장 수 검사에 쓴다 |
| `subtitle` · `speaker` · `affiliation` · `event` · `date` | | 표지에 들어가는 글자 |
| `theme` | | `wigtn-light`(기본) · `wigtn-dark` · `neutral` · 테마 JSON 경로 |

### map.stages (talk·share 필수, 3–5개)

`{ "id": "s1", "label": "어디서 틀리나", "sub": "증상", "desc": "한 줄 설명" }`. `label`은 움직임으로 쓴다.

## 장 (slides[])

### 모든 장에 공통

| 필드 | 뜻 |
|---|---|
| `id` | 고유 이름 |
| `role` | `cover` `map` `section` `context` `claim` `evidence` `counter` `stance` `proposal` `example` `action` `conclusion` `ask` `close` |
| `layout` | [layout.md](layout.md) 4절의 16종. `cover`·`map`·`section`·`close`·`conclusion`은 생략하면 기본값 |
| `stage` | 속한 지도 단계. 생략하면 바로 앞 구간 표지의 단계를 물려받는다 |
| `title` · `lead` | 제목(주장·질문, 한 줄) · 부제(한 줄) |
| `answers` | 앞 장에서 생긴 어떤 질문에 답하는지 |
| `source` | 출처 줄. 숫자·차트·표가 있으면 필수 |
| `tags` | `concept` · `example` · `limit` · `own` |
| `plant` · `payoff` | 앞에서 꺼낸 것의 이름 · 뒤에서 다시 쓰는 장에 같은 이름 |
| `defines` | 이 장에서 정의하는 용어(`terms`의 `term`) |
| `notes` | 발표자 노트 |

글자 안에서는 `**굵게**`, `==강조색==`만 쓴다.

### side 블록 (visual-evidence, chart의 오른쪽 칸)

```json
"side": [
  { "type": "point", "head": "답은 표 안에 있었다", "text": "틀린 100개 중 52개", "tone": "text" },
  { "type": "hero",  "value": "52 / 100", "label": "답이 표 안에 있던 질문", "note": "직접 분류", "tone": "accent" },
  { "type": "quote", "text": "…", "by": "이름, 출처 (날짜)" },
  { "type": "list",  "items": ["첫째", "둘째"] },
  { "type": "text",  "text": "한 문단", "role": "body_sm" }
]
```

`tone`은 색 이름(`accent` `risk` `text` `text2` …). 블록 사이 간격을 바꾸려면 `"gap": 12`.

### visual

| kind | 필드 |
|---|---|
| `image` · `diagram` | `path`(deck.json 기준 상대 경로, PNG·JPG·SVG), `fit`: `contain`(기본) · `cover` |
| `chart` | `type`: `bar` · `column` · `line`, `title`, `categories`, `series: [{name, values, highlight}]`, `highlight`: 강조할 막대 번호(0부터)나 이름 목록, `tone`, `unit`, `decimals`, `labels`, `zero` |
| `table` | `header`, `rows`, `col_widths`(비율), `highlight_row`(rows 기준 번호), `highlight_col` |
| `placeholder` | `label`. 그림이 준비되기 전 배치만 볼 때. 경고가 남는다 |

### layout별 필드

| layout | 필드 |
|---|---|
| `cover` | (meta에서 읽음) `title`·`lead`로 덮어쓰기, `visual` |
| `map` | `title`, `lead`, `highlight`(강조할 단계 id, 없으면 전부 같게) |
| `section` | `stage`, `title`(생략하면 단계 이름), `lead`(이 구간이 답할 질문) |
| `visual-evidence` | `visual`, `caption`, `side`, `flip` |
| `chart` | `visual`(kind chart), `side` |
| `compare` | `columns: [{head, tone, sub, points[], hero{value,label,note,tone}}]` 2–3개 |
| `cards` | `items: [{num, head, text, tone, hero}]` 2–4개 |
| `kpi` | `items: [{value, label, note, tone}]` 2–4개, `foot` |
| `quote` | `quote: {text, by, translation}` |
| `statement` | `text`, `sub`. `title`은 있어도 없어도 된다 |
| `qa` | `items: [{q, a}]` 3개까지, `summary: {head, lines[]}`, `bridge` |
| `steps` | `steps: [{head, text, tone}]` 3–6개, `visual`(있으면 세로 목록) |
| `table` | `visual`(kind 생략 가능, table 필드) |
| `image` | `visual`, `caption` |
| `close` | `title`(선택), `text`, `contact`, `highlight`(기본: 마지막 단계) |
| `free` | `elements: [{kind, x, y, w, h, …}]`. 아래 |

### free.elements

참고 이미지를 객체 단위로 다시 짤 때 쓴다. 좌표는 pt(960×540).

| kind | 필드 |
|---|---|
| `text` | `text`, `role`(글자 크기표의 이름), `color`, `align`, `bullets`, `h`(넘으면 오류) |
| `rect` · `round` · `oval` | `fill`, `line`, `lw`, `radius` |
| `line` | 끝점 = (x+w, y+h). `color`, `lw`, `arrow`, `dash` |
| `image` · `diagram` · `chart` · `table` · `placeholder` | visual과 같은 필드 |
