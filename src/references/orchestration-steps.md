STARTUP (Turn 1 — tool calls only, no text output)
 0. If get_runtime_context appears in your available tools, call it. Carry the returned mappings (tool names, agent dispatch syntax, MCP prefix, paths) through the entire session. If unavailable, use the fallback mappings in the entry-point skill preamble.
 1. Call resolve_settings AND assess_task_complexity(task_description: <user-request text>) in PARALLEL.
    Both calls are independent — neither needs the other's output.
 2. Read the returned assess_task_complexity signals:
    - If suggested_tier is "trivial" AND tier_confidence is "high" → Jump to Instant Path (step 42). SKIP steps 3-6.
    - If suggested_tier is "trivial" AND tier_confidence is "medium" → Continue to step 3 (full startup) but carry the trivial hint forward for classification.
    - Otherwise → Continue to step 3.
 3. Call initialize_workspace(state_dir from resolve_settings) AND get_session_status in PARALLEL.
    If get_session_status returns an active session, present status and offer resume/archive.
 4. Parse GEM_SWARM_DISABLED_AGENTS from resolved settings. Exclude listed agents from all planning.
 5. STOP. Turn 1 is ONLY steps 1-4. No text, no design questions, no file reads.

CLASSIFICATION (Turn 2)
 6. Load the architecture reference: ["architecture"]. Do NOT load templates yet — they are loaded at their consumption points (steps 13, 15, 20).
 7. Classify task as trivial/simple/medium/complex using BOTH repo signals AND task signals from assess_task_complexity. Present classification with rationale.
    <HARD-GATE>
    Classification MUST consider task_signals.suggested_tier, tier_confidence, and
    tier_rationale from assess_task_complexity. Do NOT classify based solely on
    repo_size_estimate. A 500-file project with task "change port in config" is
    still trivial. A 5-file project with task "build a dashboard" is still complex.
    The task description determines scope. The repo size determines context.
    </HARD-GATE>
 8. Route:
    - trivial → Instant Path (step 42)
    - simple  → Express (step 32)
    - medium/complex → continue to step 9

DESIGN (Phase 1)
 9. Enter Plan Mode. If unavailable, follow the runtime preamble's Plan Mode fallback instructions.
10. Call `get_skill_content` with resources: ["design-dialogue"]. Follow the loaded protocol for:
    - Design depth selector (first design question)
    - Repository grounding (for existing codebases, skip for greenfield)
    - One question at a time via user prompt
    - Enrichment per chosen depth (Quick/Standard/Deep)
    <HARD-GATE>
    Technology Recommendation Gate: Before presenting technology options, re-read
    the <user-request>. If the request implies static delivery (fan site, portfolio,
    landing page, profile page) or specifies vanilla/static/no-frameworks, the
    recommended option MUST be vanilla HTML/CSS/JS. Do NOT recommend frameworks
    (Next.js, React, Vue, Svelte, Astro) unless the request explicitly requires
    server-side rendering, authentication, database queries, or real-time updates.
    </HARD-GATE>
    <ANTI-PATTERN>
    WRONG: user requests "fan site" → options include React, Next.js, Astro
    CORRECT: user requests "fan site" → recommended option is vanilla HTML/CSS/JS
    </ANTI-PATTERN>
11. Present design sections one at a time, per the design-dialogue skill's convergence protocol.
    <HARD-GATE>
    Each section must be presented individually and approved via user prompt before
    proceeding to the next. Do NOT present the full design as a single block.
    Quick depth may combine sections. Standard/Deep MUST validate individually.
    </HARD-GATE>
12. Call `get_skill_content` with resources: ["design-document"]. Write approved design document to <state_dir>/plans/ (or Plan Mode tmp path).
13. If Plan Mode is active, exit Plan Mode with the plan path. Copy approved document to <state_dir>/plans/.

PLANNING (Phase 2)
14. Call `get_skill_content` with resources: ["implementation-planning", "implementation-plan"]. Follow the loaded skill protocol.
15. Call validate_plan with the generated plan and task_complexity.
    <HARD-GATE>
    You MUST call validate_plan BEFORE presenting the plan for approval. Do NOT
    present the plan, write it to state_dir, or proceed to step 16 without first
    calling validate_plan and resolving any error-severity violations.
    validate_plan enforces server-side: phase count limits, dependency cycles,
    unknown agents, file ownership conflicts, and agent-deliverable compatibility
    (read-only agents cannot be assigned to file-creating phases). If it returns
    violations with severity "error", fix them in the plan and re-validate.
    </HARD-GATE>
