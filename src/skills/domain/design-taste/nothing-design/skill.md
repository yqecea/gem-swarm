---
name: design-taste-nothing-design
description: Senior UI/UX Engineer for industrial, monochromatic, typographically-driven interfaces inspired by Nothing, Braun, and Teenage Engineering. Swiss typography, instrument-panel precision, OLED-black surfaces, flat depth through borders not shadows.
---

# High-Agency Nothing Design Frontend Skill

> Routing note: enter this style through `../SKILL.md` first so the pack can choose the right style and component recipes before building.

## 1. ACTIVE BASELINE CONFIGURATION
* DESIGN_VARIANCE: 3 (1=Perfect Symmetry, 10=Artsy Chaos)
* MOTION_INTENSITY: 1 (1=Static/No movement, 10=Cinematic/Magic Physics)
* VISUAL_DENSITY: 5 (1=Art Gallery/Airy, 10=Pilot Cockpit/Packed Data)

**AI Instruction:** The standard baseline for this style is set to these values. Do not ask the user to edit this file. Otherwise, ALWAYS listen to the user: adapt these values dynamically based on what they explicitly request. Use these baseline (or user-overridden) values as your global variables to drive Sections 3 through 8.

## 2. DEFAULT ARCHITECTURE & CONVENTIONS
- DEPENDENCY VERIFICATION [MANDATORY]: Before importing any third-party library, check package.json. If it is missing, output the install command before using it.
- Framework & Interactivity: Default to React or Next.js. Prefer Server Components by default and isolate heavy interactivity in leaf client components.
- RSC SAFETY: Global state only belongs in client components. Wrap providers in a dedicated use client boundary.
- INTERACTIVITY ISOLATION: If strong motion, liquid glass, magnetic interactions, or heavy canvases are used, isolate them in their own client components.
- State Management: Use local useState or useReducer for local UI. Use global state only when it prevents real prop-drilling.
- Styling Policy: Use Tailwind CSS for most styling. Check package.json first and do not assume Tailwind version or plugin setup.
- ANTI-EMOJI POLICY: Do not use emojis in code, markup, text, alt text, labels, or decorative UI unless the user explicitly asks for them.
- IMAGE EXECUTION [CRITICAL]: If imagery would improve the page, include at least one real image in the hero or first two sections by default.
- VISUAL MEDIA DEFINITION: "Visual media" means actual photography, renders, illustrations, product shots, campaign imagery, or user-supplied images. Abstract gradients, particles, waveforms, or generic decorative assets do not count as the main image treatment.
- IMAGE SOURCING ORDER: First use user-supplied images when available. If image generation is available, generate fitting images when needed. If generation is not available, source fitting public web images instead of leaving the page image-less.
- COMPONENT EXECUTION [CRITICAL]: When the pack router or `components/style-recipes.md` points to shared component library files, actually open and consult those files before building. Do not skip them just to move faster.
- Responsiveness: Standardize breakpoints, contain layouts with real max widths, and aggressively simplify high-variance desktop layouts on mobile.
- Viewport Stability [CRITICAL]: Never use h-screen for the main hero. Use min-h-[100dvh] so mobile browser chrome does not break the first scene.
- Grid over Flex-Math: Do not use brittle width calc tricks for main layout. Use CSS Grid for reliable, exact structure.
- Icons: Use Lucide (thin) or Phosphor (thin) — monoline, 1.5px stroke, no fill. Never filled or multi-color icons.
- Interaction States: Always provide hover, active, focus, loading, empty, success, and error states when relevant.

## 3. NOTHING DESIGN PHILOSOPHY

- **Subtract, don't add.** Every element must earn its pixel. Default to removal.
- **Structure is ornament.** Expose the grid, the data, the hierarchy itself.
- **Monochrome is the canvas.** Color is an event, not a default — except when encoding data status.
- **Type does the heavy lifting.** Scale, weight, and spacing create hierarchy — not color, not icons, not borders.
- **Both modes are first-class.** Dark mode: OLED black. Light mode: warm off-white. Neither is "derived" — both get full design attention. Ask the user which mode to start with.
- **Industrial warmth.** Technical and precise, but never cold. A human hand should be felt.

