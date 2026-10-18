<!-- 한 PR에 하나의 관심사. 제목은 Conventional Commits 형식 (feat/fix/docs/refactor/chore). -->

## Summary

<!-- 무엇을, 왜 바꿨는지 1~3줄 -->

## Changes

-

## Type

- [ ] `feat` — new agent / command / skill / capability
- [ ] `fix` — bug fix
- [ ] `docs` — documentation only
- [ ] `refactor` / `chore`

## Checklist

- [ ] 새 agent/command/skill을 `plugin.json`에 등록했다 (해당 시)
- [ ] 카운트를 모두 동기화했다 — `plugin.json`, `marketplace.json`, `README.{md,ko,cn}` 배지/표, `CLAUDE.md` (해당 시)
- [ ] CI 검사 통과: `validate_plugin.py`, `check_contracts.py`, `test_*.sh`, `test_knowledge_wiki.py` (CONTRIBUTING.md 참고)
- [ ] knowledge-wiki 를 바꿨다면 INGEST-POLICY.md·SKILL.md 와 경계 테스트도 함께 갱신했다 (해당 시)
- [ ] 버전 변경 시 `marketplace.json` ↔ `plugin.json` ↔ README/CLAUDE.md 일치
- [ ] 사용자 노출 콘텐츠는 한국어, 코드/커밋은 영어

## Related issue

<!-- Closes #NN -->
