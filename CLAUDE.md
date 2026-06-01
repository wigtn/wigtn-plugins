# WIGTN Claude Code Plugin Tools

## Project Overview

A unified Claude Code plugin enabling AI-powered Vibe Coding: idea to production with minimal friction.

**Version**: 0.1.7
**License**: Apache-2.0
**Repository**: https://github.com/wigtn/wigtn-plugins

## Architecture

```
wigtn-plugins/
├── .claude-plugin/           # Marketplace metadata
├── plugins/
│   └── wigtn-plugins/         # Unified plugin: 13 agents, 5 commands, 5 skills, 20 design styles
│       ├── .claude-plugin/   # Plugin metadata
│       ├── agents/           # 13 agent definitions
│       ├── commands/         # 5 commands (/prd, /screen-spec, /implement, /auto-commit, /review-pr)
│       ├── skills/           # 5 skills (code-review-levels, design-system-reference, handdrawn-diagram, screen-spec, team-memory-protocol)
│       └── hooks/            # Hooks configuration
├── CLAUDE.md                 # This file
├── README.md                 # English docs
└── README.ko.md              # Korean docs
```

### Plugin Structure

```
plugins/wigtn-plugins/
├── .claude-plugin/plugin.json  # Plugin metadata
├── agents/                     # Agent definitions (.md)
├── commands/                   # User-invocable commands (.md)
├── skills/                     # Skills with SKILL.md + reference files
└── hooks/hooks.json            # Hooks configuration
```

## Pipeline Flow

```
/prd <feature>
  → PRD.md + PLAN_{feature}.md  (§2.3 User Roles, §5.4 Pages, §5.4.1 State Matrix, §5.5 User Flow 포함)
    → digging (4-category parallel analysis via prd-reviewer)
      → /screen-spec <feature>  (FE 페이지가 있을 때만; IA / Flow / Spec / Wireframe / Handoff 5종 생성)
        → /implement (DESIGN parallel → [Frontend? → design-discovery → style select]
                       → [Linear 연동? → Epic/하위 이슈 등록 → 이슈 단위 순차 BUILD | 미연동? → BUILD team parallel])
          → /auto-commit (3-agent parallel review → quality gate → commit)
```

`/screen-spec`은 PRD §5.4에 `Has FE Components: Yes` 행이 1개+ 있을 때만 실행. 백엔드/API 전용 PRD에서는 스킵하고 바로 `/implement`로 진행.

`/implement`는 Step 0.5에서 이슈 트래커(Linear MCP, `mcp__linear__*`)를 감지한다. 연동 시 Step 6에서 1회 확인 후 PRD의 FR을 하위 이슈로(의존성은 FR 테이블 기준) 등록하고 의존성 순서대로 이슈 단위 순차 개발한다. 미연동/`--no-tracker`이면 기존 원큐 플로우. 이슈 트래커는 보조 기능이라 연동 실패 시 원큐로 graceful degradation.

### Quality Gate

- **80+**: Auto-commit (PASS)
- **60-79**: Auto-fix then retry (WARN)
- **< 60**: Block commit (FAIL)
- **Security Critical**: Force FAIL (score capped at 59)

## Conventions

### Skill Frontmatter

```yaml
---
name: skill-name
description: Brief description of the skill
disable-model-invocation: true    # Optional: for heavy skills (600+ lines)
allowed-tools: Read, Write, Edit  # Optional: restrict available tools
context: fork                     # Optional: run in isolated subagent
context-agent-type: general-purpose  # Optional: agent type for fork
---
```

### Command Frontmatter

```yaml
---
argument-hint: "<feature name>"   # Optional: autocomplete hint for $ARGUMENTS
---
```

### Hooks

Hooks are defined in `plugins/wigtn-plugins/hooks/hooks.json` and follow the Claude Code hooks schema.

### Agent Teams

Coordinators support both instruction-based orchestration (default) and native Agent Teams mode when `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` is detected.

## Key Paths

| Path | Purpose |
|------|---------|
| `plugins/wigtn-plugins/skills/code-review-levels/` | Deep review (Level 3) + architecture review (Level 4) |
| `plugins/wigtn-plugins/skills/design-system-reference/` | 20 design style guides + common patterns |
| `plugins/wigtn-plugins/skills/design-system-reference/styles/` | Individual style guide files |
| `plugins/wigtn-plugins/skills/screen-spec/` | Screen specs (IA / User Flow / Screen Spec / Wireframe HTML / Dev Handoff) generator |
| `plugins/wigtn-plugins/skills/screen-spec/templates/` | 5 boilerplate artifacts |
| `plugins/wigtn-plugins/skills/screen-spec/references/` | state-checklist, microcopy-patterns, handoff-checklist |
| `plugins/wigtn-plugins/skills/team-memory-protocol/` | Cross-agent shared context management |
| `plugins/wigtn-plugins/agents/parallel-*` | Parallel coordinators (digging, review) |
| `plugins/wigtn-plugins/agents/team-build-coordinator.md` | Team-based parallel build orchestration |

## Important Notes

- All skills and commands use Korean (한국어) for user-facing content
- Design style files follow a consistent pattern: philosophy, typography, layout, color, components, anti-patterns
- Parallel coordinators include sequential fallback for graceful degradation
- Hooks run asynchronously to avoid blocking the main workflow
- Commands can be used without plugin prefix (e.g., `/prd` instead of `wigtn-plugins:prd`)
