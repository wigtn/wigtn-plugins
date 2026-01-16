# Frontend Development Plugin

Complete frontend development solution for Claude Code. Build unique, production-ready React/Next.js applications with 12+ design styles, modern patterns, and comprehensive tooling.

## Features

### Agents

| Agent | Description | Usage |
|-------|-------------|-------|
| `frontend-developer` | Full-stack frontend expert with 12+ design styles | Auto-invoked for frontend tasks |
| `design-discovery` | Multi-phase design direction discovery | Design exploration and refinement |

### Skills (13)

Invoke with `/skill-name` or let Claude use them automatically.

| Category | Skill | Description |
|----------|-------|-------------|
| **Design** | `/design-skill` | 12+ design styles (Editorial, Brutalist, Glassmorphism, etc.) |
| | `/tailwind-design-system` | Design tokens, component libraries, responsive patterns |
| **Framework** | `/nextjs-app-router-patterns` | Server Components, streaming, parallel routes |
| **State** | `/react-state-management` | Redux Toolkit, Zustand, Jotai, React Query |
| **Auth** | `/authentication` | NextAuth.js, Clerk, custom solutions, RBAC |
| **Forms** | `/forms-validation` | React Hook Form, Zod validation, accessibility |
| **API** | `/api-integration` | Fetch, Axios, TanStack Query, error handling |
| **Testing** | `/frontend-test` | Jest, React Testing Library patterns |
| **SEO** | `/seo` | Metadata API, JSON-LD, sitemaps, robots.txt |
| **Components** | `/component-library` | Radix UI based accessible components |
| **Hooks** | `/react-hooks` | 18+ production-ready custom hooks |
| **Charts** | `/data-visualization` | Recharts, Chart.js, D3, dashboards |
| **Realtime** | `/realtime-features` | WebSocket, SSE, presence, optimistic UI |

### Commands (2)

| Command | Description |
|---------|-------------|
| `/component-scaffold` | Generate complete component with types, tests, styles, stories |
| `/add-feature` | Guided feature implementation with templates and checklists |

## Quick Start

### Installation

Add to your project's `.claude/settings.local.json`:

```json
{
  "plugins": [
    "frontend-development"
  ]
}
```

Or install via Claude Code marketplace.

### Basic Usage

```
# Let the agent handle everything
"Create a dashboard with user analytics"

# Use specific skills
/design-skill
/authentication
/forms-validation

# Use commands
/component-scaffold UserProfile
/add-feature shopping cart with checkout
```

## Design Styles

The plugin supports 12+ unique design aesthetics:

| Style | Description |
|-------|-------------|
| **Editorial** | Magazine-inspired, sophisticated typography |
| **Brutalist** | Raw, bold, unconventional layouts |
| **Glassmorphism** | Frosted glass effects, blur, transparency |
| **Neomorphism** | Soft shadows, extruded elements |
| **Minimalist** | Clean, whitespace-focused, essential |
| **Maximalist** | Bold colors, patterns, layered elements |
| **Retro/Vintage** | Nostalgic, classic aesthetics |
| **Futuristic** | Sci-fi inspired, neon, dark themes |
| **Organic** | Natural shapes, earth tones, flowing |
| **Geometric** | Sharp angles, mathematical precision |
| **Playful** | Fun, colorful, animated |
| **Corporate** | Professional, trustworthy, clean |

## Skill Details

### `/design-skill`

Multi-phase design discovery process:
1. **Style Direction** - Choose from 12+ aesthetics
2. **Color Palette** - Generate harmonious color schemes
3. **Typography** - Font pairing and hierarchy
4. **Spacing & Layout** - Grid systems and rhythm
5. **Components** - Consistent UI elements
6. **Animations** - Micro-interactions and transitions

### `/nextjs-app-router-patterns`

Modern Next.js 14+ patterns:
- Server Components & Client Components
- Streaming with Suspense
- Parallel & Intercepting Routes
- Server Actions
- Metadata API
- Route Handlers

