import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

import { DockerClient } from '@cobuilders/hardhat-arb-utils';

import { CONTAINER_NAME } from '../config/defaults.js';

const taskStatus: NewTaskActionFunction<{}> = async (
  _args,
  hre: HardhatRuntimeEnvironment,
) => {
  const config = hre.config.arbNode;
  const client = new DockerClient();

  const containerId = await client.findByName(CONTAINER_NAME);
  if (!containerId) {
    console.log('Node is not running.');
    return;
  }

  const isRunning = await client.isRunning(containerId);
  if (isRunning) {
    console.log('Node is running.');
    console.log(`  HTTP RPC: http://localhost:${config.httpPort}`);
    console.log(`  WebSocket: ws://localhost:${config.wsPort}`);
  } else {
    console.log('Node container exists but is not running.');
  }
};

export default taskStatus;
