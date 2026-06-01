# Aurora / Gradient Mesh Style Guide

## Core Philosophy
- Color in motion — gradients are not decoration, they are the design
- Light as medium — every surface catches, bends, and emits light
- Depth without shadows — layered color creates spatial hierarchy
- Calm intensity — vivid but never aggressive
- The background IS the product

---

## Core Characteristics

| Aspect | Description |
|--------|-------------|
| Feel | Ethereal, premium, fluid, alive |
| Colors | Multi-stop gradients, mesh blends, iridescent shifts |
| Typography | Clean geometric sans, thin to medium weight |
| Spacing | Generous, cinematic sections |
| Borders | None or gradient-stroked, never solid gray |
| Shadows | Colored ambient glow, never gray box-shadow |
| Motion | Slow, fluid gradient animation, breathing effect |

---

## Aurora vs Related Styles

| | Aurora / Gradient Mesh | Glassmorphism | Dark Mode First |
|--|----------------------|---------------|-----------------|
| Primary Effect | Gradient color fields | Frosted transparency | Neon glow on dark |
| Background | IS the design | Supports glass overlay | Flat dark surface |
| Depth Method | Color layering | Blur + transparency | Shadow + glow |
| Color Usage | Multi-color, continuous | Subtle tints behind glass | Sparse neon accents |
| Motion | Slow gradient shift | Static or parallax | Pulse/glow animation |
| Reference | Linear, Stripe, Arc, Raycast | Apple macOS, Windows | Warp, VS Code, Vercel |

---

## AI Slop Prevention Warning

Aurora/Gradient is one of the most **butchered** styles by AI:
- DO NOT slap a purple-to-blue gradient on white and call it done
- DO NOT use CSS `linear-gradient` alone — mesh gradients need `radial-gradient` stacking
- DO NOT animate everything — only background or accent elements shift
- DO NOT make text unreadable by placing it directly on busy gradients
- DO NOT use rainbow — curate 3-4 colors max per gradient composition

**The gradient must feel intentional, not like a Figma default.**

---

## Color Palette

### Aurora Violet (Primary)
```css
:root {
  /* Base */
  --aurora-bg: #0a0a0f;
  --aurora-surface: #12121a;
  --aurora-surface-elevated: #1a1a2e;

  /* Text */
  --aurora-text: #f0f0f5;
  --aurora-text-secondary: #9898b0;
  --aurora-text-tertiary: #5a5a78;

  /* Border */
  --aurora-border: rgba(255, 255, 255, 0.06);
  --aurora-border-gradient: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.3));

  /* Gradient Stops */
  --aurora-violet: #8b5cf6;
  --aurora-blue: #3b82f6;
  --aurora-cyan: #06b6d4;
  --aurora-pink: #ec4899;
  --aurora-indigo: #6366f1;

  /* Glow */
  --aurora-glow-violet: rgba(139, 92, 246, 0.4);
  --aurora-glow-blue: rgba(59, 130, 246, 0.3);
}
```

### Aurora Sunset (Warm Alternative)
```css
:root {
  --aurora-bg: #0f0a0a;
  --aurora-surface: #1a1212;

  /* Gradient Stops */
  --aurora-orange: #f97316;
  --aurora-rose: #f43f5e;
  --aurora-amber: #f59e0b;
  --aurora-pink: #ec4899;
}
```

### Aurora Emerald (Cool Alternative)
```css
:root {
  --aurora-bg: #0a0f0a;
  --aurora-surface: #121a14;

  /* Gradient Stops */
  --aurora-emerald: #10b981;
  --aurora-teal: #14b8a6;
  --aurora-cyan: #06b6d4;
  --aurora-blue: #3b82f6;
}
```

### Light Mode Aurora
```css
.light {
  --aurora-bg: #fafafe;
  --aurora-surface: #ffffff;
  --aurora-surface-elevated: #f5f5ff;
  --aurora-text: #0f0f1a;
  --aurora-text-secondary: #5a5a78;
  --aurora-border: rgba(0, 0, 0, 0.06);
}
```

---

## Typography

### Recommended Fonts
```css
/* Primary — geometric, clean */
--font-heading: 'Geist', 'Inter', sans-serif;
--font-body: 'Inter', 'DM Sans', sans-serif;

/* Alternative — more character */
--font-heading: 'Satoshi', 'Plus Jakarta Sans', sans-serif;
--font-body: 'Plus Jakarta Sans', sans-serif;

/* Monospace accent */
--font-mono: 'Geist Mono', 'JetBrains Mono', monospace;
```

