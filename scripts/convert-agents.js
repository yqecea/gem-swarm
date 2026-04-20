#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const AG_KIT_DIR = path.resolve(__dirname, '..', '.agent', 'agents');
const OUTPUT_DIR = path.resolve(__dirname, '..', 'src', 'agents');

// Tool mapping: AG Kit abstract names → Gemini CLI tool names
const TOOL_MAP = {
  'Read': ['read_file', 'read_many_files'],
  'Grep': ['grep_search'],
  'Glob': ['glob'],
  'Bash': ['run_shell_command'],
  'Edit': ['replace'],
  'Write': ['write_file'],
  'ViewCodeItem': ['read_file'],
  'FindByName': ['grep_search'],
  'Agent': [], // orchestrator-only, removed for subagents
};

// Capability mapping based on tools
function resolveCapabilities(tools) {
  const hasWrite = tools.includes('Write') || tools.includes('Edit');
  const hasShell = tools.includes('Bash');
  if (hasWrite && hasShell) return 'full';
  if (hasShell) return 'read_shell';
  return 'read_only';
}

// Map AG Kit tools to Gemini CLI tools
function mapTools(toolsStr) {
  const rawTools = toolsStr.split(',').map(t => t.trim()).filter(Boolean);
  const mapped = new Set();
  
  for (const tool of rawTools) {
    const geminiTools = TOOL_MAP[tool];
    if (geminiTools) {
      geminiTools.forEach(t => mapped.add(t));
    }
  }
  
  // Always add list_directory and ask_user
  mapped.add('list_directory');
  mapped.add('ask_user');
  
  return Array.from(mapped);
}

// Determine appropriate max_turns based on agent complexity
function resolveMaxTurns(name, lineCount) {
  if (name.includes('explorer') || name.includes('planner')) return 15;
  if (name.includes('product-owner') || name.includes('product-manager')) return 15;
  if (lineCount > 400) return 30;
  if (lineCount > 200) return 25;
  return 20;
}

// Parse AG Kit frontmatter
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;
  
  const fmLines = match[1].split('\n');
  const fm = {};
  
  for (const line of fmLines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.substring(0, colonIdx).trim();
    const value = line.substring(colonIdx + 1).trim();
    fm[key] = value;
  }
  
  return { frontmatter: fm, body: match[2] };
}

// Convert one agent
function convertAgent(filename) {
  const agentName = path.basename(filename, '.md');
  if (agentName === 'orchestrator') return null; // orchestrator → GEMINI.md
  
  const content = fs.readFileSync(path.join(AG_KIT_DIR, filename), 'utf8');
  const parsed = parseFrontmatter(content);
  if (!parsed) {
    console.error(`Failed to parse frontmatter: ${filename}`);
    return null;
  }
  
  const { frontmatter: fm, body } = parsed;
  const lineCount = content.split('\n').length;
  
  // Map tools
  const toolsStr = fm.tools || 'Read, Grep, Glob';
  const geminiTools = mapTools(toolsStr);
  const capabilities = resolveCapabilities(toolsStr.split(',').map(t => t.trim()));
  
  // Add google_web_search for research-capable agents
  const researchAgents = ['explorer-agent', 'security-auditor', 'seo-specialist', 
    'devops-engineer', 'performance-optimizer', 'penetration-tester'];
  if (researchAgents.includes(agentName)) {
    geminiTools.push('google_web_search');
  }
  
  const maxTurns = resolveMaxTurns(agentName, lineCount);
  
  // Build new frontmatter
  const toolsArray = `[${geminiTools.join(', ')}]`;
  
  const newFrontmatter = [
    '---',
    `name: ${agentName}`,
    `description: "${(fm.description || '').replace(/"/g, '\\"')}"`,
    `color: blue`,
    `tools: ${toolsArray}`,
    `tools.gemini: ${toolsArray}`,
    `max_turns: ${maxTurns}`,
    `temperature: 0.2`,
    `timeout_mins: 10`,
    `capabilities: ${capabilities}`,
    '---',
  ].join('\n');
  
  return {
    name: agentName,
    content: newFrontmatter + '\n' + body,
  };
}

// Main
const files = fs.readdirSync(AG_KIT_DIR).filter(f => f.endsWith('.md'));
let count = 0;

for (const file of files) {
  const result = convertAgent(file);
  if (!result) continue;
  
  const outputPath = path.join(OUTPUT_DIR, `${result.name}.md`);
  fs.writeFileSync(outputPath, result.content);
  const lines = result.content.split('\n').length;
  console.log(`✓ ${result.name}.md (${lines} lines)`);
  count++;
}

console.log(`\nConverted ${count} agents to Gemini CLI format.`);
