<div align="center">

[English](README.md) | [한국어](README.ko.md)

# WIGTN Coding

**From Idea to Deploy, Zero Friction**

![Version](https://img.shields.io/badge/v2.0.0-Unified_Plugin-FF6B6B?style=for-the-badge)
![Agents](https://img.shields.io/badge/12-Agents-5A67D8?style=for-the-badge)
![Skills](https://img.shields.io/badge/3-Skills-00D4AA?style=for-the-badge)
![Styles](https://img.shields.io/badge/20-Design_Styles-F59E0B?style=for-the-badge)

[![GitHub Stars](https://img.shields.io/github/stars/wigtn/wigtn-plugins-with-claude-code?style=flat-square)](https://github.com/wigtn/wigtn-plugins-with-claude-code/stargazers)
[![License](https://img.shields.io/badge/license-Apache_2.0-blue?style=flat-square)](LICENSE)
[![Contributors](https://img.shields.io/github/contributors/wigtn/wigtn-plugins-with-claude-code?style=flat-square)](https://github.com/wigtn/wigtn-plugins-with-claude-code/graphs/contributors)
[![Last Commit](https://img.shields.io/github/last-commit/wigtn/wigtn-plugins-with-claude-code?style=flat-square)](https://github.com/wigtn/wigtn-plugins-with-claude-code/commits/main)

</div>

---

## What is WIGTN Coding?

**WIGTN Coding** is a single, unified Claude Code plugin that takes you from a rough idea to a deployed product with zero friction. One plugin — no prefixes needed.

```
"I want to build a SaaS dashboard with user auth"
  → /prd        (requirements)
  → digging     (analysis)
  → /implement  (parallel build)
  → /auto-commit (quality gate + commit)
```

**12 agents**, **3 commands**, **3 skills**, **20 design styles** — all working together with team-based parallel execution for 3-5x speedup.

---

## At a Glance

| What | Count | Highlights |
|------|-------|------------|
| Agents | 12 | Parallel coordinators, architecture decisions, specialized developers |
| Commands | 3 | `/prd`, `/implement`, `/auto-commit` |
| Skills | 3 | Code review levels, design system reference, team memory protocol |
| Design Styles | 20 | Editorial, Brutalist, Glassmorphism, Aurora/Gradient Mesh, Kinetic Typography, and more |
| Hooks | 4 | Dangerous command blocking, formatting reminders, pattern compliance |

---

## Installation

```bash
# Step 1 — Add marketplace source (first time only)
/plugin marketplace add wigtn/wigtn-plugins-with-claude-code

# Step 2 — Install plugin
/install wigtn-coding
```

<details>
<summary>Manual install (alternative)</summary>

```bash
git clone https://github.com/wigtn/wigtn-plugins-with-claude-code.git ~/.claude-plugins/wigtn
mkdir -p ~/.claude/plugins
ln -s ~/.claude-plugins/wigtn/plugins/wigtn-coding ~/.claude/plugins/

# Update
git -C ~/.claude-plugins/wigtn pull
```

</details>

---

## The Pipeline

The core workflow is a 4-step pipeline that goes from idea to committed code:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   /prd "user authentication with OAuth"                         │
│   ├── PRD.md (structured requirements)                          │
│   └── PLAN_{feature}.md (phased task plan)                      │
│                         ↓                                       │
│   digging (4-agent parallel analysis)                           │
│   ├── Completeness — missing requirements?                      │
│   ├── Feasibility — can we actually build this?                 │
│   ├── Security — any vulnerabilities?                           │
│   └── Consistency — do requirements contradict?                 │
│                         ↓                                       │
│   /implement --parallel                                         │
│   ├── DESIGN Phase (3 agents parallel)                          │
│   │   ├── PRD search + quality gate                             │
│   │   ├── Architecture decision (MSA vs Monolith)               │
│   │   └── Project analysis + gap analysis                       │
│   ├── Design Decision (when Frontend team active)               │
│   │   └── design-discovery → style select → style guide load    │
│   ├── User approval checkpoint                                  │
│   └── BUILD Phase (team-based parallel)                         │
│       ├── Backend team  → backend-architect agent               │
│       ├── Frontend team → frontend-developer agent              │
│       ├── AI team       → ai-agent (when needed)                │
│       └── Ops team      → devops setup (when needed)            │
│                         ↓                                       │
│   /auto-commit                                                  │
│   ├── 3-agent parallel code review                              │
│   ├── Quality Gate (score 80+ = auto-commit)                    │
│   ├── Security zero-tolerance check                             │
│   └── Commit + push                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Quality Gate

| Score | Action |
|-------|--------|
| 80+ | Auto-commit |
| 60-79 | Auto-fix then retry |
| < 60 | Block commit |
| Security Critical | Force FAIL (capped at 59) |

### Parallel Speedup

| Stage | Sequential | Parallel | Speedup |
|-------|-----------|----------|---------|
| digging | 4 categories serial | 4 agents parallel | **4x** |
| DESIGN | 4 steps serial | 3 agents parallel | **3x** |
| BUILD | tasks serial | team-based parallel | **2-3x** |
| Review | single reviewer | 3 agents parallel | **3x** |
| **Full Pipeline** | **~20 min** | **~6 min** | **~3x** |

---

## Commands (3)

| Command | Description |
|---------|-------------|
| `/prd <feature>` | Generate PRD + phased task plan from a feature idea |
| `/implement <feature>` | Design + build with automatic parallel mode detection |
| `/implement --parallel` | Force parallel team-based build |
| `/auto-commit` | Parallel quality review + safety gate + auto-commit |

> Domain-specific capabilities (backend, frontend, mobile, AI, DevOps) are handled by specialized agents dispatched automatically through `/implement`'s team-build-coordinator.

---

## Agents (12)

| Agent | Role |
|-------|------|
| `architecture-decision` | Analyzes PRD to decide MSA vs Monolithic vs Modular Monolith |
| `code-formatter` | Multi-language formatting and linting automation |
| `code-reviewer` | Code review with 100-point quality scoring (readability, maintainability, performance, testability, best practices) |
| `prd-reviewer` | PRD analysis — finds weaknesses, gaps, and risks across 4 categories (completeness, feasibility, security, consistency) |
| `team-build-coordinator` | Team-based parallel build: Backend + Frontend + AI + Ops |
| `parallel-review-coordinator` | 3-agent parallel code review with score merge |
| `parallel-digging-coordinator` | 5-phase parallel PRD analysis pipeline with quality gate |
| `frontend-developer` | React 19 / Next.js 16+ component and page generation with 20 design styles |
| `design-discovery` | VS (Verbalized Sampling) style recommendation for Web and Mobile |
| `backend-architect` | Backend patterns, API design, database schema, architecture decisions |
| `mobile-developer` | React Native / Expo component, screen, and native module generation |
| `ai-agent` | STT (WhisperX) and LLM (OpenAI, Anthropic) integration patterns |

---

## Skills (3)

| Skill | Description |
|-------|-------------|
| `code-review-levels` | Reference documents for deep code review (Level 3: call chains, edge cases, concurrency, security) and architecture review (Level 4: SOLID principles, dependency analysis, layer violations, scalability) |
| `design-system-reference` | 20 style guides with common patterns (animations, colors, spacing). Works with design-discovery agent for context gathering and VS-based style recommendations. Includes anti-patterns and implementation checklists |
| `team-memory-protocol` | Shared context management for team-based parallel builds. SHARED_CONTEXT file management, TaskCreate integration, and cross-agent memory coordination |

---

## Design Styles (20)

The `design-system-reference` skill includes 20 professionally crafted style guides. Each style guide covers philosophy, typography, layout, color, components, motion, and anti-patterns.

| Style | Vibe |
|-------|------|
| **Editorial** | Magazine-inspired layouts with strong serif typography |
| **Brutalist** | Raw, bold, unconventional — breaks all the rules |
| **Glassmorphism** | Frosted glass effects with blur and transparency |
| **Swiss Minimal** | Clean grid-based design, typography-focused |
| **Neomorphism** | Soft UI with subtle inset/outset shadows |
| **Bento Grid** | Modern card-based grid layouts (Apple-inspired) |
| **Dark Mode First** | Designed for dark interfaces from the ground up |
| **Minimal Corporate** | Clean, professional business aesthetic |
| **Retro Pixel** | CRT effects, monospace fonts, terminal nostalgia |
| **Organic Shapes** | Blob shapes, natural curves, earthy tones |
| **Maximalist** | Bold typography, intense colors, layered complexity |
| **3D Immersive** | CSS 3D transforms, parallax, depth effects |
| **Liquid Glass** | Fluid, translucent glass effects with dynamic reflections |
| **Claymorphism** | Soft 3D clay-like elements with pastel tones |
| **Minimalism** | Extreme simplicity, whitespace-driven, essential-only |
| **Neobrutalism** | Modern brutalism with colorful accents and bold borders |
| **Skeuomorphism** | Realistic textures and physical-world metaphors |
| **Aurora / Gradient Mesh** | Mesh gradients, color fields, ambient glow — ethereal and premium |
| **Terminal / Hacker** | Monospace-driven, information-dense, semantic color — modern terminal craft |
| **Kinetic Typography** | Scroll-driven text animation, split reveals — typographic theater |

The `design-discovery` agent uses VS (Verbalized Sampling) technique to recommend the best style for your project context.

---

## Hooks (Safety & Quality)

| Hook | Trigger | What It Does |
|------|---------|-------------|
| Dangerous Command Blocker | `Bash` PreToolUse | Blocks `rm -rf /`, `git push --force`, `DROP TABLE`, etc. |
| Pipeline Completion | Stop event | Reminds you to review changes before pushing |
| Frontend Formatting | `Write\|Edit` PostToolUse | Reminds to run prettier/eslint on `.tsx`, `.jsx`, `.css` files |
| Backend Pattern Compliance | `Write\|Edit` PostToolUse | Reminds to verify error handling, input validation, logging on `.ts`, `.py`, `.go` files |

---

## Scenarios

### Scenario 1: Full-Stack SaaS App from Scratch

> "I want to build a project management tool with team collaboration"

```bash
# Step 1 — Define requirements
/prd project management tool with kanban boards and team collaboration

# Step 2 — Review and refine the plan (runs digging automatically)
# 4-agent parallel analysis catches gaps: "Missing: real-time sync, role permissions"

# Step 3 — Build everything in parallel
/implement --parallel project-management
# Backend team: API endpoints, Prisma schema, auth middleware
# Frontend team: Kanban board, team views, dashboard
# Ops team: Dockerfile, GitHub Actions CI/CD

# Step 4 — Quality check and commit
/auto-commit
# 3 reviewers score: 87/100 → Auto-commit
```

### Scenario 2: Mobile App Development

> "Build a fitness tracking app with React Native"

```bash
/prd fitness tracker with workout logging, progress charts, and Apple Health sync

/implement fitness-tracker
# Architecture: Expo Router + Zustand + MMKV + React Query
# Mobile-specific: biometric auth, haptic feedback, offline sync
# Generates: screens, components, navigation, native module integration
```

### Scenario 3: Design-Driven Landing Page

> "Create a landing page for my AI startup"

```bash
/prd AI startup landing page with modern design

/implement ai-landing
# design-discovery agent activates → asks about brand personality
# Recommends: Glassmorphism (modern, trust) or Liquid Glass (dynamic, cutting-edge)
# Frontend team generates: Hero, Features, Pricing, CTA sections with chosen style

/auto-commit
```

### Scenario 4: Backend API with AI Features

> "Build a transcription service with voice commands and LLM processing"

```bash
/prd transcription service with WhisperX STT and LLM-powered summarization

/implement --parallel transcription-service
# Backend team → backend-architect: API endpoints, database schema, auth
# AI team → ai-agent: WhisperX integration, OpenAI/Anthropic API patterns
# Frontend team → frontend-developer: Upload UI, transcription viewer, dashboard
# Ops team: Docker setup, CI/CD pipeline

/auto-commit
# Quality gate: 92/100 → Auto-commit
```

### Scenario 5: DevOps Pipeline Setup

> "Set up Docker and CI/CD for my monorepo"

```bash
/prd Docker multi-stage build and GitHub Actions CI/CD for pnpm monorepo

/implement devops-pipeline
# team-build-coordinator dispatches ops team tasks
# Generates: Dockerfile, docker-compose.yml, .github/workflows/ci.yml
# Includes: caching, test stage, deployment to Vercel/Railway

/auto-commit
```

---

## Plugin Structure

```
plugins/wigtn-coding/
├── .claude-plugin/
│   └── plugin.json           # Plugin metadata (12 agents, 3 commands, 3 skills)
├── agents/                   # 12 agent definitions
│   ├── architecture-decision.md
│   ├── code-formatter.md
│   ├── code-reviewer.md
│   ├── prd-reviewer.md
│   ├── team-build-coordinator.md
│   ├── parallel-review-coordinator.md
│   ├── parallel-digging-coordinator.md
│   ├── frontend-developer.md
│   ├── design-discovery.md
│   ├── backend-architect.md
│   ├── mobile-developer.md
│   └── ai-agent.md
├── commands/                 # 3 user-invocable commands
│   ├── prd.md
│   ├── implement.md
│   └── auto-commit.md
├── skills/                   # 3 skills with reference files
│   ├── code-review-levels/   # Deep review (Level 3) + architecture review (Level 4)
│   │   ├── SKILL.md
│   │   ├── deep-review.md
│   │   └── architecture-review.md
│   ├── design-system-reference/  # 20 style guides + common patterns
│   │   ├── SKILL.md
│   │   ├── README.md
│   │   ├── common/
│   │   │   ├── animations.md
│   │   │   ├── colors.md
│   │   │   └── spacing.md
│   │   └── styles/           # 20 design style guides
│   │       ├── editorial.md
│   │       ├── brutalist.md
│   │       ├── glassmorphism.md
│   │       ├── swiss-minimal.md
│   │       ├── neomorphism.md
│   │       ├── bento-grid.md
│   │       ├── dark-mode-first.md
│   │       ├── minimal-corporate.md
│   │       ├── retro-pixel.md
│   │       ├── organic-shapes.md
│   │       ├── maximalist.md
│   │       ├── 3d-immersive.md
│   │       ├── liquid-glass.md
│   │       ├── claymorphism.md
│   │       ├── minimalism.md
│   │       ├── neobrutalism.md
│   │       ├── skeuomorphism.md
│   │       ├── aurora-gradient.md
│   │       ├── terminal-hacker.md
│   │       └── kinetic-typography.md
│   └── team-memory-protocol/ # Cross-agent shared context
│       └── SKILL.md
└── hooks/
    └── hooks.json            # 4 hooks (safety + quality)
```

---

## Tech Stack Coverage

| Domain | Technologies |
|--------|-------------|
| **Frontend** | React 19, Next.js 16+, Tailwind CSS, Radix UI, React Hook Form, Zod |
| **Backend** | NestJS, Express, Fastify, FastAPI, Prisma, TypeORM, Drizzle |
| **Mobile** | React Native 0.73+, Expo SDK 52+, Expo Router, React Navigation |
| **Database** | PostgreSQL, MySQL, MongoDB, SQLite |
| **State** | Zustand, Jotai, Redux Toolkit, React Query, MMKV |
| **Testing** | Jest, RTL, RNTL, Playwright, Detox, Maestro, MSW |
| **DevOps** | Docker, Kubernetes, GitHub Actions, Vercel, Railway |
| **AI** | WhisperX (STT), OpenAI GPT, Anthropic Claude |
| **Design** | 20 style systems, VS-based style discovery, HIG, Material Design 3 |

---

## Contributing

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/amazing-skill`)
3. **Commit** your changes (`git commit -m 'feat: Add amazing skill'`)
4. **Push** to the branch (`git push origin feature/amazing-skill`)
5. **Open** a Pull Request

---

## License

This project is licensed under the **Apache License 2.0** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with Claude Code by [WIGTN Crew](https://github.com/wigtn)**

</div>
