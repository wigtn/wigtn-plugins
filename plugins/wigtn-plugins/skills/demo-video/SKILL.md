---
name: demo-video
description: >-
  제품·시스템 데모 영상을 Remotion으로 만든다. 길이 제한과 해상도를 먼저 정하고 대본 한 벌로 자막과
  (선택) TTS 음성을 함께 만든다. 대본의 주장과 숫자는 코드·결과 파일과 대조한 뒤에 찍는다. 실제 화면 녹화를
  capture slot에 넣고 빈 slot은 placeholder로 렌더되어 일부만 채워도 영상이 나온다. 스틸 프레임을
  체크리스트로 검토한 다음 전체를 렌더하고 ffprobe로 길이·해상도·fps·오디오를 재서 보고한다.
  논문 시연 영상용 `paper-demo`와 소개 영상용 `showcase` 두 프로필이 있다.
  Triggers on: '데모 영상', '시연 영상', '영상 편집', '영상 만들어줘', '스크린캐스트', '제품 소개 영상',
  '논문 데모 영상', 'demo video', 'screencast', 'system demonstration video', 'Remotion'.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Demo video (대본 → 사실 확인 → 화면 녹화 → Remotion → 스틸 검토 → 렌더 → 측정)

영상을 대본, 화면 녹화, 타임라인 세 가지로 나누어 만든다. 대본은 `src/narration.ts` 한 곳에만 있고
자막과 음성이 모두 여기서 나온다. 화면 녹화는 capture slot에 끼운다. 타임라인은 씬마다 `S(초)` 한 줄이다.
전체 렌더는 느리므로 스틸 프레임으로 먼저 고치고 마지막에 한 번만 돌린다.

## 원칙

1. 제약이 먼저다. 길이 제한, 해상도, 화면 글자 언어, 음성 여부, 올릴 곳을 정하기 전에는 대본을 쓰지 않는다.
2. 대본은 한 곳에만 둔다. 자막 문구를 씬 파일이나 다른 문서에 따로 적지 않는다.
3. 확인되지 않은 주장은 싣지 않는다. 사실 확인 표에서 `verified`가 아닌 줄은 빼거나 고쳐 쓴다.
4. 실제 화면을 보여 준다. 설명 그림보다 제품이 실제로 도는 화면이 먼저다.
5. 공개하면 안 되는 것은 찍지 않는다. 토큰, 개인정보, 사용자가 비공개라고 한 화면은 녹화 단계에서 막는다.
6. 돈이 드는 호출은 승인을 받고 한다. TTS는 유료 외부 API다. 자막만 있는 영상도 완성본이다.
7. 끝났다는 말은 측정값으로 한다. 길이·해상도·fps·오디오·파일 크기를 재서 그대로 보고한다.

## 참고 문서 (해당 단계에서 반드시 Read)

| 문서 | 언제 |
|---|---|
| [references/script-format.md](references/script-format.md) | 2·3단계. 대본 형식, 길이 예산, 자막 나누는 규칙, 사실 확인 표 |
| [references/capture-guide.md](references/capture-guide.md) | 4단계. 녹화기 사용법, 파일 이름, 속도와 커서, 가리기, 손으로 녹화하기 |
| [references/motion-guide.md](references/motion-guide.md) | 5·7단계. 모션 규칙, 프로필별 차이, 스틸 검토 체크리스트 |

## 실행

```bash
SKILL="${CLAUDE_PLUGIN_ROOT}/skills/demo-video"
bash "$SKILL/scripts/new.sh" video            # 템플릿 복사 (비어 있지 않은 폴더, 파일, symlink에는 쓰지 않는다)
cd video && npm install
npm run typecheck                             # 타입만 본다
npx remotion compositions                     # 타임라인 검사를 실제로 돌린다 (길이 제한, narration 겹침, 음성 일치)
npm run budget                                # 대본이 길이 제한에 들어가는지 (단어 수 기준 추정)
npx remotion still Demo out/check.png --frame=120 --log=error
npx remotion render Demo out/demo.mp4         # 마지막에 한 번
node "$SKILL/scripts/check-video.mjs" out/demo.mp4 --max-seconds 150 --width 1920 --height 1080 --fps 30 --forbid-audio
```

