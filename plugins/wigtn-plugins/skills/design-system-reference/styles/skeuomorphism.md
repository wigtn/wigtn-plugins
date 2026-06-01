# Skeuomorphism Style Guide

## Core Philosophy
- Digital objects mimic real-world counterparts
- Texture, depth, and physicality create familiarity
- Every surface tells a material story
- Realism earns trust through recognition
- Craft and detail signal quality

---

## Core Characteristics

| Aspect | Description |
|--------|-------------|
| Feel | Tactile, realistic, warm, premium |
| Textures | Leather, brushed metal, wood grain, linen, felt |
| Shadows | Realistic multi-layered (ambient + directional) |
| Borders | Embossed, debossed, or inset edge highlights |
| Gradients | Subtle surface curvature (convex/concave) |
| Icons | Glossy, 3D-rendered, photorealistic |

---

## AI Slop Prevention Warning

Skeuomorphism is easy to do badly. **Absolutely avoid**:

- Slapping a leather texture PNG on everything
- Inconsistent light sources across components
- Over-glossy buttons that look like candy
- Mixing realistic and flat elements randomly
- Using stock textures without color-matching
- Making every element look like a physical object (pick key elements)

**Pick 2-3 dominant materials and stay consistent.**

---

## Color Palette

### Warm Neutral Base
```css
:root {
  /* Surface materials */
  --color-leather: #8B6914;
  --color-leather-dark: #5C4A1E;
  --color-brushed-metal: #C0C0C0;
  --color-dark-metal: #4A4A4A;
  --color-wood: #DEB887;
  --color-wood-dark: #8B7355;
  --color-linen: #FAF0E6;
  --color-felt: #2F4F2F;

  /* Base colors */
  --color-bg: #E8E0D4;
  --color-surface: #D4C8B8;
  --color-text: #2C2417;
  --color-text-muted: #6B5D4F;
  --color-accent: #B8860B;
  --color-accent-hover: #DAA520;

  /* Shadows */
  --shadow-ambient: rgba(0, 0, 0, 0.15);
  --shadow-directional: rgba(0, 0, 0, 0.3);
  --highlight-edge: rgba(255, 255, 255, 0.4);
}
```

### Dark Variant (Wood Desk Theme)
```css
.dark {
  --color-bg: #1C1710;
  --color-surface: #2A2318;
  --color-text: #E8DCC8;
  --color-text-muted: #A09080;
  --color-accent: #DAA520;

  --shadow-ambient: rgba(0, 0, 0, 0.4);
  --shadow-directional: rgba(0, 0, 0, 0.6);
  --highlight-edge: rgba(255, 255, 255, 0.08);
}
```

---

## Typography

### Principles
- Serif fonts for headings (classic, trustworthy)
- Clean sans-serif for body (readability on textured backgrounds)
- Embossed or debossed text effects on surfaces
- Never pure black text on textured surfaces

### Recommended Fonts
```css
/* Headings - Classic serif */
--font-heading: 'Playfair Display', serif;
--font-heading: 'Lora', serif;
--font-heading: 'Merriweather', serif;

/* Body - Clean sans */
--font-body: 'Source Sans 3', sans-serif;
--font-body: 'Nunito Sans', sans-serif;

/* Special - Handwritten/script for labels */
--font-label: 'Caveat', cursive;
```

### Type Scale
```css
--text-display: clamp(2rem, 4vw, 3.5rem);
--text-heading: clamp(1.5rem, 3vw, 2.25rem);
--text-subheading: 1.25rem;
--text-body: 1rem;
--text-caption: 0.875rem;
--text-small: 0.75rem;
```

### Text Effects
```css
/* Embossed text (raised from surface) */
.skeu-text-embossed {
  color: var(--color-surface);
  text-shadow:
    0 1px 1px var(--highlight-edge),
    0 -1px 1px var(--shadow-ambient);
}

/* Debossed text (pressed into surface) */
.skeu-text-debossed {
  color: transparent;
  background: var(--color-surface);
  background-clip: text;
  -webkit-background-clip: text;
  text-shadow:
    0 1px 1px var(--highlight-edge);
  filter: drop-shadow(0 -1px 0 var(--shadow-directional));
}

/* Stamped/printed text */
.skeu-text-stamped {
  color: var(--color-text);
  text-shadow: 0 1px 0 var(--highlight-edge);
  letter-spacing: 0.05em;
}
```

---

## Material Textures

