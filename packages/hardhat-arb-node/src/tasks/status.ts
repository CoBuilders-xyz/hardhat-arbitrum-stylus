import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

import { DockerClient } from '@cobuilders/hardhat-arb-utils';

import { CONTAINER_NAME } from '../config/defaults.js';

interface TaskStatusArguments {
  name: string;
}

const taskStatus: NewTaskActionFunction<TaskStatusArguments> = async (
  args,
  hre: HardhatRuntimeEnvironment,
) => {
  const { name } = args;
  const containerName = name || CONTAINER_NAME;
  const config = hre.config.arbNode;
  const client = new DockerClient();

  const containerId = await client.findByName(containerName);
  if (!containerId) {
    console.log(`Node ${containerName} is not running.`);
    return;
  }

  const isRunning = await client.isRunning(containerId);
  if (isRunning) {
    console.log(`Node ${containerName} is running.`);
    console.log(`  HTTP RPC: http://localhost:${config.httpPort}`);
    console.log(`  WebSocket: ws://localhost:${config.wsPort}`);
  } else {
    console.log(`Node ${containerName} container exists but is not running.`);
  }
};

export default taskStatus;
