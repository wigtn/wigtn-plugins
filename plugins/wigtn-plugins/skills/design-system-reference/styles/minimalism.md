# Minimalism Style Guide

## Core Philosophy
- Reduce to the essential. Then reduce again.
- Every pixel must earn its place
- Whitespace is not empty — it is the design
- Content is the interface
- Quiet confidence over loud decoration

---

## Core Characteristics

| Aspect | Description |
|--------|-------------|
| Feel | Calm, focused, intentional, refined |
| Colors | Near-monochrome, 1 accent max, muted tones |
| Typography | Clean, precise, generous line-height |
| Spacing | Extreme whitespace, breathing room |
| Borders | Hairline or none, subtle dividers |
| Shadows | None or barely perceptible |
| Decoration | Zero. Content IS the design. |

---

## Minimalism vs Swiss Minimal vs Minimal Corporate

| | Minimalism | Swiss Minimal | Minimal Corporate |
|--|-----------|---------------|-------------------|
| Grid | Fluid, breathing | Strict mathematical | Balanced, comfortable |
| Emotion | Zen-like calm | Intellectual precision | Professional trust |
| Color | Near-absence of color | Systematic, rational | Blue + neutrals |
| Purpose | Art, portfolio, luxury | Information design | B2B, SaaS |
| Reference | Muji, Aesop, Apple | Helvetica, Brockmann | Stripe, Linear |

---

## Color Palette

### Near-Monochrome (Primary Approach)
```css
:root {
  --min-bg: #FAFAFA;
  --min-surface: #FFFFFF;
  --min-text: #1A1A1A;
  --min-text-secondary: #666666;
  --min-text-tertiary: #999999;
  --min-border: #E5E5E5;
  --min-border-subtle: #F0F0F0;
  --min-accent: #1A1A1A;        /* Accent = same as text (monochrome) */
  --min-accent-hover: #333333;
}
```

### Warm Minimal
```css
:root {
  --min-bg: #FAF9F7;
  --min-surface: #FFFFFF;
  --min-text: #1C1917;
  --min-text-secondary: #78716C;
  --min-text-tertiary: #A8A29E;
  --min-border: #E7E5E4;
  --min-border-subtle: #F5F5F4;
  --min-accent: #1C1917;
}
```

### Cool Minimal
```css
:root {
  --min-bg: #F8FAFC;
  --min-surface: #FFFFFF;
  --min-text: #0F172A;
  --min-text-secondary: #64748B;
  --min-text-tertiary: #94A3B8;
  --min-border: #E2E8F0;
  --min-border-subtle: #F1F5F9;
  --min-accent: #0F172A;
}
```

### Single Accent Variant
```css
/* When ONE color accent is needed */
--min-accent: #E63946;       /* Quiet red */
--min-accent: #2563EB;       /* Quiet blue */
--min-accent: #059669;       /* Quiet green */
--min-accent: #D97706;       /* Quiet amber */

/* Rule: accent appears on max 2-3 elements per viewport */
```

### Dark Minimal
```css
.dark {
  --min-bg: #0A0A0A;
  --min-surface: #141414;
  --min-text: #EDEDED;
  --min-text-secondary: #A1A1A1;
  --min-text-tertiary: #6B6B6B;
  --min-border: #262626;
  --min-border-subtle: #1A1A1A;
  --min-accent: #EDEDED;
}
```

---

## Typography

### Principles
- One font family. Maximum two.
- Weight contrast does the heavy lifting (not size)
- Line height is generous (1.6-1.8 for body)
- Letter spacing is intentional (tight for headings, normal for body)
- Text alone creates the visual hierarchy

### Recommended Fonts
```css
/* Geometric — pure, clean */
--font-primary: 'Inter', sans-serif;
--font-primary: 'Helvetica Neue', Helvetica, sans-serif;

/* Humanist — warm, approachable */
--font-primary: 'Instrument Sans', sans-serif;
--font-primary: 'Geist', sans-serif;

/* Serif — editorial luxury */
--font-primary: 'Instrument Serif', serif;
--font-primary: 'Cormorant Garamond', serif;

/* System (performance-first) */
--font-primary: system-ui, -apple-system, sans-serif;
```

