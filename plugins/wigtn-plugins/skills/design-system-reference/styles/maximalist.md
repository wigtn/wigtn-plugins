# Maximalist Style

## Core Philosophy
- More is more, and then some more
- Every surface is an opportunity for expression
- Restraint is the enemy of impact
- Layering creates depth, depth creates drama
- Clash boldly and intentionally — harmony through excess
- Design should overwhelm, captivate, and refuse to be ignored

---

## Typography

Typography is your **orchestra** — play every instrument at once.

### Principles
- Mix multiple font families within a single composition
- Oversized, screen-dominating headlines are the default
- Layer text over text, type over image, headline over headline
- Combine serif, sans-serif, and display faces freely
- Use extreme weight ranges from Thin to Black in one layout
- Decorative ligatures, stylistic alternates, and variable axes are encouraged
- Text is decoration; decoration is text

### Recommended Fonts
```css
/* Display / Headlines */
--font-display: 'Clash Display', sans-serif;
--font-display-alt: 'Syne', sans-serif;

/* Serif Contrast */
--font-serif: 'Playfair Display', serif;
--font-serif-alt: 'Libre Baskerville', serif;

/* Sans-Serif Body & Accents */
--font-sans: 'Space Grotesk', sans-serif;
--font-sans-alt: 'DM Sans', sans-serif;

/* Decorative / Statement */
--font-statement: 'Unbounded', cursive;
--font-statement-alt: 'Anybody', sans-serif;

/* Monospace Accents */
--font-mono: 'JetBrains Mono', monospace;
```

### Type Scale
```css
--text-mega: clamp(5rem, 18vw, 14rem);    /* Full-bleed statement */
--text-hero: clamp(3.5rem, 12vw, 9rem);   /* Primary headline */
--text-display: clamp(2.5rem, 8vw, 6rem); /* Secondary headline */
--text-title: clamp(1.75rem, 5vw, 3.5rem);
--text-subtitle: clamp(1.25rem, 3vw, 2rem);
--text-body: 1.125rem;
--text-small: 0.875rem;
--text-micro: 0.75rem;

/* Letter spacing extremes */
--tracking-ultra-tight: -0.06em;  /* Mega headlines */
--tracking-tight: -0.03em;       /* Display text */
--tracking-normal: 0;
--tracking-wide: 0.12em;         /* Labels, tags */
--tracking-ultra-wide: 0.3em;    /* All-caps accents */

/* Line height contrasts */
--leading-crushed: 0.85;   /* Stacked mega type */
--leading-tight: 1.0;      /* Headlines */
--leading-body: 1.6;       /* Body text */
--leading-loose: 2.0;      /* Airy callouts */
```

---

## Layout

### Principles
- Density is a feature, not a flaw
- Every pixel should earn its place through content or decoration
- Overlap elements aggressively to create depth
- Grid structures should be complex: asymmetric, nested, and multi-layered
- Allow content to break out of containers and bleed into adjacent sections
- Vertical rhythm is secondary to visual impact
- Fill the viewport — emptiness is waste

### CSS Examples
```css
/* Dense asymmetric grid */
.max-layout {
  display: grid;
  grid-template-columns: 1fr 2fr 1.5fr 1fr;
  grid-template-rows: auto;
  gap: 2px;
}

/* Nested sub-grid for complexity */
.max-layout-nested {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(4, minmax(200px, auto));
  gap: 4px;
}

/* Overlapping layers */
.max-overlap {
  position: relative;
  z-index: 2;
  margin-top: -15vh;
  margin-left: 5vw;
}

.max-overlap-deep {
  position: relative;
  z-index: 3;
  margin-top: -25vh;
  margin-right: -10vw;
}

/* Full bleed section */
.max-full-bleed {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  padding: 8vh 4vw;
  overflow: hidden;
}

/* Dense content strip */
.max-strip {
  display: flex;
  gap: 0;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

.max-strip > * {
  flex: 0 0 33vw;
  scroll-snap-align: start;
}

/* Stacked z-index composition */
.max-stack {
  display: grid;
  grid-template-areas: "stack";
}

.max-stack > * {
  grid-area: stack;
}

/* Collage positioning */
.max-collage {
  position: relative;
  min-height: 100vh;
}

.max-collage-item {
  position: absolute;
}

.max-collage-item:nth-child(1) { top: 5%; left: 3%; width: 45%; transform: rotate(-3deg); }
.max-collage-item:nth-child(2) { top: 15%; right: 5%; width: 40%; transform: rotate(2deg); }
.max-collage-item:nth-child(3) { bottom: 10%; left: 20%; width: 50%; transform: rotate(-1deg); }
```

