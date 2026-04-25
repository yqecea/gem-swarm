# 🐝 gem-swarm

Multi-agent orchestration extension for [Gemini CLI](https://github.com/google-gemini/gemini-cli).

20 domain-specialist agents · 42 skills · 12 commands · parallel subagent dispatch · persistent sessions

---

## Quick Start

```bash
# 1. Enable agents in Gemini CLI
# Add to ~/.gemini/settings.json:
# { "experimental": { "enableAgents": true } }

# 2. Install
gemini extension install github:<your-username>/gem-swarm

# 3. Verify
gemini
> /gem-swarm:status
```

**That's it.** You now have 20 specialist agents ready to work.

### Быстрый старт (RU)

```bash
# 1. Включи агентов в настройках Gemini CLI
# Добавь в ~/.gemini/settings.json:
# { "experimental": { "enableAgents": true } }

# 2. Установи
gemini extension install github:<your-username>/gem-swarm

# 3. Проверь
gemini
> /gem-swarm:status
```

**Готово.** 20 агентов-специалистов к вашим услугам.

---

## How to Use / Как пользоваться

gem-swarm gives you **three ways** to work, from fastest to most thorough:

gem-swarm даёт **три способа** работы — от самого быстрого до самого детального:

### 1. `@agent` — Direct Call / Прямой вызов ⚡

**The fastest way.** Call a specialist directly — no orchestrator, no questions, no phases. The agent just does the work.

**Самый быстрый способ.** Вызываешь специалиста напрямую — без оркестратора, без вопросов, без фаз. Агент просто делает.

```
@frontend_specialist Build a signup form with email validation
@debugger Fix the crash in auth.ts — stack trace attached
@test_engineer Write unit tests for UserService
@security_auditor Audit the /api/payments endpoint
@backend_specialist Add rate limiting to the API
```

**When to use / Когда использовать:**
- You know exactly what you need / Ты точно знаешь что нужно
- Single-domain task / Задача в одной области
- You want results fast, not a plan / Хочешь результат, а не план

### 2. `/gem-swarm:command` — Structured Commands / Структурированные команды

Predefined workflows for common tasks. More structured than `@agent`, but no full orchestration overhead.

Готовые сценарии для типовых задач. Структурированнее чем `@agent`, но без нагрузки полной оркестрации.

| Command | What it does |
|---------|-------------|
| `/gem-swarm:debug` | Systematic debugging with hypothesis-driven investigation |
| `/gem-swarm:review` | Deep code review — logic, security, structure, performance |
| `/gem-swarm:test` | Generate and run tests |
| `/gem-swarm:security-audit` | OWASP 2025, supply chain, attack surface analysis |
| `/gem-swarm:deploy` | Production deployment with pre-flight checks |
| `/gem-swarm:create` | Create a new application from natural language |
| `/gem-swarm:enhance` | Add or update features in an existing project |
| `/gem-swarm:plan` | Project planning — analysis, breakdown, dependencies |
| `/gem-swarm:status` | View active session status |
| `/gem-swarm:resume` | Resume an interrupted session |
| `/gem-swarm:archive` | Archive the active session |

### 3. `/gem-swarm:orchestrate` — Full Orchestration / Полная оркестрация 🎯

The **full 4-phase workflow** with design dialogue, implementation planning, multi-agent execution, and code review. Use for complex, multi-domain tasks.

**Полный 4-фазный воркфлоу**: диалог по дизайну, планирование, мульти-агентное выполнение, код-ревью. Для сложных задач.

```
/gem-swarm:orchestrate Build a dashboard with auth, real-time data, and responsive design
```

**When to use / Когда использовать:**
- Complex task spanning multiple domains / Сложная задача из нескольких областей
- You need a plan before execution / Нужен план перед выполнением
- Multiple agents need to coordinate / Нескольким агентам нужно координировать работу

---

## When to Use What / Когда что использовать

| Situation | Best choice | Why |
|-----------|------------|-----|
| "Add a button" | `@frontend_specialist` | Simple, one agent, fast |
| "Find this bug" | `@debugger` or `/gem-swarm:debug` | Focused investigation |
| "Review my PR" | `/gem-swarm:review` | Structured review workflow |
| "Build a new feature" | `/gem-swarm:orchestrate` | Multi-agent, needs planning |
| "New project from scratch" | `/gem-swarm:orchestrate` | Design → Plan → Build → Review |
| "Is this code secure?" | `@security_auditor` | Quick audit, one domain |
| "Full security audit" | `/gem-swarm:security-audit` | Thorough, structured audit |

**Rule of thumb / Правило**: If you can describe the task in one sentence for one specialist → use `@agent`. If it needs coordination → use `/gem-swarm:orchestrate`.

**Правило**: Если задачу можно описать одним предложением для одного специалиста → `@agent`. Если нужна координация → `/gem-swarm:orchestrate`.

---

## Agent Roster / Список агентов

| Agent | Domain | Example call |
|-------|--------|-------------|
| `frontend_specialist` | React/Next.js, UI/UX, responsive design | `@frontend_specialist` |
| `backend_specialist` | API, server architecture, backend logic | `@backend_specialist` |
| `database_architect` | Schema design, queries, migrations, indexing | `@database_architect` |
| `security_auditor` | OWASP 2025, supply chain, zero trust | `@security_auditor` |
| `penetration_tester` | Offensive security, exploit analysis | `@penetration_tester` |
| `test_engineer` | Unit/integration testing, TDD, coverage | `@test_engineer` |
| `qa_automation_engineer` | E2E testing, Playwright, CI pipelines | `@qa_automation_engineer` |
| `debugger` | Root cause analysis, crash investigation | `@debugger` |
| `performance_optimizer` | Profiling, Core Web Vitals, bundle size | `@performance_optimizer` |
| `devops_engineer` | CI/CD, deployment, server management | `@devops_engineer` |
| `mobile_developer` | React Native, Flutter, mobile patterns | `@mobile_developer` |
| `game_developer` | Game mechanics, engines (Unity/Godot/Phaser) | `@game_developer` |
| `documentation_writer` | Technical docs, READMEs, API docs | `@documentation_writer` |
| `product_manager` | Requirements, user stories, prioritization | `@product_manager` |
| `product_owner` | Roadmap, backlog, stakeholder management | `@product_owner` |
| `project_planner` | Task breakdown, dependency graphs | `@project_planner` |
| `explorer_agent` | Codebase discovery, architectural analysis | `@explorer_agent` |
| `code_archaeologist` | Legacy code analysis, codebase archaeology | `@code_archaeologist` |
| `seo_specialist` | SEO, GEO, E-E-A-T, Core Web Vitals | `@seo_specialist` |
| `website_cloner` | Pixel-perfect website cloning, 5-phase workflow | `@website_cloner` |

---

## Architecture

```
User
 ├── @agent ──────────────── Agent (direct, fast)
 ├── /gem-swarm:command ──── Structured workflow → Agent(s)
 └── /gem-swarm:orchestrate → Orchestrator (GEMINI.md)
                                    │
                                    ├── MCP Server (maestro-server.js)
                                    │   ├── Workspace tools (init, validate, settings)
                                    │   ├── Session tools (create, status, transition, archive)
                                    │   └── Content tools (skills, agents, runtime context)
                                    │
                                    ├── Subagent dispatch (native Gemini CLI agents)
                                    │   └── 20 specialists with per-agent tools, temperature, turn limits
                                    │
                                    ├── Hooks (SessionStart, BeforeAgent, AfterAgent, SessionEnd)
                                    └── Policies (shell command safety rules)
```

### 4-Phase Workflow (orchestrate mode)

1. **Design** — Interactive design dialogue with approval gates
2. **Planning** — Implementation plan with dependency analysis and validation
3. **Execution** — Parallel or sequential agent dispatch
4. **Completion** — Code review, session archival, summary

---

## Configuration

Settings via environment variables or extension `.env` file:

| Setting | Env Var | Default | Description |
|---------|---------|---------|-------------|
| Disabled Agents | `GEM_SWARM_DISABLED_AGENTS` | — | Comma-separated agents to exclude |
| Max Retries | `GEM_SWARM_MAX_RETRIES` | `2` | Phase retry limit |
| Auto Archive | `GEM_SWARM_AUTO_ARCHIVE` | `true` | Archive on success |
| Validation | `GEM_SWARM_VALIDATION_STRICTNESS` | `normal` | Validation gating mode |
| State Directory | `GEM_SWARM_STATE_DIR` | `docs/gem-swarm` | Session and plan state root |
| Max Concurrent | `GEM_SWARM_MAX_CONCURRENT` | `0` | Parallel batch size (0 = all) |
| Execution Mode | `GEM_SWARM_EXECUTION_MODE` | `ask` | `parallel`, `sequential`, or `ask` |

---

## Development

```bash
# Link for local development
git clone https://github.com/<your-username>/gem-swarm.git
cd gem-swarm
gemini extension install .

# Regenerate agent stubs and registries
npm run generate

# Verify MCP server loads
node -e "require('./src/mcp/maestro-server')"
```

## Technical Details

- **Runtime:** Node.js ≥ 20 (no external dependencies)
- **Protocol:** MCP JSON-RPC 2.0 over STDIO
- **State:** Markdown-based persistent sessions
- **Security:** TOML policy rules for shell command safety
- **License:** Apache 2.0 — see [LICENSE](LICENSE)
