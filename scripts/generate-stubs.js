#!/usr/bin/env node
'use strict';

// Generates agent STUB files in agents/ from full bodies in src/agents/
// Stubs are what Gemini CLI reads to register native subagent tools
// Full bodies are loaded via MCP get_agent at delegation time

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, '..', 'src', 'agents');
const OUT_DIR = path.resolve(__dirname, '..', 'agents');

fs.mkdirSync(OUT_DIR, { recursive: true });

// Clean existing stubs
for (const f of fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.md'))) {
  fs.unlinkSync(path.join(OUT_DIR, f));
}

const files = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.md')).sort();
let count = 0;

for (const file of files) {
  const content = fs.readFileSync(path.join(SRC_DIR, file), 'utf8');
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) continue;

  const agentName = path.basename(file, '.md');
  
  // Convert kebab-case to snake_case for Gemini CLI
  const stubName = agentName.replace(/-/g, '_');
  
  // Parse frontmatter
  const fm = {};
  for (const line of fmMatch[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.substring(0, idx).trim();
    const val = line.substring(idx + 1).trim();
    fm[key] = val;
  }

  // Build stub with Gemini CLI native frontmatter
  const stub = [
    '---',
    `name: ${stubName}`,
    `description: ${fm.description || `"${agentName} specialist agent"`}`,
    'kind: local',
    `tools: ${fm['tools.gemini'] || fm.tools || '[]'}`,
    `max_turns: ${fm.max_turns || 25}`,
    `temperature: ${fm.temperature || 0.2}`,
    `timeout_mins: ${fm.timeout_mins || 10}`,
    '---',
    '',
    `You are the ${agentName} specialist. Your full methodology is loaded via the gem-swarm MCP server.`,
    '',
    'When you receive a delegation, follow the methodology precisely.',
    '',
  ].join('\n');

  fs.writeFileSync(path.join(OUT_DIR, `${stubName}.md`), stub);
  console.log(`✓ ${stubName}.md`);
  count++;
}

console.log(`\nGenerated ${count} agent stubs in agents/`);
