# Organic Shapes Style

## Core Philosophy
- Nature is the ultimate designer
- Every edge should breathe and flow
- Rigidity is the enemy of warmth
- Asymmetry creates visual life
- Earth, water, and growth inform every decision

---

## Typography

Typography should feel **grown, not constructed**.

### Principles
- Pair expressive serifs with soft, rounded sans-serifs
- Headlines carry character and warmth
- Body text is gentle and highly readable
- Avoid mechanical, geometric precision in type
- Variable font weights add organic texture to hierarchy

### Recommended Fonts
```css
/* Pairing 1: Warm Editorial */
--font-headline: 'Fraunces', serif;
--font-body: 'Nunito', sans-serif;

/* Pairing 2: Earthy Elegance */
--font-headline: 'DM Serif Display', serif;
--font-body: 'Quicksand', sans-serif;

/* Pairing 3: Natural Modern */
--font-headline: 'Lora', serif;
--font-body: 'Varela Round', sans-serif;

/* Pairing 4: Botanical */
--font-headline: 'Playfair Display', serif;
--font-body: 'Nunito Sans', sans-serif;
```

### Type Scale
```css
--text-hero: clamp(2.5rem, 6vw, 5rem);     /* Flowing headlines */
--text-title: clamp(1.75rem, 4vw, 3rem);    /* Section titles */
--text-subtitle: clamp(1.125rem, 2vw, 1.5rem);
--text-body: 1.0625rem;                      /* Slightly larger for warmth */
--text-small: 0.875rem;
--text-caption: 0.75rem;

/* Letter spacing */
--tracking-headline: -0.01em;    /* Gentle tightening */
--tracking-body: 0.01em;         /* Slightly open for readability */
--tracking-label: 0.05em;        /* Soft, not aggressive */

/* Line height */
--leading-headline: 1.2;
--leading-body: 1.8;             /* Generous, breathable */
```

---

## Layout

### Principles
- Flowing, asymmetric compositions over rigid grids
- Curved section dividers replace hard horizontal lines
- Generous whitespace mimics open landscapes
- Content areas overlap gently like natural layers
- No element should feel boxed in or trapped
- Embrace full-width organic shapes as background accents

### CSS Examples
```css
/* Flowing container with organic max-width */
.organic-layout {
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(2rem, 5vw, 6rem);
}

/* Asymmetric two-column */
.organic-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: clamp(2rem, 4vw, 5rem);
  align-items: center;
}

/* Wave section divider using SVG */
.organic-divider {
  width: 100%;
  height: auto;
  display: block;
  margin: -1px 0;
}

/* Curved section using clip-path */
.organic-section-curved {
  clip-path: ellipse(80% 100% at 50% 0%);
  padding: clamp(6rem, 12vh, 10rem) clamp(2rem, 5vw, 6rem);
}

/* Flowing hero */
.organic-hero {
  min-height: 90vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 5vh 5vw;
  position: relative;
  overflow: hidden;
}

/* Gentle overlap */
.organic-overlap {
  margin-top: -8vh;
  position: relative;
  z-index: 1;
}
```

---

## Color

### Principles
- Earth tones as the foundation: soil, stone, clay, bark
- Accent colors drawn from nature: moss, sky, wildflower, sunset
- Low to medium saturation keeps the palette grounded
- Warm undertones dominate, even in cooler palettes
- Gradients should mimic natural transitions (sky, water, foliage)

### Recommended Palettes
```css
/* Palette 1: Forest Floor */
--color-bg: #FAF6F1;
--color-surface: #FFFFFF;
--color-text: #2D2418;
--color-text-muted: #7A6F5D;
--color-accent: #5B7C4F;        /* Moss green */
--color-accent-warm: #C4843E;   /* Amber */
--color-border: rgba(45, 36, 24, 0.1);

/* Palette 2: River Stone */
--color-bg: #F2F0EB;
--color-surface: #FAFAF7;
--color-text: #3A3630;
--color-text-muted: #8C857A;
--color-accent: #5E8B9E;        /* River blue */
--color-accent-warm: #B07D4F;   /* Sandstone */
--color-border: rgba(58, 54, 48, 0.08);

/* Palette 3: Sunset Canyon */
--color-bg: #FBF5EE;
--color-surface: #FFFCF8;
--color-text: #3B2E24;
--color-text-muted: #917B6A;
--color-accent: #C25D3A;        /* Terracotta */
--color-accent-warm: #D4A94B;   /* Desert gold */
--color-border: rgba(59, 46, 36, 0.1);

/* Palette 4: Dark Earth */
--color-bg: #1E1B17;
--color-surface: #2A2621;
--color-text: #E8E0D4;
--color-text-muted: #9C9184;
--color-accent: #7EA87A;        /* Sage */
--color-accent-warm: #C98B5E;   /* Clay */
--color-border: rgba(232, 224, 212, 0.08);

/* Natural gradients */
.organic-gradient-sky {
  background: linear-gradient(180deg, #D4C5A9 0%, #E8D5B7 40%, #F5E6D0 100%);
}

.organic-gradient-forest {
  background: linear-gradient(160deg, #3D5A3E 0%, #5B7C4F 50%, #8AA67E 100%);
}

.organic-gradient-earth {
  background: linear-gradient(135deg, #C4843E 0%, #D4A94B 50%, #E8D5B7 100%);
}
```

