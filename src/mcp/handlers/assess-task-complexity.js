'use strict';

const fs = require('fs');
const path = require('path');

const CONFIG_FILES = [
  '.eslintrc',
  '.prettierrc',
  'tsconfig.json',
  'webpack.config.js',
  'vite.config.js',
  'next.config.js',
  '.env',
  'docker-compose.yml',
  'Dockerfile',
  'Makefile',
];

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '__pycache__',
  'venv',
  '.venv',
  'target',
  'vendor',
  '.cache',
  '.output',
  'coverage',
  '.nyc_output',
  '.pytest_cache',
]);

const FRAMEWORK_INDICATORS = {
  react: ['react', 'react-dom'],
  vue: ['vue'],
  angular: ['@angular/core'],
  next: ['next'],
  express: ['express'],
  fastify: ['fastify'],
  django: ['django'],
  flask: ['flask'],
  rails: ['rails'],
};

// --- Task Signal Patterns ---
// Each array is tested against the task_description text.
// Multiple matches within the same tier reinforce confidence.
// Order matters: trivial is checked first, complex last.

const TRIVIAL_PATTERNS = [
  // Config/setting changes
  /\b(?:change|update|set|modify|edit|switch|replace)\b.*\b(?:config|port|setting|env|variable|value|version|url|host|domain|path)\b/i,
  // Service lifecycle
  /\b(?:restart|reload|stop|start|bounce|reboot)\b.*\b(?:service|server|nginx|apache|pm2|docker|container|systemd|process|daemon)\b/i,
  // Typo / rename
  /\b(?:typo|rename|spelling|s\/.*\/.*\/)\b/i,
  // Single dependency operations
  /\b(?:add|remove|install|uninstall|upgrade|downgrade)\b.*\b(?:import|dependency|package|library|module)\b/i,
  // Toggle / enable / disable
  /\b(?:enable|disable|toggle|turn on|turn off|activate|deactivate)\b.*\b(?:feature|flag|option|setting|mode|plugin)\b/i,
  // Comment out / uncomment
  /\b(?:comment out|uncomment|remove comment)\b/i,
  // Simple version bump
  /\b(?:bump|update)\b.*\b(?:version)\b/i,
];

const SIMPLE_PATTERNS = [
  // Add single unit of work
  /\b(?:add|create|implement|write)\b.*\b(?:endpoint|route|handler|function|method|hook|util|helper)\b/i,
  // Fix specific bug/error
  /\b(?:fix|resolve|patch|debug)\b.*\b(?:bug|error|issue|crash|exception|warning|failing)\b/i,
  // Single component
  /\b(?:add|create|build)\b.*\b(?:component|widget|modal|form|button|input|card)\b/i,
  // Add test
  /\b(?:add|write|create)\b.*\b(?:test|spec|assertion)\b/i,
  // Update single page/view
  /\b(?:update|modify|change)\b.*\b(?:page|view|screen|template)\b/i,
];

const COMPLEX_PATTERNS = [
  // Build full pages/apps
  /\b(?:build|create|implement|develop|make)\b.*\b(?:landing|page|dashboard|app|application|website|site|platform|portal|interface)\b/i,
  // Architectural work
  /\b(?:refactor|redesign|migrate|overhaul|restructure|rewrite|rearchitect)\b/i,
  // Multi-feature scope
  /\b(?:build|create|implement)\b.*\b(?:system|service|api|backend|frontend|pipeline|workflow)\b/i,
  // Full integrations
  /\b(?:integrate|set up|configure)\b.*\b(?:auth|authentication|payment|database|ci\/cd|deployment|monitoring)\b/i,
];

