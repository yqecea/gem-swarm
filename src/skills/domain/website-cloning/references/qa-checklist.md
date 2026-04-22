# QA Comparison Checklist

## Per-Section Comparison

For each major section (hero, features, testimonials, pricing, footer, etc.):

### Layout
- [ ] Same max-width / container width
- [ ] Same number of columns at each breakpoint
- [ ] Same alignment (left, center, right, justified)
- [ ] Same stacking order on mobile
- [ ] Same sticky/fixed behavior

### Typography
- [ ] Same font family (extract via getComputedStyle)
- [ ] Same font size (exact px match)
- [ ] Same font weight
- [ ] Same line-height
- [ ] Same letter-spacing
- [ ] Same text transform (uppercase, capitalize, none)
- [ ] Same text color (hex match)

### Colors
- [ ] Background colors match (hex)
- [ ] Text colors match (hex)
- [ ] Border colors match (hex)
- [ ] Accent/highlight colors match (hex)
- [ ] Gradient directions and stops match (if any)

### Spacing
- [ ] Section padding matches (top/bottom)
- [ ] Internal component padding matches
- [ ] Gaps between elements match
- [ ] Margin between sections matches

### Components
- [ ] Button styles match (padding, border-radius, background, text, hover)
- [ ] Card styles match (border, shadow, radius, padding)
- [ ] Input styles match (border, focus state, placeholder)
- [ ] Navigation styles match (active state, hover, mobile menu)
- [ ] Image aspect ratios and object-fit match

### Interactions
- [ ] Hover states reproduce accurately
- [ ] Focus states reproduce accurately
- [ ] Active/pressed states reproduce accurately
- [ ] Transition timing matches (duration, easing)
- [ ] Scroll-triggered animations match (trigger point, direction, easing)

### Media
- [ ] All images load from local public/ folder
- [ ] Image quality is acceptable (not compressed beyond recognition)
- [ ] Videos play correctly (if any)
- [ ] SVG icons render correctly
- [ ] Favicon matches (bonus)

## Viewport Comparison

Compare at these exact viewports:

| Viewport | Width | Height | Device |
|----------|-------|--------|--------|
| Desktop | 1920px | 1080px | Standard monitor |
| Laptop | 1440px | 900px | MacBook Pro |
| Tablet | 1024px | 768px | iPad landscape |
| Tablet Portrait | 768px | 1024px | iPad portrait |
| Mobile | 375px | 812px | iPhone X |
| Mobile Small | 320px | 568px | iPhone SE |

## Issue Template

```markdown
### Issue #{number}
- **Section:** {section name}
- **Severity:** Critical / Major / Minor
- **Category:** Layout / Typography / Color / Spacing / Interaction / Media
- **Original:** {what it should look like}
- **Clone:** {what it actually looks like}
- **Fix:** {specific CSS/code change needed}
```

## Completion Criteria

| Status | Criteria |
|--------|----------|
| PERFECT | Zero critical, zero major issues. Screenshot overlay test passes. |
| ACCEPTABLE | Zero critical. ≤3 major issues. All minor. |
| NEEDS_WORK | Any critical issues, or >3 major issues. |
