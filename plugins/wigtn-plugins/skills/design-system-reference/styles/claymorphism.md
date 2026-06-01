# Claymorphism Style Guide

## Core Philosophy
- Everything looks sculpted from soft clay or Play-Doh
- Rounded, puffy, touchable — inviting interaction
- Pastel warmth meets 3D depth
- Friendly and approachable over sophisticated
- Handcrafted feel, like a carefully shaped miniature world

---

## Core Characteristics

| Aspect | Description |
|--------|-------------|
| Feel | Soft, puffy, warm, toylike, friendly |
| Shadows | Dual-layer: outer shadow + inner highlight |
| Colors | Warm pastels, low-contrast, candy tones |
| Corners | Very rounded (20-32px), pill shapes |
| Surfaces | Matte, slightly inflated appearance |
| Depth | Elements look "puffy" — raised from surface |

---

## Claymorphism vs Neomorphism vs Glassmorphism

| | Claymorphism | Neomorphism | Glassmorphism |
|--|-------------|-------------|---------------|
| Surface | Puffy, inflated clay | Flat, extruded plastic | Transparent, frosted |
| Color | Warm pastels, distinct from bg | Same hue as background | Semi-transparent |
| Shadow | Colored outer + white inner | Dual light/dark, same hue | Single dark, blurred |
| Border | Subtle or none | None | Light, semi-transparent |
| Feel | Toy, friendly | Minimal, tactile | Futuristic, elegant |

---

## Color Palette

### Warm Pastel Base
```css
:root {
  /* Clay surface colors */
  --clay-pink: #FFB5C2;
  --clay-peach: #FFDAB9;
  --clay-lavender: #D4BFFF;
  --clay-mint: #B5EAD7;
  --clay-sky: #A7D8F0;
  --clay-yellow: #FFE5A0;
  --clay-coral: #FFB4A2;
  --clay-sage: #C5DFB4;

  /* Background (always lighter than clay) */
  --clay-bg: #FFF5F0;
  --clay-bg-alt: #F0F0FF;

  /* Text */
  --clay-text: #3D3250;
  --clay-text-muted: #7A6E8A;
  --clay-text-light: #FFFFFF;

  /* Shadow colors (tinted, not gray) */
  --clay-shadow: rgba(61, 50, 80, 0.2);
  --clay-shadow-deep: rgba(61, 50, 80, 0.35);
  --clay-highlight: rgba(255, 255, 255, 0.7);
  --clay-highlight-soft: rgba(255, 255, 255, 0.4);
}
```

### Palette Combos
```css
/* Combo 1: Berry Garden */
--clay-primary: #FFB5C2;
--clay-secondary: #D4BFFF;
--clay-accent: #B5EAD7;

/* Combo 2: Sunset Beach */
--clay-primary: #FFDAB9;
--clay-secondary: #FFB4A2;
--clay-accent: #A7D8F0;

/* Combo 3: Spring Meadow */
--clay-primary: #B5EAD7;
--clay-secondary: #FFE5A0;
--clay-accent: #D4BFFF;

/* Combo 4: Cotton Candy */
--clay-primary: #D4BFFF;
--clay-secondary: #FFB5C2;
--clay-accent: #A7D8F0;
```

---

## Typography

### Principles
- Rounded, friendly font choices
- Soft weight (500-700, avoid thin or black extremes)
- Generous line height for breathing room
- No sharp, condensed, or aggressive fonts

### Recommended Fonts
```css
/* Rounded sans — perfect for clay */
--font-heading: 'Nunito', sans-serif;
--font-heading: 'Quicksand', sans-serif;
--font-heading: 'Comfortaa', sans-serif;
--font-heading: 'Baloo 2', sans-serif;

/* Body — soft and readable */
--font-body: 'Nunito Sans', sans-serif;
--font-body: 'DM Sans', sans-serif;

/* Accent — for playful labels */
--font-accent: 'Fredoka', sans-serif;
```

### Type Scale
```css
--text-hero: clamp(2.5rem, 6vw, 4.5rem);
--text-title: clamp(1.75rem, 3vw, 2.5rem);
--text-subtitle: 1.25rem;
--text-body: 1rem;
--text-small: 0.875rem;

--weight-heading: 700;
--weight-body: 400;
--weight-emphasis: 600;

--leading-heading: 1.2;
--leading-body: 1.7;
```

### Text Styles
```css
.clay-heading {
  font-family: var(--font-heading);
  font-weight: 700;
  color: var(--clay-text);
  line-height: var(--leading-heading);
}

.clay-body {
  font-family: var(--font-body);
  color: var(--clay-text);
  line-height: var(--leading-body);
}
```

---

## The Clay Effect (Core Identity)

### How It Works
The clay effect is created by combining:
1. A **solid pastel background** color
2. An **outer shadow** (soft, colored, creates depth)
3. An **inner highlight** (white, top-left, creates the "puffy" look)
4. Very **rounded corners** (20-32px)

