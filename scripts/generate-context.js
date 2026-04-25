#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function readJSON(relPath) {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) return null;
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

function countFiles(dir, ext) {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(ext)) count++;
    if (entry.isDirectory()) count += countFiles(path.join(dir, entry.name), ext);
  }
  return count;
}

// ── Gather data from actual codebase ─────────────────────────────────

const ext = readJSON('gemini-extension.json');
const agentReg = readJSON('src/generated/agent-registry.json') || [];
const resourceReg = readJSON('src/generated/resource-registry.json') || {};
const hookReg = readJSON('src/generated/hook-registry.json') || {};
const pkg = readJSON('package.json') || {};

const hooks = ext?.hooks || {};
const settings = ext?.settings || [];
const mcpHandlersDir = path.join(ROOT, 'src/mcp/handlers');
// Count actual registered tools, not handler files (one file can register multiple tools)
let mcpTools = [];
try {
  const { createServer } = require(path.join(ROOT, 'src/mcp/core/create-server'));
  const { DEFAULT_TOOL_PACKS } = require(path.join(ROOT, 'src/mcp/tool-packs'));
  const { normalizeRuntimeConfig } = require(path.join(ROOT, 'src/mcp/runtime/runtime-config-map'));
  const server = createServer({
    runtimeConfig: normalizeRuntimeConfig('gemini'),
    services: { canonicalSrcRoot: path.join(ROOT, 'src') },
    toolPacks: DEFAULT_TOOL_PACKS,
  });
  mcpTools = server.getToolSchemas().map(s => s.name);
} catch {
  // Fallback to file counting if server can't load
  mcpTools = fs.existsSync(mcpHandlersDir)
    ? fs.readdirSync(mcpHandlersDir).filter(f => f.endsWith('.js')).map(f => f.replace('.js', ''))
    : [];
}

const hookLogicDir = path.join(ROOT, 'src/hooks/logic');
const hookLogicFiles = fs.existsSync(hookLogicDir)
  ? fs.readdirSync(hookLogicDir).filter(f => f.endsWith('.js'))
  : [];

const jsFileCount = countFiles(path.join(ROOT, 'src'), '.js');
const now = new Date().toISOString().replace('T', ' ').split('.')[0] + ' UTC';

// ── Generate CONTEXT.md ──────────────────────────────────────────────

const lines = [];
const w = (s = '') => lines.push(s);

w('# gem-swarm Context');
w('');
w(`> Auto-generated from codebase on ${now}`);
w('> Regenerate: `node scripts/generate-context.js`');
w('');
w('---');
w('');

// Stats
w('## Stats');
w('');
w(`| Metric | Value |`);
w(`|--------|-------|`);
w(`| Agents | ${agentReg.length} |`);
w(`| Skills | ${Object.keys(resourceReg).length} |`);
w(`| MCP Tools | ${mcpTools.length} |`);
w(`| Hook Events | ${Object.keys(hooks).length} |`);
w(`| Settings | ${settings.length} |`);
w(`| JS Files (src/) | ${jsFileCount} |`);
w('');

// Architecture
w('## Architecture');
w('');
w('```');
w('gemini-extension.json    ← Extension manifest (hooks, MCP, settings)');
w('├── mcp/gem-swarm-server.js → src/mcp/maestro-server.js');
w('│   └── src/mcp/handlers/   ← MCP tool implementations');
w('├── hooks/ (via gemini-extension.json "hooks" key)');
w('│   └── hook-runner.js → src/platforms/shared/hook-runner.js');
w('│       ├── src/generated/hook-registry.json  ← hook name → module mapping');
w('│       └── src/hooks/logic/*-logic.js        ← hook implementations');
w('├── src/generated/');
w('│   ├── agent-registry.json   ← built by scripts/build-registries.js');
w('│   └── resource-registry.json');
w('└── src/lib/                  ← Pure utils (NO imports from src/core/)');
w('```');
w('');