---

## Color

### Principles
- Use 4-5 or more colors simultaneously and unapologetically
- Saturated, vivid, and intense palettes are the baseline
- Clashing color combinations are intentional design decisions
- Gradients use 3+ color stops with dramatic transitions
- Background colors are never neutral — every surface is expressive
- Color blocking with hard transitions creates visual energy
- Dark and light modes should both feel intense, not muted

### Recommended Palettes
```css
/* Palette 1: Electric Carnival */
--color-bg: #0D0221;
--color-surface: #1A0533;
--color-text: #FFFFFF;
--color-primary: #FF2D6B;
--color-secondary: #6C3CE1;
--color-tertiary: #00E5A0;
--color-accent: #FFD700;
--color-accent-alt: #FF6B35;

/* Palette 2: Tropical Maximalism */
--color-bg: #FFFBF0;
--color-surface: #FFF5E1;
--color-text: #1A0A2E;
--color-primary: #FF3366;
--color-secondary: #7B2FBE;
--color-tertiary: #00B4D8;
--color-accent: #FFB400;
--color-accent-alt: #2DC653;

/* Palette 3: Neon Nightlife */
--color-bg: #0A0A0A;
--color-surface: #141414;
--color-text: #F0F0F0;
--color-primary: #FF00FF;
--color-secondary: #00FFFF;
--color-tertiary: #FFFF00;
--color-accent: #FF4444;
--color-accent-alt: #44FF44;

/* Palette 4: Jewel Tones */
--color-bg: #1C1029;
--color-surface: #2A1541;
--color-text: #F8F0FF;
--color-primary: #E63946;
--color-secondary: #457B9D;
--color-tertiary: #2A9D8F;
--color-accent: #E9C46A;
--color-accent-alt: #F4A261;

/* Palette 5: Pop Art Blast */
--color-bg: #FFFFFF;
--color-surface: #F5F5F5;
--color-text: #000000;
--color-primary: #FF0054;
--color-secondary: #3A86FF;
--color-tertiary: #FFBE0B;
--color-accent: #8338EC;
--color-accent-alt: #FB5607;

/* Multi-stop gradients */
--gradient-mega: linear-gradient(135deg, #FF2D6B, #6C3CE1, #00E5A0, #FFD700);
--gradient-sunset: linear-gradient(to right, #FF3366, #FF6B35, #FFD700, #2DC653);
--gradient-cosmic: radial-gradient(ellipse at 30% 50%, #FF00FF, #6C3CE1, #00FFFF, #0A0A0A);
```

---

## Borders & Shapes

### Principles
- Mix border styles within one composition: thick, thin, dashed, double
- Shapes should be varied: sharp rectangles next to full circles next to irregular blobs
- Decorative borders and frames are welcome
- Outlines, strokes, and shadows can all coexist
- Asymmetric border-radius creates organic, playful forms
- Everything gets a border, an outline, or a shadow — preferably all three

### CSS Examples
```css
/* Thick decorative border */
.max-box {
  border: 5px solid var(--color-primary);
  outline: 3px solid var(--color-secondary);
  outline-offset: 6px;
  background: var(--color-surface);
}

/* Double border with color */
.max-box-double {
  border: 6px double var(--color-accent);
  padding: 2rem;
  position: relative;
}

.max-box-double::before {
  content: '';
  position: absolute;
  inset: 8px;
  border: 2px dashed var(--color-tertiary);
  pointer-events: none;
}

/* Mixed radius blob */
.max-blob {
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  overflow: hidden;
}

/* Organic shape */
.max-organic {
  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  background: var(--gradient-mega);
}

/* Layered shadows — colored and stacked */
.max-shadow {
  box-shadow:
    4px 4px 0 var(--color-primary),
    8px 8px 0 var(--color-secondary),
    12px 12px 0 var(--color-tertiary);
}

/* Glow shadow */
.max-glow {
  box-shadow:
    0 0 20px var(--color-primary),
    0 0 60px var(--color-secondary),
    0 0 100px var(--color-tertiary);
}

/* Circle + square combo */
.max-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 6px solid var(--color-accent);
  background: var(--color-primary);
}

.max-square {
  width: 200px;
  height: 200px;
  border-radius: 0;
  border: 6px solid var(--color-secondary);
  background: var(--color-tertiary);
  transform: rotate(12deg);
}
```

---

## UI Components

