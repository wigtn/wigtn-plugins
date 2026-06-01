# Brutalist Style

## Core Philosophy
- Raw, unpolished, unapologetic
- Rules exist to be broken
- Discomfort is a design choice
- Function dominates form
- Authentic over pretty

---

## Typography

Typography is your **weapon**.

### Principles
- Massive, aggressive headlines
- Extreme weight contrast (Thin vs Black)
- Extremely tight or wide letter-spacing
- Heavy use of uppercase
- Text should dominate the screen

### Recommended Fonts
```css
/* Heavy impact */
--font-headline: 'Monument Extended', sans-serif;
--font-headline: 'Archivo Black', sans-serif;
--font-headline: 'Bebas Neue', sans-serif;

/* Monospace (system feel) */
--font-mono: 'JetBrains Mono', monospace;
--font-mono: 'IBM Plex Mono', monospace;
--font-mono: 'Space Mono', monospace;

/* Body */
--font-body: 'IBM Plex Sans', sans-serif;
--font-body: 'Work Sans', sans-serif;
```

### Type Scale
```css
--text-mega: clamp(4rem, 15vw, 12rem);  /* Screen domination */
--text-hero: clamp(3rem, 10vw, 8rem);
--text-title: clamp(1.5rem, 4vw, 3rem);
--text-body: 1rem;
--text-small: 0.875rem;

/* Extreme tracking */
--tracking-compressed: -0.05em;
--tracking-expanded: 0.3em;
```

---

## Layout

### Principles
- Grid? Destroy it.
- Intentional misalignment
- Collision and overlap of elements
- Extreme whitespace or no whitespace at all
- Scroll direction is experimental territory

### CSS Examples
```css
.brutal-layout {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 0; /* No gap */
}

/* Intentional misalignment */
.brutal-offset {
  transform: rotate(-2deg);
  margin-left: -2rem;
}

/* Overlap */
.brutal-overlap {
  position: relative;
  z-index: 1;
  margin-top: -30vh;
}

/* Full bleed */
.brutal-full {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
}

/* Extreme padding */
.brutal-section {
  padding: 20vh 5vw;
}
```

---

## Color

### Principles
- High contrast is key
- Use primary colors raw
- Black and white as base
- Fluorescent and neon allowed
- Color is a message

### Recommended Palettes
```css
/* Palette 1: Classic Brutal */
--color-bg: #FFFFFF;
--color-text: #000000;
--color-accent: #FF0000;

/* Palette 2: Dark Brutal */
--color-bg: #000000;
--color-text: #FFFFFF;
--color-accent: #00FF00;

/* Palette 3: Warning */
--color-bg: #FFFF00;
--color-text: #000000;
--color-accent: #FF0000;

/* Palette 4: System */
--color-bg: #0000FF;
--color-text: #FFFFFF;
--color-accent: #FFFF00;
```

---

## Borders & Shapes

### Principles
- Thick borders = identity
- Rounded corners? Forbidden.
- Boxes should look like boxes
- Shadows are hard (no blur)

### CSS Examples
```css
.brutal-box {
  border: 4px solid #000;
  background: #FFF;
}

.brutal-box-accent {
  border: 4px solid #000;
  background: #FF0000;
  color: #FFF;
}

/* Hard shadow */
.brutal-shadow {
  box-shadow: 8px 8px 0 #000;
}

.brutal-shadow-color {
  box-shadow: 8px 8px 0 #FF0000;
}

/* Hover movement */
.brutal-button {
  border: 3px solid #000;
  background: #FFFF00;
  padding: 1rem 2rem;
  font-weight: 900;
  text-transform: uppercase;
  transition: transform 0.1s, box-shadow 0.1s;
  box-shadow: 4px 4px 0 #000;
}

.brutal-button:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #000;
}

.brutal-button:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 #000;
}
```

---

## UI Components

### Principles
- Buttons are big and clear
- Input fields have thick borders too
- Hover effects are direct and immediate
- Animations are fast and sharp

### CSS Examples
```css
.brutal-input {
  border: 3px solid #000;
  padding: 1rem;
  font-size: 1rem;
  background: #FFF;
  width: 100%;
}

.brutal-input:focus {
  outline: none;
  background: #FFFF00;
}

.brutal-link {
  color: #000;
  text-decoration: none;
  border-bottom: 3px solid #000;
  padding-bottom: 2px;
}

.brutal-link:hover {
  background: #000;
  color: #FFF;
}

/* Marquee/Ticker */
.brutal-marquee {
  overflow: hidden;
  white-space: nowrap;
  border-top: 3px solid #000;
  border-bottom: 3px solid #000;
  padding: 1rem 0;
}

.brutal-marquee-content {
  display: inline-block;
  animation: marquee 20s linear infinite;
}

@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
```

---

## Interaction & Motion

### Principles
- Fast and immediate
- Minimize bounce and easing
- Glitch effects OK
- Unexpected movement OK

### CSS Examples
```css
/* Immediate transitions */
.brutal-instant {
  transition: all 0.05s linear;
}

/* Glitch effect */
@keyframes glitch {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(2px, -2px); }
  60% { transform: translate(-2px, -2px); }
  80% { transform: translate(2px, 2px); }
}

.brutal-glitch:hover {
  animation: glitch 0.3s ease-in-out;
}

/* Cursor changes */
.brutal-cursor {
  cursor: crosshair;
}

.brutal-cursor-grab {
  cursor: grab;
}
```

---

## Textures & Effects

```css
/* Noise overlay */
.brutal-noise::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* Noise pattern */
  opacity: 0.1;
  pointer-events: none;
}

/* Scanlines */
.brutal-scanlines::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.1) 2px,
    rgba(0, 0, 0, 0.1) 4px
  );
  pointer-events: none;
}
```

---

## Absolute Avoid List

- Soft gradients
- Rounded corners
- Pastel colors
- Subtle shadows
- "Safe" layouts
- Gentle animations

---

## Inspiration Keywords

- Poster design
- Punk culture
- Construction site warning signs
- 90s web
- Experimental typography
- Anti-design

---

## Final Check

> If people look at a brutalist design and think "Is this even allowed?"—you've succeeded.
> Discomfort, rawness, authenticity—that is brutalism.
