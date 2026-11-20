# 대본 형식과 사실 확인

대본은 `src/narration.ts` 한 곳에만 있다. 자막도 TTS 음성도 이 파일의 `text`에서 나온다.
다른 문서에 대본을 복사해 두면 둘이 어긋나므로 두지 않는다.

## 1. 씬을 먼저 잡는다

씬 하나는 한 가지만 말한다. 아래 순서가 기본이고 필요 없는 씬은 뺀다.

| 씬 | 말하는 것 | 화면 | 길이 감각 |
|---|---|---|---|
| 여는 장 | 무엇이고 누구를 위한 것인가 | `Title` | 4–8초 |
| 문제 | 지금 무엇이 불편한가 | `Footage` 또는 `Points` | 8–15초 |
| 시연 1..n | 한 가지 기능이 실제로 도는 모습 | `Footage` | 씬마다 15–35초 |
| 결과 | 재 본 숫자와 그 출처 | `Points` | 8–12초 |
| 닫는 장 | 어디서 찾을 수 있는가 | `Outro` | 4–6초 |

`paper-demo`에서는 시연 씬이 전체 길이의 60% 이상이 되게 잡는다. 구조를 설명하는 그림은 한 장면으로 줄인다.

## 2. narration segment

```ts
export const NARRATION: Record<string, NarSeg[]> = {
  search: [                                             // 씬 id (Demo.tsx의 id와 같아야 한다)
    { id: "search-1", off: 12, text: "The user types a question in plain language." },
    { id: "search-2", text: "The system returns the passages it used, with their sources." },
  ],
};
```

| 필드 | 뜻 |
|---|---|
| `id` | segment 이름. 전체에서 겹치면 안 된다. 음성 파일 이름(`public/audio/narration/<id>.mp3`)이 된다 |
| `text` | 자막이자 읽을 문장. 한 줄짜리 큰따옴표 문자열로 쓴다(스크립트가 정규식으로 읽는다) |
| `off` | 씬이 시작하고 몇 프레임 뒤에 첫 문장이 나오는가. 씬의 첫 segment에만 쓴다 |
| `est` | 길이를 직접 정할 때만(프레임). 보통은 쓰지 않는다 |

한 씬 안의 segment는 앞 문장이 끝나면 짧게 쉬고(`GAP_FRAMES`) 다음 문장이 이어진다. 겹치지 않는다.
segment 길이는 음성이 있으면 실제 음성 길이(`narration-manifest.json`), 없으면 단어 수로 추정한 값이다.

쓰는 법:

- 한 segment는 한두 문장. 화면에서 일어나는 일 하나에 문장 하나를 맞춘다.
- 화면이 이미 보여 주는 것을 그대로 읽지 않는다. 화면이 보여 주지 못하는 이유와 결과를 말한다.
- 숫자는 읽기 쉬운 꼴로 쓴다. TTS를 쓸 때는 읽히는 대로 적는다(`0.96` → `point nine six`).
- 줄임말은 처음 한 번 풀어 쓴다.

## 3. 길이 예산

녹화하기 전에 대본이 제한에 들어가는지 먼저 본다.

```bash
npm run budget                       # src/config.ts의 LIMIT_SECONDS, WORDS_PER_SECOND 기준
npm run budget -- --max-seconds 150 --wps 2.5
```

| 언어 | 기준 속도 | 비고 |
|---|---|---|
| 영어 | 초당 2.5단어 (분당 150단어) | 차분하게 읽는 속도. `paper-demo`에서는 이보다 빠르게 잡지 않는다 |
| 한국어 | 초당 5자 안팎 | `budget.mjs`는 띄어쓰기 단위로 세므로 `--wps 1.7` 정도로 어림한다 |