16. Present plan for user approval (Approve / Revise / Abort via user prompt).
17. Write approved implementation plan to <state_dir>/plans/.

EXECUTION SETUP (Phase 3 — pre-delegation)
18. Call `get_skill_content` with resources: ["execution"]. Follow its Execution Mode Gate.
    <HARD-GATE>
    Present ONLY "Parallel" and "Sequential" as execution mode options.
    Do NOT present "Ask" as a user-facing choice — "ask" is a setting value
    that means "prompt the user", not an execution mode the user selects.
    </HARD-GATE>
19. Call `get_skill_content` with resources: ["session-management", "session-state"].
20. Create session via create_session with resolved execution_mode. Do NOT create before mode is resolved.
21. Call `get_skill_content` with resources: ["delegation", "validation", "agent-base-protocol", "filesystem-safety-protocol"].

EXECUTION (Phase 3 — delegation loop)
22. For each phase (or parallel batch): call `get_agent` for the assigned agent, then delegate using the returned methodology and tool restrictions.
    <HARD-GATE>
    Dispatch by calling the agent's registered tool directly.
    Do NOT use the built-in generalist tool or invoke agents by bare name.
    Each gem-swarm agent carries specialized methodology, tool restrictions, temperature,
    and turn limits from its frontmatter that the generalist ignores.
    </HARD-GATE>
23. After each agent returns, parse Task Report + Downstream Context from response.
24. Call transition_phase to persist results.
    <HARD-GATE>
    For parallel batches: call transition_phase INDIVIDUALLY for EVERY completed
    phase in the batch. The MCP tool writes files_created, files_modified,
    files_deleted, and downstream_context to the SPECIFIC phase identified by
    completed_phase_id. Extract each agent's Task Report separately and pass
    that agent's files and context to the corresponding phase's call. Do NOT
    merge all agents' files into one call — the archive attributes files per
    phase, so empty payloads mean lost traceability.
    </HARD-GATE>
25. Repeat steps 22-24 until all phases complete.

COMPLETION (Phase 4)
26. If the implementation plan includes a Quality Review Pipeline (auto-appended for UI tasks),
    execute the review batch: dispatch parallel review instances per the pipeline specification
    in implementation-planning. Each instance reviews ONE quality dimension (responsive/design/a11y).
    Call transition_phase individually for each review instance.
27. If review findings contain Critical or Major items, dispatch a Fix Phase to the implementing
    agent with aggregated findings. Call transition_phase for the fix phase.
28. Call `get_skill_content` with resources: ["code-review"].
29. If execution changed non-documentation files, delegate to the code reviewer agent. Block on Critical/Major findings.
    <HARD-GATE>
    If Critical/Major findings: re-delegate to the implementing agent to fix.
    The orchestrator MUST NOT write code directly.
    </HARD-GATE>
30. If GEM_SWARM_AUTO_ARCHIVE is true (or unset), call archive_session. If false, inform user session is complete but not archived.
31. Present final summary with files changed, phase outcomes, and next steps.

RECOVERY (referenced from any step on user request)
If the user says the flow moved too fast: return to the most recent unanswered approval gate.
If the user asks for implementation before approval: remind them gem-swarm requires approval first.
If the user asks to skip execution-mode: remind them parallel/sequential is required unless GEM_SWARM_EXECUTION_MODE pins it.
If an answer invalidates a prior choice: restate the updated assumption and re-run the relevant gate.
If delegation collapses to parent session without fallback approval: return to step 19 or re-scope the child-agent work packages.

EXPRESS WORKFLOW (simple tasks only — jumped to from step 8)

EXPRESS MODE GATE BYPASS: Express bypasses the execution-mode gate entirely. Express always dispatches sequentially. Do NOT prompt for parallel/sequential.

EXPRESS MCP FALLBACK: If MCP state tools (create_session, transition_phase, archive_session) are unavailable, fall back to direct file writes on <state_dir>/state/active-session.md.

32. Verify classification is simple. If task requires multiple phases or agents, override to medium → step 9.
    <HARD-GATE>
    Express sessions MUST have exactly one implementation phase with exactly one agent.
    </HARD-GATE>
