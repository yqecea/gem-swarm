---
title: "integration-health-test"
created: "2026-04-22T12:00:00Z"
status: "draft"
authors: ["TechLead", "User"]
type: "design"
design_depth: "standard"
task_complexity: "complex"
---

# Integration Health Test Design Document

## 🎯 ДЛЯ ТЕБЯ (Простым языком)
### Что будет сделано?
- Три виртуальных инженера проверят кодовую базу, настройки CI/CD и сгенерируют общий отчет о здоровье проекта `gem-swarm`.
- Первый инженер проверит файлы реестра агентов и запустит `pre-commit` проверки.
- Второй инженер параллельно проверит настройки Github Actions и конфигурацию расширения.
- Третий инженер соберет результаты и напишет финальный отчет.

### Зачем?
- Чтобы убедиться, что система может надежно управлять несколькими агентами одновременно, не путая их файлы и состояния (как диспетчер, управляющий несколькими поездами).

### Что ты получишь?
- Файл `integration-health.md` с результатами проверок и статусом PASS/WARN/FAIL.

### ⚠️ Может ли что-то сломаться?
- Нет, скрипты запускаются в режиме проверки. Изменяются только временные файлы отчетов, которые тестируют механику сохранения состояний (git checkpoints).

## Problem Statement

The `gem-swarm` extension requires a comprehensive "self-test" integration workflow to ensure all orchestration features, hook integrations, file modifications, parallel batches, and MCP tooling function correctly. The existing codebase and commands must be audited for accuracy, registry integrity must be verified, CI configuration must be reviewed, and an overarching health report must be produced. This test explicitly exercises multi-agent delegation, parallel phase execution without file overlap, pre-commit scripts, and `write_file` operations that trigger git checkpoints.

## Requirements

### Functional Requirements

1. **REQ-1**: Execute a 3-phase audit and report generation workflow (Phase 1: `explorer_agent`, Phase 2: `devops_engineer`, Phase 3: `documentation_writer`).
2. **REQ-2**: Perform repository state audits (`build-registries.js`, `check-layer-boundaries.js`, `verify-hooks-loaded.sh`, `maestro-server`).
3. **REQ-3**: Evaluate `ci.yml`, `gemini-extension.json`, and `hooks.json` for configuration integrity.
4. **REQ-4**: Agents must use `write_file` or `replace` to ensure `BeforeTool` git stash checkpoints are verified.

### Non-Functional Requirements

1. **REQ-5**: Phases 1 and 2 must execute natively as parallel batches.
2. **REQ-6**: Validation scripts must run to completion to aggregate failures.

### Constraints

- Must exclusively use the built-in agents and strict formatting.
- Checkpoints evaluated via `git stash show -p`.

## Approach

### Selected Approach

**Parallel Audit, Sequential Report**

Phase 1 (`explorer_agent`) and Phase 2 (`devops_engineer`) will execute simultaneously in a parallel batch. They will independently evaluate non-overlapping project domains. Once the batch is completed, Phase 3 (`documentation_writer`) will run sequentially to compile their findings into the final Integration Health Report.
- *[Satisfies the "Parallel batches" constraint while explicitly segregating file creation contexts]*

### Alternatives Considered

#### Fully Sequential Pipeline

- **Description**: Run Phase 1, then Phase 2, then Phase 3.
- **Pros**: Simple state handoffs.
- **Cons**: Slower execution.
- **Rejected Because**: Explicitly violates the prompt's mandate to test parallel batch dispatch and concurrency within `gem-swarm`.

### Decision Matrix

| Criterion | Weight | Parallel Audit | Fully Sequential |
|-----------|--------|--------------|--------------|
| Requirement Match | 60% | 5: Fulfills constraints | 1: Fails constraints |
| Speed | 20% | 5: Faster read phase | 3: Baseline speed |
| Debuggability | 20% | 3: Interleaved logs | 5: Sequential logs |
| **Weighted Total** | | **4.6** | **2.2** |

## Architecture

### Component Diagram

```
[Orchestrator]
      |
      +---> (Batch 1: Parallel)
      |        |---> [explorer_agent] ---> docs/gem-swarm/reports/registry-audit.md
      |        |---> [devops_engineer] ---> docs/gem-swarm/reports/ci-audit.md
      |
      +---> (Batch 2: Sequential)
               |---> [documentation_writer] ---> docs/gem-swarm/reports/integration-health.md
```

### Data Flow

1. Parallel Dispatch of Batch 1.
2. `explorer_agent` and `devops_engineer` run validation commands and write temporary markdown reports.
3. Sequential Sync: Orchestrator persists results via `transition_phase`.
4. `documentation_writer` consumes the downstream context and generates the final report.

### Key Interfaces

```typescript
type AgentHandoff = {
  taskReport: string;
  downstreamContext: string;
  filesModified: string[];
}
```

## Agent Team

| Phase | Agent(s) | Parallel | Deliverables |
|-------|----------|----------|--------------|
| 1     | explorer_agent | Yes | `registry-audit.md` |
| 2     | devops_engineer | Yes | `ci-audit.md` |
| 3     | documentation_writer | No | `integration-health.md` |

## Risk Assessment

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| Interleaved parallel logs | LOW | HIGH | Explicitly label outputs by agent. |
| Pre-commit script hangs | MEDIUM | LOW | Fail the test if timeout occurs. |

## Success Criteria

1. Git checkpoints are verified present for `write_file` operations.
2. The `integration-health.md` report is successfully generated.
3. CI tests pass after execution.