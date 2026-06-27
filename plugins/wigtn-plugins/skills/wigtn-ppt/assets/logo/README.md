# WIGTN Logo Assets (team-private)

이 디렉토리의 PNG 로고는 **WIGTN 팀 전용 브랜드 에셋**이라 공개 플러그인에 커밋하지 않는다.
`*.png`는 `.gitignore`로 제외되어 있고, 이 README만 커밋된다.

## 들어가는 파일 (팀 로컬)

| 파일 | 형태 | 사용처 |
|------|------|--------|
| `WIGTN_LOGO_NAVY.png` | 풀 워드마크, 잉크 | Light 배경 |
| `WIGTN_LOGO_WIHTE.png` | 풀 워드마크, 화이트 | Dark 배경 |
| `wigtn_mark_dark.png` | 정사각 마크(어두움) | Light 배경 코너 마크 |
| `wigtn_mark_light.png` | 정사각 마크(밝음) | Dark 배경 코너 마크 |
| `wigtn_mark_purple.png` | 정사각 마크(퍼플) | 배지/아이콘, 공용 |

## 로고를 받는 방법

- 팀 로컬에 `docs/images/`를 받아 뒀다면(이 경로도 gitignore라 공개 레포엔 없음) 거기서 복사:
  ```bash
  cp docs/images/*.png plugins/wigtn-plugins/skills/wigtn-ppt/assets/logo/
  ```
- 공개 레포를 클론했거나 다른 프로젝트에 플러그인을 설치해 쓰는 팀원은 위 파일을 팀 채널에서 받아 이 폴더에 직접 넣는다.
- 로고가 전혀 없어도 `references/brand.md`의 **CSS/SVG 워드마크 폴백**으로 발표물은 정상 생성된다.