// File path detection in task text
const FILE_PATH_REGEX = /(?:^|\s|['"`])([a-zA-Z0-9_./-]+\.[a-zA-Z]{1,10})(?:\s|$|['"`])/g;

// Security-critical file patterns (used by orchestrator for review gate)
const SECURITY_CRITICAL_PATTERNS = [
  /^\.env/i,
  /auth/i,
  /secret/i,
  /\.(key|pem|cert|crt)$/i,
  /docker-compose/i,
  /Dockerfile/i,
  /firewall/i,
  /\.htaccess/i,
  /password/i,
  /token/i,
  /credential/i,
  /permissions?\.ya?ml/i,
  /policy\./i,
  /security\./i,
  /cors\./i,
];

function countPatternMatches(text, patterns) {
  let count = 0;
  for (const pattern of patterns) {
    if (pattern.test(text)) {
      count += 1;
    }
  }
  return count;
}

function extractFileTargets(text) {
  const matches = [];
  let match;
  const regex = new RegExp(FILE_PATH_REGEX.source, FILE_PATH_REGEX.flags);
  while ((match = regex.exec(text)) !== null) {
    const candidate = match[1];
    // Filter out common false positives (e.g., "v1.0", "i.e.", URLs)
    if (
      candidate.length > 2 &&
      !candidate.startsWith('http') &&
      !candidate.startsWith('www.') &&
      !/^\d+\.\d+/.test(candidate)
    ) {
      matches.push(candidate);
    }
  }
  return [...new Set(matches)];
}

function detectSecurityCriticalFiles(fileTargets) {
  return fileTargets.filter((file) =>
    SECURITY_CRITICAL_PATTERNS.some((pattern) => pattern.test(file))
  );
}

function analyzeTaskDescription(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return null;
  }

  const normalized = text.trim();
  const fileTargets = extractFileTargets(normalized);
  const securityCriticalFiles = detectSecurityCriticalFiles(fileTargets);

  const trivialScore = countPatternMatches(normalized, TRIVIAL_PATTERNS);
  const simpleScore = countPatternMatches(normalized, SIMPLE_PATTERNS);
  const complexScore = countPatternMatches(normalized, COMPLEX_PATTERNS);

  // Determine individual boolean signals
  const isConfigOnly =
    trivialScore > 0 &&
    /\b(?:config|\.env|port|setting|env|variable|value|flag)\b/i.test(
      normalized
    );
  const isSingleFileEdit =
    fileTargets.length === 1 ||
    (trivialScore > 0 && !complexScore && fileTargets.length <= 2);
  const isServiceRestart =
    /\b(?:restart|reload|stop|start|bounce|reboot)\b/i.test(normalized) &&
    /\b(?:service|server|nginx|apache|pm2|docker|container|process)\b/i.test(
      normalized
    );
  const isTypoFix = /\b(?:typo|spelling|rename)\b/i.test(normalized);
  const isGreenfield =
    /\b(?:build|create|scaffold|init|bootstrap|new)\b/i.test(normalized) &&
    /\b(?:project|app|application|site|website|service|api|dashboard|platform|portal)\b/i.test(
      normalized
    );
  const isMultiSection =
    /\b(?:landing|page|dashboard|sections?|multiple|several|full)\b/i.test(
      normalized
    ) && complexScore > 0;

  // Scope estimation
  let taskScope = 'unknown';
  if (trivialScore > 0 && complexScore === 0 && simpleScore === 0) {
    taskScope = 'atomic';
  } else if (
    simpleScore > 0 &&
    complexScore === 0 &&
    fileTargets.length <= 3
  ) {
    taskScope = 'single_feature';
  } else if (complexScore > 0 || isGreenfield || isMultiSection) {
    taskScope = fileTargets.length > 5 ? 'system' : 'multi_feature';
  } else {
    taskScope = 'single_feature';
  }

  // Estimated files touched (conservative for safety)
  let estimatedFilesTouched;
  if (fileTargets.length > 0) {
    estimatedFilesTouched = fileTargets.length;
  } else if (taskScope === 'atomic') {
    estimatedFilesTouched = 1;
  } else if (taskScope === 'single_feature') {
    estimatedFilesTouched = 3;
  } else if (taskScope === 'multi_feature') {
    estimatedFilesTouched = 8;
  } else {
    estimatedFilesTouched = 15;
  }

  // --- Tier Suggestion ---
  // This is a SUGGESTION for the model, not a final classification.
  // The model makes the final call. We provide strong signals.
  //
  // Tier ladder: trivial → simple → medium → complex
  // Escalation rules ensure safety (prefer higher tier when ambiguous).
  let suggestedTier;
  let tierConfidence;
  let tierRationale;

  if (trivialScore > 0 && complexScore === 0 && simpleScore === 0) {
    // Pure trivial signals, no competing signals
    suggestedTier = 'trivial';
    tierConfidence = trivialScore >= 2 ? 'high' : 'medium';
    tierRationale =
      'Task matches trivial patterns (config/restart/typo) with no complex or simple counter-signals.';
  } else if (trivialScore > 0 && simpleScore > 0 && complexScore === 0) {
    // Mixed trivial+simple → escalate to simple (safety)
    suggestedTier = 'simple';
    tierConfidence = 'medium';
    tierRationale =
      'Task has trivial signals but also simple-scope indicators. Escalating to simple for safety.';
  } else if (
    simpleScore > 0 &&
    complexScore === 0 &&
    estimatedFilesTouched <= 5
  ) {
    suggestedTier = 'simple';
    tierConfidence = simpleScore >= 2 ? 'high' : 'medium';
    tierRationale =
      'Task matches single-feature patterns with bounded file scope.';
  } else if (complexScore > 0 && isGreenfield) {
    suggestedTier = 'complex';
    tierConfidence = 'high';
    tierRationale =
      'Task involves building a new system/app from scratch (greenfield + complex patterns).';
  } else if (complexScore > 0 || isMultiSection) {
    suggestedTier = 'medium';
    tierConfidence = complexScore >= 2 ? 'high' : 'medium';
    tierRationale =
      'Task involves multi-feature or architectural work. Medium unless greenfield.';
  } else {
    // No clear signals — default to simple (safe middle ground)
    suggestedTier = 'simple';
    tierConfidence = 'low';
    tierRationale =
      'No strong pattern matches detected. Defaulting to simple. Model should use repo signals to refine.';
  }

  // --- Safety Escalation ---
  // If security-critical files are involved, never suggest trivial.
  // Check both extracted file paths AND security keywords in the raw text.
  const securityKeywordsInText =
    /(?:^|\s|['"`])\.env\b/i.test(normalized) ||
    /\b(?:auth|secret|password|token|credential|api.?key|private.?key|ssl|tls|certificate)\b/i.test(
      normalized
    );

  if (
    suggestedTier === 'trivial' &&
    (securityCriticalFiles.length > 0 || securityKeywordsInText)
  ) {
    suggestedTier = 'simple';
    tierConfidence = 'high';
    tierRationale =
      'Task involves security-sensitive content (files or keywords). Escalated from trivial to simple for review safety.';
  }

  return {
    task_signals: {
      estimated_files_touched: estimatedFilesTouched,
      explicit_file_targets: fileTargets,
      security_critical_files: securityCriticalFiles,
      is_config_only: isConfigOnly,
      is_single_file_edit: isSingleFileEdit,
      is_service_restart: isServiceRestart,
      is_typo_fix: isTypoFix,
      is_greenfield: isGreenfield,
      is_multi_section: isMultiSection,
      task_scope: taskScope,
    },
    suggested_tier: suggestedTier,
    tier_confidence: tierConfidence,
    tier_rationale: tierRationale,
    pattern_scores: {
      trivial: trivialScore,
      simple: simpleScore,
      complex: complexScore,
    },
  };
}

function countFiles(directory, depth, depthLimit) {
  if (depth > depthLimit) {
    return { count: 0, deepestLevel: depth };
  }

  let count = 0;
  let deepestLevel = depth;

  try {
    const entries = fs.readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
      if (SKIP_DIRS.has(entry.name)) {
        continue;
      }

      if (entry.isFile()) {
        count += 1;
        continue;
      }

      if (entry.isDirectory()) {
        const nested = countFiles(
          path.join(directory, entry.name),
          depth + 1,
          depthLimit
        );
        count += nested.count;
        deepestLevel = Math.max(deepestLevel, nested.deepestLevel);
      }
    }
  } catch {}

  return { count, deepestLevel };
}

function detectFrameworks(directory) {
  const packagePath = path.join(directory, 'package.json');
  if (!fs.existsSync(packagePath)) {
    return [];
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const allDependencies = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };

    return Object.entries(FRAMEWORK_INDICATORS)
      .filter(([, indicators]) =>
        indicators.some((indicator) => indicator in allDependencies)
      )
      .map(([name]) => name);
  } catch {
    return [];
  }
}

function estimateSize(fileCount) {
  if (fileCount === 0) {
    return 'empty';
  }

  if (fileCount <= 20) {
    return 'small';
  }

  if (fileCount <= 200) {
    return 'medium';
  }

  return 'large';
}

function handleAssessTaskComplexity(params, projectRoot) {
  const { count: fileCount, deepestLevel } = countFiles(projectRoot, 0, 10);
  const configFiles = CONFIG_FILES.filter((file) =>
    fs.existsSync(path.join(projectRoot, file))
  );

  const repoSignals = {
    file_count: fileCount,
    directory_depth: deepestLevel,
    has_package_json: fs.existsSync(path.join(projectRoot, 'package.json')),
    has_config_files: configFiles,
    frameworks_detected: detectFrameworks(projectRoot),
    existing_test_infrastructure:
      fs.existsSync(path.join(projectRoot, 'tests')) ||
      fs.existsSync(path.join(projectRoot, '__tests__')) ||
      fs.existsSync(path.join(projectRoot, 'test')),
    lines_of_code_estimate:
      fileCount <= 20 ? 'low' : fileCount <= 200 ? 'moderate' : 'high',
    repo_is_empty: fileCount === 0,
    repo_size_estimate: estimateSize(fileCount),
  };

  const taskAnalysis = analyzeTaskDescription(
    params ? params.task_description : null
  );

  if (!taskAnalysis) {
    return repoSignals;
  }

  return {
    ...repoSignals,
    ...taskAnalysis,
  };
}

module.exports = {
  handleAssessTaskComplexity,
  // Exported for testing
  analyzeTaskDescription,
  TRIVIAL_PATTERNS,
  SIMPLE_PATTERNS,
  COMPLEX_PATTERNS,
  SECURITY_CRITICAL_PATTERNS,
};
