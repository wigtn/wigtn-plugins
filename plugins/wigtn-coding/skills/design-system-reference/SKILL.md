---
name: design-system-reference
description: Style guides and implementation rules for frontend design. Works with design-discovery agent which handles context gathering and VS-based style recommendations. Contains detailed style guides, anti-patterns, and implementation checklists.
allowed-tools: Read, Write, Edit, Glob
---

# Design Implementation Guide

## Overview

This skill provides **style guides and implementation rules** for frontend design.

**For design discovery and style selection**, use the `design-discovery` agent which:
- Gathers context through step-by-step questions
- Uses VS (Verbalized Sampling) technique to recommend styles with suitability percentages
- Applies AIDA methodology for landing pages

This skill is automatically loaded after the agent completes discovery.

---

## How to Use

### With Discovery Agent (Recommended)
1. User requests frontend design
2. `design-discovery` agent conducts context gathering
3. Agent presents VS-based style recommendations
4. After style selection, agent loads this skill for implementation

### Direct Usage (Quick Mode)
If user already knows their style, skip discovery:
```
"Build me a landing page with Bento Grid style, dark theme, minimal animations"
```
In this case, directly read the relevant style guide and implement.

---

## Style Selection & Guidelines

Based on user responses, select the appropriate style and read the corresponding guide.

**⚠️ IMPORTANT: You MUST read both the style guide AND relevant common modules before implementing.**

### Available Style Guides

!`ls styles/`

Use the `Read` tool to read the corresponding style file:
- Editorial → `styles/editorial.md`
- Brutalist → `styles/brutalist.md`
- Neobrutalism → `styles/neobrutalism.md`
- Glassmorphism → `styles/glassmorphism.md`
- Liquid Glass → `styles/liquid-glass.md`
- Swiss Minimal → `styles/swiss-minimal.md`
- Minimalism → `styles/minimalism.md`
- Neomorphism → `styles/neomorphism.md`
- Claymorphism → `styles/claymorphism.md`
- Skeuomorphism → `styles/skeuomorphism.md`
- Bento Grid → `styles/bento-grid.md`
- Dark Mode First → `styles/dark-mode-first.md`
- Minimal Corporate → `styles/minimal-corporate.md`
- Retro Pixel → `styles/retro-pixel.md`
- Organic Shapes → `styles/organic-shapes.md`
- Maximalist → `styles/maximalist.md`
- 3D Immersive → `styles/3d-immersive.md`
- Aurora / Gradient Mesh → `styles/aurora-gradient.md`
- Terminal / Hacker → `styles/terminal-hacker.md`
- Kinetic Typography → `styles/kinetic-typography.md`

### Common Modules (Always Read Based on User Choices)
- Colors → `common/colors.md` (color systems, palettes, dark mode)
- Animations → `common/animations.md` (motion principles, Tailwind animations)
- Spacing → `common/spacing.md` (density systems, responsive spacing)

Do NOT proceed to implementation without reading:
1. The chosen style guide
2. Relevant common modules based on user's detail choices

---

## Phase 3: Implementation

### Universal Principles

#### ❌ Never Do This (AI Slop Prevention)
- Default fonts like Inter, Roboto, Arial, system-ui
- Purple gradient + white background combos
- Applying rounded-xl to everything
- Meaningless shadow spam
- Repetitive identical card components
- Using only Tailwind defaults
- Generic hero sections with stock images
- Overusing blur effects
- Inconsistent spacing

#### ✅ Always Do This
- Make intentional design decisions with clear reasoning
- Choose distinctive fonts that match the style (use Google Fonts)
- Create intentional color palettes (manage with CSS variables)
- Establish clear typography hierarchy (3-4 levels max)
- Use meaningful spacing scale (4px base: 4, 8, 12, 16, 24, 32, 48, 64)
- Apply details and finishing touches that match the chosen style
- Ensure contrast ratios meet WCAG AA (4.5:1 for text)
- Test responsive behavior at key breakpoints

---

## Style Quick Reference

