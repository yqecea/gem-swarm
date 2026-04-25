---
name: audit-v2
description: Execution-based code audit that forces verification through evidence, not assumptions. Replaces superficial structural reviews with functional verification. Every claim must be backed by executed proof.
---

# Audit-v2: Evidence-Based Verification

Activate this skill for any code audit, review, or quality gate where the goal is finding REAL bugs — not commenting on style. This skill supplements `code-review` and `code-review-checklist` by adding mandatory execution-based verification.

## Core Principle

**Reading code is not verification. Running code is verification.**

A review that reads `generate-stubs.js` and says "looks correct" is worthless. A review that runs `generate-stubs.js`, checks the output, and says "website-cloner has 0 tools — parser fails on multi-line YAML" is useful.

---

## The 5-Layer Methodology

Every audit MUST execute all 5 layers in order. Skipping a layer requires explicit justification.

### Layer 1: Execution Verification (MANDATORY)

**Rule:** Every claim MUST be backed by a tool invocation that PRODUCED the evidence.

Do not:
- Say "build succeeds" without showing exit code AND checking output content
- Say "agent has tools" without showing the actual tool count for EVERY agent
- Say "hook works" without triggering the hook and verifying the side-effect
- Say "tests pass" without running them and showing results

Do:
- Run the build. Check the output files contain expected data.
- Query the registry. Assert every entry has non-empty required fields.
- Execute the parser with representative inputs. Compare actual vs expected output.
- Trigger the workflow end-to-end. Verify the final state matches expectations.

**Evidence format:**
```
✅ VERIFIED: [claim]
   Command: [what was executed]
   Output: [relevant output excerpt]
   Assertion: [what was checked]
```

```
❌ FAILED: [claim]
   Command: [what was executed]
   Output: [actual output]
   Expected: [what should have been]
   Root cause: [why it failed]
```

### Layer 2: Edge Case Tracing (MANDATORY)

For every parser, transformer, generator, or data pipeline in scope:

1. **Identify input format variants.** What are ALL the ways data can be shaped?
   - Example: YAML tools can be `tools: [a, b, c]` OR multi-line `tools:\n  - a\n  - b`
2. **Feed EACH variant** through the code path (mentally trace or literally execute).
3. **Report what happens** for each variant — does it produce correct output?

The question to ask: **"What's the ONE file/input that uses a different format than all the others?"**

This is what would have caught the website-cloner bug: 19 agents use inline arrays, 1 uses multi-line lists. The parser handles inline. Nobody checked multi-line.

### Layer 3: Output Invariant Checking

Define success as **assertions on output**, not on process.

Bad:
- "Registry build is correct" (how do you know?)
- "Hooks are registered" (registered ≠ functional)

Good:
- "EVERY agent in registry has `tools.length > 0`"
- "EVERY hook lifecycle event has a handler AND the handler produces a non-empty side-effect"
- "EVERY stub file contains at least one `  - ` tool entry"

**Write these assertions. Execute them. Report results.**

When possible, add permanent assertions to the build pipeline itself so future builds catch regressions automatically.

### Layer 4: Adversarial Thinking (Architect → Skeptic → Judge)

After completing the first 3 layers, switch from verification to attack mode.

**Stage 1 — Architect (Generate hypotheses):**
For each critical component, generate 3 failure scenarios:
- **Conservative:** "What if the input is slightly malformed?" (extra whitespace, trailing comma, empty value)
- **Aggressive:** "What if the input is completely wrong?" (missing key, wrong type, corrupted file)
- **Unconventional:** "What if everything works but the ASSUMPTION is wrong?" (parser works but output format changed, build passes but consumer expects different schema)

**Stage 2 — Skeptic (Attack your own findings):**
- For each Layer 1-3 finding, ask: "Is this REALLY a problem or am I pattern-matching?"
- **Bias check — Confirmation:** "Am I finding this because I expected to find it?"
- **Bias check — Sunk Cost:** "Am I ignoring this finding because fixing it would invalidate previous work?"
- **Bias check — Survivor:** "Am I only looking at the code that EXISTS? What about the code that SHOULD exist but doesn't?"

**Stage 3 — Judge (Rate confidence):**
- For each finding, assign confidence: Low / Medium / High
- Low confidence findings go to ❓ UNVERIFIED, not 🔴 BLOCKING
- State what evidence would CHANGE your rating

**The 3 adversarial questions (MANDATORY):**
1. **"What assumptions does this code make?"** — list them, then test each one.
2. **"If I were a malicious/unusual input, how would I break this?"** — try it.
3. **"What's the one edge case nobody thought of?"** — the file that uses a different format, the config that has an empty value, the agent that has no skills.

### Layer 5: Cross-Component Chain Verification

Trace data flow ACROSS components, not just within a single file.

**Pattern: Source → Parser → Output → Consumer → Runtime**

Example from the website-cloner failure:
```
website-cloner.md (source)
  → generate-stubs.js (parser) — FAILED HERE: multi-line YAML not parsed
  → agents/website_cloner.md (stub output) — had 0 tools
  → agent-registry.json (registry) — registered with empty tools array
  → CLI runtime — agent couldn't use any tools
```

A review of generate-stubs.js in isolation would say "looks fine." Tracing the CHAIN reveals the break.