- Node.js 20 이상이 필요하다. Remotion이 첫 실행에 headless 브라우저를 내려받는다.
- 글꼴(Inter)은 렌더할 때 Google Fonts에서 받는다. 저장소에 글꼴 파일을 넣지 않는다. 한글은 시스템 글꼴로 나온다.
- `npm run typecheck`가 통과해도 타임라인이 제한 안에 든다는 뜻이 아니다. 길이 제한과 narration 검사는 컴포지션을 실제로 평가할 때만 돈다(`npx remotion compositions`, still, render). 위반이 있으면 이유를 말하며 실패한다.
- `check-video.mjs`는 ffprobe가 필요하다. `$FFPROBE`, PATH, 프로젝트의 `node_modules`(Remotion에 들어 있는 것) 순서로 찾는다.
- `check-video.mjs` 종료 코드: `0` 모든 기대값 통과 · `1` 기대값 실패(항목별로 출력) · `2` 잴 수 없음(파일 없음, ffprobe 없음이나 읽을 수 없는 출력, 잘못된 옵션). 제한은 반올림하지 않은 값으로 비교한다.
- `out/`, `node_modules/`, `public/captures/_raw/`, `.env*`는 커밋하지 않는다(템플릿 `.gitignore`에 들어 있다).

## 워크플로우

### 1단계: 제약을 정한다

한 번에 묶어서 확인한다. 대화나 자료에서 이미 알 수 있는 것은 묻지 않는다.

1. **길이 제한(초)**: 제출처 공고에서 직접 확인한다. 아래 기본값은 출발점일 뿐이다. 기억이나 지난해 규정으로 정하지 않는다.
2. **해상도와 fps**: 기본 1920×1080, 30fps. 제출처가 파일 형식이나 크기 제한을 두는지도 본다.
3. **화면 글자 언어**: 자막, 화면 속 글자, 녹화되는 제품 UI까지 포함한다.
4. **음성**: 자막만 / TTS 음성 / 사람이 녹음. 정하지 않았으면 자막만으로 시작한다.
5. **올릴 곳**: 제출 시스템에 직접 올리는지, 영상 사이트 링크로 내는지. 익명 심사라면 이름·소속·저장소 주소가 화면에 나오면 안 된다.

프로필을 고른다. 숫자는 `src/config.ts`의 값을 바꾸는 것이고 고정값이 아니다.

| | `paper-demo` (기본) | `showcase` |
|---|---|---|
| 쓰는 곳 | 학회 시연 논문에 붙는 영상 | 제품 소개, 발표용 영상 |
| 길이 기본값 | 150초 | 180초 |
| 말투 | 차분하게, 사실만 | 조금 더 힘 있게 |
| 화면 구성 | 실제 화면 녹화가 길이의 대부분(60% 이상을 목표) | 모션 그래픽 비중을 늘려도 된다 |
| 쓰지 않는 것 | 과장하는 단어, 효과음, 브랜드 인트로, 3D | 다른 회사 로고·색 |
| 숫자 | 화면과 대본의 모든 숫자가 사실 확인 표에 근거(파일 + commit)를 가진다 | 숫자가 있으면 같은 규칙 |
| 글자 크기 | 24px 이상 | 20px 이상 |

정한 값을 `src/config.ts`의 `LIMIT_SECONDS`(와 필요하면 `WIDTH`·`HEIGHT`·`FPS`)에 적는다. 타임라인이 이 값을 넘으면 빌드가 실패한다.

### 2단계: 대본을 쓴다 (`src/narration.ts`)

1. `references/script-format.md`를 읽는다.
2. 씬 목록을 먼저 잡는다. 씬 하나는 한 가지만 말한다. 씬 id가 `src/Demo.tsx`와 `src/narration.ts`를 잇는다.
3. 씬마다 narration segment를 쓴다. 한 segment는 한두 문장이다.
4. `npm run budget`으로 길이를 본다. 영어는 초당 2.5단어 기준이다. 넘으면 문장을 줄인다. 말을 빨리 하는 것으로 맞추지 않는다.
5. 아직 아무것도 녹화하지 않는다. 이 단계에서 고치는 비용이 가장 싸다.

