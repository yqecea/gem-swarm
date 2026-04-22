# Full Integration Test: gem-swarm Self-Improvement

## Что тестируется

Этот промпт проверяет **каждый компонент** gem-swarm одной задачей:

| Компонент | Как проверяется |
|-----------|----------------|
| **Orchestration (4 phases)** | Задача достаточно сложная → Design → Plan → Execute → Complete |
| **MCP: resolve_settings** | Startup Checks требуют резолвинга настроек |
| **MCP: initialize_workspace** | Инициализация state_dir |
| **MCP: assess_task_complexity** | Оценка сложности задачи |
| **MCP: get_agent** | Загрузка методологии агентов |
| **MCP: get_skill_content** | Загрузка протоколов для делегации |
| **MCP: create_session** | Новая сессия |
| **MCP: update_session / transition_phase** | Переходы между фазами |
| **MCP: validate_plan** | Валидация плана перед execute |
| **MCP: archive_session** | Архивация после завершения |
| **Agent delegation** | Минимум 2 агента: explorer_agent + devops_engineer |
| **BeforeTool hook** | write_file/replace вызовы → git checkpoints |
| **SessionStart hook** | Старт сессии → prune stale sessions |
| **BeforeAgent hook** | Делегация → agent tracking |
| **AfterAgent hook** | Проверка handoff format |
| **SessionEnd hook** | Завершение → cleanup |
| **Parallel batches** | 2 агента без пересечения файлов |
| **CONTEXT.md compliance** | Задача требует следовать правилам из CONTEXT.md |
| **Pre-commit checks** | Финальная валидация по GEMINI.md rules |

## Верификация после запуска

```bash
# 1. Git checkpoints были созданы?
git stash list | grep gem-swarm-checkpoint
echo "Checkpoints: $(git stash list | grep -c gem-swarm-checkpoint)"

# 2. Сессия была создана и архивирована?
ls docs/gem-swarm/state/archive/ 2>/dev/null | tail -3

# 3. Файлы были созданы?
test -f docs/gem-swarm/reports/integration-health.md && echo "✓ Report exists" || echo "✗ Missing"

# 4. CI проходит?
node scripts/build-registries.js && \
node scripts/check-layer-boundaries.js && \
bash scripts/verify-hooks-loaded.sh 2>&1 | tail -3 && \
node -e "require('./src/mcp/maestro-server')" && \
echo "✓ CI passes"

# 5. Cleanup
git stash clear
```

---

## Промпт (скопировать целиком)

```
/gem-swarm:orchestrate

Задача: Провести полный аудит здоровья gem-swarm и создать отчёт.

## Контекст
Это self-test: gem-swarm тестирует сам себя. Прочитай CONTEXT.md перед началом.

## Требования

### Фаза 1: Исследование (explorer_agent)
Проанализируй текущее состояние проекта:
1. Прочитай CONTEXT.md — сверь реальное количество агентов, скиллов, хуков с заявленным
2. Запусти все pre-commit checks из GEMINI.md → "Development Workflow":
   - node scripts/build-registries.js
   - node scripts/check-layer-boundaries.js
   - bash scripts/verify-hooks-loaded.sh
   - node -e "require('./src/mcp/maestro-server')"
3. Проверь что registries (src/generated/*.json) актуальны — совпадают ли с реальными файлами агентов и скиллов
4. Найди несоответствия: что заявлено но не существует, что существует но не заявлено

### Фаза 2: DevOps аудит (devops_engineer)
1. Проверь .github/workflows/ci.yml — все ли checks покрывают реальные точки отказа
2. Проверь gemini-extension.json:
   - Все хуки в плоском формате?
   - Все пути к скриптам корректны?
   - Все settings имеют envVar?
3. Проверь что hooks/hooks.json НЕ используется как source of truth (анти-регрессия)

### Фаза 3: Отчёт (documentation_writer)
Создай файл `docs/gem-swarm/reports/integration-health.md` со структурой:

```markdown
# Integration Health Report
> Generated: <timestamp>

## Summary
- Overall status: PASS/WARN/FAIL
- Checks passed: X/Y

## Pre-Commit Checks
| Check | Status | Details |
|-------|--------|---------|

## Registry Integrity
| Registry | Expected | Actual | Drift? |

## Hook Configuration
| Event | Name | Format | File Location | Status |

## Findings
### Issues Found
### Recommendations
```

ВАЖНО:
- Каждый агент ОБЯЗАН использовать write_file или replace для создания/редактирования файлов — это тестирует git checkpoint hook
- Следуй CONTEXT.md и GEMINI.md → Development Workflow правилам
- После завершения запусти pre-commit checks чтобы убедиться что ничего не сломано
```