### Type Scale
```css
--text-hero: clamp(3rem, 8vw, 5.5rem);
--text-display: clamp(2.25rem, 5vw, 3.5rem);
--text-title: clamp(1.5rem, 3vw, 2.25rem);
--text-subtitle: 1.25rem;
--text-body: 1rem;
--text-small: 0.875rem;
--text-micro: 0.75rem;

/* Letter spacing */
--tracking-hero: -0.04em;
--tracking-display: -0.03em;
--tracking-title: -0.02em;
--tracking-body: -0.01em;
--tracking-label: 0.05em;

/* Line height */
--leading-hero: 1.05;
--leading-display: 1.15;
--leading-body: 1.6;
```

### Advanced Typography
```css
h1, h2, h3 {
  font-feature-settings: "ss01", "cv01";
  font-optical-sizing: auto;
}

/* Hero text with gradient fill */
.text-gradient {
  background: linear-gradient(135deg, var(--aurora-violet), var(--aurora-blue), var(--aurora-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## Gradient Systems

### Mesh Gradient Background (Core Technique)
```css
/* Full-page aurora background */
.aurora-bg {
  background-color: var(--aurora-bg);
  background-image:
    radial-gradient(ellipse 80% 50% at 20% 40%, rgba(139, 92, 246, 0.15) 0%, transparent 70%),
    radial-gradient(ellipse 60% 80% at 80% 20%, rgba(59, 130, 246, 0.12) 0%, transparent 70%),
    radial-gradient(ellipse 70% 60% at 60% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 70%),
    radial-gradient(ellipse 50% 40% at 10% 90%, rgba(6, 182, 212, 0.08) 0%, transparent 70%);
}

/* Animated aurora */
.aurora-bg-animated {
  background-color: var(--aurora-bg);
  position: relative;
  overflow: hidden;
}

.aurora-bg-animated::before {
  content: '';
  position: absolute;
  inset: -50%;
  background:
    radial-gradient(ellipse at 30% 20%, rgba(139, 92, 246, 0.2) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(236, 72, 153, 0.12) 0%, transparent 50%);
  animation: aurora-drift 15s ease-in-out infinite alternate;
  filter: blur(60px);
  z-index: 0;
}

@keyframes aurora-drift {
  0% { transform: translate(0, 0) rotate(0deg) scale(1); }
  33% { transform: translate(5%, -3%) rotate(2deg) scale(1.05); }
  66% { transform: translate(-3%, 5%) rotate(-1deg) scale(0.98); }
  100% { transform: translate(2%, 2%) rotate(1deg) scale(1.02); }
}
```

### Card Gradient Border
```css
.card-gradient {
  position: relative;
  background: var(--aurora-surface);
  border-radius: 16px;
  padding: 1px;
}

.card-gradient::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  padding: 1px;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.4),
    rgba(59, 130, 246, 0.2),
    rgba(6, 182, 212, 0.3)
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
}

.card-gradient-inner {
  background: var(--aurora-surface);
  border-radius: 15px;
  padding: 24px;
}
```

### Gradient Orbs (Floating Accents)
```css
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  pointer-events: none;
}

.orb-violet {
  width: 400px;
  height: 400px;
  background: var(--aurora-violet);
}

.orb-blue {
  width: 300px;
  height: 300px;
  background: var(--aurora-blue);
}

.orb-pink {
  width: 350px;
  height: 350px;
  background: var(--aurora-pink);
}
```

### Noise Texture Overlay
```css
/* Adds film grain to prevent banding on smooth gradients */
.aurora-noise::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 1;
}
```

---

## Components

### Button
```css
/* Primary — gradient fill */
.btn-aurora {
  background: linear-gradient(135deg, var(--aurora-violet), var(--aurora-blue));
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 28px;
  font-weight: 500;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 300ms ease;
  box-shadow: 0 4px 20px var(--aurora-glow-violet);
}

.btn-aurora:hover {
  box-shadow: 0 8px 32px var(--aurora-glow-violet);
  transform: translateY(-2px);
}

/* Secondary — ghost with gradient border */
.btn-ghost {
  position: relative;
  background: transparent;
  color: var(--aurora-text);
  border: none;
  border-radius: 12px;
  padding: 12px 28px;
  cursor: pointer;
}

.btn-ghost::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  padding: 1px;
  background: linear-gradient(135deg, var(--aurora-violet), var(--aurora-blue));
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
}

