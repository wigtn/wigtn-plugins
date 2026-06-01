# Contributing to WIGTN Coding

Thanks for your interest! This repo is a Claude Code **plugin marketplace** — one
unified plugin (`wigtn-coding`) made of agents, commands, and skills. The notes
below keep contributions consistent and mergeable.

한국어 사용자를 위한 콘텐츠는 한국어로 작성하되, 코드·커밋·이 문서는 영어를 유지합니다.

## Repo layout

```
.claude-plugin/marketplace.json   # marketplace entry (name, version, plugin list)
plugins/wigtn-coding/
├── .claude-plugin/plugin.json     # plugin manifest (agents/commands/skills arrays)
├── agents/      *.md              # one file per agent
├── commands/    *.md              # one file per slash command
├── skills/      <name>/SKILL.md   # one folder per skill
└── hooks/hooks.json
```

## Adding an agent / command / skill

1. Create the file/folder under the matching directory.
2. **Register it** in `plugins/wigtn-coding/.claude-plugin/plugin.json` (add to the
   `agents` / `commands` / `skills` array). A skill that is not in the array is not
   exposed by the plugin.
3. **Update the counts everywhere** — this is enforced by CI (see below):
   - `plugins/wigtn-coding/.claude-plugin/plugin.json` description (`N agents, …`)
   - `.claude-plugin/marketplace.json` (both descriptions)
   - `README.md`, `README.ko.md`, `README.cn.md` (the `N-Skills` / `N-Agents`
     badges **and** the skill/agent tables)
   - `CLAUDE.md` architecture block
4. User-facing content (skills, commands) is written in Korean; keep technical
   terms in English.

## Conventions

- **Commits**: Conventional Commits — `feat(skill):`, `fix:`, `docs:`, `chore:`, …
- **Branches**: `feat/<name>`, `fix/<desc>`, `refactor/<desc>`.
- **Skill frontmatter**: `name`, `description` (with trigger keywords), optional
  `allowed-tools`. See existing skills for the pattern.
- **Mermaid in generated docs**: quote every label (`["..."]`), use only valid
  shapes, no `mindmap` (use `flowchart LR`).

## Versioning & releases

Single source of truth: the `version` in `marketplace.json` and `plugin.json` must
match, and `README` / `CLAUDE.md` must state the same number. Bump with
[SemVer](https://semver.org/): `fix` → patch, `feat` → minor.

## Before you open a PR

Run the same check CI runs:

```bash
python3 .github/scripts/validate_plugin.py
```

It verifies that JSON is valid and that the stated counts, the `plugin.json`
arrays, and the files on disk all agree — and that the version is consistent. PRs
that drift will fail this check.

Fill in the PR template, link any related issue, and keep one concern per PR.
