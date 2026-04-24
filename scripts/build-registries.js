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
    const fmLines = fmMatch[1].split('\n');
    for (let i = 0; i < fmLines.length; i++) {
      const line = fmLines[i];
      const idx = line.indexOf(':');
      if (idx === -1) continue;
      // Skip indented lines (they are list items belonging to a previous key)
      if (/^\s+-\s/.test(line)) continue;
      const key = line.substring(0, idx).trim();
      let val = line.substring(idx + 1).trim();
      // If value is empty, check for multi-line YAML list on following lines
      if (!val) {
        const items = [];
        while (i + 1 < fmLines.length && /^\s+-\s/.test(fmLines[i + 1])) {
          items.push(fmLines[i + 1].replace(/^\s+-\s*/, '').trim());
          i++;
        }
        if (items.length > 0) {
          val = '[' + items.join(', ') + ']';
        }
      }
      fm[key] = val;
    }

    const name = path.basename(file, '.md');
    const capabilities = fm.capabilities || 'read_only';
    
    // Parse tools array
    let tools = [];
    const toolsStr = fm['tools.gemini'] || fm.tools || '[]';
    const toolsMatch = toolsStr.match(/\[(.*)\]/);
    if (toolsMatch) {
      tools = toolsMatch[1].split(',').map(t => t.trim()).filter(Boolean);
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
