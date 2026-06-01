# 3D Immersive Style

## Core Philosophy
- Depth is the primary design language
- Space exists on all three axes, not just two
- Every element has a physical presence in a scene
- Light and shadow define spatial relationships
- Movement reveals structure, not decoration

---

## Typography

Typography inhabits the **scene**, not just the surface.

### Principles
- Headlines use perspective transforms for dramatic depth
- Body text stays flat and readable on stable planes
- Type scale reinforces z-axis hierarchy (closer = larger)
- Subtle text-shadow enhances the sense of floating
- Avoid transforming body copy; reserve 3D for display type

### Recommended Fonts
```css
/* Primary (geometric, spatial feel) */
--font-primary: 'Space Grotesk', sans-serif;

/* Secondary (clean, system-grade readability) */
--font-secondary: 'Inter', sans-serif;

/* Tertiary (modern, sharp edges) */
--font-tertiary: 'Geist', sans-serif;

/* Monospace (data, code, HUD overlays) */
--font-mono: 'JetBrains Mono', monospace;
```

### Type Scale
```css
--text-hero: clamp(3rem, 8vw, 6rem);
--text-title: clamp(1.75rem, 4vw, 3rem);
--text-subtitle: clamp(1.125rem, 2vw, 1.5rem);
--text-body: 1rem;
--text-small: 0.875rem;
--text-caption: 0.75rem;

/* Letter spacing */
--tracking-tight: -0.03em;
--tracking-normal: 0;
--tracking-wide: 0.05em;
```

### CSS Examples
```css
/* Perspective headline that recedes into the scene */
.immersive-headline {
  font-family: var(--font-primary);
  font-size: var(--text-hero);
  font-weight: 700;
  color: #f0f0f0;
  text-shadow:
    0 2px 4px rgba(0, 0, 0, 0.3),
    0 8px 24px rgba(0, 0, 0, 0.15);
  transform: perspective(800px) rotateX(2deg);
  transform-origin: bottom center;
}

/* Floating label with z-offset */
.immersive-label {
  font-size: var(--text-caption);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  color: rgba(255, 255, 255, 0.5);
  transform: translateZ(20px);
}
```

---

## Layout

### Principles
- Establish a perspective container at the page or section level
- Layer content across multiple z-planes
- Use translateZ to create real depth separation, not just shadow tricks
- Isometric grids for dashboard and data-heavy layouts
- Parallax layers scroll at different speeds to reinforce depth
- Preserve-3d on parent containers to allow nested transforms

### CSS Examples
```css
/* Perspective scene container */
.scene {
  perspective: 1200px;
  perspective-origin: 50% 50%;
  overflow: hidden;
  min-height: 100vh;
}

/* 3D transform container */
.scene-inner {
  transform-style: preserve-3d;
  position: relative;
}

/* Depth layers for parallax */
.layer-back {
  transform: translateZ(-300px) scale(1.3);
  position: absolute;
  inset: 0;
}

.layer-mid {
  transform: translateZ(-100px) scale(1.1);
  position: relative;
}

.layer-front {
  transform: translateZ(0px);
  position: relative;
  z-index: 2;
}

.layer-float {
  transform: translateZ(80px);
  position: relative;
  z-index: 3;
}

/* Isometric grid layout */
.isometric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  transform: rotateX(45deg) rotateZ(-45deg);
  transform-style: preserve-3d;
}

.isometric-grid > * {
  transform: rotateZ(45deg) rotateX(-45deg);
}

/* Subtle isometric tilt (less extreme, more usable) */
.isometric-subtle {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  transform: perspective(1200px) rotateX(5deg) rotateY(-3deg);
  transform-style: preserve-3d;
}

/* Depth-stacked sections */
.depth-section {
  position: relative;
  padding: clamp(4rem, 10vh, 8rem) clamp(1.5rem, 5vw, 4rem);
  transform-style: preserve-3d;
}

.depth-section + .depth-section {
  margin-top: -5vh;
  transform: translateZ(30px);
}
```

