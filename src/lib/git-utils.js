'use strict';

const { execFileSync } = require('node:child_process');

/**
 * Run a git command safely via execFileSync (no shell injection).
 * @param {string[]} args - Git subcommand arguments
 * @param {string} cwd - Working directory
 * @param {number} [timeout=5000] - Timeout in ms
 * @returns {{ success: boolean, output: string }}
 */
function runGit(args, cwd, timeout = 5000) {
  try {
    const output = execFileSync('git', args, {
      encoding: 'utf8',
      timeout,
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      maxBuffer: 5 * 1024 * 1024,
    });
    return { success: true, output: output || '' };
  } catch (_) {
    return { success: false, output: '' };
  }
}

/**
 * Check if a directory is inside a git repository.
 * @param {string} cwd - Directory to check
 * @returns {boolean}
 */
function isGitRepo(cwd) {
  return runGit(['rev-parse', '--git-dir'], cwd).success;
}

/**
 * Check if the working tree has uncommitted changes.
 * @param {string} cwd - Working directory
 * @returns {boolean}
 */
function hasUncommittedChanges(cwd) {
  const result = runGit(['status', '--porcelain'], cwd);
  return result.success && result.output.trim().length > 0;
}

/**
 * Create a git stash checkpoint WITHOUT modifying the working tree.
 *
 * Uses `git stash create` (produces a stash commit object in memory)
 * followed by `git stash store` (records the ref in the stash list).
 * This pair never touches the working directory or index — it only
 * snapshots the current state for later recovery.
 *
 * Adapted from richardcb/oh-my-gemini hooks/lib/utils.js (MIT).
 *
 * @param {string} message - Stash message (e.g. "gem-swarm-checkpoint-2026-04-22T16-08-30-123Z")
 * @param {string} cwd - Working directory
 * @returns {boolean} true if checkpoint was created
 */
function createGitCheckpoint(message, cwd) {
  if (!hasUncommittedChanges(cwd)) {
    return false;
  }

  const createResult = runGit(['stash', 'create'], cwd, 30000);
  if (!createResult.success || !createResult.output.trim()) {
    return false;
  }

  const stashHash = createResult.output.trim();
  const storeResult = runGit(['stash', 'store', '-m', message, stashHash], cwd, 30000);

  if (storeResult.success) {
    process.stderr.write(`[gem-swarm] Git checkpoint created: ${message}\n`);
  }

  return storeResult.success;
}

module.exports = { isGitRepo, hasUncommittedChanges, createGitCheckpoint };
