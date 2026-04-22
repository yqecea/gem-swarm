---
name: delegation
description: Agent delegation best practices for constructing effective subagent prompts with proper scoping
---

# Delegation Skill

Activate this skill when delegating work to subagents during orchestration execution. This skill provides the templates, rules, and patterns for constructing effective delegation prompts that produce consistent, high-quality results.

## Protocol Injection

Before constructing any delegation prompt, inject the shared agent base protocol:

### Injection Steps
1. Load `agent-base-protocol` via `get_skill_content`
2. Load `filesystem-safety-protocol` via `get_skill_content`
3. Prepend both protocols to the delegation prompt (base protocol first, then filesystem safety) — these appear before the task-specific content
4. For each phase listed in the current phase's `blocked_by`, read `phases[].downstream_context` from session state and include it in the prompt
5. If any required `downstream_context` is missing, include an explicit placeholder noting the missing dependency context (never omit silently)

The injected protocol ensures every agent follows consistent pre-work procedures and output formatting regardless of their specialization.

### Context Chain Construction

Every delegation prompt must include a context chain that connects the current phase to prior work:

**Phase Context**: Include Downstream Context blocks from all completed phases that the current phase depends on (identified via `blocked_by` relationships in the implementation plan and sourced from session state `phases[].downstream_context`):
```
Context from completed phases:
- Phase [N] ([agent]): [Downstream Context summary]
  - Interfaces introduced: [list with file locations]
  - Patterns established: [list]
  - Integration points: [specific files, functions, endpoints]
  - Warnings: [list]
```

**Accumulated Patterns**: Naming conventions, directory organization patterns, and architectural decisions established by earlier phases. This ensures phase 5 does not contradict patterns set in phase 2.

**File Manifest**: Complete list of files created or modified in prior phases, so the agent knows what already exists and can import from or extend those files.

**Missing Context Fallback**: If a blocked dependency has no stored downstream context, include a visible placeholder entry in the prompt:
`- Phase [N] ([agent]): Downstream Context missing in session state — verify dependency output before implementation`

### Downstream Consumer Declaration

Every delegation prompt must declare who will consume the agent's output:
```
Your output will be consumed by: [downstream agent name(s)] who need [specific information they require]
```

This primes the agent to structure their Downstream Context section for maximum utility to the next agent in the chain.

## Settings Override Application

Before constructing any delegation prompt, resolve configurable parameters:

1. Read the agent's base definition frontmatter (`temperature`, `max_turns`, `timeout_mins`, `tools`)
2. Do not invent Maestro-level model, temperature, turn, or timeout overrides. Native delegation uses agent frontmatter defaults plus any runtime-level agent configuration already active in the session.
3. Include only task-relevant execution context in the prompt metadata
4. If the agent appears in `GEM_SWARM_DISABLED_AGENTS`, do not construct a delegation prompt — report to the orchestrator that the agent is disabled

## Delegation Prompt Template

Every delegation to a subagent must follow this structure:

```
Task: [One-line description of what to accomplish]

Progress: Phase [N] of [M]: [Phase Name]

Files to modify:
- /absolute/path/to/file1.ext: [Specific change required]
- /absolute/path/to/file2.ext: [Specific change required]

Files to create:
- /absolute/path/to/new-file.ext: [Purpose and key contents]

Deliverables:
- [Concrete output 1]
- [Concrete output 2]

Validation: [command to run after completion, e.g., "npm run lint && npm run test"]

Context:
[Relevant information from the design document or previous phases]

Do NOT:
- [Explicit exclusion 1]
- [Explicit exclusion 2]
- Modify any files not listed above
```

## Scope Boundary Rules

### Absolute Paths
Always provide absolute file paths in delegation prompts. Never use relative paths or expect agents to search for files.

### Specific Deliverables
Define exactly what the agent should produce. Vague instructions like "implement the feature" lead to inconsistent results. Instead: "Create UserService class with createUser(), getUserById(), and deleteUser() methods implementing the IUserService interface."

### Validation Criteria
Include the exact command(s) to run after completion. The agent should run these and report results. Examples:
- `npm run lint && npm run test`
- `cargo build && cargo test`
- `go vet ./... && go test ./...`
- `python -m pytest tests/`

### No Interactive Commands in Delegation Prompts
Never include interactive CLI commands in delegation prompts. Subagents run autonomously without user input. Interactive commands will hang indefinitely.

