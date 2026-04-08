<div align="center">

[English](README.md) | [한국어](README.ko.md) | [中文](README.cn.md)

# WIGTN Coding

**One plugin. 12 agents. From idea to production.**

![Version](https://img.shields.io/badge/v2.0.0-Unified_Plugin-FF6B6B?style=for-the-badge)
![Agents](https://img.shields.io/badge/12-Agents-5A67D8?style=for-the-badge)
![Commands](https://img.shields.io/badge/3-Commands-38B2AC?style=for-the-badge)
![Skills](https://img.shields.io/badge/3-Skills-00D4AA?style=for-the-badge)
![Styles](https://img.shields.io/badge/20-Design_Styles-F59E0B?style=for-the-badge)

[![GitHub Stars](https://img.shields.io/github/stars/wigtn/wigtn-plugins-with-claude-code?style=flat-square)](https://github.com/wigtn/wigtn-plugins-with-claude-code/stargazers)
[![License](https://img.shields.io/badge/license-Apache_2.0-blue?style=flat-square)](LICENSE)
[![Contributors](https://img.shields.io/github/contributors/wigtn/wigtn-plugins-with-claude-code?style=flat-square)](https://github.com/wigtn/wigtn-plugins-with-claude-code/graphs/contributors)
[![Last Commit](https://img.shields.io/github/last-commit/wigtn/wigtn-plugins-with-claude-code?style=flat-square)](https://github.com/wigtn/wigtn-plugins-with-claude-code/commits/main)

</div>

---

## What it does

WIGTN Coding is a Claude Code plugin. You describe what you want to build, and 12 specialized agents handle the rest — requirements, architecture, code, review, commit — all in parallel.

```
/prd "SaaS dashboard with OAuth"  →  PRD + task plan in 30 seconds
/implement --parallel             →  Backend + Frontend + AI + Ops teams build simultaneously
/auto-commit                      →  3-agent review, quality gate, auto-commit if 80+
```

---

## Quick Start

```bash
# Install
/plugin marketplace add wigtn/wigtn-plugins-with-claude-code
/install wigtn-coding

# Try it — this is the full workflow
/prd landing page for an AI startup with modern design
/implement ai-landing
/auto-commit
```

That's it. The plugin handles PRD generation, 4-category quality analysis, architecture decisions, design style selection, parallel build, code review, and commit.

---

## The Pipeline

```
  /prd                    /implement                    /auto-commit
   │                         │                              │
   ▼                         ▼                              ▼
┌──────────┐  ┌──────────────────────────────┐  ┌─────────────────────┐
│ PRD.md   │  │ DESIGN (3 agents parallel)   │  │ 3-agent review      │
│ PLAN.md  │  │  ├─ PRD quality gate         │  │  ├─ Readability     │
│          │  │  ├─ Architecture decision     │  │  ├─ Performance     │
│ digging  │  │  └─ Gap analysis             │  │  └─ Security        │
│ (4-agent │  │                              │  │                     │
│ parallel │  │ DESIGN DECISION              │  │ Score ≥ 80 → commit │
│ analysis)│  │  └─ style select (if FE)     │  │ Score 60-79 → fix   │
│          │  │                              │  │ Score < 60 → block   │
│          │  │ BUILD (team parallel)        │  │                     │
│          │  │  ├─ Backend                  │  │ Security critical    │
│          │  │  ├─ Frontend                 │  │  → force FAIL       │
│          │  │  ├─ AI Server               │  │                     │
│          │  │  └─ Ops                     │  │                     │
└──────────┘  └──────────────────────────────┘  └─────────────────────┘
```

Each step runs in parallel where possible. Full pipeline: ~6 min (vs ~20 min sequential).

---

## Commands

| Command | What it does |
|---------|-------------|
| `/prd <feature>` | Generate PRD + phased task plan from a feature idea |
| `/implement <feature>` | Design + build with automatic parallel team dispatch |
| `/auto-commit` | 3-agent parallel review → quality gate → commit + PR |

---

<details>
<summary><b>Agents (12)</b> — click to expand</summary>

### Coordinators

| Agent | Role |
|-------|------|
| `team-build-coordinator` | Dispatches Backend, Frontend, AI, Ops teams in parallel |
| `parallel-review-coordinator` | Runs 3 review agents, merges scores |
| `parallel-digging-coordinator` | 4-category PRD analysis pipeline |
| `architecture-decision` | MSA vs Monolithic vs Modular Monolith |

### Developers

| Agent | Role |
|-------|------|
| `frontend-developer` | React 19, Next.js 16+, 20 design styles |
| `backend-architect` | API design, database schema, backend patterns |
| `mobile-developer` | React Native / Expo, native modules |
| `ai-agent` | WhisperX STT, OpenAI/Anthropic integration |

### Quality

| Agent | Role |
|-------|------|
| `code-reviewer` | 100-point scoring across 5 categories |
| `prd-reviewer` | Finds gaps across completeness, feasibility, security, consistency |
| `code-formatter` | Multi-language auto-formatting and lint fixes |
| `design-discovery` | VS-based style recommendation for Web and Mobile |

</details>

<details>
<summary><b>Skills (3)</b> — click to expand</summary>

| Skill | What it provides |
|-------|-----------------|
| `code-review-levels` | Deep review (Level 3: call chains, edge cases, concurrency) and architecture review (Level 4: SOLID, layer violations, scalability) |
| `design-system-reference` | 20 style guides with typography, color, components, motion, and anti-patterns. Works with design-discovery for context-aware recommendations |
| `team-memory-protocol` | SHARED_CONTEXT management for cross-agent coordination during parallel builds |

</details>

<details>
<summary><b>Design Styles (20)</b> — click to expand</summary>

Each style guide covers philosophy, typography, layout, color, components, motion, and an anti-pattern checklist.

| Style | Vibe |
|-------|------|
| Editorial | Magazine layouts, strong serif typography |
| Brutalist | Raw, bold, unconventional |
| Glassmorphism | Frosted glass, blur, transparency |
| Swiss Minimal | Grid-based, typography-focused |
| Neomorphism | Soft UI, inset/outset shadows |
| Bento Grid | Card-based grid (Apple-inspired) |
| Dark Mode First | Dark interfaces from the ground up |
| Minimal Corporate | Clean professional aesthetic |
| Retro Pixel | CRT effects, monospace, terminal nostalgia |
| Organic Shapes | Blobs, natural curves, earthy tones |
| Maximalist | Bold type, intense colors, layered |
| 3D Immersive | CSS 3D transforms, parallax, depth |
| Liquid Glass | Fluid translucent glass, dynamic reflections |
| Claymorphism | Soft 3D clay elements, pastel tones |
| Minimalism | Extreme simplicity, whitespace-driven |
| Neobrutalism | Colorful accents, bold borders |
| Skeuomorphism | Realistic textures, physical metaphors |
| Aurora / Gradient Mesh | Mesh gradients, ambient glow, ethereal |
| Terminal / Hacker | Monospace-driven, information-dense, semantic color |
| Kinetic Typography | Scroll-driven text animation, split reveals |

The `design-discovery` agent recommends the best style for your project context using VS (Verbalized Sampling).

</details>

<details>
<summary><b>Hooks (4)</b> — click to expand</summary>

| Hook | Trigger | What it does |
|------|---------|-------------|
| Dangerous Command Blocker | `Bash` PreToolUse | Blocks `rm -rf /`, `git push --force`, `DROP TABLE` |
| Pipeline Completion | Stop | Reminds to review before pushing |
| Frontend Formatting | `Write\|Edit` PostToolUse | Reminds prettier/eslint for `.tsx`, `.jsx`, `.css` |
| Backend Pattern Compliance | `Write\|Edit` PostToolUse | Checks error handling, validation, logging for `.ts`, `.py`, `.go` |

</details>

---

## Scenarios

<details>
<summary><b>Full-Stack SaaS from scratch</b></summary>

```bash
/prd project management tool with kanban boards and team collaboration
# → 4-agent analysis catches: "Missing: real-time sync, role permissions"

/implement --parallel project-management
# Backend: API endpoints, Prisma schema, auth middleware
# Frontend: Kanban board, team views, dashboard
# Ops: Dockerfile, GitHub Actions CI/CD

/auto-commit
# 3 reviewers → 87/100 → auto-commit
```

</details>

<details>
<summary><b>Mobile app with React Native</b></summary>

```bash
/prd fitness tracker with workout logging, progress charts, Apple Health sync

/implement fitness-tracker
# Expo Router + Zustand + MMKV + React Query
# Biometric auth, haptic feedback, offline sync
```

</details>

<details>
<summary><b>Design-driven landing page</b></summary>

```bash
/prd AI startup landing page with modern design

/implement ai-landing
# design-discovery activates → recommends Glassmorphism or Liquid Glass
# Frontend team builds Hero, Features, Pricing, CTA with chosen style
```

</details>

<details>
<summary><b>Backend API + AI features</b></summary>

```bash
/prd transcription service with WhisperX STT and LLM summarization

/implement --parallel transcription-service
# Backend → API + DB + auth
# AI → WhisperX + OpenAI/Anthropic patterns
# Frontend → Upload UI + transcription viewer
```

</details>

---

## Tech Stack

| Domain | Technologies |
|--------|-------------|
| Frontend | React 19, Next.js 16+, Tailwind CSS, Radix UI |
| Backend | NestJS, Express, FastAPI, Prisma, Drizzle |
| Mobile | React Native 0.73+, Expo SDK 52+ |
| AI | WhisperX, OpenAI GPT, Anthropic Claude |
| DevOps | Docker, Kubernetes, GitHub Actions |
| Design | 20 style systems, VS-based discovery, HIG, MD3 |

---

## Contributing

```bash
git checkout -b feature/amazing-skill
# make changes
git commit -m 'feat: Add amazing skill'
git push origin feature/amazing-skill
# open PR
```

---

## License

Apache License 2.0 — see [LICENSE](LICENSE).

---

<div align="center">

**Built by [WIGTN Crew](https://github.com/wigtn)**

</div>