---

## Color

### Principles
- Dark backgrounds create the illusion of infinite depth
- Light elements appear to float forward; dark elements recede
- Use gradients as depth cues (lighter = closer to viewer)
- Accent colors glow and emit light into the scene
- Keep base palette restrained; let lighting do the work

### Recommended Palettes
```css
/* Palette 1: Deep Space */
--color-bg: #08090d;
--color-surface: #12141a;
--color-surface-raised: #1a1d26;
--color-text: #e8e8ec;
--color-text-muted: rgba(232, 232, 236, 0.5);
--color-accent: #6366f1;
--color-accent-glow: rgba(99, 102, 241, 0.4);

/* Palette 2: Midnight Ocean */
--color-bg: #060b18;
--color-surface: #0d1526;
--color-surface-raised: #152038;
--color-text: #d4dff0;
--color-text-muted: rgba(212, 223, 240, 0.45);
--color-accent: #38bdf8;
--color-accent-glow: rgba(56, 189, 248, 0.35);

/* Palette 3: Dark Carbon */
--color-bg: #0a0a0a;
--color-surface: #161616;
--color-surface-raised: #222222;
--color-text: #fafafa;
--color-text-muted: rgba(250, 250, 250, 0.4);
--color-accent: #a78bfa;
--color-accent-glow: rgba(167, 139, 250, 0.35);

/* Depth gradient (apply to backgrounds) */
--gradient-depth: radial-gradient(
  ellipse at 50% 0%,
  var(--color-surface-raised) 0%,
  var(--color-bg) 70%
);
```

---

## Borders & Shapes

### Principles
- Borders are subtle or absent; depth replaces outlines
- Use soft, large border-radius for floating panels (16-24px)
- Hard edges only for grounded, architectural elements
- Shapes cast real shadows that shift with perspective
- Beveled edges and inner highlights simulate thickness

### CSS Examples
```css
/* Floating panel with depth border */
.immersive-panel {
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: var(--color-surface);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.04) inset;
}

/* Beveled card with simulated thickness */
.immersive-card-thick {
  border-radius: 16px;
  background: linear-gradient(
    145deg,
    var(--color-surface-raised) 0%,
    var(--color-surface) 100%
  );
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.3);
  border-right: 1px solid rgba(0, 0, 0, 0.2);
}

/* Grounded architectural element */
.immersive-base {
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.03);
  background: var(--color-surface);
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.6);
}
```

---

## UI Components

### Principles
- Buttons physically press and depress along the z-axis
- Cards tilt toward the cursor to reveal perspective
- Inputs sit recessed into the surface plane
- Interactive elements have spatial hover states
- Use translateZ for push/pull instead of translateY alone

