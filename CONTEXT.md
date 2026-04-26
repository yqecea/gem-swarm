# gem-swarm Context

> Auto-generated from codebase on 2026-04-26 10:34:26 UTC
> Regenerate: `node scripts/generate-context.js`

---

## Stats

| Metric | Value |
|--------|-------|
| Agents | 20 |
| Skills | 57 |
| MCP Tools | 12 |
| Hook Events | 5 |
| Settings | 8 |
| JS Files (src/) | 77 |

## Architecture

```
gemini-extension.json    ← Extension manifest (hooks, MCP, settings)
├── mcp/gem-swarm-server.js → src/mcp/maestro-server.js
│   └── src/mcp/handlers/   ← MCP tool implementations
├── hooks/ (via gemini-extension.json "hooks" key)
│   └── hook-runner.js → src/platforms/shared/hook-runner.js
│       ├── src/generated/hook-registry.json  ← hook name → module mapping
│       └── src/hooks/logic/*-logic.js        ← hook implementations
├── src/generated/
│   ├── agent-registry.json   ← built by scripts/build-registries.js
│   └── resource-registry.json
└── src/lib/                  ← Pure utils (NO imports from src/core/)
```

## How to Add a Hook

Hooks MUST be in `gemini-extension.json` → `"hooks"` key. Flat format:

```json
"HookEvent": [
  {
    "type": "command",
    "command": "node \"${extensionPath}/hooks/hook-runner.js\" gemini <hook-name>",
    "name": "gem-swarm-<hook-name>",
    "description": "...",
    "timeout": 10000
  }
]
```

Valid events: `SessionStart`, `BeforeAgent`, `BeforeTool`, `AfterTool`, `AfterAgent`, `SessionEnd`

Then:
1. Create `src/hooks/logic/<hook-name>-logic.js` exporting `handle<HookName>(ctx)`
2. Add entry to `src/generated/hook-registry.json`
3. Run `bash scripts/verify-hooks-loaded.sh` to validate

> ⚠️ NEVER put hooks in a separate `hooks/hooks.json` — CLI ignores it.

### Current Hooks

| Event | Name | Matcher |
|-------|------|---------|
| SessionStart | `gem-swarm-session-start` | * |
| BeforeAgent | `gem-swarm-before-agent` | * |
| BeforeTool | `gem-swarm-git-checkpoint` | write_file|replace |
| AfterAgent | `gem-swarm-after-agent` | * |
| SessionEnd | `gem-swarm-session-end` | * |

## How to Add an MCP Tool

1. Create handler in `src/mcp/handlers/<tool-name>.js`
2. Export: `{ name, description, inputSchema, handler }`
3. The tool is auto-discovered by `src/mcp/core/tool-registry.js`

### Current MCP Tools

- `initialize_workspace`
- `assess_task_complexity`
- `validate_plan`
- `resolve_settings`
- `create_session`
- `get_session_status`
- `update_session`
- `transition_phase`
- `archive_session`
- `get_skill_content`
- `get_agent`
- `get_runtime_context`

## How to Add an Agent

1. Create `src/agents/<agent-name>.md` with YAML frontmatter
2. Required frontmatter: `name`, `capabilities`, `tools.gemini`
3. Run `node scripts/build-registries.js` to rebuild registry
4. Verify with `node -e "console.log(require('./src/generated/agent-registry.json').length)"`

### Current Agents

| Agent | Capabilities |
|-------|-------------|
| `backend-specialist` | full |
| `code-archaeologist` | read_only |
| `database-architect` | full |
| `debugger` | read_only |
| `devops-engineer` | full |
| `documentation-writer` | full |
| `explorer-agent` | read_shell |
| `frontend-specialist` | full |
| `game-developer` | full |
| `mobile-developer` | full |
| `penetration-tester` | full |
| `performance-optimizer` | full |
| `product-manager` | read_shell |
| `product-owner` | read_shell |
| `project-planner` | read_shell |
| `qa-automation-engineer` | full |
| `security-auditor` | full |
| `seo-specialist` | full |
| `test-engineer` | full |
| `website-cloner` | full |

## Extension Settings

| Name | Env Var |
|------|---------|
| Disabled Agents | `GEM_SWARM_DISABLED_AGENTS` |
| Max Retries | `GEM_SWARM_MAX_RETRIES` |
| Auto Archive | `GEM_SWARM_AUTO_ARCHIVE` |
| Validation | `GEM_SWARM_VALIDATION_STRICTNESS` |
| State Directory | `GEM_SWARM_STATE_DIR` |
| Max Concurrent | `GEM_SWARM_MAX_CONCURRENT` |
| Execution Mode | `GEM_SWARM_EXECUTION_MODE` |
| Git Checkpoints | `GEM_SWARM_GIT_CHECKPOINTS` |

## Layer Rules

`src/lib/` is a pure utility layer:
- ✅ Can import: `node:*` builtins, other `src/lib/` files
- ❌ Cannot import: `src/core/`, `src/mcp/`, `src/hooks/`, external packages
- Enforced by: `node scripts/check-layer-boundaries.js`

## Build & Verify

```bash
# Rebuild registries after changing agents/skills
npm run build

# Full CI check (same as GitHub Actions)
node scripts/build-registries.js
node scripts/check-layer-boundaries.js
bash scripts/verify-hooks-loaded.sh
node -e "require('./src/mcp/maestro-server')"
node scripts/generate-context.js
```
