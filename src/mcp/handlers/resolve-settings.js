'use strict';

const { resolveSetting } = require('../../config/setting-resolver');

const KNOWN_SETTINGS = [
  'GEM_SWARM_DISABLED_AGENTS',
  'GEM_SWARM_MAX_RETRIES',
  'GEM_SWARM_AUTO_ARCHIVE',
  'GEM_SWARM_VALIDATION_STRICTNESS',
  'GEM_SWARM_STATE_DIR',
  'GEM_SWARM_MAX_CONCURRENT',
  'GEM_SWARM_EXECUTION_MODE',
];

function handleResolveSettings(params, projectRoot) {
  const requested =
    Array.isArray(params.settings) && params.settings.length > 0
      ? params.settings.filter((name) => KNOWN_SETTINGS.includes(name))
      : KNOWN_SETTINGS;

  const settings = {};
  for (const name of requested) {
    settings[name] = resolveSetting(name, projectRoot) ?? null;
  }

  return {
    settings,
    disabled_agents: settings.GEM_SWARM_DISABLED_AGENTS
      ? settings.GEM_SWARM_DISABLED_AGENTS.split(',')
          .map((value) => value.trim())
          .filter(Boolean)
      : [],
  };
}

module.exports = {
  KNOWN_SETTINGS,
  handleResolveSettings,
};