33. Clarifying questions gate:
    - If task_signals.explicit_file_targets is non-empty AND the action is unambiguous:
      SKIP questions entirely. The task is self-describing.
    - Otherwise: ask at most 1 clarifying question from Area 1 (Problem Scope) only.
    <HARD-GATE>
    Questions MUST use the user prompt tool (not plain text). Use the choose
    variant with 2-4 options where possible.
    </HARD-GATE>
34. Present structured Express brief as plain text, then ask for approval.
    <HARD-GATE>
    The brief MUST be plain text output in the model response.
    The approval MUST be a SEPARATE user prompt tool call — not embedded in the
    brief text. The prompt contains only: "Approve this Express brief to proceed?"
    These are two distinct actions: first emit the brief as text, then call the
    user prompt tool for approval. Do NOT combine them into one text block.
    </HARD-GATE>
35. On approval, create session with workflow_mode: "express", exactly 1 phase.
    On rejection, revise. On second rejection, escalate to Standard → step 9.
36. Call `get_skill_content` with resources: ["agent-base-protocol", "filesystem-safety-protocol"] and prepend them to the delegation prompt.
    Include `workflow_mode: express` in the delegation prompt metadata to trigger
    the agent's Fast Pre-Flight instead of full Pre-Flight.
37. Delegate to the assigned agent.
    <HARD-GATE>
    Same dispatch rule as step 23: call agent by registered tool name, not generalist.
    </HARD-GATE>
38. Parse Task Report from the agent's response. Call transition_phase to persist results.
    <HARD-GATE>
    You MUST call transition_phase after the implementing agent returns. Extract
    files_created, files_modified, files_deleted, and downstream_context from the
    Task Report and pass them to transition_phase. Without this call, the session
    state has no record of what was delivered. Do NOT skip to code review or archive
    without calling transition_phase first.
    </HARD-GATE>
39. Code review gate:
    - If files_modified ≤ 2 AND no security-critical files touched:
      SKIP code review. Record "review_skipped: low_impact" in session state.
    - Security-critical files: any file matching .env*, auth*, secret*, *.key, *.pem,
      *.cert, docker-compose*, Dockerfile*, firewall*, .htaccess, *password*,
      *token*, *credential*, *permissions*, *policy*, *security*, *cors*.
    - Otherwise: delegate to code_reviewer.
    <HARD-GATE>
    If code review runs and returns Critical/Major findings: re-delegate to
    implementing agent (1 retry). Orchestrator MUST NOT write code directly.
    If retry fails, escalate to user.
    </HARD-GATE>
40. Call archive_session.
41. Present summary.

INSTANT WORKFLOW (trivial tasks only — jumped to from step 2 or step 8)

INSTANT MODE PRINCIPLES:
- No session created. No archive. No design phase. No plan. No subagent dispatch.
- The orchestrator executes the change DIRECTLY.
- This is the ONLY workflow where the orchestrator writes code / runs commands directly.
- Justified: subagent dispatch overhead (pre-flight, handoff, parsing) vastly exceeds
  the task itself for trivial operations. Express minimum = 5 turns; Instant = 2 turns.

INSTANT LOGGING: After completing the task, append a one-line entry to
<state_dir>/instant-log.md with format: `| <ISO-date> | <task-summary> | <files-touched> | <result> |`.
Create the file with a markdown table header if it does not exist.

42. Verify classification is trivial:
    - Task matches trivial indicators: is_config_only OR is_single_file_edit OR
      is_service_restart OR is_typo_fix (from assess_task_complexity task_signals)
    - No architectural decisions required
    - No multi-file coordination needed (estimated_files_touched ≤ 2)
    - No security-critical files involved (security_critical_files is empty)
    If ANY verification fails → escalate to Express (step 32).
    <HARD-GATE>
    Instant Path may touch at most 2 files. If the change cascades to 3+ files
    during execution, STOP, undo changes, and reclassify as simple → step 32.
    </HARD-GATE>

43. Execute the task directly:
    - Read the target file(s)
    - Make the change (edit file, update config value, etc.)
    - Run the command if needed (restart service, reload config, etc.)

44. Present the result to the user:
    - What was changed (show the diff or before/after)
    - What command was run and its output (if any)
    - Verification that the change took effect

45. Append to instant-log.md. DONE.

EXPRESS RESUME (when resuming an Express session from get_session_status)
If phase is pending: re-generate and present brief (step 34). On approval, proceed to delegation (step 37).
If phase is in_progress: re-delegate with same scope (step 37).
If phase is completed but session is in_progress: run code review (step 39), then archive (step 40).