```css
/* The fundamental clay surface */
.clay-surface {
  background: var(--clay-pink);
  border-radius: 24px;
  box-shadow:
    /* Outer shadow — depth */
    8px 8px 20px var(--clay-shadow),
    /* Inner highlight — puffiness */
    inset -4px -4px 8px var(--clay-shadow),
    inset 4px 4px 8px var(--clay-highlight);
}

/* Clay levels */
.clay-level-1 {
  box-shadow:
    4px 4px 10px var(--clay-shadow),
    inset -2px -2px 4px rgba(0, 0, 0, 0.05),
    inset 2px 2px 4px var(--clay-highlight);
}

.clay-level-2 {
  box-shadow:
    8px 8px 20px var(--clay-shadow),
    inset -4px -4px 8px rgba(0, 0, 0, 0.06),
    inset 4px 4px 8px var(--clay-highlight);
}

.clay-level-3 {
  box-shadow:
    12px 12px 30px var(--clay-shadow),
    -4px -4px 12px rgba(255, 255, 255, 0.3),
    inset -6px -6px 10px rgba(0, 0, 0, 0.07),
    inset 6px 6px 10px var(--clay-highlight);
}

/* Pressed / Inset clay */
.clay-pressed {
  box-shadow:
    inset 4px 4px 10px var(--clay-shadow),
    inset -2px -2px 6px var(--clay-highlight-soft);
}
```

---

## UI Components

### Button
```css
.clay-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 1rem;
  color: var(--clay-text);
  background: var(--clay-pink);
  border: none;
  border-radius: 16px;
  cursor: pointer;
  box-shadow:
    6px 6px 16px var(--clay-shadow),
    inset -3px -3px 6px rgba(0, 0, 0, 0.06),
    inset 3px 3px 6px var(--clay-highlight);
  transition: all 0.2s ease;
}

.clay-button:hover {
  transform: translateY(-2px);
  box-shadow:
    8px 8px 20px var(--clay-shadow),
    inset -3px -3px 6px rgba(0, 0, 0, 0.06),
    inset 3px 3px 6px var(--clay-highlight);
}

.clay-button:active {
  transform: translateY(1px);
  box-shadow:
    2px 2px 8px var(--clay-shadow),
    inset -2px -2px 4px rgba(0, 0, 0, 0.04),
    inset 2px 2px 4px var(--clay-highlight-soft);
}

/* Color variants */
.clay-button-peach { background: var(--clay-peach); }
.clay-button-lavender { background: var(--clay-lavender); }
.clay-button-mint { background: var(--clay-mint); }
.clay-button-sky { background: var(--clay-sky); }
```

### Card
```css
.clay-card {
  background: var(--clay-bg);
  border-radius: 28px;
  padding: 28px;
  box-shadow:
    10px 10px 24px var(--clay-shadow),
    inset -4px -4px 8px rgba(0, 0, 0, 0.04),
    inset 4px 4px 8px var(--clay-highlight);
}

/* Colored card */
.clay-card-pink {
  background: var(--clay-pink);
}

.clay-card-lavender {
  background: var(--clay-lavender);
}

/* Card with clay icon */
.clay-card-icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: var(--clay-peach);
  box-shadow:
    4px 4px 10px var(--clay-shadow),
    inset -2px -2px 4px rgba(0, 0, 0, 0.05),
    inset 2px 2px 4px var(--clay-highlight);
}
```

### Input
```css
.clay-input {
  width: 100%;
  padding: 14px 20px;
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--clay-text);
  background: var(--clay-bg);
  border: none;
  border-radius: 16px;
  box-shadow:
    inset 3px 3px 8px var(--clay-shadow),
    inset -2px -2px 6px var(--clay-highlight-soft);
  transition: box-shadow 0.2s ease;
}

.clay-input:focus {
  outline: none;
  box-shadow:
    inset 4px 4px 10px var(--clay-shadow),
    inset -2px -2px 6px var(--clay-highlight-soft),
    0 0 0 3px rgba(212, 191, 255, 0.4);
}

.clay-input::placeholder {
  color: var(--clay-text-muted);
}
```

### Toggle
```css
.clay-toggle {
  width: 56px;
  height: 30px;
  background: var(--clay-bg);
  border-radius: 15px;
  border: none;
  position: relative;
  cursor: pointer;
  box-shadow:
    inset 3px 3px 8px var(--clay-shadow),
    inset -2px -2px 6px var(--clay-highlight-soft);
  transition: background 0.3s ease;
}

.clay-toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--clay-peach);
  box-shadow:
    3px 3px 8px var(--clay-shadow),
    inset -1px -1px 3px rgba(0, 0, 0, 0.05),
    inset 1px 1px 3px var(--clay-highlight);
  transition: transform 0.3s ease, background 0.3s ease;
}

.clay-toggle.active {
  background: var(--clay-mint);
}

.clay-toggle.active .clay-toggle-knob {
  transform: translateX(26px);
  background: var(--clay-lavender);
}
```