### Type Scale (Restrained)
```css
/* Fewer sizes = stronger hierarchy */
--text-display: clamp(2.5rem, 5vw, 4rem);
--text-heading: clamp(1.5rem, 2.5vw, 2rem);
--text-subheading: 1.125rem;
--text-body: 1rem;
--text-small: 0.875rem;
--text-micro: 0.75rem;

/* Weight scale */
--weight-light: 300;
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;

/* Line heights */
--leading-tight: 1.2;
--leading-normal: 1.5;
--leading-relaxed: 1.7;
--leading-loose: 1.9;

/* Letter spacing */
--tracking-tight: -0.025em;
--tracking-normal: 0;
--tracking-wide: 0.05em;
--tracking-micro: 0.1em;
```

### Text Styles
```css
.min-display {
  font-size: var(--text-display);
  font-weight: var(--weight-light);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--min-text);
}

.min-heading {
  font-size: var(--text-heading);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--min-text);
}

.min-body {
  font-size: var(--text-body);
  font-weight: var(--weight-regular);
  line-height: var(--leading-relaxed);
  color: var(--min-text-secondary);
}

/* Micro label (uppercase, tracked) */
.min-label {
  font-size: var(--text-micro);
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-micro);
  text-transform: uppercase;
  color: var(--min-text-tertiary);
}
```

---

## Whitespace System

### Principles
- Whitespace is the primary design tool
- More whitespace = more perceived luxury
- Consistent spacing scale (multiples of 4 or 8)
- Sections breathe with generous padding

```css
/* Spacing scale */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
--space-16: 64px;
--space-24: 96px;
--space-32: 128px;
--space-48: 192px;

/* Section spacing */
.min-section {
  padding: var(--space-32) var(--space-8);
}

/* Component spacing */
.min-stack > * + * {
  margin-top: var(--space-6);
}

.min-stack-tight > * + * {
  margin-top: var(--space-3);
}

.min-stack-loose > * + * {
  margin-top: var(--space-12);
}
```

---

## Dividers & Borders

### Principles
- Hairline (1px) or nothing
- Use spacing instead of borders when possible
- Borders are structural indicators, not decoration

```css
/* Hairline divider */
.min-divider {
  border: none;
  border-top: 1px solid var(--min-border);
  margin: var(--space-12) 0;
}

/* Subtle divider (barely visible) */
.min-divider-subtle {
  border-top: 1px solid var(--min-border-subtle);
}

/* No visible border, just spacing */
.min-gap {
  margin: var(--space-16) 0;
}
```

---

## UI Components

### Button
```css
/* Primary — solid, minimal */
.min-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: var(--text-small);
  font-weight: var(--weight-medium);
  color: var(--min-bg);
  background: var(--min-text);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.min-button:hover {
  opacity: 0.85;
}

/* Secondary — outlined */
.min-button-secondary {
  color: var(--min-text);
  background: transparent;
  border: 1px solid var(--min-border);
}

.min-button-secondary:hover {
  background: var(--min-bg);
  border-color: var(--min-text-tertiary);
}

/* Ghost — text only */
.min-button-ghost {
  color: var(--min-text-secondary);
  background: transparent;
  border: none;
  padding: 10px 12px;
}

.min-button-ghost:hover {
  color: var(--min-text);
}

/* Link style button */
.min-button-link {
  color: var(--min-text);
  background: none;
  border: none;
  padding: 0;
  font-weight: var(--weight-medium);
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-thickness: 1px;
  cursor: pointer;
}

.min-button-link:hover {
  text-decoration-thickness: 2px;
}
```

### Card
```css
.min-card {
  background: var(--min-surface);
  border: 1px solid var(--min-border);
  border-radius: 8px;
  padding: var(--space-8);
}

/* Borderless card (whitespace defines boundary) */
.min-card-borderless {
  background: transparent;
  padding: var(--space-8);
}

/* Card with subtle hover */
.min-card-interactive {
  transition: border-color 0.15s ease;
  cursor: pointer;
}

.min-card-interactive:hover {
  border-color: var(--min-text-tertiary);
}
```

### Input
```css
.min-input {
  width: 100%;
  padding: 10px 0;
  font-size: var(--text-body);
  color: var(--min-text);
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--min-border);
  transition: border-color 0.15s ease;
}

.min-input:focus {
  outline: none;
  border-color: var(--min-text);
}

.min-input::placeholder {
  color: var(--min-text-tertiary);
}

/* Boxed variant */
.min-input-boxed {
  padding: 12px 16px;
  border: 1px solid var(--min-border);
  border-radius: 6px;
  background: var(--min-surface);
}

.min-input-boxed:focus {
  border-color: var(--min-text);
  box-shadow: 0 0 0 1px var(--min-text);
}
```

