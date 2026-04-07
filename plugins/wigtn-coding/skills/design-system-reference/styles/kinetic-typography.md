# Kinetic Typography Style Guide

## Core Philosophy
- Text is not static — it moves, reveals, transforms, reacts
- Typography IS the animation, not decoration on top of it
- Every letter has weight, velocity, and personality
- Less UI chrome, more typographic theater
- Motion creates hierarchy — what moves first is what matters most
- The page is a stage, headlines are the performers

---

## Core Characteristics

| Aspect | Description |
|--------|-------------|
| Feel | Dramatic, cinematic, award-winning, immersive |
| Colors | Monochrome or limited palette — type is the star |
| Typography | Oversized, animated, variable fonts with axis control |
| Spacing | Cinematic — extreme vertical rhythm, theatrical pauses |
| Borders | Almost none — motion creates separation |
| Shadows | Rarely — motion provides depth |
| Motion | Core feature. Scroll-triggered, staggered, physics-based |

---

## Kinetic Typography vs Related Styles

| | Kinetic Typography | Editorial | Maximalist |
|--|-------------------|-----------|------------|
| Motion Role | Primary design element | Subtle enhancement | Layered complexity |
| Type Size | Extreme (fills viewport) | Large (dominant) | Extreme (chaotic) |
| Animation | Scroll-driven, letter-level | Page transitions | Multi-element |
| Layout | Theatrical, full-screen sections | Magazine grid | Dense collage |
| Color | Minimal — focus on type | Restrained | Saturated, clashing |
| Reference | Awwwards SOTD, Locomotive, Lusion | Vogue, NYT | Sagmeister, David Carson |

---

## AI Slop Prevention Warning

- DO NOT just fade text in from bottom — every AI does this
- DO NOT animate everything simultaneously — stagger creates rhythm
- DO NOT use CSS transition alone — this style needs scroll-driven animation or Framer Motion
- DO NOT use small text with kinetic effects — go BIG or it looks like a bug
- DO NOT forget performance — requestAnimationFrame, will-change, GPU layers
- DO NOT ignore accessibility — `prefers-reduced-motion` is mandatory, not optional

**The difference between kinetic typography and "text that moves" is choreography.**

---

## Color Palette

### Monochrome (Primary Approach)
```css
:root {
  /* Keep it simple — type is the hero */
  --kt-bg: #0a0a0a;
  --kt-surface: #141414;
  --kt-text: #fafafa;
  --kt-text-secondary: #888888;
  --kt-text-dim: #444444;
  --kt-accent: #fafafa;             /* Accent = text color in mono */
  --kt-border: rgba(255, 255, 255, 0.08);
}
```

### Light Mode
```css
.light {
  --kt-bg: #fafafa;
  --kt-surface: #ffffff;
  --kt-text: #0a0a0a;
  --kt-text-secondary: #666666;
  --kt-text-dim: #aaaaaa;
  --kt-accent: #0a0a0a;
}
```

### Single Accent (When needed)
```css
:root {
  --kt-accent: #ff3d00;           /* Bold red-orange for emphasis */
  /* OR */
  --kt-accent: #3b82f6;           /* Electric blue */
  /* OR */
  --kt-accent: #f59e0b;           /* Warm amber */
}
```

---

## Typography

### This Style Lives or Dies by Type Choice

```css
/* Display — variable font required for animation */
--font-display: 'Instrument Serif', serif;
--font-display: 'Clash Display', sans-serif;
--font-display: 'Cabinet Grotesk', sans-serif;

/* Variable font alternatives (best for axis animation) */
--font-display: 'Inter', sans-serif;           /* wght axis */
--font-display: 'Syne', sans-serif;           /* wght axis */
--font-display: 'Outfit', sans-serif;          /* wght axis */

/* Premium variable fonts */
--font-display: 'Editorial New', serif;
--font-display: 'GT Super Display', serif;

/* Body */
--font-body: 'Inter', 'DM Sans', sans-serif;

/* Monospace accent */
--font-mono: 'Geist Mono', monospace;
```

### Type Scale — Go Extreme
```css
/* Viewport-relative for cinematic scale */
--text-mega: clamp(6rem, 20vw, 18rem);       /* Full-screen statement */
--text-hero: clamp(4rem, 14vw, 12rem);       /* Primary headline */
--text-display: clamp(2.5rem, 8vw, 6rem);    /* Section headline */
--text-title: clamp(1.5rem, 4vw, 3rem);      /* Sub-headline */
--text-body: 1.125rem;                         /* Body text */
--text-small: 0.875rem;
--text-micro: 0.75rem;

/* Aggressive negative tracking for large text */
--tracking-mega: -0.06em;
--tracking-hero: -0.05em;
--tracking-display: -0.03em;
--tracking-body: -0.01em;
--tracking-wide: 0.15em;                       /* Small labels, all-caps */

/* Tight leading for impact */
--leading-mega: 0.85;
--leading-hero: 0.9;
--leading-display: 1.0;
--leading-body: 1.6;
```

