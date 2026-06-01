# Glassmorphism Style

## Core Philosophy
- Beauty of depth and layers
- Harmony of light and transparency
- Soft yet clear hierarchy
- Futuristic yet gentle
- Restrained elegance, never overdone

---

## ⚠️ AI Slop Prevention Warning

Glassmorphism is one of the most overused styles by AI.
**Absolutely avoid** the following:

- Applying blur + transparency to every element
- Rainbow gradient backgrounds
- White border + purple background combos
- Meaningless blur spam
- Overlapping layers without clear distinction

**Use glassmorphism on only 2-3 key elements.**

---

## Background

A great background is essential for glass effects to shine.

### Principles
- Needs gradient or colorful background
- Mesh gradients that aren't too complex
- Blobs or circular gradients recommended
- Background itself is a design element

### CSS Examples
```css
/* Mesh gradient */
.glass-bg {
  background: 
    radial-gradient(ellipse at 20% 30%, rgba(124, 58, 237, 0.5) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(59, 130, 246, 0.5) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 90%, rgba(236, 72, 153, 0.3) 0%, transparent 40%),
    #0f0f23;
  min-height: 100vh;
}

/* Animated blobs */
.glass-blob {
  position: absolute;
  width: 40vw;
  height: 40vw;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: float 20s ease-in-out infinite;
}

.blob-1 { background: #7c3aed; top: 10%; left: 10%; }
.blob-2 { background: #3b82f6; bottom: 20%; right: 10%; animation-delay: -7s; }
.blob-3 { background: #ec4899; top: 50%; left: 50%; animation-delay: -14s; }

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(10%, -10%) scale(1.1); }
  50% { transform: translate(-5%, 15%) scale(0.95); }
  75% { transform: translate(-10%, -5%) scale(1.05); }
}
```

---

## Glass Cards (Core Element)

### Principles
- Semi-transparent background (using backdrop-filter)
- Subtle border (light reflection effect)
- Shadow for floating effect
- **Not too transparent** (readability matters)

### CSS Examples
```css
/* Basic glass card */
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Dark mode glass */
.glass-card-dark {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
}

/* Light mode glass */
.glass-card-light {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

/* Layered - nested glass */
.glass-card-inner {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1.5rem;
}
```

---

## Typography

### Principles
- Clean sans-serif
- Ensure readability on translucent backgrounds
- Appropriate weight contrast
- Light text + subtle shadow

### Recommended Fonts
```css
--font-primary: 'Plus Jakarta Sans', sans-serif;
--font-primary: 'Outfit', sans-serif;
--font-primary: 'Satoshi', sans-serif;
--font-primary: 'General Sans', sans-serif;

/* System fonts (performance-focused) */
--font-system: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
```

### Typography Styles
```css
.glass-heading {
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.glass-text {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.7;
}

.glass-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
```

---

## Color Palette

### Dark Theme (Recommended)
```css
--color-bg-start: #0f0f23;
--color-bg-end: #1a1a3e;
--color-text: #ffffff;
--color-text-muted: rgba(255, 255, 255, 0.6);
--color-glass-bg: rgba(255, 255, 255, 0.08);
--color-glass-border: rgba(255, 255, 255, 0.12);
--color-accent: #818cf8; /* Indigo */
--color-accent-2: #34d399; /* Emerald */
```

### Light Theme
```css
--color-bg: #f0f4ff;
--color-text: #1e293b;
--color-text-muted: #64748b;
--color-glass-bg: rgba(255, 255, 255, 0.6);
--color-glass-border: rgba(255, 255, 255, 0.8);
--color-accent: #6366f1;
```

### Accent Gradients
```css
.glass-accent-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.glass-accent-gradient-vibrant {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}
```

---

## UI Components

### Buttons
```css
.glass-button {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 0.875rem 1.5rem;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.glass-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* Accent button */
.glass-button-accent {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
}

.glass-button-accent:hover {
  box-shadow: 0 6px 30px rgba(102, 126, 234, 0.6);
  transform: translateY(-2px);
}
```

### Input Fields
```css
.glass-input {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.glass-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.glass-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
}
```

---

## Icons

```css
.glass-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Gradient icon */
.glass-icon-gradient {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
}
```

---

## Animation

### Principles
- Smooth and elegant movement
- Use ease-out or cubic-bezier curves
- Subtle lift on hover
- Not too fast

```css
/* Hover lift */
.glass-lift {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-lift:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

/* Fade in */
.glass-fade-in {
  opacity: 0;
  transform: translateY(20px);
  animation: glassFadeIn 0.8s ease-out forwards;
}

@keyframes glassFadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Glow pulse */
.glass-glow {
  animation: glowPulse 3s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 30px rgba(102, 126, 234, 0.3); }
  50% { box-shadow: 0 0 50px rgba(102, 126, 234, 0.5); }
}
```

---

## Layout Tips

```css
/* Glass card grid */
.glass-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Centered hero */
.glass-hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}
```

---

## Absolute Avoid List

- Applying blur to every element
- Rainbow gradient backgrounds
- Too high transparency (poor readability)
- Excessive shadow stacking
- Ignoring browser compatibility (need backdrop-filter fallback)
- Reckless blur without performance consideration

---

## Final Check

> Glassmorphism should focus on 2-3 key elements.
> The background must be beautiful for glass to shine.
> Balance between transparency and readability is key.