### 3단계: 사실 확인 표를 채운다 (`factcheck.md`)

1. 대본과 화면 글자에서 주장과 숫자를 모두 뽑아 한 줄씩 적는다.
2. 줄마다 근거를 직접 열어 본다. 근거는 파일 경로와 commit, 또는 결과 파일이다. 기억이나 예전 문서는 근거가 아니다.
3. 상태를 적는다: `verified` · `verified-with-condition` · `unverified` · `wrong`.
4. `verified`가 아닌 줄은 대본에서 빼거나, 확인된 범위까지만 말하도록 고쳐 쓴다. 그대로 두지 않는다.
5. 표를 사용자에게 보여 주고 확인받은 다음에 녹화로 넘어간다.

### 4단계: 실제 화면을 녹화한다

1. `references/capture-guide.md`를 읽는다.
2. `src/captures.ts`에 slot을 정의한다. `hint`에 그 clip이 무엇을 보여 줘야 하는지 적는다.
3. `scripts/record.mjs`(Playwright 템플릿)를 제품에 맞게 고쳐 녹화하거나, 손으로 녹화해 `public/captures/<slot>.mp4`에 둔다. 1920×1080이어야 한다.
4. **찍지 않는 것**: 비밀 값(API key, 토큰, 비밀번호), 개인정보(실명, 이메일, 고객 데이터), 사용자가 공개하지 않겠다고 한 화면. 공개해도 되는 시연용 계정과 데이터로만 찍는다. 녹화기의 `mask`는 그래도 남는 요소를 덮는 보조 수단이다. 지정한 selector 밖의 것은 가리지 못한다. 토큰이 한 프레임이라도 보이면 그 clip은 버리고 다시 찍는다.
5. 로그인이 필요한 화면은 사용자가 직접 녹화한다. 로그인을 자동화하지 않는다.
6. clip을 쓰기 전에 첫 프레임부터 끝까지 본다. 대본이 말하는 순서대로 화면이 나오는지, 가려야 할 것이 없는지 확인한다.

### 5단계: Remotion 프로젝트를 채운다

1. `references/motion-guide.md`를 읽는다.
2. `src/Demo.tsx`의 `SCENES`에 씬을 순서대로 적는다. 씬 길이는 그 줄의 `S(초)` 하나다.
3. 템플릿 씬을 조합한다: `Title`(여는 장), `Footage`(창 틀 안의 실제 화면, 설명하는 부분으로 확대), `Points`(결과와 출처), `Outro`(찾아갈 곳).
4. `Footage`의 `zooms`에 확대할 영역을 녹화 화면 좌표(1920×1080 기준)와 시각(초)으로 적는다.
5. `npx remotion compositions`로 타임라인을 평가한다. 아래 경우에 이유를 말하며 실패한다. 씬을 늘리거나 문장을 줄인다.
   - 전체 길이가 `LIMIT_SECONDS`를 넘는다
   - 씬의 narration이 그 씬보다 길다
   - 앞 문장이 끝나기 전에 다음 문장이 시작한다(전환으로 씬이 겹치는 구간에서 생긴다)
   - `narration.ts`의 씬 id가 `SCENES`에 없다
6. 색은 `src/theme.ts`의 `dark`·`light` 중 하나를 고르고 `accent`만 바꾼다. 다른 회사의 브랜드 색과 로고는 넣지 않는다.

### 6단계: (선택) TTS 음성

**유료 외부 API 호출이다.** 자막만으로 끝내도 완성본이다.

