# WIGTN Claude Code Plugin Tools

## Project Overview

A unified Claude Code plugin enabling AI-powered Vibe Coding: idea to production with minimal friction.

**Version**: 2.0.0
**License**: Apache-2.0
**Repository**: https://github.com/wigtn/wigtn-plugins-with-claude-code

## Architecture

```
wigtn-plugins-with-claude-code/
├── .claude-plugin/           # Marketplace metadata
├── plugins/
│   └── wigtn-coding/         # Unified plugin: 12 agents, 3 commands, 3 skills, 20 design styles
│       ├── .claude-plugin/   # Plugin metadata
│       ├── agents/           # 12 agent definitions
│       ├── commands/         # 3 commands (/prd, /implement, /auto-commit)
│       ├── skills/           # 3 skills (code-review-levels, design-system-reference, team-memory-protocol)
│       └── hooks/            # Hooks configuration
├── CLAUDE.md                 # This file
├── README.md                 # English docs
└── README.ko.md              # Korean docs
```

### Plugin Structure

```
plugins/wigtn-coding/
├── .claude-plugin/plugin.json  # Plugin metadata
├── agents/                     # Agent definitions (.md)
├── commands/                   # User-invocable commands (.md)
├── skills/                     # Skills with SKILL.md + reference files
└── hooks/hooks.json            # Hooks configuration
```

## Pipeline Flow

```
/prd <feature>
  → PRD.md + PLAN_{feature}.md
    → digging (4-category parallel analysis)
      → /implement (DESIGN parallel → [Frontend? → design-discovery → style select] → BUILD team parallel)
        → /auto-commit (3-agent parallel review → quality gate → commit)
```

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

Hooks are defined in `plugins/wigtn-coding/hooks/hooks.json` and follow the Claude Code hooks schema.

### Agent Teams

Coordinators support both instruction-based orchestration (default) and native Agent Teams mode when `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` is detected.

## Key Paths

| Path | Purpose |
|------|---------|
| `plugins/wigtn-coding/skills/code-review-levels/` | Deep review (Level 3) + architecture review (Level 4) |
| `plugins/wigtn-coding/skills/design-system-reference/` | 20 design style guides + common patterns |
| `plugins/wigtn-coding/skills/design-system-reference/styles/` | Individual style guide files |
| `plugins/wigtn-coding/skills/team-memory-protocol/` | Cross-agent shared context management |
| `plugins/wigtn-coding/agents/parallel-*` | Parallel coordinators (digging, review) |
| `plugins/wigtn-coding/agents/team-build-coordinator.md` | Team-based parallel build orchestration |

## Important Notes

- All skills and commands use Korean (한국어) for user-facing content
- Design style files follow a consistent pattern: philosophy, typography, layout, color, components, anti-patterns
- Parallel coordinators include sequential fallback for graceful degradation
- Hooks run asynchronously to avoid blocking the main workflow
- Commands can be used without plugin prefix (e.g., `/prd` instead of `wigtn-coding:prd`)
