# Integration Health Report
> Generated: 2026-04-22T17:31:05Z

## Summary
- Overall status: WARN
- Checks passed: 4/5

## Pre-Commit Checks
| Check | Status | Details |
|-------|--------|---------|
| Build Registries | PASS | Built successfully (20 agents, 55 resources) |
| Check Layer Boundaries | PASS | Clean (7 files scanned, 0 violations) |
| Verify Hooks Loaded | WARN | Format passed (7 checks, 1 warning) |
| MCP Server Boot | PASS | Required successfully with no output errors |
| CI Configuration | PASS | .github/workflows/ci.yml is correctly configured |

## Registry Integrity
| Registry | Expected | Actual | Drift? |
|----------|----------|--------|--------|
| Agents | 20 | 20 | No |
| Resources| 55 | 55 | No |

## Hook Configuration
| Event | Name | Format | File Location | Status |
|-------|------|--------|---------------|--------|
| SessionStart | SessionStart | Flat array | gemini-extension.json | PASS |
| BeforeAgent | BeforeAgent | Flat array | gemini-extension.json | PASS |
| BeforeTool | BeforeTool | Flat array | gemini-extension.json | PASS |
| AfterAgent | AfterAgent | Flat array | gemini-extension.json | PASS |
| SessionEnd | SessionEnd | Flat array | gemini-extension.json | PASS |

## Findings
### Issues Found
- `hooks/hooks.json` still exists in the codebase but is NOT read by Gemini CLI.

### Recommendations
- Remove or rename the legacy `hooks/hooks.json` file. All hooks are properly loaded from `gemini-extension.json` using the required flat array format.