### Advanced Typography
```css
/* Variable font weight animation */
@supports (font-variation-settings: normal) {
  .variable-weight {
    font-variation-settings: "wght" 400;
    transition: font-variation-settings 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .variable-weight:hover,
  .variable-weight.active {
    font-variation-settings: "wght" 900;
  }
}

/* Optical sizing for large text */
h1, .mega {
  font-optical-sizing: auto;
  font-feature-settings: "ss01", "cv01";
  text-wrap: balance;
}

/* Fluid text that respects viewport */
.fluid-text {
  font-size: clamp(var(--text-display), 10vw, var(--text-hero));
  line-height: var(--leading-hero);
  letter-spacing: var(--tracking-hero);
}
```

---

## Animation Systems

### Split Text Reveal (Letter by Letter)
```css
/* Setup: split text into spans via JS */
.split-letter {
  display: inline-block;
  opacity: 0;
  transform: translateY(100%);
}

.split-letter.revealed {
  animation: letter-reveal 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes letter-reveal {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Stagger: each letter gets increasing delay */
/* In JS: letters.forEach((l, i) => l.style.animationDelay = `${i * 0.03}s`) */
```

### Word-by-Word Reveal
```css
.split-word {
  display: inline-block;
  overflow: hidden;
}

.split-word-inner {
  display: inline-block;
  transform: translateY(110%);
  transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

.in-view .split-word-inner {
  transform: translateY(0);
}
```

### Line Reveal (Mask Wipe)
```css
.line-reveal {
  overflow: hidden;
}

.line-reveal-inner {
  transform: translateY(100%);
  transition: transform 1s cubic-bezier(0.22, 1, 0.36, 1);
}

.in-view .line-reveal-inner {
  transform: translateY(0);
}
```

### Scroll-Driven Parallax Text
```css
/* Modern CSS scroll-driven animation (Chrome 115+) */
@supports (animation-timeline: scroll()) {
  .scroll-text {
    animation: scroll-move linear;
    animation-timeline: scroll();
    animation-range: entry 0% exit 100%;
  }

  @keyframes scroll-move {
    from { transform: translateX(-20%); opacity: 0.3; }
    50% { opacity: 1; }
    to { transform: translateX(20%); opacity: 0.3; }
  }
}

/* Fallback: Intersection Observer in JS */
```

### Horizontal Scroll Text (Marquee)
```css
.marquee {
  display: flex;
  overflow: hidden;
  white-space: nowrap;
}

.marquee-track {
  display: flex;
  animation: marquee 20s linear infinite;
}

.marquee-text {
  font-size: var(--text-mega);
  font-weight: 900;
  letter-spacing: var(--tracking-mega);
  line-height: var(--leading-mega);
  color: var(--kt-text-dim);
  padding-right: 2rem;
  -webkit-text-stroke: 1px var(--kt-text-dim);
  -webkit-text-fill-color: transparent;
}

@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
```

### Counter / Number Roll
```css
.number-roll {
  display: inline-flex;
  overflow: hidden;
  height: 1.2em;
}

.number-roll-digit {
  display: flex;
  flex-direction: column;
  transition: transform 1.5s cubic-bezier(0.22, 1, 0.36, 1);
}

/* In JS: set translateY based on target digit */
```

### Weight Animation (Variable Font)
```javascript
// Framer Motion example
const WeightText = ({ children }) => (
  <motion.span
    initial={{ fontVariationSettings: '"wght" 100' }}
    whileInView={{ fontVariationSettings: '"wght" 900' }}
    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.span>
);
```

---

## Components

### Hero Section
```css
.hero-kinetic {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-headline {
  font-size: var(--text-mega);
  font-weight: 900;
  letter-spacing: var(--tracking-mega);
  line-height: var(--leading-mega);
  text-align: center;
  text-transform: uppercase;
}

/* Outline text for layered depth */
.hero-outline {
  -webkit-text-stroke: 2px var(--kt-text);
  -webkit-text-fill-color: transparent;
}
```

### Section Transition
```css
.section-kinetic {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 clamp(24px, 5vw, 120px);
}

.section-label {
  font-family: var(--font-mono);
  font-size: var(--text-micro);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--kt-text-dim);
  margin-bottom: 24px;
}
```

### Minimal Navigation
```css
.nav-kinetic {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px clamp(24px, 5vw, 60px);
  mix-blend-mode: difference;
  color: white;
}

.nav-logo {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.nav-links {
  display: flex;
  gap: 32px;
  font-size: var(--text-small);
}

.nav-link {
  color: inherit;
  text-decoration: none;
  opacity: 0.6;
  transition: opacity 200ms;
}

.nav-link:hover {
  opacity: 1;
}
```

### Button (Minimal)
```css
.btn-kinetic {
  position: relative;
  background: none;
  border: 1px solid var(--kt-text);
  color: var(--kt-text);
  padding: 16px 40px;
  font-size: var(--text-small);
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  overflow: hidden;
  transition: color 400ms;
}

.btn-kinetic::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--kt-text);
  transform: translateY(100%);
  transition: transform 400ms cubic-bezier(0.22, 1, 0.36, 1);
}

.btn-kinetic:hover {
  color: var(--kt-bg);
}

.btn-kinetic:hover::before {
  transform: translateY(0);
}

.btn-kinetic span {
  position: relative;
  z-index: 1;
}
```