### Progress Bar
```css
.clay-progress {
  height: 16px;
  background: var(--clay-bg);
  border-radius: 8px;
  box-shadow:
    inset 2px 2px 6px var(--clay-shadow),
    inset -1px -1px 4px var(--clay-highlight-soft);
  overflow: hidden;
  padding: 3px;
}

.clay-progress-fill {
  height: 100%;
  background: var(--clay-mint);
  border-radius: 5px;
  box-shadow:
    inset -1px -1px 3px rgba(0, 0, 0, 0.05),
    inset 1px 1px 3px var(--clay-highlight);
  transition: width 0.5s ease;
}
```

### Pill / Chip
```css
.clay-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  font-family: var(--font-heading);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--clay-text);
  background: var(--clay-lavender);
  border: none;
  border-radius: 24px;
  box-shadow:
    4px 4px 10px var(--clay-shadow),
    inset -2px -2px 4px rgba(0, 0, 0, 0.05),
    inset 2px 2px 4px var(--clay-highlight);
}
```

---

## Layout

### Principles
- Generous spacing (clay elements need room to "breathe")
- Centered, symmetrical layouts feel natural
- Group elements with shared surface color
- Avoid dense grids — keep it airy

```css
/* Clay container */
.clay-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

/* Card grid — airy spacing */
.clay-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
}

/* Two-column feature */
.clay-feature {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
}

/* Hero section */
.clay-hero {
  text-align: center;
  padding: 6rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

/* Section with clay background blob */
.clay-section {
  position: relative;
  padding: 5rem 2rem;
}

.clay-section-blob {
  position: absolute;
  width: 400px;
  height: 400px;
  background: var(--clay-peach);
  border-radius: 60% 40% 50% 50% / 40% 60% 40% 60%;
  opacity: 0.3;
  filter: blur(60px);
  z-index: -1;
}
```

---

## Interaction & Motion

### Principles
- Soft, bouncy animations (spring-like, not snappy)
- Elements "squish" when pressed (scale down slightly)
- Hover lifts gently (translateY)
- No harsh transitions — everything is cushioned

```css
/* Soft hover lift */
.clay-hover {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.3s ease;
}

.clay-hover:hover {
  transform: translateY(-4px);
}

/* Squish on press */
.clay-squish:active {
  transform: scale(0.97);
  transition: transform 0.1s ease;
}

/* Bounce in */
.clay-bounce-in {
  animation: clayBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes clayBounce {
  from {
    opacity: 0;
    transform: scale(0.85) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Blob morph (background decoration) */
@keyframes clayBlob {
  0%, 100% {
    border-radius: 60% 40% 50% 50% / 40% 60% 40% 60%;
  }
  25% {
    border-radius: 50% 60% 40% 60% / 60% 40% 60% 40%;
  }
  50% {
    border-radius: 40% 50% 60% 40% / 50% 50% 40% 60%;
  }
  75% {
    border-radius: 60% 40% 50% 60% / 40% 60% 50% 40%;
  }
}

.clay-blob-animate {
  animation: clayBlob 8s ease-in-out infinite;
}

/* Gentle float */
@keyframes clayFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.clay-float {
  animation: clayFloat 3s ease-in-out infinite;
}
```

---

## 3D Illustration Integration

```css
/* Container for 3D clay illustrations */
.clay-illustration {
  display: flex;
  justify-content: center;
  padding: 2rem;
  filter: drop-shadow(8px 8px 16px var(--clay-shadow));
}

.clay-illustration img {
  max-width: 100%;
  height: auto;
}

/* Floating 3D elements */
.clay-3d-float {
  animation: clayFloat 3s ease-in-out infinite;
  filter: drop-shadow(6px 6px 12px var(--clay-shadow));
}

/* Rotate for visual interest */
.clay-3d-rotate {
  transform: perspective(800px) rotateX(5deg) rotateY(-5deg);
  transition: transform 0.3s ease;
}

.clay-3d-rotate:hover {
  transform: perspective(800px) rotateX(0) rotateY(0);
}
```

---

## Absolute Avoid List

- Sharp corners (everything must be rounded, 16px minimum)
- Hard/solid shadows without inner highlight (that's neobrutalism)
- Dark or moody color palettes (clay is warm and cheerful)
- Thin borders or outlines (clay has no visible edges)
- Flat, shadowless elements (depth is the whole point)
- Complex gradients (keep surfaces matte/solid)
- Mixing clay with glassmorphism blur effects

---

## Inspiration Keywords

- Play-Doh and clay modeling
- Toy Story character design
- Kawaii culture
- 3D icon sets (Superscene, 3Dicons)
- Soft-touch packaging
- Marshmallow textures
- Children's educational apps

---

## Final Check

> Every element should look like you could squeeze it.
> The inner highlight is what separates clay from flat pastels — never skip it.
> If it doesn't feel warm and inviting, the palette is wrong.