### CSS-Only Textures (No Images)
```css
/* Brushed metal */
.skeu-metal {
  background:
    repeating-linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.03) 1px,
      transparent 2px
    ),
    linear-gradient(
      180deg,
      #d4d4d4 0%,
      #b8b8b8 30%,
      #c8c8c8 50%,
      #b0b0b0 70%,
      #c0c0c0 100%
    );
}

/* Leather grain */
.skeu-leather {
  background:
    url("data:image/svg+xml,%3Csvg width='6' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='6' height='6' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E"),
    linear-gradient(160deg, #8B6914 0%, #6B4E12 50%, #7A5C13 100%);
  background-size: 6px 6px, 100% 100%;
}

/* Wood grain */
.skeu-wood {
  background:
    repeating-linear-gradient(
      95deg,
      transparent,
      rgba(139, 115, 85, 0.1) 2px,
      transparent 4px
    ),
    linear-gradient(
      180deg,
      #DEB887 0%,
      #C9A86C 25%,
      #D4B07A 50%,
      #BF9B5E 75%,
      #D2AE74 100%
    );
}

/* Linen/fabric */
.skeu-linen {
  background:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 3px,
      rgba(0, 0, 0, 0.02) 3px,
      rgba(0, 0, 0, 0.02) 4px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 3px,
      rgba(0, 0, 0, 0.02) 3px,
      rgba(0, 0, 0, 0.02) 4px
    ),
    #FAF0E6;
}

/* Felt/velvet */
.skeu-felt {
  background:
    url("data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='1.2' numOctaves='3'/%3E%3C/filter%3E%3Crect width='4' height='4' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E"),
    #2F5233;
  background-size: 4px 4px, 100% 100%;
}
```

---

## Shadow System

### Principles
- Light source: top-left (consistent across ALL elements)
- Every raised element needs ambient + directional shadow
- Edge highlights simulate surface curvature
- Shadows get softer and larger with more elevation

```css
/* Elevation levels */
.skeu-elevation-1 {
  box-shadow:
    0 1px 2px var(--shadow-ambient),
    0 2px 4px var(--shadow-ambient),
    inset 0 1px 0 var(--highlight-edge);
}

.skeu-elevation-2 {
  box-shadow:
    0 2px 4px var(--shadow-ambient),
    0 4px 8px var(--shadow-ambient),
    0 8px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 var(--highlight-edge);
}

.skeu-elevation-3 {
  box-shadow:
    0 4px 8px var(--shadow-ambient),
    0 8px 16px var(--shadow-ambient),
    0 16px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 var(--highlight-edge),
    inset 0 -1px 0 rgba(0, 0, 0, 0.05);
}

/* Inset (pressed into surface) */
.skeu-inset {
  box-shadow:
    inset 0 2px 4px var(--shadow-directional),
    inset 0 -1px 0 var(--highlight-edge);
}
```

---

## UI Components

### Button (Glossy Push Button)
```css
.skeu-button {
  background: linear-gradient(
    180deg,
    #f0f0f0 0%,
    #d8d8d8 50%,
    #c0c0c0 100%
  );
  border: 1px solid #999;
  border-radius: 8px;
  padding: 10px 24px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  box-shadow:
    0 2px 4px var(--shadow-ambient),
    0 4px 8px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
  transition: all 0.1s ease;
}

.skeu-button:hover {
  background: linear-gradient(
    180deg,
    #f8f8f8 0%,
    #e0e0e0 50%,
    #c8c8c8 100%
  );
}

.skeu-button:active {
  background: linear-gradient(
    180deg,
    #c0c0c0 0%,
    #d0d0d0 50%,
    #d8d8d8 100%
  );
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 -1px 0 rgba(255, 255, 255, 0.3);
  transform: translateY(1px);
}

/* Primary action button */
.skeu-button-primary {
  background: linear-gradient(
    180deg,
    #5B9BD5 0%,
    #3A7CC0 50%,
    #2A6CAF 100%
  );
  border-color: #1E5A9A;
  color: #fff;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.3);
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.2),
    0 4px 8px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
}
```

### Card (Paper on Desk)
```css
.skeu-card {
  background: linear-gradient(
    180deg,
    #FFFFF8 0%,
    #FAFAF2 100%
  );
  border: 1px solid #D4C8B0;
  border-radius: 4px;
  padding: 24px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.12),
    0 4px 8px rgba(0, 0, 0, 0.08),
    0 8px 24px rgba(0, 0, 0, 0.06);
  /* Subtle paper texture */
  background-image:
    url("data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='4' height='4' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
  background-size: 4px 4px;
}

/* Stacked papers effect */
.skeu-card-stacked {
  position: relative;
}

.skeu-card-stacked::before,
.skeu-card-stacked::after {
  content: '';
  position: absolute;
  left: 4px;
  right: 4px;
  bottom: -4px;
  height: 4px;
  background: #F0EAE0;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.skeu-card-stacked::after {
  left: 8px;
  right: 8px;
  bottom: -8px;
  background: #E8E0D4;
}
```

