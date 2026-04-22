---
name: redesign
description: Methodology for improving existing frontends without full rewrites. Preserves working logic while upgrading visual quality, animations, responsiveness, and design systems. Use when asked to "improve", "redesign", "polish", "upgrade the UI", or "make it look better".
---

# Redesign Skill

Upgrade existing interfaces without destroying what works. This is NOT a greenfield build skill — it's a surgical improvement methodology.

## When to Use

- Existing project needs visual upgrade or modernization
- UI feels "generic", "template-like", or "AI slop"
- Adding animations, micro-interactions, design polish to working code
- Client says "make it look better" or "it looks too basic"
- Migrating from one design system/style to another

## When NOT to Use

- Greenfield builds → use `frontend-design` + `design-taste` instead
- Pure functionality changes with no visual impact
- Backend-only changes

## Core Principle: Preserve → Audit → Upgrade → Verify

Never rewrite. Improve surgically. The user's working features are sacred.

---

## Phase 1: Preserve (MANDATORY FIRST STEP)

Before touching anything, document what EXISTS and WORKS:

### Inventory Checklist
- [ ] Map all existing components and their props/state interfaces
- [ ] Document current routing structure and navigation flow
- [ ] List all API calls, data fetching patterns, and server interactions
- [ ] Identify all third-party dependencies and their versions
- [ ] Screenshot every page/state at 375px, 768px, 1024px, 1440px
- [ ] Note all working animations and transitions
- [ ] Record any user-reported issues (these are upgrade priorities)

### Sacred Elements (DO NOT TOUCH without explicit approval)
- Business logic and data flow
- API contracts and response handling
- Authentication and authorization flows
- Form validation logic
- URL structure and routing
- Database queries or server actions

---

## Phase 2: Audit

Score each visual element on a 1-5 scale across these dimensions:

### Audit Matrix

| Element | Typography | Spacing | Color | Motion | Responsive | Score |
|---------|-----------|---------|-------|--------|------------|-------|
| Header/Nav | | | | | | /25 |
| Hero | | | | | | /25 |
| Content sections | | | | | | /25 |
| Footer | | | | | | /25 |
| Components (cards, buttons, forms) | | | | | | /25 |

### Slop Pattern Detection

Flag these common AI-generated design problems:

| Slop Pattern | Symptom | Fix Direction |
|-------------|---------|---------------|
| **Default shadows** | `shadow-md` on everything | Remove or use intentional elevation system |
| **Generic borders** | `border border-gray-200` everywhere | Use spacing/whitespace instead, or commit to a border style |
| **Template colors** | Blue primary, gray secondary | Route through `design-taste` for intentional palette |
| **Uniform radius** | `rounded-lg` on every element | Choose extreme: 0-2px (sharp) or 16-32px (soft) |
| **Weak typography** | Single font weight, no hierarchy | Establish clear weight scale (400/500/600/700) |
| **No motion** | Everything is static | Add scroll reveals, hover states, micro-interactions |
| **Placeholder feel** | Lorem ipsum vibes even with real content | Fix spacing, alignment, and visual weight |

### Priority Ranking
1. **Critical**: Broken responsiveness, accessibility failures, unusable interactions
2. **High**: Weak typography hierarchy, no visual rhythm, missing hover states
3. **Medium**: Inconsistent spacing, default colors, missing animations
4. **Low**: Minor polish items, icon upgrades, subtle refinements

---

## Phase 3: Upgrade (Surgical)

Apply fixes in order of impact. Each change must be atomic and testable.

### Typography Upgrade
- Replace system/default fonts with intentional choices
- Establish clear hierarchy: heading scale, body size, caption size
- Fix line-heights (headings: 1.1-1.2, body: 1.5-1.6)
- Add font-weight contrast (don't use single weight throughout)

### Color Upgrade
- Route through `design-taste` if available — pick a style and commit
- Replace generic blues/grays with curated palette
- Ensure sufficient contrast ratios (WCAG AA minimum)
- Add semantic color tokens (success, warning, error, info)

### Spacing Upgrade
- Establish consistent spacing scale (4, 8, 12, 16, 24, 32, 48, 64, 96px)
- Fix section breathing room (most AI designs compress too much)
- Add intentional whitespace — empty space is a design element

### Motion Upgrade
- Add scroll-triggered reveals for sections (stagger children)
- Add hover states to ALL interactive elements
- Add transition to color/background changes (150-300ms ease-out)
- Use spring physics for interactions, not linear timing
- ALWAYS include `prefers-reduced-motion` support

### Responsive Upgrade
- Fix layouts at 375px (iPhone SE), 768px (iPad), 1024px (laptop), 1440px (desktop)
- Ensure touch targets are 44px minimum
- Convert desktop multi-column to mobile stack without losing hierarchy
- Test horizontal overflow — nothing should scroll horizontally

### Component Upgrade
- Replace generic buttons with styled variants (primary, secondary, ghost)
- Add loading and disabled states to interactive elements
- Fix form inputs: proper focus states, validation feedback, label alignment
- Upgrade cards: intentional elevation, hover lift, content hierarchy

---

## Phase 4: Verify

### Before/After Validation
- [ ] Screenshot every upgraded page at all breakpoints
- [ ] Side-by-side comparison with Phase 1 screenshots
- [ ] All existing features still work identically
- [ ] No new console errors or warnings
- [ ] Performance: no regression in load time or Core Web Vitals
- [ ] Accessibility: lighthouse a11y score maintained or improved

### Quality Gate
The redesign PASSES if:
- Audit score improved by 40%+ across all dimensions
- Zero Critical/High issues remain from Phase 2 audit
- All Sacred Elements (Phase 1) are untouched
- The design would NOT be described as "generic" or "template-like"

The redesign FAILS if:
- Any working feature broke during the upgrade
- The design looks like a different site (went too far)
- Typography, color, or spacing still feel "default"
- No motion was added (static output = failure)

---

## Anti-Patterns (HARD RULES)

- Do NOT rewrite working business logic — you are upgrading visuals, not architecture
- Do NOT change component APIs/props without explicit approval
- Do NOT add new heavy dependencies (e.g., adding Framer Motion to a vanilla CSS project)
- Do NOT remove existing features "for cleanliness"
- Do NOT change URL structure or routing
- Do NOT merge redesign with feature changes — one PR per concern