### `/react-state-management`

State management solutions:
- **Zustand** - Lightweight, hooks-based
- **Redux Toolkit** - Scalable, predictable
- **Jotai** - Atomic state
- **TanStack Query** - Server state management

### `/authentication`

Complete auth solutions:
- NextAuth.js (Auth.js)
- Clerk integration
- Custom JWT implementation
- Protected routes & middleware
- Role-based access control (RBAC)

### `/forms-validation`

Form handling patterns:
- React Hook Form integration
- Zod schema validation
- Accessible error messages
- Multi-step forms
- File uploads

### `/react-hooks`

18+ production-ready hooks:
- `useLocalStorage` - Persistent state
- `useDebounce` / `useThrottle` - Performance
- `useMediaQuery` - Responsive design
- `useClickOutside` - UI interactions
- `useIntersectionObserver` - Lazy loading
- `useCopyToClipboard` - Clipboard API
- `useAsync` - Async operations
- `useKeyPress` - Keyboard shortcuts
- And more...

### `/data-visualization`

Charting libraries:
- **Recharts** - React-native charts
- **Chart.js** - Lightweight, simple
- **D3.js** - Advanced visualizations
- Dashboard widgets (KPI cards, sparklines, progress rings)
- Real-time streaming charts

### `/realtime-features`

Real-time patterns:
- WebSocket connections with auto-reconnect
- Server-Sent Events (SSE)
- Presence indicators (online/offline)
- Optimistic UI updates
- Collaborative features (cursors, editing)

## Command Details

### `/component-scaffold`

Generates complete component structure:

```
components/
└── [ComponentName]/
    ├── [ComponentName].tsx      # Main component
    ├── [ComponentName].types.ts # TypeScript types
    ├── [ComponentName].test.tsx # Unit tests
    ├── [ComponentName].stories.tsx # Storybook
    ├── [ComponentName].module.css # Styles
    └── index.ts                 # Exports
```

### `/add-feature`

Guided feature implementation:

1. **Codebase Analysis** - Detects existing patterns
2. **Feature Planning** - User stories, components, API
3. **Implementation Order** - Types → API → State → UI
4. **File Templates** - Production-ready code
5. **Integration Checklist** - Quality assurance

## Examples

### Create a Complete App

```
"Build a task management app with:
- User authentication
- Dashboard with analytics
- CRUD operations for tasks
- Real-time updates
- Dark mode support"
```

### Add Authentication

```
/authentication

"Set up NextAuth with Google and GitHub providers,
protected routes, and role-based access"
```

### Build a Dashboard

```
/data-visualization

"Create an analytics dashboard with:
- Revenue line chart
- User growth bar chart
- Category distribution pie chart
- Real-time KPI cards"
```

### Design Exploration

```
/design-skill

"I want a modern SaaS landing page.
Help me explore design directions."
```

## Project Structure

```
plugins/frontend-development/
├── .claude-plugin/
│   └── plugin.json          # Plugin configuration
├── agents/
│   ├── frontend-developer.md
│   └── design-discovery.md
├── commands/
│   ├── component-scaffold.md
│   └── add-feature.md
├── skills/
│   ├── design-skill/
│   ├── nextjs-app-router-patterns/
│   ├── react-state-management/
│   ├── tailwind-design-system/
│   ├── frontend-test/
│   ├── seo/
│   ├── forms-validation/
│   ├── api-integration/
│   ├── authentication/
│   ├── component-library/
│   ├── react-hooks/
│   ├── data-visualization/
│   └── realtime-features/
└── README.md
```

## Requirements

- Claude Code CLI
- Node.js 18+
- Next.js 14+ (recommended)
- React 18+

## License

MIT

## Author

[wigtn](https://github.com/wigtn)

## Contributing

Contributions welcome! Please read our contributing guidelines before submitting PRs.

---

Built with Claude Code Plugin System
