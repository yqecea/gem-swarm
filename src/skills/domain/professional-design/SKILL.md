---
name: professional-design
description: Advanced UX design methodology covering data visualization, error handling, loading states, feedback patterns, component specifications, theming systems, heuristic evaluation, competitive analysis, and UX writing. Use when the task requires UX depth beyond visual styling — research, interaction quality, copy, and systematic evaluation.
---

# Professional Design

Advanced UX methodology for production-grade interfaces. This skill covers what visual design skills do not: how users experience errors, loading, feedback, data, and copy. Use alongside `frontend-design` (visual principles) and `design-taste` (style routing).

## 1. Data Visualization Patterns

### When to Use
Dashboard, analytics, metrics display, progress tracking, comparison interfaces.

### Principles
- **Data-ink ratio:** Maximize data, minimize decoration. Remove gridlines, borders, and backgrounds that don't encode information.
- **Comparison is the goal:** Every chart answers a question. If you can't state the question, remove the chart.
- **Numbers first:** Always show the actual numeric value alongside any visual representation.

### Chart Selection

| Data Type | Best Chart | Avoid |
|-----------|-----------|-------|
| Part-to-whole | Stacked bar, treemap | Pie charts (hard to compare) |
| Change over time | Line chart, area chart | Bar charts (lose trend continuity) |
| Comparison | Horizontal bar, grouped bar | 3D charts, radar charts |
| Distribution | Histogram, box plot | Pie charts |
| Correlation | Scatter plot | Line charts (imply sequence) |
| Single metric | Large number + trend indicator | Gauge (unless instrument aesthetic) |

### Implementation Rules
- Label axes directly, not in legends
- Use consistent color encoding across all charts on the same page
- Highlight the insight, not just the data (annotate key points)
- Mobile: simplify to sparklines or single-metric cards, not shrunken desktop charts
- Accessibility: never rely on color alone — use patterns, labels, or position

## 2. Error Handling UX

### Principles
- **Say what happened** — clear, non-technical language
- **Say why** — brief context if it helps
- **Say what to do next** — specific, actionable step
- **Never blame the user** — "We couldn't save" not "You failed to save"

### Error Hierarchy

| Severity | Display Method | User Action Required |
|----------|---------------|---------------------|
| **Field-level** | Inline text below input, red border | Fix input |
| **Form-level** | Summary at form top, scroll to first error | Review and fix |
| **Page-level** | Banner at top of content area | Retry, navigate away |
| **System-level** | Full-page error state | Wait, retry, contact support |

### Error Message Template
```
[What happened] + [Why, if brief] + [What to do]

✓ "This email is already registered. Try signing in instead."
✗ "Error 409: Conflict in user creation endpoint."
✗ "Something went wrong. Please try again."
```

### Recovery Patterns
- **Auto-save draft:** Prevent data loss on navigation/crash
- **Retry with backoff:** Show attempt count and next retry time
- **Graceful degradation:** Show cached/stale data with staleness indicator
- **Undo over confirm:** "Document deleted. Undo?" beats "Are you sure?"

## 3. Loading States Design

### Loading Hierarchy

| Duration | Treatment |
|----------|-----------|
| 0-100ms | No indicator (perceived as instant) |
| 100-300ms | Subtle opacity change or disabled state |
| 300ms-1s | Spinner or progress indicator |
| 1-5s | Skeleton screen or progress bar with text |
| 5s+ | Progress bar with percentage + estimated time |

### Skeleton Screens
- Match the actual content layout dimensions
- Use subtle pulse animation (not shimmer — it implies horizontal loading)
- Show 2-3 content blocks max, not the entire page
- Never show skeletons for content that loads in <300ms

### Progress Indicators
- **Determinate:** When you know the total (file upload, multi-step process)
- **Indeterminate:** When duration is unknown (API call, search)
- Show what's loading: "Loading your dashboard..." not just a spinner
- For multi-step: show step labels and current position

### Optimistic UI
- Update UI immediately, roll back on failure
- Best for: toggles, likes, saves, reorders
- Avoid for: payments, deletions, irreversible actions

## 4. Feedback Patterns

### Feedback Hierarchy (closest to action = best)
1. **Inline/contextual** — color change, icon swap, text update near the trigger
2. **Component-level** — state change within the current card/form
3. **Page-level** — toast/snackbar at page edge
4. **System-level** — notification outside current view

### Feedback by Action Type

| Action | Immediate | Confirmation |
|--------|-----------|-------------|
| Toggle/switch | Visual state change | None needed |
| Form submit | Button loading state | Success message + next step |
| Delete | Item fades/removes | Undo snackbar (3-5s) |
| Save | Inline "Saved" text | None (auto-save) or brief toast |
| Upload | Progress bar | Completion + preview |
| Error | Field highlight + message | Persist until resolved |

### Principles
- Acknowledge every user action (even if just a button press animation)
- Match feedback intensity to action importance
- Provide undo rather than "Are you sure?" confirmation dialogs
- Ensure feedback is accessible: not color-only, screen-reader announced

