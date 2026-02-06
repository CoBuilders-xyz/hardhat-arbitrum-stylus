import type { HardhatPlugin } from 'hardhat/types/plugins';

import { emptyTask, task } from 'hardhat/config';
import { ArgumentType } from 'hardhat/types/arguments';

import './type-extensions.js';

// Export temp-node utilities for use by other plugins
export {
  generateTempContainerName,
  registerTempContainer,
  unregisterTempContainer,
  getActiveTempContainer,
  setActiveTempContainer,
  isTempContainerRunning,
  cleanupTempContainer,
  cleanupAllTempContainers,
  ensureExitHandlerRegistered,
} from './temp-node.js';

const hardhatArbNodePlugin: HardhatPlugin = {
  id: 'hardhat-arb-node',
  npmPackage: '@cobuilders/hardhat-arb-node',
  hookHandlers: {
    config: () => import('./hook-handlers/config.js'),
    hre: () => import('./hook-handlers/hre.js'),
    network: () => import('./hook-handlers/network.js'),
  },
  tasks: [
    emptyTask('arb:node', 'Manage Arbitrum nitro-devnode').build(),

    task(['arb:node', 'start'], 'Start the local Arbitrum node')
      .addFlag({
        name: 'quiet',
        description: 'Suppress output',
      })
      .addFlag({
        name: 'detach',
        shortName: 'd',
        description: 'Run in background without attaching to logs',
      })
      .addFlag({
        name: 'stylusReady',
        description:
          'Deploy CREATE2 factory, Cache Manager, and StylusDeployer',
      })
      .addOption({
        name: 'name',
        type: ArgumentType.STRING,
        defaultValue: '',
        description: 'Custom container name (default: nitro-devnode)',
      })
      .addOption({
        name: 'httpPort',
        type: ArgumentType.INT,
        defaultValue: 0,
        description: 'Custom HTTP port (default: from config)',
      })
      .addOption({
        name: 'wsPort',
        type: ArgumentType.INT,
        defaultValue: 0,
        description: 'Custom WebSocket port (default: from config)',
      })
      .setAction(() => import('./tasks/start.js'))
      .build(),

    task(['arb:node', 'stop'], 'Stop the local Arbitrum node')
      .addFlag({
        name: 'quiet',
        description: 'Suppress output',
      })
      .addOption({
        name: 'name',
        type: ArgumentType.STRING,
        defaultValue: '',
        description: 'Container name (default: nitro-devnode)',
      })
      .setAction(() => import('./tasks/stop.js'))
      .build(),

    task(['arb:node', 'status'], 'Check if the Arbitrum node is running')
      .addOption({
        name: 'name',
        type: ArgumentType.STRING,
        defaultValue: '',
        description: 'Container name (default: nitro-devnode)',
      })
      .setAction(() => import('./tasks/status.js'))
      .build(),

    task(['arb:node', 'logs'], 'Show Arbitrum node logs')
      .addFlag({
        name: 'follow',
        shortName: 'f',
        description: 'Follow log output',
      })
      .addOption({
        name: 'tail',
        shortName: 'n',
        type: ArgumentType.INT,
        defaultValue: 50,
        description: 'Number of lines to show from end of logs',
      })
      .addOption({
        name: 'name',
        type: ArgumentType.STRING,
        defaultValue: '',
        description: 'Container name (default: nitro-devnode)',
      })
      .setAction(() => import('./tasks/logs.js'))
      .build(),
  ],
};

export default hardhatArbNodePlugin;