### Navigation
```css
.min-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6) 0;
  border-bottom: 1px solid var(--min-border);
}

.min-nav-links {
  display: flex;
  gap: var(--space-8);
}

.min-nav-link {
  font-size: var(--text-small);
  color: var(--min-text-secondary);
  text-decoration: none;
  transition: color 0.15s ease;
}

.min-nav-link:hover,
.min-nav-link.active {
  color: var(--min-text);
}
```

### Table
```css
.min-table {
  width: 100%;
  border-collapse: collapse;
}

.min-table th {
  text-align: left;
  font-size: var(--text-micro);
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-micro);
  text-transform: uppercase;
  color: var(--min-text-tertiary);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--min-border);
}

.min-table td {
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--min-border-subtle);
  color: var(--min-text);
}
```

---

## Layout

### Principles
- Single column for reading (max-width: 680px)
- Generous container padding
- Content-first: layout serves the content, never the other way
- Asymmetry is OK if it serves a purpose

```css
/* Reading container */
.min-prose {
  max-width: 680px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

/* Wide container */
.min-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-8);
}

/* Full bleed section */
.min-full {
  width: 100%;
  padding: var(--space-32) var(--space-8);
}

/* Two column (content + sidebar) */
.min-layout-sidebar {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--space-16);
  align-items: start;
}

/* Grid — generous gap */
.min-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--space-8);
}

/* Hero — extreme whitespace */
.min-hero {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--space-32) var(--space-8);
}
```

---

## Interaction & Motion

### Principles
- Motion is subtle and purposeful
- Transitions are fast (0.15-0.2s)
- No bouncing, no springing, no playfulness
- Opacity changes over color changes
- Fade, don't slide

```css
/* Standard transition */
.min-transition {
  transition: all 0.15s ease;
}

/* Fade in on scroll */
.min-fade-in {
  opacity: 0;
  transform: translateY(8px);
  animation: minFadeIn 0.6s ease forwards;
}

@keyframes minFadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Stagger (subtle) */
.min-stagger > * {
  opacity: 0;
  animation: minFadeIn 0.5s ease forwards;
}

.min-stagger > *:nth-child(1) { animation-delay: 0ms; }
.min-stagger > *:nth-child(2) { animation-delay: 100ms; }
.min-stagger > *:nth-child(3) { animation-delay: 200ms; }
.min-stagger > *:nth-child(4) { animation-delay: 300ms; }

/* Hover: opacity only */
.min-hover-fade {
  transition: opacity 0.15s ease;
}

.min-hover-fade:hover {
  opacity: 0.7;
}

/* Cursor line (text cursor) */
@keyframes minBlink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

---

## Images & Media

### Principles
- Images speak for themselves — no overlays, no filters
- Full-bleed or contained with generous margins
- Aspect ratios are intentional
- Captions in micro/label style

```css
/* Full bleed image */
.min-image-full {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
}

/* Contained image */
.min-image {
  width: 100%;
  border-radius: 4px;
}

/* Image with caption */
.min-figure {
  margin: var(--space-12) 0;
}

.min-figure figcaption {
  font-size: var(--text-micro);
  color: var(--min-text-tertiary);
  margin-top: var(--space-3);
  letter-spacing: var(--tracking-wide);
}
```

---

## Absolute Avoid List

- Gradients (anywhere)
- Box shadows (use borders or nothing)
- Rounded corners above 8px
- More than 1 accent color
- Bold/saturated colors
- Decorative elements (icons, patterns, illustrations for decoration)
- Animation that draws attention to itself
- Dense information layouts
- Multiple font families (1 is ideal, 2 max)

---

## Inspiration Keywords

- Muji product design
- Aesop packaging
- Dieter Rams "less but better"
- Japanese wabi-sabi
- Apple.com product pages
- Kinfolk magazine
- Architectural white spaces
- Scandinavian design

---

## Final Check

> If you can remove something and the design still works — remove it.
> If the whitespace doesn't feel "too much" — add more.
> A minimalist design should feel like a deep breath.