## 5. Component Specification Format

### When Writing Component Specs

Use this structure for any reusable component:

```
## [Component Name]

### Overview
- Purpose: What problem does this solve?
- When to use / When NOT to use

### Anatomy
- Visual breakdown of sub-elements
- Required vs. optional parts

### Variants
- Size: sm / md / lg
- Style: primary / secondary / ghost / destructive
- Layout: horizontal / vertical / stacked

### Props / API
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|

### States
- Default, hover, focus, active, disabled, loading, error, success
- Each state: what changes visually + behavior

### Behavior
- Click/tap interaction
- Keyboard navigation (Tab, Enter, Escape, Arrow keys)
- Responsive behavior at breakpoints
- Edge cases (overflow, empty, max content)

### Accessibility
- ARIA role and attributes
- Focus management
- Screen reader announcement
- Color contrast requirements
```

## 6. Theming System Design

### Architecture
- Use CSS custom properties as the token layer
- Group tokens: color, typography, spacing, radius, shadow, motion
- Provide light and dark themes minimum
- Tokens should be semantic (`--color-surface`, `--color-text-primary`), not literal (`--gray-100`)

### Theme Switching
- Respect `prefers-color-scheme` as default
- Allow manual override stored in localStorage
- Apply theme class on `<html>` element, not `<body>`
- Transition between themes: opacity or color transitions, never layout shifts

### Token Naming Convention
```
--color-{role}-{modifier}    → --color-surface-raised
--text-{role}                → --text-primary
--space-{size}               → --space-md
--radius-{size}              → --radius-lg
--shadow-{level}             → --shadow-sm
```

## 7. Heuristic Evaluation Checklist

Use for UX quality audits:

| # | Heuristic | Check |
|---|-----------|-------|
| 1 | **Visibility of system status** | Does the user always know what's happening? Loading states, progress, confirmation? |
| 2 | **Match real world** | Does terminology match user language, not developer language? |
| 3 | **User control & freedom** | Can users undo, go back, escape? Emergency exits available? |
| 4 | **Consistency & standards** | Same action = same result everywhere? Platform conventions followed? |
| 5 | **Error prevention** | Are dangerous actions guarded? Inputs validated before submission? |
| 6 | **Recognition over recall** | Are options visible, not hidden? Context provided at point of decision? |
| 7 | **Flexibility & efficiency** | Shortcuts for power users? Bulk actions? Keyboard navigation? |
| 8 | **Aesthetic & minimal design** | Every element earns its place? No decorative-only elements that distract? |
| 9 | **Error recovery** | Are error messages helpful? Do they suggest solutions? Is data preserved? |
| 10 | **Help & documentation** | Is help contextual? Searchable? Task-oriented, not feature-oriented? |

### Severity Rating
- **Critical:** Blocks task completion, causes data loss
- **Major:** Significant confusion or frustration, workaround exists
- **Minor:** Cosmetic issue or minor inconvenience
- **Enhancement:** Not a problem, but could be improved

## 8. Competitive Analysis Framework

### Process
1. **Identify competitors:** Direct (same product), indirect (same need), aspirational (same quality bar)
2. **Define evaluation criteria:** Features, UX patterns, onboarding flow, pricing model, content strategy
3. **Capture evidence:** Screenshots, flow recordings, timing measurements
4. **Analyze patterns:** What do top 3 competitors do the same? Where do they differ?
5. **Identify gaps:** What does nobody do well? What's the opportunity?

### Analysis Template

| Criteria | Competitor A | Competitor B | Our Product | Opportunity |
|----------|-------------|-------------|-------------|-------------|
| Onboarding time | | | | |
| Key task completion | | | | |
| Error handling | | | | |
| Mobile experience | | | | |
| Unique value | | | | |

### Output
- Feature comparison matrix
- UX pattern library (screenshots + annotations)
- Gap analysis with prioritized opportunities
- Design recommendations with competitive evidence

## 9. UX Writing Patterns

### Microcopy Rules
- **Buttons:** Start with a verb, be specific. "Save draft" not "Submit". "Add to cart" not "Continue".
- **Labels:** Clear, concise, no jargon. "Email address" not "Electronic mail identifier".
- **Tooltips:** One sentence max. Answer "What is this?" or "Why should I care?"
- **Placeholders:** Show format example, not instructions. `john@example.com` not "Enter your email"

### Error Messages
- Say what happened + what to do: "Password must be at least 8 characters"
- Never: "Invalid input", "Error", "Something went wrong"

### Empty States
- Explain what will appear + one clear CTA
- "No projects yet. Create your first project to get started." + [Create Project] button

### Confirmation Messages
- Confirm what happened + next step if relevant
- "Project saved. Share it with your team?" Brief and positive.

### Voice Principles
- **Clear over clever:** Users are task-focused, not reading for entertainment
- **Concise over comprehensive:** One idea per message
- **Helpful over promotional:** Guide, don't sell
- **Consistent terminology:** Pick one word for each concept and stick to it
- **Consider translation:** Avoid idioms, cultural references, abbreviations