## 4. NOTHING DESIGN CRAFT RULES

### 4.1 Visual Hierarchy: The Three-Layer Rule

Every screen has exactly **three layers of importance.** Not two, not five. Three.

| Layer | What | How |
|-------|------|-----|
| **Primary** | The ONE thing the user sees first. A number, a headline, a state. | Doto or Space Grotesk at display size. `--text-display`. 48–96px breathing room. |
| **Secondary** | Supporting context. Labels, descriptions, related data. | Space Grotesk at body/subheading. `--text-primary`. Grouped tight (8–16px) to the primary. |
| **Tertiary** | Metadata, navigation, system info. Visible but never competing. | Space Mono at caption/label. `--text-secondary` or `--text-disabled`. ALL CAPS. Pushed to edges or bottom. |

**The test:** Squint at the screen. Can you still tell what's most important? If two things compete, one needs to shrink, fade, or move.

**Common mistake:** Making everything "secondary." Evenly-sized elements with even spacing = visual flatness. Be brave — make the primary absurdly large and the tertiary absurdly small. The contrast IS the hierarchy.

### 4.2 Font Discipline

Per screen, use maximum:
- **2 font families** (Space Grotesk + Space Mono. Doto only for hero moments.)
- **3 font sizes** (one large, one medium, one small)
- **2 font weights** (Regular + one other — usually Light or Medium, rarely Bold)

Think of it as a budget. Every additional size/weight costs visual coherence. Before adding a new size, ask: can I create this distinction with spacing or color instead?

| Decision | Size | Weight | Color |
|----------|:---:|:---:|:---:|
| Heading vs. body | Yes | No | No |
| Label vs. value | No | No | Yes |
| Active vs. inactive nav | No | No | Yes |
| Hero number vs. unit | Yes | No | No |
| Section title vs. content | Yes | Optional | No |

**Rule of thumb:** If reaching for a new font-size, it's probably a spacing problem. Add distance instead.

### 4.3 Spacing as Meaning

Spacing is the primary tool for communicating relationships.

```
Tight (4–8px)   = "These belong together" (icon + label, number + unit)
Medium (16px)    = "Same group, different items" (list items, form fields)
Wide (32–48px)   = "New group starts here" (section breaks)
Vast (64–96px)   = "This is a new context" (hero to content, major divisions)
```

**If a divider line is needed, the spacing is probably wrong.** Dividers are a symptom of insufficient spacing contrast. Use them only in data-dense lists where items are structurally identical.

### 4.4 Container Strategy (prefer top)

1. **Spacing alone** (proximity groups items)
2. A single divider line
3. A subtle border outline
4. A surface card with background change

Each step down adds visual weight. Use the lightest tool that works. Never box the most important element — let it float on the background.

### 4.5 Color as Hierarchy

In a monochrome system, the gray scale IS the hierarchy. Max 4 levels per screen:

```
--text-display (100%) → Hero numbers. One per screen.
--text-primary (90%)  → Body text, primary content.
--text-secondary (60%) → Labels, captions, metadata.
--text-disabled (40%) → Disabled, timestamps, hints.
```