- 150초 영상에 영어 대본은 300단어 안팎이 넉넉하다. 375단어가 계산상 한도이고 그만큼 채우면 쉴 틈이 없다.
- narration이 영상의 전부가 아니다. 말 없는 구간과 전환이 더해지므로 예산의 90%를 넘기지 않는다.
- 넘치면 문장을 줄인다. 읽는 속도를 올려서 맞추지 않는다.
- 추정값은 어림이다. TTS를 만들면 실제 길이로 바뀌므로 씬 길이를 다시 맞춘다.

## 4. 자막을 나누는 규칙 (`Caption.tsx`)

- segment를 문장 단위(`.` `!` `?`)로 나눠 한 번에 한 문장씩 보여 준다.
- 96자보다 긴 문장만 한 번 더 나눈다. 가운데에서 가장 가까운 `,` `;` `:` 자리에서 자른다. 구 중간에서 끊지 않는다.
- 자막 하나는 두 줄을 넘지 않는다. 넘으면 문장을 줄인다.
- 각 조각이 보이는 시간은 글자 수에 비례한다. 음성 한 덩어리를 문장별로 자르지 않는다(말투가 끊긴다).
- 자막은 아래쪽 띠(`CAPTION_ZONE`)에만 나온다. `Footage` 창은 그 위에서 끝나므로 자막이 설명 중인 화면을 가리지 않는다.

## 5. 사실 확인 표 (`factcheck.md`)

대본의 문장과 화면의 글자에서 주장과 숫자를 모두 뽑아 한 줄씩 적는다. "빠르다", "정확하다" 같은 평가도 주장이다.

```markdown
| # | Scene / segment id | Claim as written | Evidence (file path + commit, or result file) | Status | Action |
|---|---|---|---|---|---|
| 1 | results / results-1 | "Recall is 0.96 on the held-out set" | eval/results/heldout.json @ 3f2a1c9, field `recall` | verified | |
| 2 | search / search-2 | "returns the passages with their sources" | src/retriever/answer.py:88 @ 3f2a1c9 | verified | |
| 3 | sched / sched-1 | "runs every hour" | deploy/cron.yaml @ 3f2a1c9 (schedule is set, job is paused) | verified-with-condition | say "can run hourly"; record after resuming the job |
| 4 | intro / intro-1 | "the first system to ..." | none | unverified | cut |
```

| 상태 | 뜻 | 대본에서 |
|---|---|---|
| `verified` | 근거를 직접 열어 확인했다 | 그대로 쓴다 |
| `verified-with-condition` | 조건이 맞을 때만 사실이다 | 조건을 Action에 적고 그 범위까지만 말한다 |
| `unverified` | 근거를 찾지 못했다 | 뺀다 |
| `wrong` | 코드나 결과와 다르다 | 고치거나 뺀다 |

확인하는 법:

- 근거는 지금 열어 본 파일이어야 한다. commit hash를 같이 적는다. 기억, 예전 문서, 발표 자료는 근거가 아니다.
- 숫자는 결과 파일에서 읽는다. 논문에 실린 표가 있으면 그 표와 같은 값인지도 본다. 반올림한 방식까지 같게 쓴다.
- "고른다"와 "찾아낸다"처럼 동작의 범위가 다른 말을 구분한다. 코드가 하는 만큼만 말한다.
- 모델이 판단하는 동작은 매번 같지 않을 수 있다. 그런 장면은 실제로 찍힌 화면만 쓰고 나올 것을 미리 정해 두고 말하지 않는다.
- 아직 만들지 않은 기능은 시연하지 않는다. 말해야 하면 계획이라고 분명히 한다.
- 대본을 고치면 표도 다시 본다. 표가 통과하기 전에는 녹화하지 않는다.

## 6. `paper-demo`에서 쓰지 않는 말

근거 없이 크기만 키우는 말은 뺀다: revolutionary, groundbreaking, state-of-the-art(비교 표가 없을 때), seamless,
blazing fast, the first, unprecedented, game-changing. 비교하려면 무엇과 무엇을 어떤 조건에서 비교했는지 말한다.
