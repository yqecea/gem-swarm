'use strict';

const { defineToolPack } = require('../contracts');
const {
  handleInitializeWorkspace,
} = require('../../handlers/initialize-workspace');
const {
  handleAssessTaskComplexity,
} = require('../../handlers/assess-task-complexity');
const { handleValidatePlan } = require('../../handlers/validate-plan');
const { handleResolveSettings } = require('../../handlers/resolve-settings');

function createToolPack() {
  return defineToolPack({
    name: 'workspace',
    tools: [
      {
        name: 'initialize_workspace',
        description:
          'Initialize Maestro workspace directories (state, plans, archives). Idempotent.',
        inputSchema: {
          type: 'object',
          properties: {
            state_dir: {
              type: 'string',
              description:
                'State directory relative to project root. Defaults to docs/maestro.',
            },
          },
        },
      },
      {
        name: 'assess_task_complexity',
        description:
          'Analyze repo structure and task text to return classification signals. Returns repo signals (file count, frameworks) and, when task_description is provided, task-aware signals (suggested_tier, task_scope, trivial indicators). The model makes the final classification decision using these signals.',
        inputSchema: {
          type: 'object',
          properties: {
            task_description: {
              type: 'string',
              description:
                'The user\'s task description text. When provided, enables task-aware signals: suggested_tier (trivial/simple/medium/complex), task_signals (is_config_only, is_single_file_edit, etc.), pattern_scores, and tier_confidence. ALWAYS pass the user request text here for accurate classification.',
            },
          },
        },
      },
      {
        name: 'validate_plan',
        description:
          'Validate an implementation plan against complexity constraints, file ownership, dependency cycles, and agent registry.',
        inputSchema: {
          type: 'object',
          properties: {
            plan: { type: 'object' },
            task_complexity: {
              type: 'string',
              enum: ['trivial', 'simple', 'medium', 'complex'],
            },
          },
          required: ['plan', 'task_complexity'],
        },
      },
      {
        name: 'resolve_settings',
        description:
          'Resolve Maestro settings using script-accurate precedence (env var > workspace .env > extension .env). Returns resolved values for requested or all known settings.',
        inputSchema: {
          type: 'object',
          properties: {
            settings: {
              type: 'array',
              items: { type: 'string' },
              description:
                'Setting names to resolve (e.g., ["GEM_SWARM_DISABLED_AGENTS"]). If empty or omitted, resolves all known settings.',
            },
          },
        },
      },
    ],
    handlers: {
      initialize_workspace: handleInitializeWorkspace,
      assess_task_complexity: handleAssessTaskComplexity,
      validate_plan: handleValidatePlan,
      resolve_settings: handleResolveSettings,
    },
  });
}

module.exports = {
  createToolPack,
};