// How to add hooks
w('## How to Add a Hook');
w('');
w('Hooks MUST be in `gemini-extension.json` → `"hooks"` key. Flat format:');
w('');
w('```json');
w('"HookEvent": [');
w('  {');
w('    "type": "command",');
w('    "command": "node \\"${extensionPath}/hooks/hook-runner.js\\" gemini <hook-name>",');
w('    "name": "gem-swarm-<hook-name>",');
w('    "description": "...",');
w('    "timeout": 10000');
w('  }');
w(']');
w('```');
w('');
w('Valid events: `SessionStart`, `BeforeAgent`, `BeforeTool`, `AfterTool`, `AfterAgent`, `SessionEnd`');
w('');
w('Then:');
w('1. Create `src/hooks/logic/<hook-name>-logic.js` exporting `handle<HookName>(ctx)`');
w('2. Add entry to `src/generated/hook-registry.json`');
w('3. Run `bash scripts/verify-hooks-loaded.sh` to validate');
w('');
w('> ⚠️ NEVER put hooks in a separate `hooks/hooks.json` — CLI ignores it.');
w('');

// Current hooks
w('### Current Hooks');
w('');
w(`| Event | Name | Matcher |`);
w(`|-------|------|---------|`);
for (const [event, entries] of Object.entries(hooks)) {
  for (const h of entries) {
    w(`| ${event} | \`${h.name}\` | ${h.matcher || '*'} |`);
  }
}
w('');

// How to add MCP tool
w('## How to Add an MCP Tool');
w('');
w('1. Create handler in `src/mcp/handlers/<tool-name>.js`');
w('2. Export: `{ name, description, inputSchema, handler }`');
w('3. The tool is auto-discovered by `src/mcp/core/tool-registry.js`');
w('');
w('### Current MCP Tools');
w('');
for (const t of mcpTools) {
  w(`- \`${t}\``);
}
w('');

// How to add agent
w('## How to Add an Agent');
w('');
w('1. Create `src/agents/<agent-name>.md` with YAML frontmatter');
w('2. Required frontmatter: `name`, `capabilities`, `tools.gemini`');
w('3. Run `node scripts/build-registries.js` to rebuild registry');
w('4. Verify with `node -e "console.log(require(\'./src/generated/agent-registry.json\').length)"`');
w('');
w('### Current Agents');
w('');
w(`| Agent | Capabilities |`);
w(`|-------|-------------|`);
for (const a of agentReg) {
  w(`| \`${a.name}\` | ${a.capabilities} |`);
}
w('');

// Settings
w('## Extension Settings');
w('');
w(`| Name | Env Var |`);
w(`|------|---------|`);
for (const s of settings) {
  w(`| ${s.name} | \`${s.envVar}\` |`);
}
w('');

// Layer rules
w('## Layer Rules');
w('');
w('`src/lib/` is a pure utility layer:');
w('- ✅ Can import: `node:*` builtins, other `src/lib/` files');
w('- ❌ Cannot import: `src/core/`, `src/mcp/`, `src/hooks/`, external packages');
w('- Enforced by: `node scripts/check-layer-boundaries.js`');
w('');

// Build commands
w('## Build & Verify');
w('');
w('```bash');
w('# Rebuild registries after changing agents/skills');
w('npm run build');
w('');
w('# Full CI check (same as GitHub Actions)');
w('node scripts/build-registries.js');
w('node scripts/check-layer-boundaries.js');
w('bash scripts/verify-hooks-loaded.sh');
w('node -e "require(\'./src/mcp/maestro-server\')"');
w('node scripts/generate-context.js');
w('```');

// Write file
const content = lines.join('\n') + '\n';
const outPath = path.join(ROOT, 'CONTEXT.md');
fs.writeFileSync(outPath, content);
console.log(`Generated CONTEXT.md (${lines.length} lines, ${content.length} bytes)`);
