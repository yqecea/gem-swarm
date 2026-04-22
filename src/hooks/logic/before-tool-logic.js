'use strict';

const { log } = require('../../core/logger');
const { resolveProjectRoot } = require('../../core/project-root-resolver');
const { isGitRepo, hasUncommittedChanges, createGitCheckpoint } = require('../../lib/git-utils');

/**
 * Check if git checkpoints are enabled via environment variable.
 * Default: true (enabled) unless explicitly set to 'false' or '0'.
 * @returns {boolean}
 */
function isCheckpointEnabled() {
  const val = process.env.GEM_SWARM_GIT_CHECKPOINTS;
  if (val === undefined || val === null || val === '') {
    return true;
  }
  return val !== 'false' && val !== '0';
}

/**
 * Before-tool hook logic (runtime-agnostic).
 *
 * Creates a git stash checkpoint before file write/replace operations.
 * Matched on: write_file | replace
 *
 * The checkpoint uses `git stash create` + `git stash store` which
 * snapshots the current working tree state WITHOUT modifying it.
 * Recovery: `git stash pop` or `git stash apply stash@{N}`
 *
 * @param {object} ctx - Internal context contract
 * @param {string} ctx.cwd - Working directory
 * @param {string} ctx.toolName - Name of the tool being called
 * @param {object} ctx.toolInput - Tool input object
 * @returns {{ action: string, message: string|null, reason: null }}
 */
function handleBeforeTool(ctx) {
  const toolName = ctx.toolName || '';

  if (!isCheckpointEnabled()) {
    return { action: 'allow', message: null, reason: null };
  }

  const isWriteOp = toolName === 'write_file' || toolName === 'replace';
  if (!isWriteOp) {
    return { action: 'allow', message: null, reason: null };
  }

  let projectRoot;
  try {
    projectRoot = resolveProjectRoot();
  } catch (_) {
    return { action: 'allow', message: null, reason: null };
  }

  if (!isGitRepo(projectRoot)) {
    return { action: 'allow', message: null, reason: null };
  }

  if (!hasUncommittedChanges(projectRoot)) {
    return { action: 'allow', message: null, reason: null };
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const checkpointName = `gem-swarm-checkpoint-${timestamp}`;

  const created = createGitCheckpoint(checkpointName, projectRoot);
  if (created) {
    log('INFO', `BeforeTool: checkpoint ${checkpointName}`);
    return {
      action: 'allow',
      message: `Git checkpoint: ${checkpointName}`,
      reason: null,
    };
  }

  return { action: 'allow', message: null, reason: null };
}

module.exports = { handleBeforeTool };
