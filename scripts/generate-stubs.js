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
  
  // Parse frontmatter (supports both inline arrays and multi-line YAML lists)
  const fm = {};
  let lastKey = null;
  for (const line of fmMatch[1].split('\n')) {
    // Multi-line list item: "  - value"
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
    const val = line.substring(idx + 1).trim();
    fm[key] = val;
    lastKey = key;
  }



  // Parse tools into YAML list format (Gemini CLI requires `-` list, not inline `[...]`)
  const toolsRaw = fm['tools.gemini'] || fm.tools || '[]';
  const toolsList = toolsRaw
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);
  const toolsYaml = toolsList.map(t => `  - ${t}`).join('\n');

  // Build stub with Gemini CLI native frontmatter
  const stub = [
    '---',
    `name: ${stubName}`,
    `description: ${fm.description || `"${agentName} specialist agent"`}`,
    'kind: local',
    'tools:',
    toolsYaml,
    `max_turns: ${fm.max_turns || 25}`,
    `temperature: ${fm.temperature || 0.2}`,
    `timeout_mins: ${fm.timeout_mins || 10}`,
    'mcp_servers:',
    '  gem-swarm:',
    `    command: 'node'`,
    `    args: ['\${extensionPath}/mcp/gem-swarm-server.js']`,
    `    cwd: '\${extensionPath}'`,
    `    trust: true`,
    '---',
    '',
    `# ${agentName} specialist`,
    '',
    '## Activation Protocol',
    '',
    'On activation, load your full methodology and skills:',
    '',
    '1. Call `mcp_gem-swarm_get_agent` with your agent name to load your complete methodology.',
    '2. Call `mcp_gem-swarm_get_skill_content` for each skill listed in your methodology.',
    '3. Apply the loaded methodology to the task.',
    '',
    '## Direct @agent Mode',
    '',
    'When invoked directly via `@' + stubName + '`:',
    '- You are NOT inside an orchestration session',
    '- Do NOT produce `## Task Report` or `## Downstream Context` headers',
    '- Respond naturally as a specialist, applying your loaded methodology',
    '',
    '## Orchestrated Mode',
    '',
    'When delegated by the orchestrator (your prompt starts with `Agent: / Phase: / Batch: / Session:`):',
    '- Follow the delegation prompt precisely',
    '- End your response with `## Task Report` and `## Downstream Context` sections',
    '',
  ].join('\n');

  fs.writeFileSync(path.join(OUT_DIR, `${stubName}.md`), stub);
  console.log(`✓ ${stubName}.md`);
  count++;
}

console.log(`\nGenerated ${count} agent stubs in agents/`);
