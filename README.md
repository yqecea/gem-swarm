# 🐝 gem-swarm

Multi-agent orchestration extension for [Gemini CLI](https://github.com/anthropics/gemini-cli).

19 domain-specialist agents, 55 skills, 12 commands, native parallel subagent dispatch, persistent session management, and an autonomous 4-phase workflow — all running as a single Gemini CLI extension.

## What You Get

| Component | Count | Description |
|-----------|-------|-------------|
| **Agents** | 19 | Domain specialists with deep methodology (frontend, backend, security, DevOps, DB, mobile, game dev, testing, docs, SEO, and more) |
| **Skills** | 55 | Actionable knowledge packs covering clean code, API patterns, architecture, TDD, performance profiling, deployment procedures, vulnerability scanning, and more |
| **Commands** | 12 | Slash commands for orchestration, planning, debugging, deployment, code review, security audit, and testing |
| **MCP Tools** | 12 | Session state machine, plan validator, workspace initializer, settings resolver, agent/skill content provider |

## Architecture

gem-swarm implements the **Maestro** orchestration pattern:

```
User → /gem-swarm:orchestrate → Orchestrator (GEMINI.md)
                                      │
                                      ├── MCP Server (maestro-server.js)
                                      │   ├── Workspace tools (init, complexity, validate, settings)
                                      │   ├── Session tools (create, status, update, transition, archive)
                                      │   └── Content tools (skills, agents, runtime context)
                                      │
                                      ├── Subagent dispatch (native Gemini CLI agents)
                                      │   └── 19 specialists with per-agent tools, temperature, turn limits
                                      │
                                      ├── Hooks (SessionStart, BeforeAgent, AfterAgent, SessionEnd)
                                      │
                                      └── Policies (shell command safety rules)
```

### 4-Phase Autonomous Workflow

1. **Design** — Interactive design dialogue with approval gates
2. **Planning** — Implementation plan with DAG dependency analysis, plan validation, and user approval
3. **Execution** — Parallel or sequential agent dispatch with phase transitions
4. **Completion** — Automated code review, session archival, and summary

## Install

> **Requires:** [Gemini CLI](https://github.com/google-gemini/gemini-cli) with `experimental.enableAgents: true` in `~/.gemini/settings.json`.

```bash
gemini extension install github:<your-username>/gem-swarm
```

### Verify Installation

```bash
gemini
> /gem-swarm:status
```

### Manual Install (development)

```bash
git clone https://github.com/<your-username>/gem-swarm.git
cd gem-swarm
gemini extension install .
```

## Commands

| Command | Description |
|---------|-------------|
| `/gem-swarm:orchestrate` | Full workflow — design → plan → execute → review |
| `/gem-swarm:create` | Create a new application from natural language |
| `/gem-swarm:enhance` | Add or update features in an existing project |
| `/gem-swarm:plan` | Project planning — analysis, breakdown, dependencies |
| `/gem-swarm:deploy` | Production deployment with pre-flight checks |
| `/gem-swarm:debug` | Systematic debugging with hypothesis-driven investigation |
| `/gem-swarm:review` | Deep code review — logic, security, structure, performance |
| `/gem-swarm:security-audit` | OWASP 2025, supply chain, attack surface analysis |
| `/gem-swarm:test` | Generate and run tests |
| `/gem-swarm:status` | View active session status (read-only) |
| `/gem-swarm:resume` | Resume an interrupted session |
| `/gem-swarm:archive` | Archive the active session |

## Agent Roster

| Agent | Domain |
|-------|--------|
| `frontend_specialist` | React/Next.js, UI/UX, responsive design |
| `backend_specialist` | API, server architecture, backend logic |
| `database_architect` | Schema design, queries, migrations, indexing |
| `security_auditor` | OWASP 2025, supply chain, zero trust |
| `penetration_tester` | Offensive security, exploit analysis |
| `test_engineer` | Unit/integration testing, TDD, coverage |
| `qa_automation_engineer` | E2E testing, Playwright, CI pipelines |
| `debugger` | Root cause analysis, crash investigation |
| `performance_optimizer` | Profiling, Core Web Vitals, bundle size |
| `devops_engineer` | CI/CD, deployment, server management |
| `mobile_developer` | React Native, Flutter, mobile patterns |
| `game_developer` | Game mechanics, engines (Unity/Godot/Phaser) |
| `documentation_writer` | Technical docs, READMEs, API docs |
| `product_manager` | Requirements, user stories, prioritization |
| `product_owner` | Roadmap, backlog, stakeholder management |
| `project_planner` | Task breakdown, dependency graphs |
| `explorer_agent` | Codebase discovery, architectural analysis |
| `code_archaeologist` | Legacy code analysis, codebase archaeology |
| `seo_specialist` | SEO, GEO, E-E-A-T, Core Web Vitals |

## Configuration

Settings can be configured via environment variables or the extension `.env` file:

| Setting | Env Var | Default | Description |
|---------|---------|---------|-------------|
| Disabled Agents | `GEM_SWARM_DISABLED_AGENTS` | — | Comma-separated agents to exclude |
| Max Retries | `GEM_SWARM_MAX_RETRIES` | `2` | Phase retry limit |
| Auto Archive | `GEM_SWARM_AUTO_ARCHIVE` | `true` | Archive on success |
| Validation | `GEM_SWARM_VALIDATION_STRICTNESS` | `normal` | Validation gating mode |
| State Directory | `GEM_SWARM_STATE_DIR` | `docs/gem-swarm` | Session and plan state root |
| Max Concurrent | `GEM_SWARM_MAX_CONCURRENT` | `0` | Parallel batch chunk size (0 = all) |
| Execution Mode | `GEM_SWARM_EXECUTION_MODE` | `ask` | `parallel`, `sequential`, or `ask` |

## Technical Details

- **Runtime:** Node.js ≥ 20 (no external dependencies)
- **Protocol:** MCP JSON-RPC 2.0 over STDIO
- **State:** Markdown-based persistent sessions in workspace
- **Security:** TOML policy rules for shell command safety
- **License:** Apache 2.0

## Development

```bash
# Regenerate agent stubs and registries from source
npm run generate

# Verify MCP server loads
node -e "require('./src/mcp/maestro-server')"
```

## License

Apache 2.0 — see [LICENSE](LICENSE).