<ANTI-PATTERN>
WRONG — Delegation prompt includes interactive scaffolding:
  "Run `npx create-next-app@latest . --typescript --tailwind`"
  "Run `npm init` to create package.json"

CORRECT — Delegation prompt specifies direct file creation:
  "Create package.json with the following content: ..."
  "Create tsconfig.json, tailwind.config.ts, and src/app/layout.tsx directly"
</ANTI-PATTERN>

### Exclusions
Explicitly state what the agent must NOT do:
- Files it must not modify
- Dependencies it must not add
- Patterns it must not introduce
- Scope it must not exceed

## Agent Selection Guide

| Task Domain | Agent | Key Capability |
|-------------|-------|---------------|
| React/Next.js, UI/UX, responsive design | `frontend_specialist` | Full read/write/shell — design systems, accessibility, Taste Skill Pack |
| API, server architecture, backend logic | `backend_specialist` | Full read/write/shell — API patterns, middleware, auth |
| Schema design, queries, migrations, indexing | `database_architect` | Full read/write/shell — ORM, query optimization |
| OWASP 2025, supply chain, zero trust | `security_auditor` | Full read/write/shell + web search |
| Offensive security, exploit analysis | `penetration_tester` | Full read/write/shell + web search |
| Unit/integration testing, TDD, coverage | `test_engineer` | Full read/write/shell |
| E2E testing, Playwright, CI pipelines | `qa_automation_engineer` | Full read/write/shell |
| Root cause analysis, crash investigation | `debugger` | Read + shell (no write) |
| Profiling, Core Web Vitals, bundle size | `performance_optimizer` | Full read/write/shell + web search |
| CI/CD, deployment, server management | `devops_engineer` | Full read/write/shell + web search |
| React Native, Flutter, mobile patterns | `mobile_developer` | Full read/write/shell |
| Game mechanics, engines (Unity/Godot/Phaser) | `game_developer` | Full read/write/shell |
| Technical documentation, READMEs, API docs | `documentation_writer` | Full read/write/shell |
| Requirements, user stories, prioritization | `product_manager` | Read + shell (no write) |
| Roadmap, backlog, stakeholder management | `product_owner` | Read + shell (no write) |
| Task breakdown, dependency graphs, planning | `project_planner` | Read + shell (no write) |
| Codebase discovery, architectural analysis | `explorer_agent` | Read + shell + web search (no write) |
| Legacy code analysis, codebase archaeology | `code_archaeologist` | Read-only analysis |
| SEO, GEO, E-E-A-T, Core Web Vitals | `seo_specialist` | Read + shell + web search + write |

## Agent Tool Dispatch Contract

Delegate to the assigned agent using the dispatch pattern from `get_runtime_context` (loaded at session start, step 0). Every gem-swarm agent in the Agent Roster carries its frontmatter configuration:

- `temperature`: Controls output determinism (e.g., frontend_specialist uses 0.2 for precise code)
- `max_turns`: Prevents runaway sessions (e.g., 25-30 turns for implementation agents)
- `tools`: Restricts the agent to its authorized tool surface (e.g., read-only agents cannot use file-writing tools)
- Body: Contains the agent's specialized methodology and decision frameworks

Using a generic/default agent tool bypasses all of this — it uses default temperature, has no turn limit, no tool restrictions, and no specialized methodology. Never use a generic agent tool for gem-swarm phase delegations.

Every delegation must include the required header fields:

```
Agent: <agent_name>
Phase: <id>/<total>
Batch: <batch_id> (or "single" for sequential)
Session: <session_id>
```

**Sequential dispatch**: Invoke the agent using your runtime's dispatch mechanism with the full delegation prompt.

**Parallel dispatch**: Emit contiguous agent dispatch calls in a single turn for all agents in the ready batch. Each call includes the same header format with the shared batch ID.

Call `get_agent` with the agent name (as it appears in the implementation plan or Agent Roster) to load the agent methodology body, declared tool restrictions, and the runtime-specific `tool_name`. Use the returned `tool_name` as the dispatch target when invoking the agent tool. Runtime-local agent files remain registration stubs only; do not rely on them for the full methodology body.

## Parallel Delegation

Parallel delegation uses the runtime's native subagent scheduler. The orchestrator emits contiguous agent tool calls inside a single turn; it does not write prompt files, spawn subprocesses, or call shell-based dispatch helpers.

### Native Batch Construction

For each agent in a ready batch:

1. Build a full delegation prompt using the same template as sequential delegation
2. Include the required header:
   - `Agent: <agent_name>`
   - `Phase: <id>/<total>`
   - `Batch: <batch_id>`
   - `Session: <session_id>`
3. Keep prompts self-contained with explicit files, deliverables, validation commands, exclusions, and dependency context
4. Emit only contiguous agent tool calls for the current batch turn — no shell commands, file writes, or narration between them

Native parallel batches may pause if an agent asks a follow-up question. Scope prompts tightly enough that questions are rare.

### Same-Agent Parallel Dispatch

When the implementation plan assigns the same agent to multiple parallel phases (see Same-Agent Decomposition in implementation-planning):

1. **Unique Phase Headers**: Each dispatch MUST have a unique Phase ID:
   ```
   Agent: frontend_specialist
   Phase: 3/8
   Batch: batch-2
   Session: session-123
   Sub-task: Hero Section + CTA (components/Hero.tsx, components/CTA.tsx)
   ```

2. **Explicit File Isolation**: Each prompt lists ONLY its assigned files and explicitly excludes others:
   ```
   Files you own: components/Hero.tsx, components/CTA.tsx
   
   Do NOT create or modify files assigned to other instances:
   - components/Header.tsx (Phase 2)
   - components/Footer.tsx (Phase 4)
   - globals.css, layout.tsx, page.tsx (Integration Phase 5)
   ```

3. **Shared Design Context**: All parallel instances receive the same upstream context (foundation phase outputs, design tokens, chosen style) but produce independent deliverables.

4. **Integration Awareness**: Include in each prompt:
   ```
   Your output will be integrated with parallel work from other instances.
   Export your components cleanly. Do NOT modify shared layout files.
   Integration happens in a dedicated phase after all parallel instances complete.
   ```

### Review-Mode Delegation

When dispatching review phases from the Automatic Quality Review Pipeline:

1. **Read-Only Enforcement**: Review instances MUST NOT modify files. Override the agent's normal write capabilities:
   ```
   MODE: REVIEW ONLY
   You have READ access to all project files but MUST NOT create, modify, or delete any files.
   Your output is a structured findings report only.
   ```

2. **Focus Scoping**: Each review instance gets ONE quality dimension:
   ```
   REVIEW FOCUS: [Responsive Design / Design Compliance / Accessibility + Performance]
   Review ONLY your assigned dimension. Do not duplicate work from other reviewers.
   ```

3. **Findings Format**: Enforce structured output for downstream aggregation:
   ```
   ## Findings Report: [Focus Area]
   
   ### Critical
   - [file:line] Description. Suggested fix: ...
   
   ### Major  
   - [file:line] Description. Suggested fix: ...
   
   ### Minor
   - [file:line] Description. Suggested fix: ...
   ```

4. **Fix Phase Aggregation**: After all review instances return, aggregate all Critical + Major findings into a single Fix Phase prompt for the implementing agent.

### Tool Restriction Enforcement

gem-swarm enforces tool permissions at two levels:

**Level 1: Native enforcement (primary)**

Tool permissions are enforced natively via each agent's registered frontmatter stub. Use the `tools` array returned by `get_agent` when you mirror that restriction in the prompt. This works for both sequential and parallel delegation.

**Level 2: Prompt-based enforcement (defense-in-depth)**

Native tool permissions remain the primary boundary. As defense-in-depth, every delegation prompt should still include an explicit tool restriction block so the agent sees its allowed surface in plain language.

1. Agent Base Protocol (load `agent-base-protocol` via `get_skill_content`)
2. Filesystem Safety Protocol (load `filesystem-safety-protocol` via `get_skill_content`)
3. **TOOL RESTRICTIONS block (immediately here, before any task content)**
4. **FILE WRITING RULES block (immediately after tool restrictions)**
5. Context chain from prior phases
6. Task-specific instructions
7. Scope boundaries and prohibitions

The tool restriction block template:

```
TOOL RESTRICTIONS (MANDATORY):
You are authorized to use ONLY the following tools: [list from agent frontmatter].
Do NOT use any tools not listed above. Specifically:
- Do NOT use `write_file` or `replace` unless explicitly authorized above
- Do NOT use `run_shell_command` unless explicitly authorized above
- Do NOT create, modify, or delete files unless authorized above
Violation of these restrictions constitutes a security boundary breach.
```

Populate the tool list from the `tools` array returned by `get_agent` for the delegated agent.

The file writing rules block template:

```
FILE WRITING RULES (MANDATORY):
Use ONLY `write_file` to create files and `replace` to modify files.
Do NOT use `run_shell_command` with cat, echo, printf, heredocs, or shell redirection (>, >>) to write file content.
Shell interpretation corrupts YAML, Markdown, and special characters. This rule has NO exceptions.
```

This block reinforces the Agent Base Protocol's File Writing Rule directly in every delegation prompt, ensuring agents see the prohibition even if they skim the injected protocols.

### Non-Overlapping File Ownership
When delegating to multiple agents in parallel, ensure no two agents are assigned the same file. Each file must have exactly one owner in a parallel batch.

### Batch Completion Gates
All agents in a parallel batch must complete before:
- The next batch of phases begins
- Shared/container files are updated
- Validation checkpoints run
- The orchestrator creates a git commit for the batch

### Conflict Prevention
- Assign non-overlapping file sets to each agent
- Reserve shared files (barrel exports, configuration, dependency manifests) for a single agent or a post-batch update step
- If two phases must modify the same file, they cannot run in parallel — execute them sequentially
- Parallel agents must NOT create git commits — the orchestrator commits after validating the batch

## Hook Integration

gem-swarm hooks fire at agent boundaries during delegation, providing context injection and output validation. Understanding hook behavior is essential for constructing correct delegation prompts.

### Agent Tracking

Before each agent dispatch, a hook tracks which agent is currently executing:

- Preferred signal: the required `Agent: <agent_name>` header in the delegation prompt
- Legacy fallbacks: `GEM_SWARM_CURRENT_AGENT` from the environment, then regex-based detection of patterns like `delegate to <agent>` or `@<agent>`

The detected agent name is persisted to `/tmp/maestro-hooks/<session-id>/active-agent` and cleared by the post-delegation hook on every allowed response (both successful validation and retry allow-through). On deny (malformed output), the active agent is preserved to enable re-validation on retry.

### Session Context Injection

When an active orchestration session exists, the pre-delegation hook parses `<GEM_SWARM_STATE_DIR>/state/active-session.md` and injects a compact context line into the agent's turn:

```
Active session: current_phase=3, status=in_progress
```

This gives delegated agents awareness of where they sit in the orchestration workflow without requiring explicit context in every delegation prompt. The injection is automatic and requires no action from the orchestrator.

### Handoff Format Enforcement

After completion, the post-delegation hook validates that every subagent response contains both required handoff sections:

- `## Task Report` (or `# Task Report`)
- `## Downstream Context` (or `# Downstream Context`)

If either heading is missing:

1. **First failure**: The hook blocks the response and requests a retry with a diagnostic message specifying which section is missing.
2. **Second failure** (`stop_hook_active=true`, mapped to `stopHookActive` in JS): The hook allows the malformed response through to prevent infinite retry loops, logging a warning.

This enforcement is the runtime complement to the Output Handoff Contract defined in the agent-base-protocol. Delegation prompts do not need to re-state the retry mechanism — the hook handles it transparently.

**Exception**: The TechLead/orchestrator agent is excluded from validation. Only delegated subagents are subject to format enforcement.

## Validation Criteria Templates

### For Implementation Agents (`frontend_specialist`, `backend_specialist`, `database_architect`, `devops_engineer`, `mobile_developer`, `game_developer`)
```
Validation: [build command] && [lint command] && [test command]
```

### For Test Agents (`test_engineer`, `qa_automation_engineer`)
```
Validation: [test command]
Verify: All new tests pass, report coverage metrics
```

### For Assessment Agents (`debugger`, `explorer_agent`, `code_archaeologist`, `performance_optimizer`, `product_manager`, `product_owner`, `project_planner`)
```
Validation: N/A (assessment-only or read-only tools)
Verify: Findings reference specific files and line numbers
```

### For Security Agents (`security_auditor`, `penetration_tester`)
```
Validation: Security scan tools + manual review
Verify: Findings include severity, affected files, and remediation steps
```

### For Documentation Agents (`documentation_writer`)
```
Validation: Verify all links resolve, code examples are syntactically valid
```

### For Product Agents (`product_manager`, `product_owner`)
```
Validation: N/A (requirements and strategy artifacts)
Verify: Deliverables reference user needs and acceptance criteria
```

### For SEO Agent (`seo_specialist`)
```
Validation: SEO audit tools + Core Web Vitals check
Verify: Recommendations reference specific pages and measurable metrics
```
