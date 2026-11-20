# 화면 녹화

실제 제품 화면을 녹화해 capture slot에 넣는다. slot이 비어 있으면 placeholder가 나오므로
한 개씩 채워도 영상은 항상 렌더된다. 마지막 렌더 전에는 빈 slot이 없어야 한다.

## 1. slot과 파일 이름

```ts
// src/captures.ts
export const CAPTURES = {
  search: { file: null, hint: "Type a question, wait for the answer, hover a cited passage" },
  export: { file: "export.mp4", hint: "Open the export dialog and download the report" },
} satisfies Record<string, CaptureSlot>;
```

- slot 이름은 영어 소문자 한 단어(`search`, `export`). 파일은 `public/captures/<slot>.mp4`(또는 `.webm`).
- `hint`는 그 clip이 보여 줘야 하는 것이다. placeholder에 그대로 찍히고 녹화하는 사람에게 주는 지시가 된다.
- 씬에서는 `<Footage slot="search" label="..." />`로 쓴다. `label`은 창 제목 줄에 나온다.

## 2. 규격

| 항목 | 값 |
|---|---|
| 크기 | 1920×1080 (다른 크기는 창에 맞게 잘린다) |
| fps | 30 이상 |
| 소리 | 없음. clip의 소리는 쓰지 않는다 |
| 길이 | 그 씬의 narration 길이와 같거나 조금 길게. 짧으면 마지막 화면에서 멈춘다 |
| 화면 글자 | 1단계에서 정한 언어. 제품 UI와 입력하는 글도 포함 |

영상 안에서는 창이 75% 크기로 보인다. 작은 글자는 읽히지 않으므로 녹화할 때 브라우저 확대를 125–150%로 올린다.
확대(`zooms`)는 1.8배까지만 된다. 그보다 크게 보여야 하면 녹화할 때 화면을 키운다.

## 3. 찍으면 안 되는 것

- 비밀 값: API key, 토큰, 비밀번호, 세션 쿠키, 내부 주소.
- 개인정보: 실명, 이메일, 전화번호, 고객 데이터, 다른 사람의 계정.
- 사용자가 공개하지 않겠다고 한 화면과 데이터.
- 익명 심사라면 이름, 소속, 저장소 주소, 계정 이름.

지키는 법:

- 시연용 계정과 시연용 데이터로 찍는다. 실제 운영 화면을 찍지 않는다.
- 화면에 나올 수밖에 없는 값은 가린다. 녹화기에서는 `mask(page, [".token", "[data-email]"])`가 그 요소를 흐리게 한다.
- 손으로 녹화할 때는 알림을 끄고 북마크 줄과 다른 탭을 숨기고 새 브라우저 프로필을 쓴다.
- 토큰이 한 프레임이라도 읽히면 그 clip은 지우고 다시 찍는다. 이미 노출된 토큰은 폐기하도록 사용자에게 알린다.
- clip을 쓰기 전에 처음부터 끝까지 본다.

## 4. 녹화기 템플릿 (`scripts/record.mjs`)

Playwright로 페이지를 열고 적어 둔 동작을 하고 clip을 저장한다. 그대로는 쓸 수 없는 템플릿이다. `CLIPS`를 제품에 맞게 고친다.

```bash
npm i -D playwright@1.65.0 && npx playwright install chromium     # 한 번만
DEMO_BASE_URL=http://localhost:3000 node scripts/record.mjs        # 전체
node scripts/record.mjs search                                     # 하나만
```

```js
const CLIPS = {
  search: {
    url: `${BASE}/search`,
    steps: async (page) => {
      await mask(page, [".account-email"]);
      await wait(1500);                                   // 첫 화면이 자리 잡을 시간
      await clickSlow(page, "input[name=q]");
      await page.keyboard.type("how does caching work", { delay: 70 });
      await page.keyboard.press("Enter");
      await page.waitForSelector(".answer");
      await wait(2500);                                   // 결과를 읽을 시간
    },
  },
};
```

- 결과는 `public/captures/<slot>.mp4`. ffmpeg가 없으면 Remotion에 들어 있는 것을 쓰고 그것도 없으면 `.webm`으로 남긴다.
- 그 다음 `src/captures.ts`의 `file`에 파일 이름을 적는다.
- 녹화에는 마우스 포인터가 찍히지 않아서 스크립트가 동그란 포인터를 그려 넣는다.
- 이 템플릿은 로그인하지 않고 자동화 브라우저라는 것을 숨기지도 않는다. 그런 기능을 덧붙이지 않는다.
  로그인이 필요한 화면은 5절처럼 사용자가 직접 녹화한다.
- 공개해도 되는 페이지와 데이터만 찍는다.

## 5. 손으로 녹화하기

로그인이 필요한 화면, 데스크톱 앱, 터미널은 사용자가 직접 녹화한다.

1. 화면 녹화 도구(macOS 화면 기록, OBS 등)로 1920×1080 영역을 찍는다.
2. 필요하면 크기와 형식을 맞춘다. 시스템에 ffmpeg가 없어도 Remotion에 들어 있는 것을 쓸 수 있다.
   ```bash
   npx remotion ffmpeg -i raw.mov -vf "scale=1920:1080" -r 30 -an -c:v libx264 -pix_fmt yuv420p public/captures/search.mp4
   ```
3. 앞쪽의 군더더기는 `<Footage trimStart={1.5} />`로 잘라 낸다(초).
4. `node "$SKILL/scripts/check-video.mjs" public/captures/search.mp4 --width 1920 --height 1080`으로 규격을 확인한다.

## 6. 보기 좋게 찍는 법

- 한 clip은 narration이 말하는 동작 하나만 담는다. 여러 기능을 한 clip에 몰아넣지 않는다.
- 첫 프레임부터 재생되므로 0초에 이미 준비된 화면이 오게 한다. 로딩 화면으로 시작하지 않는다.
- 마우스는 천천히 움직이고 누르기 전에 0.3초쯤 멈춘다. 방황하는 움직임은 없앤다.
- 글자는 사람이 읽을 수 있는 속도로 친다(글자당 60–80ms).
- 결과가 나오면 2초 이상 머문다. 숫자가 나오는 자리에서는 더 머문다.
- 스크롤은 조금씩 부드럽게 한다(`scrollSlow`). 한 번에 뛰지 않는다.
- 기다리는 시간이 길면 그 구간을 잘라 두 clip으로 나누거나 `playbackRate`로 빠르게 돌린다. 빠르게 돌린 구간은 자막이나 대본에서 밝힌다.
- 모델이 판단하는 결과는 찍힐 때마다 다를 수 있다. 실제로 찍힌 것에 맞춰 대본을 고친다. 대본에 맞춰 결과를 꾸미지 않는다.

## 7. 확대할 자리 정하기

`zooms`의 좌표는 녹화 화면(1920×1080) 기준 픽셀이다.

```tsx
<Footage slot="search" label="Search" zooms={[{ at: 4, hold: 3, x: 960, y: 200, w: 900, h: 506 }]} />
```

- `at`은 씬이 시작하고 몇 초 뒤인가, `hold`는 몇 초 머무는가. 들어가고 나오는 데 0.7초씩 더 걸린다.
- 영역은 16:9에 가깝게 잡는다. 좁게 잡아도 1.8배를 넘지 않는다.
- 자리는 clip의 스틸을 Read로 보고 정한다. 확대한 프레임도 스틸로 뽑아 설명하는 부분이 가운데 있는지 본다.