### Principles
- Buttons should be loud, large, and impossible to miss
- Inputs are styled surfaces, not invisible fields
- Links announce themselves with color, weight, or decoration
- Cards are layered compositions, not flat containers
- Every component is an opportunity for visual expression
- Hover states should transform dramatically, not subtly

### CSS Examples
```css
/* Statement button */
.max-button {
  background: var(--gradient-mega);
  color: #FFFFFF;
  border: 3px solid var(--color-text);
  padding: 1.25rem 3rem;
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow:
    4px 4px 0 var(--color-primary),
    8px 8px 0 var(--color-secondary);
}

.max-button:hover {
  transform: translate(-4px, -4px) scale(1.02);
  box-shadow:
    8px 8px 0 var(--color-primary),
    12px 12px 0 var(--color-secondary),
    16px 16px 0 var(--color-tertiary);
}

.max-button:active {
  transform: translate(2px, 2px);
  box-shadow:
    2px 2px 0 var(--color-primary);
}

/* Shimmer on hover */
.max-button::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 70%
  );
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.max-button:hover::after {
  transform: translateX(100%);
}

/* Ghost button variant */
.max-button-ghost {
  background: transparent;
  color: var(--color-primary);
  border: 3px solid var(--color-primary);
  padding: 1rem 2.5rem;
  font-family: var(--font-display);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.max-button-ghost:hover {
  background: var(--color-primary);
  color: #FFFFFF;
  border-color: var(--color-secondary);
  box-shadow: 0 0 30px var(--color-primary);
}

/* Decorated input */
.max-input {
  border: 3px solid var(--color-secondary);
  border-left: 8px solid var(--color-primary);
  padding: 1.25rem 1.5rem;
  font-family: var(--font-sans);
  font-size: 1rem;
  background: var(--color-surface);
  width: 100%;
  transition: all 0.3s ease;
}

.max-input:focus {
  outline: none;
  border-color: var(--color-accent);
  background: var(--color-bg);
  box-shadow:
    0 0 0 4px var(--color-primary),
    0 0 30px rgba(108, 60, 225, 0.3);
}

.max-input::placeholder {
  color: var(--color-secondary);
  font-style: italic;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Expressive link */
.max-link {
  color: var(--color-primary);
  font-weight: 700;
  text-decoration: none;
  position: relative;
  display: inline-block;
  transition: color 0.2s ease;
}

.max-link::before {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 4px;
  background: var(--gradient-mega);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.4s ease;
}

.max-link:hover {
  color: var(--color-secondary);
}

.max-link:hover::before {
  transform: scaleX(1);
  transform-origin: left;
}

/* Layered card */
.max-card {
  background: var(--color-surface);
  border: 3px solid var(--color-text);
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.max-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 6px;
  background: var(--gradient-mega);
}

.max-card::after {
  content: '';
  position: absolute;
  bottom: -30%;
  right: -20%;
  width: 60%;
  height: 60%;
  background: var(--color-primary);
  opacity: 0.08;
  border-radius: 50%;
  filter: blur(40px);
}

/* Decorative tag / badge */
.max-tag {
  display: inline-block;
  background: var(--color-primary);
  color: #FFFFFF;
  padding: 0.35rem 1rem;
  font-family: var(--font-mono);
  font-size: var(--text-micro);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  transform: rotate(-2deg);
  border: 2px solid var(--color-text);
}

/* Ticker / Marquee */
.max-marquee {
  overflow: hidden;
  white-space: nowrap;
  background: var(--color-primary);
  color: #FFFFFF;
  padding: 0.75rem 0;
  border-top: 3px solid var(--color-text);
  border-bottom: 3px solid var(--color-text);
}

.max-marquee-content {
  display: inline-block;
  animation: max-scroll 15s linear infinite;
  font-family: var(--font-display);
  font-size: var(--text-title);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

@keyframes max-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
```

---

## Interaction & Motion

### Principles
- Motion should be bold, expressive, and theatrical
- Combine multiple animation properties simultaneously
- Stagger reveals for dramatic entrance sequences
- Hover effects should transform, not just tweak
- Scroll-triggered animations at every section
- Use elastic, spring, and overshoot easing curves
- Parallax, rotation, and scale shifts are all encouraged

