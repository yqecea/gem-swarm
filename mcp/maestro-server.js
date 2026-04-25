'use strict';

process.env.GEM_SWARM_RUNTIME = process.env.GEM_SWARM_RUNTIME || 'gemini';
require('../src/mcp/maestro-server').main();