---

## Layout

### Principles
- **Full-screen sections** — each section is a scene, 100vh minimum
- **Asymmetric placement** — text can anchor to any corner or edge
- **Minimal grid** — 2-3 columns max, mostly single-column theatrical
- **Negative space is rhythm** — large gaps between sections = dramatic pause

### Theatrical Grid
```css
.grid-kinetic {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  min-height: 100vh;
}

.grid-kinetic-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(40px, 6vw, 120px);
}

.grid-kinetic-media {
  position: relative;
  overflow: hidden;
}

/* Asymmetric: text left 40%, media right 60% */
.grid-asymmetric {
  grid-template-columns: 2fr 3fr;
}
```

### Scroll Snap (Optional)
```css
.scroll-container {
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
  height: 100vh;
}

.scroll-section {
  scroll-snap-align: start;
  min-height: 100vh;
}
```

---

## JavaScript Integration

### Intersection Observer (Required for Reveals)
```javascript
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        // Stagger children
        const children = entry.target.querySelectorAll('[data-reveal]');
        children.forEach((child, i) => {
          child.style.transitionDelay = `${i * 0.1}s`;
          child.classList.add('revealed');
        });
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
```

### Text Splitting Utility
```javascript
function splitText(element, type = 'letter') {
  const text = element.textContent;
  element.innerHTML = '';

  if (type === 'letter') {
    [...text].forEach((char, i) => {
      const span = document.createElement('span');
      span.className = 'split-letter';
      span.style.animationDelay = `${i * 0.03}s`;
      span.textContent = char === ' ' ? '\u00A0' : char;
      element.appendChild(span);
    });
  } else if (type === 'word') {
    text.split(' ').forEach((word, i) => {
      const wrapper = document.createElement('span');
      wrapper.className = 'split-word';
      const inner = document.createElement('span');
      inner.className = 'split-word-inner';
      inner.style.transitionDelay = `${i * 0.08}s`;
      inner.textContent = word;
      wrapper.appendChild(inner);
      element.appendChild(wrapper);
      if (i < text.split(' ').length - 1) {
        element.appendChild(document.createTextNode(' '));
      }
    });
  }
}
```

### Framer Motion Patterns (React)
```jsx
// Staggered text reveal
const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.03 }
  }
};

const letter = {
  hidden: { y: '100%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const AnimatedHeadline = ({ text }) => (
  <motion.h1 variants={container} initial="hidden" whileInView="visible">
    {[...text].map((char, i) => (
      <motion.span key={i} variants={letter} style={{ display: 'inline-block' }}>
        {char === ' ' ? '\u00A0' : char}
      </motion.span>
    ))}
  </motion.h1>
);
```

---

## Performance Guidelines

```css
/* GPU-accelerated properties only */
.animated-element {
  will-change: transform, opacity;
  /* NEVER animate: width, height, top, left, margin, padding */
}

/* Reduce motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .marquee-track {
    animation: none;
  }

  .split-letter,
  .split-word-inner,
  .line-reveal-inner {
    transform: none !important;
    opacity: 1 !important;
    transition: none !important;
  }
}

/* Mobile: simplify animations */
@media (max-width: 768px) {
  /* Reduce stagger count */
  .split-letter:nth-child(n+20) {
    animation-delay: 0.6s !important;
  }

  /* Disable parallax, simplify reveals */
  .scroll-text {
    animation: none;
  }
}
```

---

## Responsive Behavior

```css
@media (max-width: 768px) {
  .hero-headline {
    font-size: clamp(3rem, 15vw, 6rem);
  }

  .grid-kinetic {
    grid-template-columns: 1fr;
  }

  .section-kinetic {
    padding: 0 24px;
  }

  /* Stack navigation vertically */
  .nav-kinetic {
    padding: 16px 24px;
  }

  .nav-links {
    gap: 20px;
    font-size: var(--text-micro);
  }
}
```

---

## Absolute Avoid List

- **Fade-up only** — the laziest animation. Use split reveals, wipes, parallax, weight shifts
- **All text animated at once** — stagger is mandatory. Simultaneous = no choreography
- **Small animated text** — kinetic type needs to be LARGE. Animating 14px body text is motion noise
- **CSS transition-only** — this style requires JS (Intersection Observer minimum, Framer Motion ideal)
- **Busy background** — the background should be near-empty. Type is the visual
- **Decorative elements competing** — no icons, illustrations, or gradients stealing attention from type
- **Forgetting prefers-reduced-motion** — this style has the highest a11y obligation of all styles
- **Over-engineering** — 3-4 animation types per page max. More = circus, not cinema

---

## Inspiration Keywords

Locomotive Scroll, Lusion, Awwwards SOTD, Aristide Benoist, Holographik, Resn, Active Theory, Tubik Studio, DIA Studio

---

## Final Check

> "If the text doesn't make you stop scrolling, the animation isn't dramatic enough."
> "Every animation should feel like it was choreographed, not configured."
> "Static screenshots of kinetic typography should still look like great design."