For every audit, identify the data chain and verify EACH link:
1. Is the source data in the expected format?
2. Does the parser handle ALL source format variants?
3. Does the output contain the expected data?
4. Does the consumer read the output correctly?
5. Does the runtime behave as expected with this data?

---

## Enforcement: Banned Phrases

These phrases indicate an unverified claim. If you catch yourself writing one, STOP and verify.

| Banned Phrase | Why | Required Alternative |
|---|---|---|
| "Looks correct" | No evidence provided | "Verified by executing X, output was Y" |
| "Should work" | Speculation, not verification | "Executed with input X, confirmed output Y" |
| "No issues found" | Absence of evidence ≠ evidence of absence | "Tested N scenarios, all produced expected results: [list]" |
| "Build passes" | exit 0 ≠ correct output | "Build passes AND output contains [specific assertions]" |
| "Code review complete" | Reading ≠ verification | "Reviewed N files, verified M assertions, found K issues" |
| "LGTM" | Lazy approval with no substance | "Approved: verified [specific claims] with [specific evidence]" |
| "Seems fine" | Hedging without checking | "Confirmed by [method]: [result]" |

---

## Scope Calibration

Inherit from `code-review` skill's calibration rules:

- **New files**: Full 5-layer audit
- **Modified files (behavior change)**: Layers 1-3 on the diff, Layer 5 on affected chains
- **Modified files (refactoring)**: Layer 1 (verify same outputs), Layer 3 (assert behavior preserved)
- **Deleted files**: Layer 5 (verify no broken consumers)
- **Configuration changes**: Layer 2 (edge cases in config values), Layer 5 (environment chain)
- **Build/tooling changes**: ALL 5 layers — this is where the website-cloner bug lived

---

## Severity Classification

Use the 4-tier markers from `code-review-checklist`:

- 🔴 **BLOCKING**: Verified bug, security vulnerability, data loss risk, or broken functionality
- 🟡 **IMPORTANT**: Verified logic issue, missing validation, or significant maintainability problem
- 🟢 **SUGGESTION**: Verified improvement opportunity, not a bug
- ❓ **UNVERIFIED**: Could not verify — needs manual confirmation or additional context

**New category — unique to audit-v2:**
- ⚫ **SYSTEMIC**: Same root cause appears in 3+ locations. Report once with all affected locations. (From `code-review` deduplication protocol.)

---

## Finding Format

Every finding uses this structure (adapted from `/audit_back` Rule ID format):

```
### [SEVERITY] AV2-NNN: [Title]

**File:** `path/to/file.ext:line`
**Evidence:**
  Command: [what was executed or traced]
  Actual: [what happened]
  Expected: [what should have happened]
**Impact:** [what breaks or degrades]
**Fix:** [concrete remediation]
**Chain:** [which components are affected downstream] (Layer 5 only)
```

---

## Quality Gate (Pre-Report Checklist)

Before finalizing the audit report, run this self-check (from `security-threat-model` step 8):

- [ ] Every finding has file:line evidence
- [ ] Every "verified" claim has an executed command or traced path
- [ ] No banned phrases remain in the report
- [ ] Edge case variants were tested, not just the happy path
- [ ] At least one cross-component chain was traced end-to-end
- [ ] Systemic findings are deduplicated
- [ ] The report contains at least one Layer 2 (edge case) check
- [ ] Output invariants were defined AND checked, not just stated

---

## Report Format

```markdown
# 🔍 Audit-v2 Report

## Scope
- Files reviewed: N
- Assertions executed: M
- Edge case variants tested: K
- Chains traced: L

## 🔴 Blocking (N)
[findings with full evidence]

## 🟡 Important (M)
[findings with full evidence]

## 🟢 Suggestions (K)
[findings with evidence]

## ⚫ Systemic Issues (L)
[deduplicated findings with all affected locations]

## ❓ Unverified (requires manual check)
[items that could not be verified with available tools]

## ✅ Verified Working
[things that WERE checked and confirmed correct — with evidence]

## Invariants Checked
| Invariant | Result | Evidence |
|-----------|--------|----------|
| Every agent has tools > 0 | ✅ PASS | Checked N agents |
| Build output matches expected | ✅ PASS | Compared output hash |
| ... | ... | ... |
```

---

## Integration

This skill supplements, not replaces:

| Existing Skill | What it does | audit-v2 adds |
|---|---|---|
| `code-review` | Structural review, scope calibration, deduplication | Execution-based verification (Layers 1-5) |
| `code-review-checklist` | Static checklist (security, quality, AI patterns) | Dynamic assertion checking |
| `validation` | Build/lint/test gating | Output correctness verification |
| `security-best-practices` | Framework-specific security patterns | Chain tracing through security boundaries |
| `security-threat-model` | Trust boundaries, abuse paths | Applied to code correctness, not just security |

## When NOT to use audit-v2

- Single-line typo fixes — use `code-review` alone
- Style-only changes — use `code-review-checklist` alone
- Pure documentation changes — overkill

## When to ALWAYS use audit-v2

- Build system or tooling changes (parsers, generators, registries)
- Agent or skill registration changes
- Hook modifications
- Any change that survived a previous audit without being caught
