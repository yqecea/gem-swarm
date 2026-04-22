# Hooks Competitive Gap Analysis: gem-swarm vs. richardcb/oh-my-gemini

## Executive Summary

This report identifies the functional gaps between the `gem-swarm` hooks system and the competitor `richardcb/oh-my-gemini`. While `gem-swarm` excels in orchestration-specific hooks (handoff validation), it lacks the execution-level safety and verification hooks found in the competitor's ecosystem.

## 1. Comparison Table

| Feature | richardcb | gem-swarm | Gap | Priority | Difficulty |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **session-start** | Yes | Yes | None | - | - |
| **before-agent** | Yes | Yes | None | - | - |
| **before-tool** | Yes | Yes | None (Git Checkpoints matched) | - | - |
| **after-tool** | Yes | No | Automated verification of tool results (lint/test). | P0 | Medium |
| **tool-filter** | Yes | No | Intercept and block/modify tool calls for security. | P1 | Hard |
| **phase-gate** | Yes | No | Logic gate before phase transitions (consensus). | P0 | Medium |
| **ralph-retry** | Yes | Partial | Advanced error-aware retry logic. | P2 | Medium |
| **session-end** | No | Yes | `gem-swarm` has explicit cleanup hooks. | - | - |
| **after-agent** | No | Yes | `gem-swarm` enforces handoff report format. | - | - |

## 2. Missing Hooks: Deep Dive

### 2.1 after-tool (Auto-Verify)
- **Definition**: Triggers immediately after a tool execution completes.
- **Use Case**: Running `npm test` or `eslint` automatically after a `replace` tool modifies a source file.
- **Why it matters**: It catches regressions or syntax errors at the "unit" level of an agent's work, rather than waiting for the entire phase to fail.
- **Implementation**: Medium. Requires a mapping of tools/files to verification commands in `hooks.json`.
- **Priority**: **P0** (Critical for implementation quality).

### 2.2 tool-filter
- **Definition**: Intercepts tool calls before they are dispatched to the runtime.
- **Use Case**: Blocking `run_shell_command` if it contains destructive patterns (`rm -rf /`, `chmod 777`). Enforcing read-only agents by blocking write tools.
- **Why it matters**: Provides a robust security layer and prevents agents from deviating from their assigned "Focus"/tool profile.
- **Implementation**: Hard. Requires integration with the core tool execution loop in the extension host.
- **Priority**: **P1** (Security & Governance).

### 2.3 phase-gate
- **Definition**: Logic that must return `allow` before a phase can transition from `in_progress` to `completed`.
- **Use Case**: Ensuring a Design phase produced a valid `.md` file in the `plans/` directory. Running full integration tests before moving from Execute to Complete.
- **Why it matters**: Protects the state machine from advancing on "false positives" where an agent claims success but deliverables are missing or broken.
- **Implementation**: Medium. Can be integrated into the `mcp_gem-swarm_transition_phase` tool logic.
- **Priority**: **P0** (Workflow Integrity).

### 2.4 ralph-retry
- **Definition**: Specialized retry logic that analyzes the *content* of a failure and adjusts the next turn's prompt.
- **Use Case**: If a tool fails with "permission denied," the hook could automatically prepend a reminder about tool restrictions or request the user for permissions.
- **Why it matters**: Increases the autonomous success rate of complex tasks by learning from immediate failures.
- **Implementation**: Medium. Requires an "Error Analyzer" module to categorize failures and map them to prompt injections.
- **Priority**: **P2** (Operational Efficiency).

## 3. Strategic Recommendations

1. **Urgent (P0): Implement `phase-gate`**. Integrate this into the MCP transition tool to prevent "broken" phases from polluting the orchestration chain.
2. **High (P0): Introduce `after-tool`**. Focus first on auto-linting and file integrity checks to ensure agent output matches the requested changes.
3. **Safety (P1): Prototype `tool-filter`**. Focus on blacklisting dangerous shell commands as a first step toward full agent-specific tool governance.
