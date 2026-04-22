---
name: website-cloning
description: Methodology for pixel-perfect website cloning. Covers style extraction techniques, Tailwind arbitrary value matching, asset management, and QA comparison workflows. Use when cloning or replicating existing websites.
---

# Website Cloning Methodology

Technical methodology for extracting and reproducing website designs with pixel-perfect fidelity.

## 1. Style Extraction

### Color Extraction
```javascript
// Extract all unique colors from a page
() => {
  const elements = document.querySelectorAll('*');
  const colors = new Set();
  elements.forEach(el => {
    const style = window.getComputedStyle(el);
    ['color', 'backgroundColor', 'borderColor', 'outlineColor'].forEach(prop => {
      const val = style[prop];
      if (val && val !== 'rgba(0, 0, 0, 0)' && val !== 'transparent') {
        colors.add(val);
      }
    });
  });
  return [...colors];
}
```

### Typography Extraction
```javascript
// Extract font usage across the page
() => {
  const elements = document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,a,button,li,label,input');
  const fonts = {};
  elements.forEach(el => {
    const style = window.getComputedStyle(el);
    const key = `${style.fontFamily}|${style.fontSize}|${style.fontWeight}`;
    if (!fonts[key]) {
      fonts[key] = {
        family: style.fontFamily,
        size: style.fontSize,
        weight: style.fontWeight,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
        tag: el.tagName,
        sample: el.textContent?.slice(0, 50)
      };
    }
  });
  return Object.values(fonts);
}
```

### Spacing Extraction
```javascript
// Extract section-level spacing patterns
() => {
  const sections = document.querySelectorAll('section, [class*="section"], main > div');
  return [...sections].map(s => {
    const style = window.getComputedStyle(s);
    return {
      tag: s.tagName,
      class: s.className?.slice(0, 80),
      padding: style.padding,
      margin: style.margin,
      gap: style.gap,
      maxWidth: style.maxWidth
    };
  });
}
```

### Animation Extraction
- Observe scroll behavior: are elements fading in, sliding, scaling?
- Check `transition` and `animation` CSS properties via getComputedStyle
- Note hover state changes on buttons, cards, navigation items
- Record timing: duration, delay, easing function

## 2. Tailwind Arbitrary Value Matching

### Color Matching
```
Original: rgb(26, 43, 60) → Tailwind: bg-[#1a2b3c]
Original: rgba(0,0,0,0.5) → Tailwind: bg-black/50
Original: hsl(210, 40%, 17%) → Convert to hex first → bg-[#1a2b3c]
```

### Typography Matching
```
font-size: 15px     → text-[15px]
font-weight: 500    → font-medium (or font-[500])
line-height: 1.6    → leading-[1.6]
letter-spacing: 0.02em → tracking-[0.02em]
font-family: custom → font-['CustomFont'] (with tailwind config)
```

### Spacing Matching
```
padding: 120px 0    → py-[120px]
gap: 24px           → gap-[24px] (or gap-6 if close to 4px grid)
max-width: 1200px   → max-w-[1200px]
margin: 0 auto      → mx-auto
```

### Rule: Prefer arbitrary values over closest standard
When cloning, **exact match** is more important than clean Tailwind:
- `text-[15px]` > `text-base` (which is 16px — wrong)
- `py-[120px]` > `py-28` (which is 112px — wrong)
- `bg-[#1a2b3c]` > `bg-slate-800` (which is approximate — wrong)

## 3. Asset Management

### Image Downloads
- Use `evaluate_script` to find all `img` src URLs
- Download with descriptive names: `hero-background.jpg`, `feature-icon-speed.svg`
- Store in `public/images/`, reference as `/images/hero-background.jpg`

### Font Loading
- Extract Google Fonts URLs from `<link>` tags or `@import` rules
- If custom fonts: document the font family name and provide a similar Google Font alternative
- Add font `<link>` to the component or layout

### SVG Extraction
- Inline SVGs: copy the SVG markup directly into the component
- External SVGs: download to `public/icons/`
- Prefer inline for small icons, external for large illustrations

## 4. QA Comparison

Detailed methodology in `references/qa-checklist.md`.

**Quick visual test:**
1. Open original and clone side by side
2. Take screenshots at same viewport size
3. Compare section by section
4. Check: colors, fonts, spacing, alignment, hover states, animations
5. Document every difference, no matter how small

## Reference Files

- `references/extraction-patterns.md` — Advanced extraction scripts
- `references/qa-checklist.md` — Comprehensive QA comparison checklist