---

## Borders & Shapes

### Principles
- No sharp corners, ever
- Use blob-like border-radius values (asymmetric radii)
- SVG blobs for backgrounds and containers
- Shapes should look like they were formed by water or wind
- Shadows are soft, warm, and diffused

### CSS Examples
```css
/* Organic border-radius (asymmetric blob) */
.organic-blob {
  border-radius: 60% 40% 45% 55% / 50% 60% 40% 50%;
}

.organic-blob-alt {
  border-radius: 40% 60% 55% 45% / 55% 40% 60% 50%;
}

/* Pill shape with organic softness */
.organic-pill {
  border-radius: 999px;
}

/* Soft card shape */
.organic-card {
  border-radius: 24px;
  border: 1px solid var(--color-border);
}

/* Extra-rounded container */
.organic-container {
  border-radius: 32px 32px 40px 28px;
}

/* Warm, diffused shadows */
.organic-shadow-sm {
  box-shadow: 0 2px 8px rgba(139, 109, 68, 0.08);
}

.organic-shadow-md {
  box-shadow:
    0 4px 16px rgba(139, 109, 68, 0.1),
    0 1px 4px rgba(139, 109, 68, 0.06);
}

.organic-shadow-lg {
  box-shadow:
    0 8px 40px rgba(139, 109, 68, 0.12),
    0 2px 8px rgba(139, 109, 68, 0.06);
}

/* SVG blob background */
.organic-blob-bg {
  position: absolute;
  width: 60vw;
  height: 60vw;
  opacity: 0.15;
  z-index: -1;
  filter: blur(40px);
  background: var(--color-accent);
  border-radius: 60% 40% 45% 55% / 50% 60% 40% 50%;
}

/* Wavy border using SVG mask */
.organic-wavy-edge {
  mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 1200 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z' fill='black'/%3E%3C/svg%3E");
  mask-size: 100% 100%;
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 1200 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z' fill='black'/%3E%3C/svg%3E");
  -webkit-mask-size: 100% 100%;
}
```

---

## UI Components

### Principles
- Buttons feel like smooth pebbles or seeds
- Input fields are soft and inviting, never harsh
- Links breathe with gentle underline animations
- Special elements use blob shapes and organic motion
- Hover states are warm transitions, not mechanical snaps

### CSS Examples
```css
/* Primary button - pebble shape */
.organic-button {
  background: var(--color-accent);
  color: #FFFFFF;
  border: none;
  border-radius: 999px;
  padding: 0.875rem 2rem;
  font-family: var(--font-body);
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 2px 12px rgba(91, 124, 79, 0.25);
}

.organic-button:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 24px rgba(91, 124, 79, 0.3);
}

.organic-button:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 1px 6px rgba(91, 124, 79, 0.2);
}

/* Secondary button - outlined pebble */
.organic-button-secondary {
  background: transparent;
  color: var(--color-text);
  border: 1.5px solid var(--color-border);
  border-radius: 999px;
  padding: 0.875rem 2rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.organic-button-secondary:hover {
  background: var(--color-surface);
  border-color: var(--color-accent);
  box-shadow: 0 4px 16px rgba(139, 109, 68, 0.08);
}

/* Input field */
.organic-input {
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: 16px;
  padding: 1rem 1.25rem;
  font-size: 1rem;
  font-family: var(--font-body);
  color: var(--color-text);
  transition: all 0.3s ease;
  width: 100%;
}

.organic-input::placeholder {
  color: var(--color-text-muted);
  opacity: 0.6;
}

.organic-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 4px rgba(91, 124, 79, 0.1);
}

/* Textarea with extra roundness */
.organic-textarea {
  border-radius: 20px;
  resize: vertical;
  min-height: 120px;
}

/* Link style */
.organic-link {
  color: var(--color-accent);
  text-decoration: none;
  position: relative;
  transition: color 0.3s ease;
}

.organic-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--color-accent);
  border-radius: 999px;
  transition: width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.organic-link:hover::after {
  width: 100%;
}

/* Card component */
.organic-card {
  background: var(--color-surface);
  border-radius: 24px;
  padding: clamp(1.5rem, 3vw, 2.5rem);
  border: 1px solid var(--color-border);
  box-shadow: 0 4px 16px rgba(139, 109, 68, 0.06);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.organic-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(139, 109, 68, 0.1);
}

/* Badge / tag - seed shape */
.organic-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 1rem;
  border-radius: 999px;
  background: rgba(91, 124, 79, 0.1);
  color: var(--color-accent);
  font-size: var(--text-small);
  font-weight: 500;
}

/* Blob decorative element */
.organic-blob-decoration {
  position: absolute;
  width: 300px;
  height: 300px;
  background: var(--color-accent);
  opacity: 0.08;
  border-radius: 60% 40% 45% 55% / 50% 60% 40% 50%;
  pointer-events: none;
  z-index: -1;
}
```

