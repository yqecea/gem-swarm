---
name: output-guard
description: Anti-incomplete-output protocol. Prevents AI from leaving work unfinished, generating placeholder content, or stopping mid-implementation. Use when quality-critical output is required.
---

# Output Guard Skill

Prevents the most common AI failure mode: **stopping before the work is done.**

## Problem Statement

AI models frequently:
- Generate the first 60% of a file and stop with `// ... rest of implementation`
- Create component stubs without actual logic
- Leave `TODO` comments as if someone else will finish
- Produce a hero section and skip the rest of the page
- Generate CSS for desktop and skip mobile entirely
- Build the happy path and ignore error/loading/empty states

This skill enforces completion.

## Completion Rules (MANDATORY)

### Rule 1: No Placeholders
```
FORBIDDEN tokens in any output:
- // TODO
- // ... rest of implementation
- // implement here
- // add more as needed
- {/* placeholder */}
- Lorem ipsum (unless explicitly a design placeholder)
- "Coming soon" sections
- Empty function bodies
- Commented-out code blocks as "examples"
```

If you cannot complete a section, state WHY and what is needed — do not leave a stub.

### Rule 2: Every File is Complete
A file is complete when:
- [ ] All imports resolve to real modules
- [ ] All functions have real implementations (not stubs)
- [ ] All types/interfaces are fully defined
- [ ] All error handling is implemented (not just `catch (e) {}`)
- [ ] All component states are handled (loading, error, empty, success)
- [ ] The file would pass `tsc --noEmit` and linting

### Rule 3: Every Page is Complete
A page is complete when:
- [ ] ALL sections are implemented (not just hero + one section)
- [ ] Responsive layout works at 375px, 768px, 1024px, 1440px
- [ ] All interactive elements have hover/focus/active states
- [ ] Navigation actually navigates (no dead links)
- [ ] Forms actually submit (or have clear disabled states)
- [ ] Images have actual `src` attributes (not empty or broken)

### Rule 4: Every Component is Complete
A component is complete when:
- [ ] All props are typed and documented
- [ ] Default/hover/focus/active/disabled states exist
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen readers can announce it properly (ARIA)
- [ ] It renders correctly in light and dark modes (if applicable)

### Rule 5: Self-Audit Before Reporting Done
Before saying "task complete", verify:

```
COMPLETION CHECKLIST (answer honestly):
1. Did I implement EVERY section mentioned in the brief? (not just the interesting ones)
2. Did I handle ALL breakpoints? (not just desktop)
3. Did I add ALL interactive states? (not just default)
4. Did I leave ANY TODO/placeholder/stub? (search the output)
5. Would this ship to production AS-IS? (not "with minor tweaks")
```

If ANY answer is "no" → finish the work before reporting done.

## Enforcement Mechanism

When this skill is active, the orchestrator or reviewing agent should check for:

1. **Grep scan**: Search all created/modified files for forbidden tokens
2. **Section count**: Compare brief requirements to actual implemented sections
3. **Breakpoint check**: Verify responsive rules exist (not just desktop CSS)
4. **State coverage**: Check that components handle more than just the happy path

## Integration with Review Pipeline

The Automatic Quality Review Pipeline (from implementation-planning) should include output completeness as part of its Design Compliance review dimension. Incomplete output is a **Critical** severity finding.
