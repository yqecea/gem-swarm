#!/usr/bin/env bash
# verify-hooks-loaded.sh — Runtime verification that gem-swarm hooks are active
#
# WHY THIS EXISTS:
# Static code review and unit tests can pass even when hooks are completely dead.
# This happened: hooks were in hooks/hooks.json (wrong file) in nested format
# (wrong format). Tests passed because we tested hook-runner.js directly,
# not the CLI→hook integration chain.
#
# This script verifies the INTEGRATION, not the components.

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
EXT_JSON="$PROJECT_ROOT/gemini-extension.json"

echo "=== gem-swarm Hook Verification ==="
echo ""

PASS=0
FAIL=0
WARN=0

check_pass() { echo -e "  ${GREEN}✓${NC} $1"; PASS=$((PASS + 1)); }
check_fail() { echo -e "  ${RED}✗${NC} $1"; FAIL=$((FAIL + 1)); }
check_warn() { echo -e "  ${YELLOW}⚠${NC} $1"; WARN=$((WARN + 1)); }

# ─── 1. MANIFEST CHECK: hooks exist in gemini-extension.json ───
echo "1. Manifest Check (gemini-extension.json)"

if [ ! -f "$EXT_JSON" ]; then
  check_fail "gemini-extension.json not found"
  exit 1
fi

HOOKS_KEY=$(python3 -c "
import json, sys
d = json.load(open(sys.argv[1]))
print('yes' if 'hooks' in d else 'no')
" "$EXT_JSON")

if [ "$HOOKS_KEY" = "yes" ]; then
  check_pass "hooks section exists in gemini-extension.json"
else
  check_fail "hooks section MISSING from gemini-extension.json (hooks won't load!)"
  echo ""
  echo "  CRITICAL: Hooks must be embedded in gemini-extension.json, not in hooks/hooks.json"
  echo "  Gemini CLI only reads hooks from the extension manifest."
  exit 1
fi

# ─── 2. FORMAT CHECK: flat format, not nested ───
echo "2. Format Check (flat vs nested)"

FORMAT_CHECK=$(python3 -c "
import json, sys
d = json.load(open(sys.argv[1]))
hooks = d.get('hooks', {})
errors = []
for event, entries in hooks.items():
    if not isinstance(entries, list):
        errors.append(f'{event}: not a list')
        continue
    for i, h in enumerate(entries):
        if 'hooks' in h:
            errors.append(f'{event}[{i}]: nested format detected (has inner hooks key)')
        for req in ['type', 'command', 'name']:
            if req not in h:
                errors.append(f'{event}[{i}]: missing required field \"{req}\"')
if errors:
    print('ERRORS')
    for e in errors:
        print(f'  - {e}')
else:
    print('OK')
" "$EXT_JSON")

if [ "$FORMAT_CHECK" = "OK" ]; then
  check_pass "All hooks use flat format (type/command/name at top level)"
else
  check_fail "Hook format errors detected:"
  echo "$FORMAT_CHECK" | tail -n +2
fi

# ─── 3. REGISTERED EVENTS CHECK ───
echo "3. Registered Events"

python3 -c "
import json, sys
d = json.load(open(sys.argv[1]))
hooks = d.get('hooks', {})
expected = ['SessionStart', 'BeforeAgent', 'BeforeTool', 'AfterAgent', 'SessionEnd']
for event in expected:
    if event in hooks:
        count = len(hooks[event])
        names = [h.get('name', '?') for h in hooks[event]]
        print(f'  FOUND  {event}: {count} hook(s) — {names}')
    else:
        print(f'  MISSING  {event}')
" "$EXT_JSON"

# ─── 4. HOOK RUNNER CHECK: scripts exist ───
echo "4. Hook Runner Check"

# The extension path resolves through the symlink
RUNNER="$PROJECT_ROOT/hooks/hook-runner.js"
if [ -f "$RUNNER" ]; then
  LINKED_DIR="$HOME/.gemini/extensions/gem-swarm"
  if [ -d "$LINKED_DIR" ]; then
    check_pass "Extension installed at ~/.gemini/extensions/gem-swarm"
  else
    check_warn "Extension not found at ~/.gemini/extensions/gem-swarm"
  fi
  node -c "$RUNNER" 2>/dev/null && check_pass "hook-runner.js parses OK" || check_fail "hook-runner.js has syntax errors"
else
  check_fail "hook-runner.js not found at $RUNNER"
fi

# ─── 5. EXTENSION PATH RESOLUTION ───
echo "5. Extension Path Resolution"

INSTALL_JSON="$HOME/.gemini/extensions/gem-swarm/.gemini-extension-install.json"
if [ -f "$INSTALL_JSON" ]; then
  SOURCE=$(python3 -c "import json, sys; print(json.load(open(sys.argv[1])).get('source', 'unknown'))" "$INSTALL_JSON")
  TYPE=$(python3 -c "import json, sys; print(json.load(open(sys.argv[1])).get('type', 'unknown'))" "$INSTALL_JSON")
  check_pass "Install type: $TYPE, source: $SOURCE"

  if [ "$SOURCE" = "$PROJECT_ROOT" ]; then
    check_pass "Extension source matches project root"
  else
    check_warn "Extension source ($SOURCE) ≠ project root ($PROJECT_ROOT)"
  fi
else
  check_warn "Extension install metadata not found"
fi

# ─── 6. ANTI-REGRESSION: hooks/hooks.json should NOT be source of truth ───
echo "6. Anti-Regression Check"

LEGACY="$PROJECT_ROOT/hooks/hooks.json"
if [ -f "$LEGACY" ]; then
  check_warn "hooks/hooks.json still exists — NOT read by Gemini CLI"
  echo "         Hooks are only loaded from gemini-extension.json"
else
  check_pass "No legacy hooks/hooks.json (single source of truth)"
fi

# ─── 7. GIT CHECKPOINT INTEGRATION ───
echo "7. Git Checkpoint Integration"

if command -v git &>/dev/null && git -C "$PROJECT_ROOT" rev-parse --is-inside-work-tree &>/dev/null; then
  check_pass "Git repo detected"
  STASH_COUNT=$(git -C "$PROJECT_ROOT" stash list 2>/dev/null | grep -c "gem-swarm-checkpoint" || true)
  echo "         Current checkpoints in stash: $STASH_COUNT"
else
  check_warn "Not a git repo — checkpoints won't work"
fi

# ─── SUMMARY ───
echo ""
echo "=== Summary ==="
echo -e "  ${GREEN}Passed: $PASS${NC}"
[ "$WARN" -gt 0 ] && echo -e "  ${YELLOW}Warnings: $WARN${NC}"
[ "$FAIL" -gt 0 ] && echo -e "  ${RED}Failed: $FAIL${NC}"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo -e "${RED}HOOKS ARE NOT WORKING. Fix the failures above.${NC}"
  exit 1
elif [ "$WARN" -gt 0 ]; then
  echo -e "${YELLOW}Hooks should work but check warnings.${NC}"
  exit 0
else
  echo -e "${GREEN}All checks passed. Hooks should be active after gemini restart.${NC}"
  exit 0
fi