/* Subtle — soft glow on hover */
.btn-subtle {
  background: rgba(139, 92, 246, 0.08);
  color: var(--aurora-violet);
  border: none;
  border-radius: 12px;
  padding: 12px 28px;
  transition: all 200ms ease;
}

.btn-subtle:hover {
  background: rgba(139, 92, 246, 0.15);
}
```

### Card
```css
.card {
  background: var(--aurora-surface);
  border: 1px solid var(--aurora-border);
  border-radius: 16px;
  padding: 24px;
  transition: all 300ms ease;
}

.card:hover {
  border-color: rgba(139, 92, 246, 0.2);
  box-shadow: 0 8px 40px rgba(139, 92, 246, 0.1);
}

/* Featured card with ambient glow */
.card-featured {
  background: var(--aurora-surface-elevated);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 20px;
  padding: 32px;
  box-shadow:
    0 0 60px rgba(139, 92, 246, 0.08),
    0 0 120px rgba(59, 130, 246, 0.05);
}
```

### Input
```css
.input {
  background: var(--aurora-surface);
  border: 1px solid var(--aurora-border);
  border-radius: 12px;
  padding: 12px 16px;
  color: var(--aurora-text);
  font-size: 1rem;
  transition: all 200ms ease;
}

.input:focus {
  outline: none;
  border-color: var(--aurora-violet);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
}

.input::placeholder {
  color: var(--aurora-text-tertiary);
}
```

### Badge
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.badge-gradient {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15));
  color: var(--aurora-violet);
  border: 1px solid rgba(139, 92, 246, 0.2);
}
```

### Navigation
```css
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  padding: 16px 24px;
  background: rgba(10, 10, 15, 0.6);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--aurora-border);
}

.nav-link {
  color: var(--aurora-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 200ms;
}

.nav-link:hover {
  color: var(--aurora-text);
}

.nav-link.active {
  color: var(--aurora-violet);
}
```

---

## Layout

### Hero Section Pattern
```css
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 24px;
  overflow: hidden;
}

/* Gradient positioned behind content */
.hero .aurora-bg-animated::before {
  z-index: 0;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
}

.hero h1 {
  font-size: var(--text-hero);
  letter-spacing: var(--tracking-hero);
  line-height: var(--leading-hero);
  font-weight: 600;
}

.hero p {
  font-size: 1.25rem;
  color: var(--aurora-text-secondary);
  margin-top: 24px;
  line-height: 1.6;
}
```

### Section Spacing
```css
section {
  padding: 120px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  section {
    padding: 80px 16px;
  }
}
```

---

## Responsive Behavior

```css
/* Breakpoints */
--bp-mobile: 640px;
--bp-tablet: 768px;
--bp-desktop: 1024px;
--bp-wide: 1440px;

/* Mobile: reduce gradient complexity for performance */
@media (max-width: 768px) {
  .aurora-bg {
    background-image:
      radial-gradient(ellipse 80% 50% at 50% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 70%),
      radial-gradient(ellipse 70% 60% at 50% 70%, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
  }

  .aurora-bg-animated::before {
    animation: none;  /* Save battery on mobile */
    filter: blur(40px);
  }

  .orb {
    filter: blur(60px);
    opacity: 0.3;
  }
}

/* Reduced motion — mandatory */
@media (prefers-reduced-motion: reduce) {
  .aurora-bg-animated::before {
    animation: none;
    filter: blur(40px);
  }

  .orb {
    animation: none;
  }
}
```

---

## Absolute Avoid List

- **Linear gradient only** — real aurora needs `radial-gradient` stacking, not `linear-gradient(to right, purple, blue)`
- **Rainbow soup** — curate colors. 3-4 stops max. Every color must belong.
- **Text on raw gradient** — always ensure text sits on a semi-opaque surface or has sufficient contrast
- **Gray shadows** — use colored ambient glow (`rgba` of your accent), never `rgba(0,0,0,0.1)`
- **Solid borders** — use gradient borders or `rgba` white/accent borders
- **Static only** — at least the background should subtly breathe. Static gradient = dead gradient
- **Gradient banding** — always add noise texture overlay on large gradient areas
- **Same gradient everywhere** — vary the composition per section. Hero ≠ Features ≠ Footer

---

## Inspiration Keywords

Linear App, Stripe Homepage, Arc Browser, Raycast, Vercel 2024, Liveblocks, Railway, Resend

---

## Final Check

> "If the gradient looks like a PowerPoint slide, start over."
> "If you can describe the background as 'purple to blue', it's not an aurora."
> "The best aurora gradients make you forget you're looking at a gradient."