### CSS Examples
```css
/* 3D press button */
.immersive-button {
  background: var(--color-accent);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 0.875rem 1.75rem;
  font-family: var(--font-primary);
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transform: perspective(600px) translateZ(0);
  box-shadow:
    0 6px 20px var(--color-accent-glow),
    0 2px 4px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.immersive-button:hover {
  transform: perspective(600px) translateZ(10px);
  box-shadow:
    0 12px 32px var(--color-accent-glow),
    0 4px 8px rgba(0, 0, 0, 0.3);
}

.immersive-button:active {
  transform: perspective(600px) translateZ(-4px);
  box-shadow:
    0 2px 8px var(--color-accent-glow),
    0 1px 2px rgba(0, 0, 0, 0.4);
  transition-duration: 0.05s;
}

/* Ghost button with depth outline */
.immersive-button-ghost {
  background: transparent;
  color: var(--color-text);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 0.875rem 1.75rem;
  font-family: var(--font-primary);
  font-weight: 500;
  cursor: pointer;
  transform: perspective(600px) translateZ(0);
  transition: all 0.25s ease;
}

.immersive-button-ghost:hover {
  border-color: rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.04);
  transform: perspective(600px) translateZ(6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

/* Recessed input field */
.immersive-input {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 0.875rem 1.25rem;
  font-family: var(--font-secondary);
  font-size: 1rem;
  color: var(--color-text);
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4);
  transition: all 0.25s ease;
}

.immersive-input::placeholder {
  color: var(--color-text-muted);
}

.immersive-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow:
    inset 0 2px 6px rgba(0, 0, 0, 0.4),
    0 0 0 3px var(--color-accent-glow);
}

/* Tilt card on hover (apply via JS for mouse tracking, or CSS for fixed tilt) */
.immersive-card {
  background: var(--color-surface);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transform: perspective(800px) rotateX(0) rotateY(0);
  transform-style: preserve-3d;
  transition: transform 0.4s ease, box-shadow 0.4s ease;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
}

.immersive-card:hover {
  transform: perspective(800px) rotateX(2deg) rotateY(-3deg) translateZ(10px);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    -5px 5px 20px rgba(0, 0, 0, 0.2);
}

/* Card flip */
.flip-card {
  perspective: 1000px;
  width: 300px;
  height: 400px;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.flip-card:hover .flip-card-inner {
  transform: rotateY(180deg);
}

.flip-card-front,
.flip-card-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: 20px;
  background: var(--color-surface);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.flip-card-back {
  transform: rotateY(180deg);
  background: var(--color-surface-raised);
}

/* Depth-aware link */
.immersive-link {
  color: var(--color-accent);
  text-decoration: none;
  position: relative;
  transition: all 0.2s ease;
}

.immersive-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--color-accent);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s ease;
}

.immersive-link:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

.immersive-link:hover {
  text-shadow: 0 0 12px var(--color-accent-glow);
}

/* Floating badge / HUD element */
.immersive-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  font-size: var(--text-caption);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  color: var(--color-accent);
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 100px;
  transform: perspective(400px) translateZ(30px);
  box-shadow: 0 4px 16px var(--color-accent-glow);
}
```

---

## Interaction & Motion

### Principles
- Motion should reinforce spatial relationships
- Elements enter the scene by traveling along the z-axis
- Hover reveals depth through tilt, lift, or glow
- Transitions use cubic-bezier for physicality, not linear
- Parallax scrolling must have at least 3 distinct speed layers
- Floating idle animations breathe life into static scenes

### CSS Examples
```css
/* Enter from depth (z-axis fade in) */
.immersive-enter {
  opacity: 0;
  transform: perspective(800px) translateZ(-80px) translateY(30px);
  animation: enterFromDepth 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes enterFromDepth {
  to {
    opacity: 1;
    transform: perspective(800px) translateZ(0) translateY(0);
  }
}

/* Staggered depth entrance */
.immersive-stagger > * {
  opacity: 0;
  transform: perspective(800px) translateZ(-60px);
  animation: enterFromDepth 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.immersive-stagger > *:nth-child(1) { animation-delay: 0s; }
.immersive-stagger > *:nth-child(2) { animation-delay: 0.1s; }
.immersive-stagger > *:nth-child(3) { animation-delay: 0.2s; }
.immersive-stagger > *:nth-child(4) { animation-delay: 0.3s; }
.immersive-stagger > *:nth-child(5) { animation-delay: 0.4s; }

/* Floating idle animation */
.immersive-float {
  animation: floatIdle 6s ease-in-out infinite;
}

@keyframes floatIdle {
  0%, 100% {
    transform: translateY(0) translateZ(0);
  }
  50% {
    transform: translateY(-12px) translateZ(8px);
  }
}

/* Orbit rotation for decorative elements */
.immersive-orbit {
  animation: orbit 20s linear infinite;
  transform-style: preserve-3d;
}

@keyframes orbit {
  from {
    transform: rotateY(0deg) translateZ(120px) rotateY(0deg);
  }
  to {
    transform: rotateY(360deg) translateZ(120px) rotateY(-360deg);
  }
}

/* Parallax scroll layers (use with JS scroll listener) */
.parallax-container {
  perspective: 1px;
  overflow-x: hidden;
  overflow-y: auto;
  height: 100vh;
}

.parallax-layer-deep {
  transform: translateZ(-3px) scale(4);
  position: absolute;
  inset: 0;
}

.parallax-layer-mid {
  transform: translateZ(-1px) scale(2);
  position: absolute;
  inset: 0;
}

.parallax-layer-surface {
  transform: translateZ(0);
  position: relative;
}

/* Interactive depth shadow (shadow shifts on hover) */
.depth-shadow {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  transition: box-shadow 0.4s ease, transform 0.4s ease;
}

.depth-shadow:hover {
  box-shadow:
    0 25px 60px rgba(0, 0, 0, 0.5),
    0 5px 15px rgba(0, 0, 0, 0.3);
  transform: translateY(-4px);
}

/* Scene transition with 3D rotation */
@keyframes sceneRotateIn {
  from {
    opacity: 0;
    transform: perspective(1000px) rotateY(-15deg) translateX(-50px);
  }
  to {
    opacity: 1;
    transform: perspective(1000px) rotateY(0) translateX(0);
  }
}

.scene-enter {
  animation: sceneRotateIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

---

## Textures & Effects

```css
/* Ambient light gradient overlay */
.immersive-ambient::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 30% 20%,
    rgba(99, 102, 241, 0.08) 0%,
    transparent 60%
  );
  pointer-events: none;
  z-index: 1;
}

