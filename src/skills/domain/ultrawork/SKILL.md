---
name: ultrawork
description: Maximum-intensity execution protocol. Activated when [ULTRAWORK ACTIVE] header is present in delegation prompt. Enforces pre-implementation gates, zero-excuses completion, anti-rationalization, and mandatory verification.
allowed-tools: Read, Write, Edit, Glob, Grep, Shell
version: 1.0
priority: CRITICAL
---

# Ultrawork Protocol — Agent Execution Rules

> **TRIGGER:** This skill activates when your delegation prompt contains `[ULTRAWORK ACTIVE]`.
> It applies ON TOP of your normal agent methodology. It does NOT replace your specialization — it intensifies it.

---

## Pre-Implementation Gate

**YOU MUST NOT START ANY IMPLEMENTATION UNTIL YOU ARE 100% CERTAIN.**

| Before writing a single line of code, you MUST: |
|--------------------------------------------------|
| **FULLY UNDERSTAND** what the orchestrator ACTUALLY wants (not what you ASSUME) |
| **READ** every file listed in "Files to modify" before changing anything |
| **HAVE A CLEAR PLAN** — if your plan is vague, YOUR WORK WILL FAIL |
| **RESOLVE ALL AMBIGUITY** — if anything is unclear, state it in your Task Report |

**Signs you are NOT ready to implement:**
- You're making assumptions about file structure
- You're unsure which files exist
- You don't understand how existing code works
- Your approach has "probably" or "maybe" in it

---

## Zero Excuses

**The orchestrator's delegation is sacred. You MUST fulfill it exactly.**

| VIOLATION | CONSEQUENCE |
|-----------|-------------|
| "I couldn't because..." | **UNACCEPTABLE.** Find a way or report a blocker. |
| "This is a simplified version..." | **UNACCEPTABLE.** Deliver FULL implementation. |
| "You can extend this later..." | **UNACCEPTABLE.** Finish it NOW. |
| "Due to limitations..." | **UNACCEPTABLE.** Use all available tools. |
| "I made some assumptions..." | **UNACCEPTABLE.** State them as explicit questions in Task Report. |

---

## Anti-Rationalization Shield

**If you catch yourself forming any of these phrases, STOP and verify.**

| If you're about to say... | It means... | Do this instead |
|---|---|---|
| "This looks correct" | You read but didn't verify | Run the build. Check the output. |
| "This is probably fine" | You're uncertain | State what's uncertain. Test it. |
| "I believe this should work" | You haven't confirmed | Run it. Then say "Verified: it works." |
| "No issues found" | You stopped looking | List what you checked and what you didn't |

**The shield is working if:** your Task Report contains specific evidence (command output, test results), not general assessments.

---

## Mandatory Verification Gates

Before reporting your phase as complete, you MUST pass ALL applicable gates:

| Gate | What to do |
|------|-----------|
| **Build** | Run the build command. It must succeed. |
| **Test** | Run tests. They must pass. |
| **Output** | Verify the output contains expected data. Check it. |
| **Integration** | Verify your changes don't break adjacent files. |

Do NOT report success based on "I believe this should work." Run it. Confirm it. Then report.

---

## Manual QA Mandate

**Type checks catch type errors, NOT functional bugs. Your work is NOT verified until you MANUALLY test it.**

| If your change... | YOU MUST... |
|---|---|
| Creates new files | Verify the files exist and have correct content |
| Adds a component | Verify it renders (describe expected output) |
| Adds a function | Call it with test inputs, show the output |
| Modifies config | Load the config, verify it parses |
| Adds CLI behavior | Run the command, show the output |
| Changes build output | Run the build, verify output files |

---

## Anti-AI-Filler

During Ultrawork, enforce strict output hygiene:

| Rule | Enforcement |
|------|-------------|
| No placeholder comments | Zero `// TODO`, `// implement here`, `// add more` |
| No type suppression | Zero `@ts-ignore`, `as any`, `eslint-disable` |
| No empty error handling | Zero `catch(e) {}` — always handle errors |
| No catch-all files | Zero `utils.ts`, `helpers.ts` with single functions |
| Comments explain WHY | Never explain WHAT the code does — it's self-documenting |
| No AI filler phrases | Zero "Here's the implementation", "Let's create" in code comments |

---

## No Partial Completion

Your phase deliverables are a contract. Every item must be delivered.

- **Every file** listed in "Files to create" MUST be created with full implementation
- **Every file** listed in "Files to modify" MUST be modified as specified
- **Every deliverable** listed MUST be present in your output
- **No stubs**: if a function exists, it has a real implementation
- **No skipped states**: if a component renders, ALL states work (loading, error, empty, success)

**The phase is NOT done until:**
1. All deliverables are implemented
2. Code compiles without errors
3. Tests pass (or were written and pass)
4. You have verified the output, not just the process

---

## Parallel Awareness

When running in Ultrawork parallel mode, you may be one of several instances of the same agent running simultaneously. Follow these rules:

1. **Own your files**: Only modify files explicitly listed in YOUR delegation prompt
2. **Don't touch shared files**: Layout files, barrel exports, and config files belong to the integration phase
3. **Export cleanly**: Make your components importable without side effects
4. **No assumptions about siblings**: Other parallel instances produce their own deliverables — don't reference them unless explicitly told to
5. **Self-contained validation**: Run validation only on YOUR files

---

## Task Report Enhancement

In Ultrawork mode, your Task Report MUST include:

```markdown
## Task Report

Status: [success|failure|partial]

### Verification Evidence
- Build: [command run] → [pass/fail]
- Test: [command run] → [pass/fail]
- Manual QA: [what was verified] → [result]

### Files Created
- [path]: [purpose]

### Files Modified
- [path]: [what changed]

### Anti-Slop Self-Check
- [ ] Zero TODO/placeholder tokens
- [ ] Zero @ts-ignore/as any
- [ ] Zero empty catch blocks
- [ ] All component states handled
- [ ] All deliverables present

## Downstream Context
[context for next phase]
```
