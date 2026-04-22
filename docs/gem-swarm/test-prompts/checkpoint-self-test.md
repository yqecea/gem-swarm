# Test Prompt: Git Checkpoint Self-Test + Competitive Improvement

## How to use
Copy the prompt below and paste it into the running `gemini` CLI session in the gem-swarm project directory.

## What it tests
- **BeforeTool hook** — every `write_file`/`replace` call should create a `gem-swarm-checkpoint-*` entry in `git stash list`
- **Fail-open behavior** — hook errors should never block file writes
- **Useful output** — the task genuinely improves gem-swarm by filling a documentation gap identified in the competitive audit

## Verification after running
```bash
# Check that checkpoints were created during the task:
git stash list | grep gem-swarm-checkpoint

# Count how many checkpoints were made:
git stash list | grep -c gem-swarm-checkpoint

# Clean up test checkpoints when satisfied:
git stash clear
```

---

## Prompt (copy everything below this line)

```
Проанализируй hooks-систему gem-swarm и сравни её с конкурентом richardcb/oh-my-gemini.

Контекст:
- Наша hooks система: hooks/hooks.json, src/platforms/shared/hook-runner.js, src/hooks/logic/*.js
- У конкурента richardcb есть 6 хуков: session-start, before-agent, before-tool, after-tool, tool-filter, phase-gate + ralph-retry
- У нас сейчас 4 хука: session-start, before-agent, after-agent, session-end + новый before-tool (git checkpoints)

Задача (обязательно редактируй файлы!):

1. Прочитай все наши hook-logic файлы в src/hooks/logic/ и hooks/hooks.json
2. Создай файл docs/gem-swarm/reports/hooks-competitive-gap.md с детальным сравнением:
   - Какие хуки есть у richardcb, но нет у нас (after-tool auto-verify, tool-filter, phase-gate, ralph-retry)
   - Для каждого пропущенного хука: что он делает, насколько сложно реализовать (easy/medium/hard), и приоритет (P0/P1/P2)
   - Таблица: Feature | richardcb | gem-swarm | Gap | Priority
3. Обнови файл docs/gem-swarm/reports/2026-04-22-audit-and-competitive-analysis.md — добавь секцию "## Hooks Gap Analysis (Updated)" в конец, с кратким резюме из пункта 2

Важно: каждый файл редактируй через write_file или replace — это тестирует наш новый git checkpoint хук.
```
