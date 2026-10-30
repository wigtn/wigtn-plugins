# Contributing to WIGTN Plugins

Thanks for your interest! This repo is a Claude Code **plugin marketplace** — one
unified plugin (`wigtn-plugins`) made of agents, commands, and skills. The notes
below keep contributions consistent and mergeable.

한국어 사용자를 위한 콘텐츠는 한국어로 작성하되, 코드·커밋·이 문서는 영어를 유지합니다.

## Repo layout

```
.claude-plugin/marketplace.json   # marketplace entry (name, version, plugin list)
plugins/wigtn-plugins/
├── .claude-plugin/plugin.json     # plugin manifest (agents/commands/skills arrays)
├── agents/      *.md              # one file per agent
├── commands/    *.md              # one file per slash command
├── skills/      <name>/SKILL.md   # one folder per skill
├── contracts/   *.md              # policies the code enforces (INGEST-POLICY.md, PRD-CONTRACT.md)
├── scripts/     *.sh              # bundled scripts commands call directly
│   └── knowledge_wiki/ *.py       # team knowledge wiki hook entries and gates
└── hooks/hooks.json
.github/scripts/                   # CI checks and regression tests (no model calls)
```

## Adding an agent / command / skill

1. Create the file/folder under the matching directory.
2. **Register it** in `plugins/wigtn-plugins/.claude-plugin/plugin.json` (add to the
   `agents` / `commands` / `skills` array). A skill that is not in the array is not
   exposed by the plugin.
3. **Update the counts everywhere** — this is enforced by CI (see below):
   - `plugins/wigtn-plugins/.claude-plugin/plugin.json` description (`N agents, …`)
   - `.claude-plugin/plugin.json` (root manifest description)
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
- **Bundled scripts**: a command that needs several read-only lookups (`git`,
  `gh`, file probes) calls one script under `scripts/` via
  `bash "${CLAUDE_PLUGIN_ROOT}/scripts/<name>.sh"` instead of listing the commands
  for the model to run one by one. Return a single JSON object, cap unbounded
  fields, and never let a missing tool abort the script. Keep the decision in the
  command (the model), not in the script. Add a line telling the model not to run
  the individual commands anyway — without it the model re-runs them to confirm.

## Versioning & releases

Single source of truth: the `version` in `marketplace.json` and `plugin.json` must
match, and the three `README` badges and `CLAUDE.md` must state the same number.
The README banner (`assets/readme/banner.jpg`) prints the version and the counts as
well; replace it when either changes.
While the plugin is on `0.1.x`, every release bumps the patch number, whether it is
a `feat` or a `fix`.

When a version bump lands on `main`, `.github/workflows/release.yml` tags
`v<version>` and publishes a GitHub Release with generated notes. Do not tag by hand.

## Knowledge wiki changes

`scripts/knowledge_wiki/` sends session content off the machine, so its boundaries
are tested, not reviewed by eye. When you change it:

- Keep `contracts/INGEST-POLICY.md` and `skills/knowledge-wiki/SKILL.md` in step with
  the code (the field legend table in `SKILL.md` must match `compile.FIELDS`).
- Add a case to `.github/scripts/test_knowledge_wiki.py` for any new path that
  decides where content goes or whether it is pushed.
- Every failure path discards. A lost note is cheap; a leak cannot be undone.

## Before you open a PR

Run the same checks CI runs (`.github/workflows/validate.yml`):

```bash
python3 .github/scripts/validate_plugin.py      # JSON, plugin.json arrays, counts, version
python3 .github/scripts/check_contracts.py      # prompt contracts, agent names, hooks schema
python3 .github/scripts/test_knowledge_wiki.py  # knowledge-wiki boundaries
bash .github/scripts/test_gate.sh               # commit gate
bash .github/scripts/test_danger_hook.sh        # dangerous-command hook
bash .github/scripts/test_context_scripts.sh    # bundled context scripts
```

None of them call a model. PRs that drift from the counts, the version, or the
tested boundaries fail CI.

Fill in the PR template, link any related issue, and keep one concern per PR.