1. `npm run tts:plan`을 돌린다. 네트워크 호출 없이 provider, voice, model, 줄마다의 상태(음성 없음 · 최신 · 대본이 바뀜), 보낼 글자 수를 출력한다. voice와 model은 `src/config.ts`의 `TTS_VOICE`·`TTS_MODEL`이다.
2. 그 출력(provider, voice/model, 대략의 글자 수)을 사용자에게 보여 주고 명시적으로 승인받는다. 승인 없이는 실행하지 않는다.
3. API key는 사용자의 셸 환경 변수(`ELEVENLABS_API_KEY`)에서만 읽는다. 파일에 쓰지 않는다. 출력하지 않는다. 값을 대화나 명령줄에 적어 달라고 하지 않는다. 환경 변수가 없으면 사용자에게 설정을 부탁하고 멈춘다.
4. 승인을 받으면 `node scripts/gen-tts.mjs --confirm`. 글·voice·model이 그대로인 줄은 다시 만들지 않는다.
5. 모든 줄에 최신 음성이 생기면 `src/config.ts`에서 `NARRATION_AUDIO = true`로 바꾸고 `npx remotion compositions`를 다시 돌린다. 자막 길이가 음성 길이를 따르므로 씬 길이를 다시 맞춘다.
6. 스크립트는 줄마다 길이를 어떻게 얻었는지 적는다. `measured`는 ffprobe로 mp3를 잰 값, `aligned`는 provider가 준 마지막 글자 시각, `estimated`는 글자 수로 어림한 값이다. `measured`가 아닌 줄은 자막이 음성과 맞는지 들어서 확인한다.
7. 대본을 고치면 그 줄의 음성은 낡은 것이 된다. `NARRATION_AUDIO = true`인 채로는 빌드가 실패하고 어느 줄인지 알려 준다. 낡은 음성이 새 자막 아래에서 재생되는 일은 없다. 고르는 길은 둘이다.
   - `NARRATION_AUDIO = false`로 돌려 자막만으로 작업을 잇는다(만들어 둔 음성과 manifest는 그대로 남는다).
   - 바뀐 줄만 다시 만든다(`--only id1,id2`). 이것도 유료이므로 다시 승인받는다.
8. 오류가 나면 스크립트는 짧은 코드만 출력한다(`http_401_unauthorized`, `network_error` 등). provider의 응답 본문은 출력하지 않는다. `narration-manifest.json`이 깨져 있으면 아무것도 보내지 않고 멈춘다. 빈 것으로 보고 전부 다시 만들지 않는다.

### 7단계: 스틸로 검토하고 마지막에 렌더한다

1. 씬마다 한두 프레임을 스틸로 뽑는다: `npx remotion still Demo out/s-<id>.png --frame=N --log=error`. 씬 시작 프레임은 `SCENE_STARTS`에서 계산한다. 전환 중간 프레임도 하나 뽑는다.
2. PNG를 Read로 보고 `references/motion-guide.md`의 체크리스트로 확인한다. 걸리는 것을 고치고 다시 뽑는다.
3. 반드시 볼 것: 잘린 글자, 흐린 글자, 자막이 설명 중인 화면을 가리는지, 전환 중 다른 색이 비치는지, 빈 slot이 남았는지.
4. 스틸이 모두 통과하면 전체 렌더를 한 번 한다: `npx remotion render Demo out/demo.mp4`.
5. 음성을 넣었으면 영상을 처음부터 끝까지 듣는다. 줄마다 자막과 같은 문장을 읽는지, 잘리거나 겹치는 곳이 없는지 본다. 이 확인은 사람이 한다. 들을 수 없는 환경이면 사용자에게 부탁한다. 확인받기 전에는 끝났다고 하지 않는다.

이미지를 볼 수 없는 환경이면 눈으로 확인하는 단계를 건너뛰었다고 말한다. 끝났다고 하지 않는다.

### 8단계: 결과를 재고 보고한다

```bash
node "$SKILL/scripts/check-video.mjs" out/demo.mp4 \
  --max-seconds <제한> --width 1920 --height 1080 --fps 30 \
  --forbid-audio        # 음성을 넣었으면 --require-audio, 크기 제한이 있으면 --max-mb N
```

`NARRATION_AUDIO = false`면 영상에 오디오 스트림이 없고 `true`면 있다. `--require-audio`는 오디오 스트림이 있는지만 본다. 무음이어도 통과한다. 말이 들어 있는지, 맞는 대본을 읽는지는 7단계에서 들어서 확인한다. 종료 코드가 `0`이 아니면 끝난 것이 아니다.

무엇이 무엇으로 지켜지는지는 아래와 같다. 코드가 막지 않는 항목을 코드가 확인한 것처럼 보고하지 않는다.