| Style | Key Characteristics | Example Fonts | Color Traits |
|-------|-------------------|---------------|--------------|
| Editorial | Large type, intentional whitespace, asymmetry | Playfair Display, Cormorant | Monotone, single accent |
| Brutalist | Raw, thick borders, rule-breaking | Monument Extended, Archivo Black | High contrast, primary colors |
| **Neobrutalism** | Thick borders, hard shadows, playful colors | Space Grotesk, Clash Display | Vivid pastels, cheerful |
| Glassmorphism | Blur, transparency, soft light | SF Pro, Plus Jakarta Sans | Pastel + white |
| **Liquid Glass** | Dynamic refraction, specular highlights, alive | SF Pro, Geist, Inter | Environment-adaptive tints |
| Swiss Minimal | Grid, typography-focused, refined | Helvetica Neue, Suisse Int'l | B&W + single accent |
| **Minimalism** | Extreme whitespace, near-monochrome, zen | Inter, Instrument Sans | Near-absence of color |
| Organic | Curves, blobs, natural flow | Fraunces, DM Serif | Earth tones, warm neutrals |
| **Neomorphism** | Soft 3D, inset shadows, tactile | Inter, Outfit | Muted, low contrast |
| **Claymorphism** | Puffy clay surfaces, inner highlights, pastel | Nunito, Quicksand, Fredoka | Warm pastels, candy tones |
| **Skeuomorphism** | Real-world textures, realistic depth, physical | Playfair Display, Lora | Leather/wood/metal warm tones |
| **Bento Grid** | Modular cards, varied sizes, Apple-like | SF Pro, Geist | Neutral + vibrant accents |
| **Dark Mode First** | Dark backgrounds, neon accents, glow | JetBrains Mono, Fira Code | Dark + neon |
| **Minimal Corporate** | Clean, trustworthy, professional | DM Sans, Satoshi | Blue/gray, conservative |
| **Retro Pixel** | CRT effects, terminal aesthetics, pixelated | Press Start 2P, VT323 | Green/amber on black |
| **Organic Shapes** | Blobs, curves, natural flow | Fraunces, Nunito | Earth tones, warm naturals |
| **Maximalist** | Bold type, intense colors, layered | Clash Display, Syne | Saturated, multi-color |
| **3D Immersive** | CSS 3D transforms, parallax, depth | Space Grotesk, Geist | Dark + gradient depth |
| **Aurora / Gradient Mesh** | Mesh gradients, color fields, ambient glow | Geist, Inter, Satoshi | Multi-stop gradients, iridescent |
| **Terminal / Hacker** | Monospace, information-dense, command palette | JetBrains Mono, Geist Mono | Dark + semantic (green/red/yellow) |
| **Kinetic Typography** | Scroll-driven text animation, split reveals | Instrument Serif, Clash Display | Mono/limited palette, type-focused |

---

## Example Scenarios

### Scenario 1: Fashion Brand Landing Page
```
Target: Women 20-30 interested in fashion
Mood: Editorial/Magazine
Colors: Monochrome
Gradients: None
Animation: Moderate
Border Radius: Sharp
Spacing: Spacious

→ Apply Editorial style
→ Large serif headlines, generous whitespace, monotone, image overlap
→ Smooth scroll animations, no gradients, sharp edges
```

### Scenario 2: SaaS Dashboard
```
Target: Business users 30-40
Mood: Minimal Corporate
Colors: Cool (blue-based)
Gradients: Subtle
Animation: Minimal
Border Radius: Slight
Spacing: Balanced

→ Apply Minimal Corporate style
→ Sans-serif, clear grid, functional design
→ Subtle hover states, light gradients for depth
```

### Scenario 3: Developer Tool
```
Target: Developers 25-40
Mood: Dark Mode First
Colors: Dark with neon accents
Gradients: Subtle
Animation: Moderate
Border Radius: Slight
Spacing: Compact

→ Apply Dark Mode First style
→ Monospace fonts, syntax highlighting colors
→ Glow effects on interactive elements
```

### Scenario 4: Portfolio Site
```
Target: Creative professionals
Mood: Bento Grid
Colors: Vibrant
Gradients: Mesh
Animation: Rich
Border Radius: Rounded
Spacing: Spacious

→ Apply Bento Grid style
→ Modular layout, varied card sizes
→ Complex animations, mesh gradient backgrounds
```

---

## Final Checklist

Before completing the design, verify:
- [ ] Does it reflect the key characteristics of the chosen style?
- [ ] Is it free from generic AI-generated aesthetics?
- [ ] Is the typography distinctive with clear hierarchy?
- [ ] Is the color palette intentional and consistent?
- [ ] Do animations match the specified level (none/minimal/moderate/rich)?
- [ ] Is the border radius consistent throughout?
- [ ] Does spacing match the specified density?
- [ ] Are gradients used (or not used) as specified?
- [ ] Does it support the specified theme mode (light/dark/both)?
- [ ] Is there something memorable that users will remember?

---

## Response Format

When presenting design choices to users, summarize the configuration:

```
## Design Configuration Summary

| Setting | Choice |
|---------|--------|
| Style | Swiss Minimal |
| Colors | Monochrome (Black + Blue accent) |
| Gradients | None |
| Animation | Minimal |
| Border Radius | Sharp (0px) |
| Spacing | Spacious |
| Theme | Light + Dark mode |

Proceeding with implementation...
```
