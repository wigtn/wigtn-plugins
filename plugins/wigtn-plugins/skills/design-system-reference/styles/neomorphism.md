# Neomorphism Style Guide

## Overview
Neomorphism (or "soft UI") creates a soft, extruded plastic look using subtle shadows. Elements appear to be made from the same material as the background, creating a tactile, 3D effect.

---

## Core Characteristics

| Aspect | Description |
|--------|-------------|
| Feel | Soft, tactile, 3D, modern |
| Shadows | Dual shadows (light + dark), soft blur |
| Colors | Muted, low contrast, same-hue variations |
| Borders | None or very subtle |
| Backgrounds | Solid, muted colors (never pure white) |

---

## Color Palette

### Light Mode
```css
:root {
  --background: #e0e5ec;      /* Muted gray-blue base */
  --foreground: #3d3d3d;
  --surface: #e0e5ec;         /* Same as background */
  --accent: #6c63ff;          /* Soft purple accent */
  --muted: #b8c0cc;
  --muted-foreground: #5c6370;

  /* Shadow colors */
  --shadow-light: rgba(255, 255, 255, 0.8);
  --shadow-dark: rgba(163, 177, 198, 0.6);
}
```

### Dark Mode
```css
.dark {
  --background: #2d3436;
  --foreground: #dfe6e9;
  --surface: #2d3436;
  --accent: #74b9ff;
  --muted: #3d4447;
  --muted-foreground: #95a5a6;

  --shadow-light: rgba(255, 255, 255, 0.05);
  --shadow-dark: rgba(0, 0, 0, 0.4);
}
```

---

## Shadow System

### Raised Elements (Convex)
```css
.neu-raised {
  background: var(--surface);
  box-shadow:
    8px 8px 16px var(--shadow-dark),
    -8px -8px 16px var(--shadow-light);
}
```

### Pressed Elements (Concave/Inset)
```css
.neu-pressed {
  background: var(--surface);
  box-shadow:
    inset 4px 4px 8px var(--shadow-dark),
    inset -4px -4px 8px var(--shadow-light);
}
```

### Flat (No elevation)
```css
.neu-flat {
  background: var(--surface);
  box-shadow: none;
}
```

### Subtle Raised
```css
.neu-subtle {
  background: var(--surface);
  box-shadow:
    4px 4px 8px var(--shadow-dark),
    -4px -4px 8px var(--shadow-light);
}
```

---

## Typography

### Recommended Fonts
- **Primary**: Inter, Outfit, Poppins
- **Monospace**: JetBrains Mono

### Hierarchy
```css
h1 {
  font-size: 2.5rem;
  font-weight: 600;
  color: var(--foreground);
  letter-spacing: -0.02em;
}

h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--foreground);
}

p {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--muted-foreground);
}
```

---

## Components

### Button
```css
.neu-button {
  background: var(--surface);
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 500;
  color: var(--foreground);
  cursor: pointer;
  box-shadow:
    6px 6px 12px var(--shadow-dark),
    -6px -6px 12px var(--shadow-light);
  transition: box-shadow 200ms ease, transform 100ms ease;
}

.neu-button:hover {
  box-shadow:
    4px 4px 8px var(--shadow-dark),
    -4px -4px 8px var(--shadow-light);
}

.neu-button:active {
  box-shadow:
    inset 3px 3px 6px var(--shadow-dark),
    inset -3px -3px 6px var(--shadow-light);
}

/* Primary button */
.neu-button-primary {
  background: var(--accent);
  color: white;
  box-shadow:
    6px 6px 12px var(--shadow-dark),
    -6px -6px 12px var(--shadow-light),
    inset 0 0 0 transparent;
}
```

### Card
```css
.neu-card {
  background: var(--surface);
  border-radius: 20px;
  padding: 24px;
  box-shadow:
    12px 12px 24px var(--shadow-dark),
    -12px -12px 24px var(--shadow-light);
}

.neu-card-inset {
  background: var(--surface);
  border-radius: 20px;
  padding: 24px;
  box-shadow:
    inset 8px 8px 16px var(--shadow-dark),
    inset -8px -8px 16px var(--shadow-light);
}
```