| 지키는 방법 | 항목 |
|---|---|
| 코드가 막는다 (빌드 실패) | 전체 길이 ≤ `LIMIT_SECONDS` · narration이 씬 안에 들어감 · narration끼리 겹치지 않음 · 모르는 씬 id · 음성을 켰을 때 모든 줄의 음성이 지금 대본·voice·model과 일치 |
| 스크립트로 잰다 | 길이·해상도·fps·오디오 스트림 유무·파일 크기 (`check-video.mjs`) · 대본 길이 추정 (`budget`) |
| 사람이 확인한다 | 사실 확인 표의 근거 · 과장하는 말과 효과음이 없는지 · 실제 화면 비중 60% · 숫자 옆 출처 · 글자 크기와 자막 두 줄 · 자막이 화면을 가리지 않는지 · clip에 비밀 값이 없는지 · 빈 slot · 음성이 자막과 같은 말을 하는지 |
| 외부 서비스에 달렸다 | 제출처의 실제 길이·형식 규정 · TTS 음질과 발음, 과금 · 렌더할 때 받는 글꼴 · 영상 사이트의 재인코딩 |

보고는 이 구분을 그대로 나눠 쓴다.

```
영상: video/out/demo.mp4
- 측정 (check-video, exit 0): 길이 2:21.4 (제한 2:30) · 1920x1080 · 30fps · 오디오 스트림 없음 · 38.2 MB
- 코드 검사 (remotion compositions 통과): 길이 제한, narration 겹침 없음
- 사람이 확인: 스틸 9장을 봄 · 사실 확인 12줄 모두 verified (video/factcheck.md) · 빈 capture slot 없음
- 확인하지 못한 것: 제출처 규정은 공고 원문을 다시 봐야 함
- 하지 않은 것: TTS (승인 요청 전)
```

## 파일

```
demo-video/
├── SKILL.md
├── references/  script-format.md · capture-guide.md · motion-guide.md
├── scripts/     new.sh(템플릿 복사) · check-video.mjs(ffprobe로 측정)
├── tests/       오프라인 테스트 (bash .github/scripts/test_demo_video.sh, 네트워크와 key 없이 돈다)
└── template/    Remotion 프로젝트
    ├── src/config.ts        제약: WIDTH · HEIGHT · FPS · LIMIT_SECONDS · NARRATION_AUDIO · TTS_VOICE · TTS_MODEL
    ├── src/narration.ts     대본 (자막과 음성의 원본)
    ├── src/captures.ts      capture slot
    ├── src/Demo.tsx         타임라인: 씬마다 S(초) 한 줄
    ├── src/Caption.tsx      자막과 음성을 얹는 층
    ├── src/core.mjs         렌더러와 스크립트가 함께 쓰는 규칙 (음성 일치 판단, narration 배치 검사)
    ├── src/scenes/          Title · Footage · Points · Outro
    ├── src/theme.ts · motion.tsx · transitions.tsx · Root.tsx · index.ts
    ├── scripts/             budget.mjs · gen-tts.mjs(유료 API) · record.mjs(Playwright 템플릿)
    ├── factcheck.md         사실 확인 표
    └── narration-manifest.json   줄마다 음성을 만든 글·voice·model, 파일, 길이
```

## 체크리스트

- [ ] 1단계: 길이 제한을 제출처 공고에서 확인했고 `src/config.ts`에 적었다
- [ ] 2단계: `npm run budget`이 제한 안에 들어온다
- [ ] 3단계: `factcheck.md`의 모든 줄이 `verified`이거나 대본에서 빠졌다
- [ ] 4단계: clip을 첫 프레임부터 끝까지 봤고 비밀 값·개인정보·비공개 화면이 없다
- [ ] 5단계: `npx remotion compositions`가 통과한다
- [ ] 6단계: TTS를 썼다면 실행 전에 승인을 받았다
- [ ] 7단계: 씬별 스틸을 눈으로 확인했다. 음성이 있으면 끝까지 들었다
- [ ] 8단계: `check-video.mjs` 종료 코드 0. 측정·코드 검사·사람 확인·확인하지 못한 것을 나눠 보고했다
