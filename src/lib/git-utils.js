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
 * Check if there are any changes (tracked or untracked).
 * @param {string} cwd - Working directory
 * @returns {boolean}
 */
function hasUncommittedChanges(cwd) {
  const result = runGit(['status', '--porcelain'], cwd);
  return result.success && result.output.trim().length > 0;
}

/**
 * Check if there are tracked (staged or modified) changes.
 * Excludes untracked files (??) since git stash create ignores them.
 * @param {string} cwd - Working directory
 * @returns {boolean}
 */
function hasTrackedChanges(cwd) {
  const result = runGit(['status', '--porcelain'], cwd);
  if (!result.success) return false;
  const lines = result.output.trim().split('\n').filter(Boolean);
  return lines.some((line) => !line.startsWith('??'));
}

/**
 * Create a git stash checkpoint WITHOUT modifying the working tree.
 *
 * Strategy:
 * - If tracked changes exist: `git stash create` works directly.
 * - If only untracked files exist: temporarily stage them with
 *   `git add -A`, run `git stash create`, then `git reset` to
 *   restore the index. This is safe because stash create does not
 *   touch the working directory.
 *
 * Uses `git stash create` (produces a stash commit object in memory)
 * followed by `git stash store` (records the ref in the stash list).
 *
 * Adapted from richardcb/oh-my-gemini hooks/lib/utils.js (MIT).
 *
 * @param {string} message - Stash message
 * @param {string} cwd - Working directory
 * @returns {boolean} true if checkpoint was created
 */
function createGitCheckpoint(message, cwd) {
  if (!hasUncommittedChanges(cwd)) {
    return false;
  }

  const onlyUntracked = !hasTrackedChanges(cwd);
  let needsReset = false;

  // git stash create ignores untracked files.
  // Temporarily stage them so stash create can see them.
  if (onlyUntracked) {
    const addResult = runGit(['add', '-A'], cwd, 10000);
    if (!addResult.success) {
      return false;
    }
    needsReset = true;
  }

  const createResult = runGit(['stash', 'create'], cwd, 30000);

  // Always restore index if we staged untracked files
  if (needsReset) {
    runGit(['reset'], cwd, 10000);
  }

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

