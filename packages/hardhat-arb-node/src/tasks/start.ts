import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

import {
  ContainerManager,
  type ContainerConfig,
} from '@cobuilders/hardhat-arb-utils';

import { CONTAINER_NAME } from '../config/defaults.js';

interface TaskStartArguments {
  quiet: boolean;
}

const taskStart: NewTaskActionFunction<TaskStartArguments> = async (
  args,
  hre: HardhatRuntimeEnvironment,
) => {
  const { quiet } = args;
  const config = hre.config.arbNode;
  const manager = new ContainerManager();

  if (!quiet) {
    console.log('Starting Arbitrum nitro-devnode...');
  }

  const containerConfig: ContainerConfig = {
    image: config.image,
    tag: config.tag,
    name: CONTAINER_NAME,
    ports: [
      { host: config.httpPort, container: 8547 },
      { host: config.wsPort, container: 8548 },
    ],
    command: [
      '--dev',
      '--http.api=eth,net,web3,debug',
      '--http.corsdomain=*',
      '--http.addr=0.0.0.0',
      '--http.vhosts=*',
      '--ws.api=eth,net,web3,debug',
      '--ws.addr=0.0.0.0',
      '--ws.origins=*',
    ],
    readinessCheck: {
      type: 'http',
      target: `http://localhost:${config.httpPort}`,
      timeout: 30000,
      interval: 1000,
    },
    autoRemove: true,
    detach: true,
  };

  const containerInfo = await manager.start(containerConfig);

  if (!quiet) {
    console.log(`Node started (container: ${containerInfo.id.slice(0, 12)})`);
    console.log(`  HTTP RPC: http://localhost:${config.httpPort}`);
    console.log(`  WebSocket: ws://localhost:${config.wsPort}`);
  }
};

export default taskStart;
