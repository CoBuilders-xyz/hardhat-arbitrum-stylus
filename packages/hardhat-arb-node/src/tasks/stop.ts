import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

import { DockerClient } from '@cobuilders/hardhat-arb-utils';

import { CONTAINER_NAME } from '../config/defaults.js';

interface TaskStopArguments {
  quiet: boolean;
  name: string;
}

const taskStop: NewTaskActionFunction<TaskStopArguments> = async (
  args,
  _hre: HardhatRuntimeEnvironment,
) => {
  const { quiet, name } = args;
  const containerName = name || CONTAINER_NAME;
  const client = new DockerClient();

  if (!quiet) {
    console.log(`Stopping Arbitrum node ${containerName}...`);
  }

  const containerId = await client.findByName(containerName);
  if (!containerId) {
    if (!quiet) {
      console.log('Node is not running.');
    }
    return;
  }

  try {
    await client.stop(containerId);
  } catch {
    // Container may already be stopped
  }

  // Try to remove, but ignore errors (container may be auto-removed)
  try {
    await client.remove(containerId, true);
  } catch {
    // Container may already be removed (autoRemove flag)
  }

  if (!quiet) {
    console.log('Node stopped.');
  }
};

export default taskStop;
