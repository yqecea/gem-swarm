#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '..', 'src');

// ─── Build Agent Registry ────────────────────────────────────────────
function buildAgentRegistry() {
  const agentsDir = path.join(SRC, 'agents');
  const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md')).sort();
  const registry = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(agentsDir, file), 'utf8');
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) continue;

    const fm = {};
    let lastKey = null;
    for (const line of fmMatch[1].split('\n')) {
      if (/^\s+-\s+/.test(line) && lastKey) {
        const item = line.replace(/^\s+-\s+/, '').trim();
        if (item) {
          const existing = fm[lastKey];
          fm[lastKey] = existing ? `${existing}, ${item}` : item;
        }
        continue;
      }
      const idx = line.indexOf(':');
      if (idx === -1) continue;
      const key = line.substring(0, idx).trim();
      fm[key] = line.substring(idx + 1).trim();
      lastKey = key;
    }

    const name = path.basename(file, '.md');
    const capabilities = fm.capabilities || 'read_only';
    
    // Parse tools array (handles both "[a, b, c]" and "a, b, c" from multi-line)
    let tools = [];
    const toolsStr = fm['tools.gemini'] || fm.tools || '';
    if (toolsStr) {
      const cleaned = toolsStr.replace(/^\[|\]$/g, '');
      tools = cleaned.split(',').map(t => t.trim()).filter(Boolean);
    }

    if (tools.length === 0) {
      console.error(`ERROR: ${name} has 0 tools — check frontmatter for 'tools' or 'tools.gemini'`);
      process.exit(1);
    }
    registry.push({ name, capabilities, tools });
  }

  return registry;
}

// ─── Build Resource Registry ─────────────────────────────────────────
function buildResourceRegistry() {
  const registry = {};

  // 1. Shared orchestration skills (from Maestro)
  const sharedDir = path.join(SRC, 'skills', 'shared');
  if (fs.existsSync(sharedDir)) {
    scanSkillDir(sharedDir, 'skills/shared', registry);
  }

  // 2. Domain skills (from AG Kit)
  const domainDir = path.join(SRC, 'skills', 'domain');
  if (fs.existsSync(domainDir)) {
    const entries = fs.readdirSync(domainDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const skillPath = path.join(domainDir, entry.name, 'SKILL.md');
      if (fs.existsSync(skillPath)) {
        registry[entry.name] = `skills/domain/${entry.name}/SKILL.md`;
      }
    }
  }

  // 3. Templates
  const templatesDir = path.join(SRC, 'templates');
  if (fs.existsSync(templatesDir)) {
    for (const file of fs.readdirSync(templatesDir).filter(f => f.endsWith('.md'))) {
      registry[path.basename(file, '.md')] = `templates/${file}`;
    }
  }

  // 4. References
  const refsDir = path.join(SRC, 'references');
  if (fs.existsSync(refsDir)) {
    for (const file of fs.readdirSync(refsDir).filter(f => f.endsWith('.md'))) {
      registry[path.basename(file, '.md')] = `references/${file}`;
    }
  }

  return registry;
}

function scanSkillDir(dir, prefix, registry) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    
    const subDir = path.join(dir, entry.name);
    const skillFile = path.join(subDir, 'SKILL.md');
    
    if (fs.existsSync(skillFile)) {
      registry[entry.name] = `${prefix}/${entry.name}/SKILL.md`;
    }
    
    // Check for protocol files
    const protocolsDir = path.join(subDir, 'protocols');
    if (fs.existsSync(protocolsDir)) {
      for (const pFile of fs.readdirSync(protocolsDir).filter(f => f.endsWith('.md'))) {
        registry[path.basename(pFile, '.md')] = `${prefix}/${entry.name}/protocols/${pFile}`;
      }
    }
  }
}

// ─── Build Hook Registry ─────────────────────────────────────────────
function buildHookRegistry() {
  const logicDir = path.join(SRC, 'hooks', 'logic');
  if (!fs.existsSync(logicDir)) return {};

  const files = fs.readdirSync(logicDir)
    .filter(f => f.endsWith('-logic.js'))
    .sort();

  const registry = {};
  for (const file of files) {
    // before-tool-logic.js → hook name "before-tool", fn "handleBeforeTool"
    const hookName = file.replace(/-logic\.js$/, '');
    const parts = hookName.split('-');
    const fnName = 'handle' + parts.map(p => p[0].toUpperCase() + p.slice(1)).join('');
    registry[hookName] = {
      module: `hooks/logic/${file}`,
      fn: fnName,
    };
  }

  return registry;
}

// ─── Main ────────────────────────────────────────────────────────────
const outDir = path.join(SRC, 'generated');
fs.mkdirSync(outDir, { recursive: true });

const agentReg = buildAgentRegistry();
fs.writeFileSync(
  path.join(outDir, 'agent-registry.json'),
  JSON.stringify(agentReg, null, 2) + '\n'
);
console.log(`Agent registry: ${agentReg.length} agents`);
agentReg.forEach(a => console.log(`  ${a.name} (${a.capabilities})`));

const resourceReg = buildResourceRegistry();
fs.writeFileSync(
  path.join(outDir, 'resource-registry.json'),
  JSON.stringify(resourceReg, null, 2) + '\n'
);
const keys = Object.keys(resourceReg);
console.log(`\nResource registry: ${keys.length} resources`);
keys.forEach(k => console.log(`  ${k} → ${resourceReg[k]}`));

const hookReg = buildHookRegistry();
fs.writeFileSync(
  path.join(outDir, 'hook-registry.json'),
  JSON.stringify(hookReg, null, 2) + '\n'
);
console.log(`\nHook registry: ${Object.keys(hookReg).length} hooks`);
Object.entries(hookReg).forEach(([k, v]) => console.log(`  ${k} → ${v.module} . ${v.fn}()`));