### CSS Examples
```css
/* Dramatic entrance */
@keyframes max-entrance {
  0% {
    opacity: 0;
    transform: translateY(80px) scale(0.9) rotate(-3deg);
    filter: blur(10px);
  }
  60% {
    opacity: 1;
    transform: translateY(-10px) scale(1.02) rotate(0.5deg);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1) rotate(0);
    filter: blur(0);
  }
}

.max-entrance {
  animation: max-entrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

/* Staggered cascade */
.max-stagger > * {
  opacity: 0;
  animation: max-entrance 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.max-stagger > *:nth-child(1) { animation-delay: 0s; }
.max-stagger > *:nth-child(2) { animation-delay: 0.1s; }
.max-stagger > *:nth-child(3) { animation-delay: 0.2s; }
.max-stagger > *:nth-child(4) { animation-delay: 0.3s; }
.max-stagger > *:nth-child(5) { animation-delay: 0.4s; }
.max-stagger > *:nth-child(6) { animation-delay: 0.5s; }

/* Bold hover transform */
.max-hover-transform {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.max-hover-transform:hover {
  transform: scale(1.08) rotate(-2deg);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

/* Color-shifting background */
@keyframes max-color-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.max-color-shift {
  background: var(--gradient-mega);
  background-size: 300% 300%;
  animation: max-color-shift 6s ease infinite;
}

/* Pulsing glow */
@keyframes max-pulse {
  0%, 100% { box-shadow: 0 0 20px var(--color-primary); }
  50% { box-shadow: 0 0 60px var(--color-primary), 0 0 100px var(--color-secondary); }
}

.max-pulse {
  animation: max-pulse 2s ease-in-out infinite;
}

/* Rotating decoration */
@keyframes max-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.max-spin-slow {
  animation: max-spin 20s linear infinite;
}

/* Parallax scroll hint */
.max-parallax-layer {
  will-change: transform;
  transition: transform 0.1s linear;
}

/* Elastic bounce on click */
@keyframes max-bounce {
  0% { transform: scale(1); }
  30% { transform: scale(0.92); }
  50% { transform: scale(1.08); }
  70% { transform: scale(0.97); }
  100% { transform: scale(1); }
}

.max-bounce:active {
  animation: max-bounce 0.5s ease;
}
```

---

## Textures & Effects

```css
/* Multi-layer gradient overlay */
.max-gradient-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgba(255, 45, 107, 0.15), transparent 50%),
    linear-gradient(225deg, rgba(108, 60, 225, 0.15), transparent 50%),
    linear-gradient(315deg, rgba(0, 229, 160, 0.1), transparent 50%);
  pointer-events: none;
  z-index: 1;
}

/* Noise texture overlay */
.max-noise::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.04;
  pointer-events: none;
  z-index: 2;
}

/* Diagonal stripe pattern */
.max-stripes::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(255, 255, 255, 0.03) 10px,
    rgba(255, 255, 255, 0.03) 20px
  );
  pointer-events: none;
}

/* Dot grid pattern */
.max-dots::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(
    circle,
    var(--color-primary) 1px,
    transparent 1px
  );
  background-size: 24px 24px;
  opacity: 0.08;
  pointer-events: none;
}

/* Halftone effect */
.max-halftone::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(
    circle,
    var(--color-secondary) 1.5px,
    transparent 1.5px
  );
  background-size: 8px 8px;
  opacity: 0.12;
  mix-blend-mode: multiply;
  pointer-events: none;
}

/* Glass layer with color tint */
.max-glass {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 8px 32px rgba(0, 0, 0, 0.3);
}

/* Text gradient fill */
.max-text-gradient {
  background: var(--gradient-mega);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Decorative floating shapes */
.max-deco-circle {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: var(--color-primary);
  opacity: 0.1;
  filter: blur(60px);
  pointer-events: none;
  animation: max-spin 30s linear infinite;
}

.max-deco-ring {
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  border: 4px solid var(--color-accent);
  opacity: 0.15;
  pointer-events: none;
  animation: max-spin 40s linear infinite reverse;
}
```

---

## Absolute Avoid List

- Minimalism or understatement of any kind
- Monochrome or single-accent color palettes
- Excessive whitespace or sparse layouts
- Thin, delicate, or whisper-weight typography
- Subtle, barely-perceptible hover effects
- Safe, predictable grid layouts
- Uniform border-radius or shape language
- Muted, desaturated, or pastel-only palettes
- Single font family used throughout
- "Less is more" as a guiding principle

---

## Inspiration Keywords

- Baroque architecture
- Carnival and festival posters
- David Carson typography
- Memphis Design Group
- Wes Anderson set design
- Collage art and mixed media
- Fashion magazine covers
- Street art and mural culture
- Psychedelic concert posters
- Rococo ornamentation

---

## Final Check

> If people look at a maximalist design and feel a rush of visual energy, an overload of
> intentional beauty crashing together in glorious excess — you have succeeded.
> More color, more type, more texture, more life. Restraint is not a virtue here;
> abundance is the entire point.