/* Grid floor for spatial reference */
.immersive-grid-floor::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: -50%;
  width: 200%;
  height: 60vh;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(0deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  transform: perspective(500px) rotateX(60deg);
  transform-origin: bottom center;
  mask-image: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
  pointer-events: none;
}

/* Depth fog (fades distant elements) */
.immersive-fog {
  mask-image: linear-gradient(
    to bottom,
    black 0%,
    black 60%,
    transparent 100%
  );
}

/* Glow pulse on accent elements */
.immersive-glow {
  position: relative;
}

.immersive-glow::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: inherit;
  background: var(--color-accent);
  opacity: 0;
  filter: blur(20px);
  z-index: -1;
  animation: glowPulse 3s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0.3; }
}

/* Particle field (CSS-only dots) */
.immersive-particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.immersive-particles > span {
  position: absolute;
  width: 2px;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: particleDrift 15s linear infinite;
}

@keyframes particleDrift {
  from {
    transform: translateY(100vh) translateZ(0);
    opacity: 0;
  }
  10% { opacity: 1; }
  90% { opacity: 1; }
  to {
    transform: translateY(-10vh) translateZ(50px);
    opacity: 0;
  }
}

/* Scanline HUD overlay */
.immersive-scanline::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    transparent,
    transparent 3px,
    rgba(0, 0, 0, 0.05) 3px,
    rgba(0, 0, 0, 0.05) 4px
  );
  pointer-events: none;
}
```

---

## Absolute Avoid List

- Flat designs with no depth differentiation
- Pure white backgrounds (destroys depth illusion)
- Over-rotating elements past 15 degrees (causes disorientation)
- Applying perspective transforms to body text (kills readability)
- translateZ on every element (creates visual chaos)
- Ignoring transform-style: preserve-3d on parent containers
- Animations longer than 1s for interactive feedback
- Mixing 2D box-shadow-only depth with real 3D transforms inconsistently
- Forgetting backface-visibility: hidden on flipped elements
- Neglecting performance; always use will-change and GPU-composited properties sparingly

---

## Inspiration Keywords

- Spatial computing interfaces
- Holographic UI
- Architectural depth
- Cinematic parallax
- Isometric game worlds
- Cockpit and HUD dashboards
- Three.js and WebGL landing pages
- Apple Vision Pro spatial design
- Stage lighting and theater depth
- Layered paper dioramas

---

## Final Check

> Every screen should feel like a window into a three-dimensional scene.
> Elements must occupy real space, cast real shadows, and respond to the viewer
> with physical presence. Depth is not decoration; it is the structure itself.