### Input (Engraved Field)
```css
.skeu-input {
  background: linear-gradient(
    180deg,
    #E8E0D4 0%,
    #F0EAE0 4px,
    #FFFFF8 8px,
    #FFFFF8 100%
  );
  border: 1px solid #B8A88C;
  border-radius: 6px;
  padding: 12px 16px;
  font-size: 1rem;
  color: var(--color-text);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.12),
    inset 0 1px 2px rgba(0, 0, 0, 0.08),
    0 1px 0 var(--highlight-edge);
  transition: box-shadow 0.2s ease;
}

.skeu-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.12),
    0 0 0 3px rgba(218, 165, 32, 0.2),
    0 1px 0 var(--highlight-edge);
}

.skeu-input::placeholder {
  color: var(--color-text-muted);
  font-style: italic;
}
```

### Toggle (Physical Switch)
```css
.skeu-toggle {
  width: 64px;
  height: 32px;
  background: linear-gradient(
    180deg,
    #C8C0B4 0%,
    #D8D0C4 100%
  );
  border-radius: 16px;
  border: 1px solid #A09080;
  position: relative;
  cursor: pointer;
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.15),
    0 1px 0 var(--highlight-edge);
}

.skeu-toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(
    180deg,
    #F8F8F8 0%,
    #E0E0E0 100%
  );
  border: 1px solid #B0B0B0;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transition: transform 0.2s ease;
}

.skeu-toggle.active {
  background: linear-gradient(
    180deg,
    #3A7CC0 0%,
    #5B9BD5 100%
  );
  border-color: #1E5A9A;
}

.skeu-toggle.active .skeu-toggle-knob {
  transform: translateX(32px);
}
```

### Slider (Knob/Dial)
```css
.skeu-slider-track {
  width: 100%;
  height: 8px;
  background: linear-gradient(
    180deg,
    #B8B0A4 0%,
    #D0C8BC 100%
  );
  border-radius: 4px;
  box-shadow:
    inset 0 2px 3px rgba(0, 0, 0, 0.15),
    0 1px 0 var(--highlight-edge);
  position: relative;
}

.skeu-slider-fill {
  height: 100%;
  background: linear-gradient(
    180deg,
    #5B9BD5 0%,
    #3A7CC0 100%
  );
  border-radius: 4px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.skeu-slider-thumb {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 35% 35%, #F8F8F8, #D0D0D0),
    linear-gradient(180deg, #E8E8E8, #C0C0C0);
  border: 1px solid #999;
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  cursor: grab;
}
```

---

## Layout

### Principles
- Structured, orderly layouts (desktops, shelves, dashboards)
- Clear spatial hierarchy through elevation
- Group related elements on shared surfaces
- Use "container" metaphors (drawers, panels, folders)

```css
/* Desk surface layout */
.skeu-desk {
  min-height: 100vh;
  padding: 2rem;
}

/* Sidebar (wooden drawer) */
.skeu-sidebar {
  width: 280px;
  padding: 1.5rem;
  border-right: 1px solid #B8A88C;
  box-shadow:
    2px 0 8px rgba(0, 0, 0, 0.1),
    inset -1px 0 0 var(--highlight-edge);
}

/* Toolbar (metal strip) */
.skeu-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-bottom: 1px solid #999;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
}

/* Content area grid */
.skeu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  padding: 24px;
}
```

---

## Interaction & Motion

### Principles
- Physical, weight-based animations
- Buttons depress when clicked (translateY + shadow change)
- Switches flick with slight overshoot
- Drawers slide with friction
- No bouncy/elastic effects (feels cheap)

```css
/* Physical press */
.skeu-press {
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.skeu-press:active {
  transform: translateY(1px) scale(0.99);
}

/* Drawer slide */
.skeu-drawer-enter {
  animation: drawerSlide 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

@keyframes drawerSlide {
  from {
    transform: translateX(-100%);
    opacity: 0.8;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Page turn */
.skeu-page-turn {
  animation: pageTurn 0.5s ease-in-out;
  transform-origin: left center;
}

@keyframes pageTurn {
  0% { transform: perspective(1200px) rotateY(0); }
  100% { transform: perspective(1200px) rotateY(-90deg); opacity: 0; }
}

/* Knob rotation */
.skeu-knob {
  transition: transform 0.15s ease-out;
  cursor: grab;
}
```

---

## Absolute Avoid List

- Inconsistent light direction across elements
- Flat/solid colors on supposedly textured surfaces
- Mixing realistic and flat/minimal styles
- Over-glossy everything (pick: matte or glossy, not both everywhere)
- Skeuomorphic elements with no real-world counterpart
- Heavy bitmap textures that slow rendering (use CSS-only)
- Ignoring accessibility (textures can reduce readability)

---

## Inspiration Keywords

- Dieter Rams industrial design
- Apple iOS 1-6 era
- Audio equipment (amplifiers, mixers)
- Moleskine notebooks
- Wooden dashboards
- Leather-bound journals
- Analog instruments (gauges, dials)

---

## Final Check

> Every surface should feel like you could reach out and touch it.
> Pick a material palette (2-3 materials max) and commit.
> If the light source is inconsistent, the illusion breaks. Check every shadow.