**Red (#D71921) is not part of the hierarchy.** It's an interrupt — "look HERE, NOW." If nothing is urgent, no red on the screen.

**Data status colors** (success green, warning amber, accent red) are exempt from the "one accent" rule when encoding data values. Apply color to the **value itself**, not labels or row backgrounds. See `references/tokens.md` for the full color system.

### 4.6 Consistency vs. Variance

**Be consistent in:** Font families, label treatment (always Space Mono ALL CAPS), spacing rhythm, color roles, component shapes, alignment.

**Break the pattern in exactly ONE place per screen:** An oversized number, a circular widget among rectangles, a red accent among grays, a Doto headline, a vast gap where everything else is tight.

This single break IS the design. Without it: sterile grid. With more than one: visual chaos.

### 4.7 Compositional Balance

**Asymmetry > symmetry.** Centered layouts feel generic. Favor deliberately unbalanced composition:
- **Large left, small right:** Hero metric + metadata stack.
- **Top-heavy:** Big headline near top, sparse content below.
- **Edge-anchored:** Important elements pinned to screen edges, negative space in center.

Balance heavy elements with more empty space, not with more heavy elements.

### 4.8 The Nothing Vibe

1. **Confidence through emptiness.** Large uninterrupted background areas. Resist filling space.
2. **Precision in the small things.** Letter-spacing, exact gray values, 4px gaps. Micro-decisions compound into craft.
3. **Data as beauty.** `36GB/s` in Space Mono at 48px IS the visual. No illustrations needed.
4. **Mechanical honesty.** Controls look like controls. A toggle = physical switch. A gauge = instrument.
5. **One moment of surprise.** A dot-matrix headline. A circular widget. A red dot. Restraint makes the one expressive moment powerful.
6. **Percussive, not fluid.** Imagine UI sounds: click not swoosh, tick not chime. Design transitions that feel mechanical and precise.

### 4.9 Visual Variety in Data-Dense Screens

When 3+ data sections appear on one screen, vary the visual form:

| Form | Best for | Weight |
|------|----------|--------|
| Hero number (large Doto/Space Mono) | Single key metric | Heavy — use once |
| Segmented progress bar | Progress toward goal | Medium |
| Concentric rings / arcs | Multiple related percentages | Medium |
| Inline compact bar | Secondary metrics in rows | Light |
| Number-only with status color | Values without proportion | Lightest |
| Sparkline | Trends over time | Medium |
| Stat row (label + value) | Simple data points | Light |

Lead section → heaviest treatment. Secondary → different form. Tertiary → lightest. The FORM varies, the VOICE stays the same.

## 5. NOTHING DESIGN ANTI-PATTERNS

- No gradients in UI chrome
- No shadows. No blur. Flat surfaces, border separation.
- No skeleton loading screens. Use `[LOADING...]` text or segmented spinner.
- No toast popups. Use inline status text: `[SAVED]`, `[ERROR: ...]`
- No sad-face illustrations, cute mascots, or multi-paragraph empty states
- No zebra striping in tables
- No filled icons, multi-color icons, or emoji as UI
- No parallax, scroll-jacking, or gratuitous animation
- No spring/bounce easing. Use subtle ease-out only: `cubic-bezier(0.25, 0.1, 0.25, 1)`
- No border-radius > 16px on cards. Buttons are pill (999px) or technical (4–8px).
- Data visualization: differentiate with **opacity** (100%/60%/30%) or **pattern** (solid/striped/dotted) before introducing color.
- Prefer opacity over position for transitions. Elements fade, don't slide.
- Hover: border/text brightens. No scale, no shadows.
- Duration: 150–250ms micro, 300–400ms transitions.

## 6. NOTHING DESIGN TYPOGRAPHY

### Font Stack

| Role | Font | Fallback | Weight |
|------|------|----------|--------|
| **Display** | `"Doto"` | `"Space Mono", monospace` | 400–700, variable dot-size |
| **Body / UI** | `"Space Grotesk"` | `"DM Sans", system-ui, sans-serif` | Light 300, Regular 400, Medium 500, Bold 700 |
| **Data / Labels** | `"Space Mono"` | `"JetBrains Mono", "SF Mono", monospace` | Regular 400, Bold 700 |

**Why these fonts:** Doto = variable dot-matrix (closest to NDot 57). Space Grotesk + Space Mono by Colophon Foundry — same foundry as Nothing's actual typefaces. Shared design DNA.

**Before starting any design work, declare which Google Fonts are required and how to load them.** Never assume fonts are already available.

### Typographic Rules

- **Doto:** 36px+ only, tight tracking, never for body text
- **Labels:** Always Space Mono, ALL CAPS, 0.06–0.1em spacing, 11–12px ("instrument panel" labels)
- **Data/Numbers:** Always Space Mono. Units as `--label` size, slightly raised, adjacent
- **Hierarchy:** display (Doto) > heading (Space Grotesk) > label (Space Mono caps) > body (Space Grotesk). Four levels max.

## 7. NOTHING DESIGN COLOR SYSTEM

### Primary Palette (Dark Mode)

| Token | Hex | Contrast on #000 | Role |
|-------|-----|-------------------|------|
| `--black` | `#000000` | — | Primary background (OLED) |
| `--surface` | `#111111` | 1.3:1 | Elevated surfaces, cards |
| `--surface-raised` | `#1A1A1A` | 1.5:1 | Secondary elevation |
| `--border` | `#222222` | — | Subtle dividers (decorative only) |
| `--border-visible` | `#333333` | — | Intentional borders, wireframe lines |
| `--text-disabled` | `#666666` | 4.0:1 | Disabled text, decorative elements |
| `--text-secondary` | `#999999` | 6.3:1 | Labels, captions, metadata |
| `--text-primary` | `#E8E8E8` | 16.5:1 | Body text |
| `--text-display` | `#FFFFFF` | 21:1 | Headlines, hero numbers |

### Accent & Status Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--accent` | `#D71921` | Signal light: active states, destructive, urgent. One per screen as UI element. Never decorative. |
| `--accent-subtle` | `rgba(215,25,33,0.15)` | Accent tint backgrounds |
| `--success` | `#4A9E5C` | Confirmed, completed, connected |
| `--warning` | `#D4A843` | Caution, pending, degraded |
| `--error` | `#D71921` | Shares accent red — errors ARE the accent moment |
| `--info` | `#999999` | Uses secondary text color |
| `--interactive` | `#007AFF` / `#5B9BF6` | Tappable text: links, picker values. Not for buttons. |

### Dark / Light Mode

| Token | Dark | Light |
|-------|------|-------|
| `--black` | `#000000` | `#F5F5F5` |
| `--surface` | `#111111` | `#FFFFFF` |
| `--surface-raised` | `#1A1A1A` | `#F0F0F0` |
| `--border` | `#222222` | `#E8E8E8` |
| `--border-visible` | `#333333` | `#CCCCCC` |
| `--text-disabled` | `#666666` | `#999999` |
| `--text-secondary` | `#999999` | `#666666` |
| `--text-primary` | `#E8E8E8` | `#1A1A1A` |
| `--text-display` | `#FFFFFF` | `#000000` |
| `--interactive` | `#5B9BF6` | `#007AFF` |

**Identical across modes:** Accent red, status colors, ALL CAPS labels, fonts, type scale, spacing, component shapes.

**Dark feel:** Instrument panel in a dark room. OLED black, white data glowing.
**Light feel:** Printed technical manual. Off-white paper (#F5F5F5), black ink. Cards = `#FFFFFF` on off-white page = subtle elevation without shadows.

## 8. TASTE CORE OVERLAY

### 8.1 QUALITY AND INTENT
- Every page must feel like a deliberate product decision, not a template fill.
- The output must feel industrially designed — like an instrument panel or a Braun product manual.
- Prefer fewer stronger ideas over many weak UI gestures.
- The result must feel premium, deliberate, and production-minded.

### 8.2 ACTIVE BASELINE INTERPRETATION
- DESIGN_VARIANCE controls structural risk, asymmetry, and compositional surprise. Nothing Design defaults to LOW variance (3) — precision over chaos.
- MOTION_INTENSITY controls how alive the interface feels. Nothing Design defaults to MINIMAL motion (1) — mechanical clicks, not fluid swooshes.
- VISUAL_DENSITY controls how tightly information is packed. Nothing Design defaults to MEDIUM-HIGH density (5) — data-rich instrument panels.
- Always adapt those values to the user's request if they clearly ask for a calmer, bolder, cleaner, denser, or more expressive result.
- If the user does not specify values, follow the baseline defined at the top.
- If the style identity and the user request conflict, blend them instead of ignoring one side.
- For example, a high-motion request inside Nothing Design should become precise mechanical motion, not fluid spring physics.
- For example, a low-density request inside Nothing Design should become spacious instrument layout, not empty generic page.
- Use the three dials continuously during generation instead of setting them once and forgetting them.

### 8.3 NOTHING-SPECIFIC DESIGN ENGINEERING
- Headlines: Doto or Space Grotesk at display sizes. Tight tracking, deliberate line breaks.
- Body: Space Grotesk, leading-normal or leading-relaxed. Max 60-70ch width.
- Labels: Space Mono, ALL CAPS, 11-12px, letter-spacing 0.06-0.1em. Always.
- Data: Space Mono for all numbers. Tabular numerals for tables.
- One clear accent color (red #D71921) and one neutral family (grayscale). Nothing else.
- The AI purple-blue aesthetic is absolutely banned. No purple gradients, no neon violet, no cyan-indigo.
- Pure black #000000 IS the page background in dark mode (OLED). This is the ONE exception to the off-black rule.
- Build the hierarchy with the grayscale (4 levels: display/primary/secondary/disabled), not with color.
- Flat white pages with no tonal hierarchy fail. Use #F5F5F5 base with #FFFFFF cards for light mode depth.

### 8.4 NOTHING-SPECIFIC CREATIVE PROACTIVITY
- Motion in Nothing Design is MECHANICAL, not fluid. Think instrument click, not spring bounce.
- Use opacity transitions, not position transitions. Elements fade in, they don't slide.
- Hover states: border brightens or text brightens. No scale transforms, no shadows, no glow.
- If motion intensity is raised by user request, keep the character mechanical: precise ease-out, discrete steps, ticker-tape reveals.
- Dot-matrix motif (Doto font, radial-gradient dot grids) is the signature decorative element. Use sparingly.
- Segmented progress bars (discrete blocks with 2px gaps) are the signature data visualization.
- Consider gauge/dial/compass motifs for instrument-like widgets.
- No glassmorphism, no blur, no gradients. Depth through border contrast and background steps only.

### 8.5 PERFORMANCE GUARDRAILS
- Never animate `top`, `left`, `width`, or `height` when transform or opacity can do the job.
- Nothing Design rarely needs grain, noise, or blur — avoid them entirely.
- Avoid giant client components for otherwise static pages.
- Keep animation cleanup explicit inside effects.
- Nothing Design's minimal motion means performance is naturally light. Preserve this.

### 8.6 TECHNICAL REFERENCE: DESIGN_VARIANCE (Nothing-tuned)
- Levels 1 to 3 (DEFAULT): Grid-aligned, symmetric or subtly asymmetric. Instrument-panel precision.
- Levels 4 to 5: Introduce offset compositions, one dominant + one supporting column.
- Levels 6 to 7: Strong asymmetry with edge-anchored elements and intentional negative space.
- Levels 8 to 10: Poster-like compositions. Oversized numbers floating on vast black. Rare for Nothing.
- High variance on desktop must still collapse cleanly on mobile.

### 8.7 TECHNICAL REFERENCE: MOTION_INTENSITY (Nothing-tuned)
- Levels 1 to 2 (DEFAULT): Hover states only. Border/text color transitions at 150-250ms ease-out.
- Levels 3 to 4: Add opacity fade-ins on scroll. Dot-matrix text reveals. Counter animations for numbers.
- Levels 5 to 6: Staggered label reveals. Segmented bar animations. Gauge needle sweeps.
- Levels 7+: Reserved for exceptional cases. Even at high motion, NO spring physics, NO bounce, NO parallax. Mechanical precision only.

### 8.8 TECHNICAL REFERENCE: VISUAL_DENSITY (Nothing-tuned)
- Levels 1 to 2: Gallery-like. One metric per screen. Maximum breathing room.
- Levels 3 to 4: Spacious instrument layout. 2-3 data groups per screen.
- Levels 5 to 6 (DEFAULT): Balanced data density. Dashboard-level information with clear grouping.
- Levels 7 to 8: Compact control panel. Multiple stat rows, tight dividers, dense grids.
- Levels 9 to 10: Mission control. Every pixel carries data. Requires flawless hierarchy to stay readable.

### 8.9 AI TELLS (FORBIDDEN PATTERNS)
- Avoid neon glows. Nothing Design has no glow, no shadow, no blur.
- Avoid oversaturated accents. Only red #D71921, and only as signal.
- Avoid huge gradient headlines. No gradients exist in Nothing Design.
- Avoid Inter as the font. Use Space Grotesk + Space Mono + Doto only.
- Avoid equal three-card feature rows. Vary visual form per section.
- Avoid generic placeholder people, SVG eggs, round fake numbers.
- Avoid startup slop: "Elevate", "Unleash", "Revolutionize".
- Avoid skeleton loading. Use `[LOADING...]` bracket text.
- Avoid toast popups. Use inline `[SAVED]`, `[ERROR: ...]` status text.
- Avoid filled icons. Monoline 1.5px stroke only.
- Avoid spring/bounce animations. Subtle ease-out only.
- Avoid making the page feel like a template or prompt artifact.

### 8.10 NOTHING-SPECIFIC CREATIVE ARSENAL
- Consider dot-matrix Doto headlines as the hero's signature visual moment.
- Consider dot-grid backgrounds (radial-gradient, 12-16px spacing, 0.1-0.2 opacity) for texture.
- Consider segmented progress bars (discrete blocks, 2px gaps, square ends) for data.
- Consider gauge/dial/compass widgets for circular data visualization.
- Consider `[ BRACKET LABELS ]` for navigation and status text.
- Consider pipe-separated navigation: `HOME | GALLERY | INFO`.
- Consider stat rows with Space Mono values and ALL CAPS labels.
- Consider instrument-panel card layouts with category labels top-left.
- Consider concentric ring/arc charts for percentage data.
- Consider hero numbers in Doto at 72px+ as the dominant visual.
- Consider underline-style inputs over bordered inputs.
- Consider inline status text over modal dialogs and toasts.

### 8.11 HERO AND PAGE CHECKSUM (Nothing-tuned)
- The hero should communicate one dominant data point, metric, or statement.
- Use Doto or large Space Mono for the hero number/headline.
- Support with Space Mono ALL CAPS labels as metadata.
- The hero must read as a complete instrument panel on first view.
- Navigation: horizontal text bar desktop, bottom bar mobile. Space Mono ALL CAPS.
- Sections should alternate between data-dense and spacious breathing room.
- Footer continues the instrument aesthetic — not a generic link dump.

## 9. PAGE AND COMPONENT CONSTRUCTION MATRIX

### 9.1 HERO SYSTEMS (Nothing-tuned)
- Use a **metrics hero** when a single number or data point drives the story.
- Use a **command hero** when the product is interaction-led.
- Use a **split hero** with data left, context right for dashboard-style pages.
- Use a **typographic hero** with Doto display text for brand/product pages.
- Give the hero one primary metric/headline, one supporting label, and one action.
- Keep support copy in Space Grotesk, max 60ch width.
- Keep buttons as Space Mono ALL CAPS pills or technical rectangles.
- On mobile, stack into clean reading order without losing instrument identity.

### 9.2 NAVIGATION SYSTEMS (Nothing-tuned)
- Desktop: horizontal text bar. Space Mono, ALL CAPS, pipe or bracket separated.
- Active state: `--text-display` + dot/underline indicator. Inactive: `--text-disabled`.
- Back button: Circular 40-44px, `--surface` background, thin chevron `<`.
- Keep nav height stable. No wrapping, no clipping.
- Sticky behavior only when orientation is unclear.

### 9.3 SECTION PACING (Nothing-tuned)
- Each section has a unique job. No repeating the same shell.
- Alternate between data-dense sections and breathing-room sections.
- Use divider lines between data rows. Use vast spacing between section groups.
- Use shifts in metric visualization form (hero number → segmented bar → stat rows) across sections.
- Proof (logos, stats, testimonials) enters as data, not as decorative cards.

### 9.4 CARD AND SURFACE SYSTEMS (Nothing-tuned)
- Cards: `--surface` or `--surface-raised` background. `1px solid --border` border. 12-16px radius. No shadows.
- Internal padding: 16-24px. Internal spacing follows the 8px base grid.
- Category label top-left: Space Mono, ALL CAPS, `--text-secondary`.
- Hero metric inside card: large Doto or Space Mono, left-aligned.
- Mix carded and uncarded sections. Never card everything.
- Active/selected rows: `--surface-raised` background + `2px solid --accent` left indicator.

### 9.5 DATA VISUALIZATION (Nothing-tuned)
- **Segmented progress bars:** Square-ended blocks, 2px gaps. Filled = status color. Empty = `--border`.
- **Bar charts:** Vertical, white fill, `--border` remainder. Square ends.
- **Line charts:** 1.5-2px `--text-display` line, dashed average `--text-secondary`. No area fill.
- **Gauges:** Thin stroke circles + tick marks, numeric readout centered.
- **Dot grids:** Vary opacity/size for heat maps. Uniform spacing.
- Always show numeric value alongside any visual. Bar = proportion, number = precision.
- Axis labels: Space Mono, `--caption`. Grid: `--border`, horizontal only. No legend boxes — label lines directly.

### 9.6 STATE PATTERNS (Nothing-tuned)
- **Error:** Input border → `--accent` + message below. Form-level: summary box `1px solid --accent`. Inline: `[ERROR]` prefix. Never red backgrounds or alert banners.
- **Empty:** Centered, 96px+ padding. Headline `--text-secondary`, 1 sentence. Optional dot-matrix illustration. No mascots.
- **Loading:** Segmented spinner (hardware-style), or segmented bar + percentage. Use `[LOADING]` bracket text.
- **Disabled:** Opacity 0.4 or `--text-disabled`. Borders fade to `--border`.

### 9.7 OUTPUT ALGORITHM
- First decide the page's central metric or promise.
- Then decide the hero system (metrics, command, typographic, split).
- Then decide the navigation posture (bracket, pipe, minimal).
- Then decide the section sequence (data-dense → breathing → data-dense).
- Then decide where proof enters as data points.
- Then decide where imagery enters (product shots, device renders — never stock lifestyle).
- Then decide the motion posture (mechanical, minimal, precise ease-out).
- Then decide the conversion moment (pill CTA, command input, inline action).
- Then decide the closing section and footer tone (instrument continuation).
- Then refine typography (Doto hero, Space Grotesk body, Space Mono labels).
- Then add states, polish, and implementation details.

## 10. FAILURE MODES AND RECOVERY LOOP
- If the result looks like a template, increase structural specificity through asymmetry and data hierarchy.
- If the result looks empty, improve composition with instrument-panel density, not filler content.
- If the result looks crowded, remove containers before shrinking typography.
- If the result looks generic, strengthen the monochrome hierarchy and Space Mono labels.
- If the result has color, remove it. Return to grayscale + one red accent.
- If shadows appear, remove them. Use border contrast only.
- If spring/bounce animations appear, replace with ease-out.
- If the hero wraps awkwardly, rewrite the headline or resize.
- If sections all look the same, vary the data visualization form.
- If the page feels too safe, add one Doto headline or one dot-matrix background.
- If the page feels chaotic, reduce to three layers and rebuild spacing.

## 11. FINAL PRE-FLIGHT CHECK
- Is the hero a complete instrument-panel first scene?
- Do headlines use Doto or Space Grotesk at display size?
- Are ALL labels in Space Mono, ALL CAPS?
- Is the color system monochrome + red accent only?
- Are there NO shadows, NO blur, NO gradients?
- Are transitions ease-out only, 150-400ms?
- Is the navigation bracket/pipe style with Space Mono?
- Are cards flat with border separation?
- Does data use segmented bars, gauges, or stat rows?
- Does loading use `[LOADING]` text, not skeletons?
- Does the page feel like an instrument panel, not a SaaS template?
- Would one screenshot feel unmistakably Nothing?

## 12. REFERENCE FILES

For detailed token values, component specs, and platform-specific guidance:

- **`references/tokens.md`** — Fonts, type scale, color system (dark + light), spacing scale, motion, iconography, dot-matrix motif
- **`references/components.md`** — Cards, buttons, inputs, lists, tables, nav, tags, segmented controls, progress bars, charts, widgets, overlays, state patterns
- **`references/platform-mapping.md`** — HTML/CSS, SwiftUI, React/Tailwind output conventions