---

## Interaction & Motion

### Principles
- Motion mimics nature: breeze, water, growth
- Ease-out and custom cubic-beziers feel organic
- No linear or mechanical easing
- Gentle hover lifts like leaves rising
- Scroll-triggered reveals unfold like petals
- Blob shapes subtly morph on idle or hover

### CSS Examples
```css
/* Organic ease curve */
:root {
  --ease-organic: cubic-bezier(0.25, 0.8, 0.25, 1);
  --ease-bloom: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-settle: cubic-bezier(0.22, 0.61, 0.36, 1);
}

/* Gentle fade-in rise */
.organic-fade-in {
  opacity: 0;
  transform: translateY(24px);
  animation: organicFadeIn 0.8s var(--ease-organic) forwards;
}

@keyframes organicFadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Staggered bloom reveal */
.organic-stagger > * {
  opacity: 0;
  transform: translateY(16px) scale(0.97);
  animation: organicBloom 0.6s var(--ease-organic) forwards;
}

.organic-stagger > *:nth-child(1) { animation-delay: 0.1s; }
.organic-stagger > *:nth-child(2) { animation-delay: 0.2s; }
.organic-stagger > *:nth-child(3) { animation-delay: 0.3s; }
.organic-stagger > *:nth-child(4) { animation-delay: 0.4s; }

@keyframes organicBloom {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Blob morphing animation */
.organic-morph {
  animation: blobMorph 8s ease-in-out infinite;
}

@keyframes blobMorph {
  0%, 100% {
    border-radius: 60% 40% 45% 55% / 50% 60% 40% 50%;
  }
  25% {
    border-radius: 45% 55% 60% 40% / 40% 50% 55% 60%;
  }
  50% {
    border-radius: 55% 45% 40% 60% / 60% 45% 55% 40%;
  }
  75% {
    border-radius: 40% 60% 55% 45% / 55% 40% 60% 50%;
  }
}

/* Gentle floating */
.organic-float {
  animation: organicFloat 6s ease-in-out infinite;
}

@keyframes organicFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-12px) rotate(1deg); }
}

/* Hover lift */
.organic-lift {
  transition: all 0.4s var(--ease-organic);
}

.organic-lift:hover {
  transform: translateY(-4px);
}

/* Gentle scale on hover */
.organic-grow {
  transition: transform 0.4s var(--ease-bloom);
}

.organic-grow:hover {
  transform: scale(1.03);
}
```

---

## Textures & Effects

```css
/* Subtle grain overlay - natural paper texture */
.organic-grain::after {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.04;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}

/* Watercolor edge effect */
.organic-watercolor {
  position: relative;
  overflow: hidden;
}

.organic-watercolor::before {
  content: '';
  position: absolute;
  inset: -20%;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(91, 124, 79, 0.08) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 30%, rgba(196, 132, 62, 0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, rgba(94, 139, 158, 0.05) 0%, transparent 55%);
  pointer-events: none;
  z-index: -1;
}

/* Soft vignette */
.organic-vignette::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 50%, rgba(45, 36, 24, 0.06) 100%);
  pointer-events: none;
}

/* Natural gradient mesh background */
.organic-mesh-bg {
  background:
    radial-gradient(ellipse at 15% 25%, rgba(91, 124, 79, 0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 85% 60%, rgba(196, 132, 62, 0.1) 0%, transparent 45%),
    radial-gradient(ellipse at 45% 85%, rgba(94, 139, 158, 0.08) 0%, transparent 50%),
    var(--color-bg);
}

/* SVG wave divider between sections */
.organic-wave-top {
  position: relative;
}

.organic-wave-top::before {
  content: '';
  position: absolute;
  top: -60px;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--color-surface);
  mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 1200 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,30 Q300,60 600,30 Q900,0 1200,30 L1200,60 L0,60 Z' fill='black'/%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 1200 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,30 Q300,60 600,30 Q900,0 1200,30 L1200,60 L0,60 Z' fill='black'/%3E%3C/svg%3E");
  mask-size: 100% 100%;
  -webkit-mask-size: 100% 100%;
}
```

---

## Absolute Avoid List

- Sharp 90-degree corners on any visible element
- Mechanical, linear easing functions
- Neon or fluorescent colors
- Hard, crisp box-shadows with zero blur
- Rigid, perfectly symmetric grid layouts
- Monospaced or geometric sans-serif fonts as primary type
- Straight-line section dividers when a curve would serve better
- High-contrast, jarring color transitions
- Cold, sterile color palettes without warmth
- Overly uniform spacing that feels manufactured

---

## Inspiration Keywords

- River stones
- Forest canopy
- Watercolor painting
- Botanical illustration
- Handmade ceramics
- Sand dunes and erosion
- Moss and lichen growth
- Japanese wabi-sabi
- Natural topography
- Seed pods and petals

---

## Final Check

> Every screen should feel like it was shaped by wind and water over time,
> not snapped together on a factory line. If an element could exist in nature,
> the design is working. Warmth, flow, and imperfection are not flaws -- they are the style.