### Input
```css
.neu-input {
  background: var(--surface);
  border: none;
  border-radius: 12px;
  padding: 14px 18px;
  font-size: 1rem;
  color: var(--foreground);
  box-shadow:
    inset 4px 4px 8px var(--shadow-dark),
    inset -4px -4px 8px var(--shadow-light);
  transition: box-shadow 200ms ease;
}

.neu-input:focus {
  outline: none;
  box-shadow:
    inset 6px 6px 12px var(--shadow-dark),
    inset -6px -6px 12px var(--shadow-light);
}

.neu-input::placeholder {
  color: var(--muted);
}
```

### Toggle/Switch
```css
.neu-toggle {
  width: 60px;
  height: 32px;
  background: var(--surface);
  border-radius: 16px;
  position: relative;
  cursor: pointer;
  box-shadow:
    inset 4px 4px 8px var(--shadow-dark),
    inset -4px -4px 8px var(--shadow-light);
}

.neu-toggle::after {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--surface);
  box-shadow:
    3px 3px 6px var(--shadow-dark),
    -3px -3px 6px var(--shadow-light);
  transition: transform 200ms ease;
}

.neu-toggle.active::after {
  transform: translateX(28px);
  background: var(--accent);
}
```

### Progress Bar
```css
.neu-progress {
  background: var(--surface);
  height: 16px;
  border-radius: 8px;
  box-shadow:
    inset 3px 3px 6px var(--shadow-dark),
    inset -3px -3px 6px var(--shadow-light);
  overflow: hidden;
}

.neu-progress-bar {
  height: 100%;
  background: var(--accent);
  border-radius: 8px;
  box-shadow:
    2px 2px 4px var(--shadow-dark);
}
```

---

## Icon Treatment

```css
.neu-icon-button {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  border-radius: 12px;
  box-shadow:
    6px 6px 12px var(--shadow-dark),
    -6px -6px 12px var(--shadow-light);
  color: var(--muted-foreground);
  transition: all 200ms ease;
}

.neu-icon-button:hover {
  color: var(--accent);
}

.neu-icon-button:active {
  box-shadow:
    inset 3px 3px 6px var(--shadow-dark),
    inset -3px -3px 6px var(--shadow-light);
}
```

---

## Layout Patterns

### Container
```css
.neu-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px;
}
```

### Grid
```css
.neu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
}
```

---

## Accessibility Considerations

⚠️ **Important**: Neomorphism has known accessibility challenges:

1. **Low contrast**: Ensure text meets WCAG AA (4.5:1)
2. **Subtle states**: Make hover/focus states obvious
3. **Color-blind users**: Don't rely solely on shadow depth

### Improved Focus State
```css
.neu-button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
```

---

## Tailwind CSS Classes

```css
/* Add to your CSS */
.shadow-neu {
  box-shadow:
    8px 8px 16px var(--shadow-dark),
    -8px -8px 16px var(--shadow-light);
}

.shadow-neu-sm {
  box-shadow:
    4px 4px 8px var(--shadow-dark),
    -4px -4px 8px var(--shadow-light);
}

.shadow-neu-inset {
  box-shadow:
    inset 4px 4px 8px var(--shadow-dark),
    inset -4px -4px 8px var(--shadow-light);
}
```

---

## Do's and Don'ts

### ✅ Do
- Use muted, same-hue backgrounds (never pure white/black)
- Apply consistent shadow direction (top-left light source)
- Use rounded corners (12-24px)
- Keep designs simple with few elements
- Add subtle hover/active states

### ❌ Don't
- Use on busy backgrounds or images
- Mix with other shadow styles
- Apply to small/detailed elements (icons, small text)
- Use sharp corners
- Overuse - limit to key interactive elements
