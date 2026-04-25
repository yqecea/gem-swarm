'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SRC = path.resolve(__dirname, '..', '..', 'src');

describe('Agent Registry', () => {
  const registry = require(path.join(SRC, 'generated', 'agent-registry.json'));

  it('has 20 agents', () => {
    assert.equal(registry.length, 20);
  });

  it('every agent has tools > 0', () => {
    for (const entry of registry) {
      assert.ok(
        entry.tools && entry.tools.length > 0,
        `${entry.name} has 0 tools`
      );
    }
  });

  it('every agent has a capabilities field', () => {
    const valid = ['full', 'read_only', 'read_shell'];
    for (const entry of registry) {
      assert.ok(
        valid.includes(entry.capabilities),
        `${entry.name} has invalid capabilities: ${entry.capabilities}`
      );
    }
  });

  it('read_only agents do not have write tools', () => {
    const writeTools = ['write_file', 'replace'];
    for (const entry of registry) {
      if (entry.capabilities !== 'read_only') continue;
      for (const tool of writeTools) {
        assert.ok(
          !entry.tools.includes(tool),
          `${entry.name} (read_only) has forbidden tool: ${tool}`
        );
      }
    }
  });

  it('read_shell agents do not have write tools', () => {
    const writeTools = ['write_file', 'replace'];
    for (const entry of registry) {
      if (entry.capabilities !== 'read_shell') continue;
      for (const tool of writeTools) {
        assert.ok(
          !entry.tools.includes(tool),
          `${entry.name} (read_shell) has forbidden tool: ${tool}`
        );
      }
    }
  });
});

describe('Resource Registry', () => {
  const registry = require(path.join(SRC, 'generated', 'resource-registry.json'));

  it('has at least 50 resources', () => {
    assert.ok(Object.keys(registry).length >= 50);
  });

  it('every resource path resolves to an existing file', () => {
    for (const [name, relPath] of Object.entries(registry)) {
      const full = path.join(SRC, relPath);
      assert.ok(
        fs.existsSync(full),
        `${name} → ${full} does not exist`
      );
    }
  });
});

describe('Hook Registry', () => {
  const registry = require(path.join(SRC, 'generated', 'hook-registry.json'));

  it('has 5 hooks', () => {
    assert.equal(Object.keys(registry).length, 5);
  });

  it('every hook module exists and exports the handler function', () => {
    for (const [hookName, entry] of Object.entries(registry)) {
      const modulePath = path.resolve(SRC, entry.module);
      assert.ok(
        fs.existsSync(modulePath),
        `${hookName} → ${modulePath} does not exist`
      );
      const mod = require(modulePath);
      assert.equal(
        typeof mod[entry.fn],
        'function',
        `${hookName} → ${entry.fn} is not a function`
      );
    }
  });
});

describe('MCP Agent Tools (runtime path)', () => {
  const { readAgentFromFilesystem, AGENT_ALLOWLIST } = require(
    path.join(SRC, 'mcp', 'content', 'runtime-content')
  );

  it('every agent returns tools > 0 via readAgentFromFilesystem', () => {
    for (const name of AGENT_ALLOWLIST) {
      const result = readAgentFromFilesystem(name, { name: 'gemini' }, SRC);
      assert.ok(!result.error, `${name} returned error: ${result.error}`);
      assert.ok(
        result.agent.tools.length > 0,
        `${name} returned 0 tools via MCP path`
      );
    }
  });
});

describe('Stub-Source Parity', () => {
  it('every source has a corresponding stub', () => {
    const sources = fs.readdirSync(path.join(SRC, 'agents'))
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace(/-/g, '_'));
    const stubs = fs.readdirSync(path.resolve(__dirname, '..', '..', 'agents'))
      .filter(f => f.endsWith('.md'));

    assert.deepEqual(sources.sort(), stubs.sort());
  });
});

describe('Agent Frontmatter Format', () => {
  it('all agents use inline array format for tools.gemini', () => {
    const agentsDir = path.join(SRC, 'agents');
    const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));

    for (const file of files) {
      const content = fs.readFileSync(path.join(agentsDir, file), 'utf8');
      const hasMultiLine = /^tools\.gemini:\s*$/m.test(content);
      assert.ok(
        !hasMultiLine,
        `${file} uses multi-line YAML for tools.gemini — must use inline array [a, b, c]`
      );
    }
  });
});
