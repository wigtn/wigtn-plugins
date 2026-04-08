# Claude Design Skill

AI-powered design discovery plugin for Claude Code. Asks detailed questions to understand your design preferences, then applies consistent style guidelines.

## Features

- **12 Design Styles**: Swiss Minimal, Brutalist, Editorial, Glassmorphism, Neomorphism, Bento Grid, Dark Mode First, Minimal Corporate, and more
- **Granular Control**: Colors, gradients, animations, border radius, spacing density
- **Common Modules**: Reusable color systems, animation patterns, spacing scales
- **AI Slop Prevention**: Built-in rules to avoid generic AI-generated aesthetics

## Installation

### Option 1: Git Clone (Recommended)

```bash
# Navigate to your project root
cd your-project

# Create .claude/skills directory if it doesn't exist
mkdir -p .claude/skills

# Clone the design skill
git clone https://github.com/YOUR_USERNAME/claude-design-skill.git .claude/skills/design-skill
```

### Option 2: Manual Download

1. Download this repository as ZIP
2. Extract to `.claude/skills/design-skill/` in your project

### Option 3: Git Submodule

```bash
git submodule add https://github.com/YOUR_USERNAME/claude-design-skill.git .claude/skills/design-skill
```

## Project Structure

```
.claude/skills/design-skill/
├── SKILL.md              # Main skill definition
├── README.md             # This file
├── common/
│   ├── colors.md         # Color systems & palettes
│   ├── animations.md     # Animation levels & patterns
│   └── spacing.md        # Density & spacing systems
└── styles/
    ├── swiss-minimal.md
    ├── brutalist.md
    ├── editorial.md
    ├── glassmorphism.md
    ├── neomorphism.md
    ├── bento-grid.md
    ├── dark-mode-first.md
    └── minimal-corporate.md
```

## Usage

Once installed, simply ask Claude Code to help with frontend design:

```
"Help me design a landing page for my SaaS product"
"Create a dashboard UI"
"Redesign my portfolio site"
```

Claude will automatically:
1. Ask about your target audience
2. Present style options
3. Ask detail questions (colors, animations, etc.)
4. Read the appropriate style guide
5. Implement with consistent design tokens

## Discovery Questions

### Core Questions
1. **Target Audience** - Who are you designing for?
2. **Mood/Style** - Which aesthetic direction?
3. **References** - Any inspiration sites?

### Detail Questions
4. **Color Preference** - Custom, Monochrome, Vibrant, Earthy, Cool, Warm, Dark
5. **Gradient Usage** - None, Subtle, Bold, Mesh
6. **Animation Level** - None, Minimal, Moderate, Rich
7. **Border Radius** - Sharp, Slight, Rounded, Pill
8. **Density** - Compact, Balanced, Spacious

## Available Styles

| Style | Best For |
|-------|----------|
| Swiss Minimal | Clean products, SaaS |
| Brutalist | Creative agencies, portfolios |
| Editorial | Fashion, magazines, luxury |
| Glassmorphism | Modern apps, dashboards |
| Neomorphism | Soft UI, toggles, controls |
| Bento Grid | Apple-style layouts, portfolios |
| Dark Mode First | Developer tools, gaming |
| Minimal Corporate | B2B, enterprise, fintech |

## Customization

### Adding New Styles

1. Create `styles/your-style.md` with the style guide
2. Add reference in `SKILL.md` under "Style Guides" section
3. Add to the Quick Reference table

### Modifying Questions

Edit `SKILL.md` Phase 1 section to add/remove/modify discovery questions.

## License

Apache License 2.0 - Feel free to use, modify, and distribute.

## Contributing

Pull requests welcome! Please ensure new styles follow the existing format with:
- Color palette (light + dark mode)
- Typography recommendations
- Component examples
- Do's and Don'ts section
