import { createConnection } from 'node:net';

import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

import {
  type ContainerConfig,
  ContainerManager,
  DockerClient,
} from '@cobuilders/hardhat-arb-utils';
import { createPluginError } from '@cobuilders/hardhat-arb-utils/errors';

import { CONTAINER_NAME } from '../config/defaults.js';
import { printStartupInfo } from '../utils/startup-info.js';
import {
  performEssentialSetup,
  prefundAccounts,
} from '../utils/chain-setup.js';
import {
  deployCreate2Factory,
  deployCacheManager,
  deployStylusDeployer,
} from '../utils/chain-infra.js';

interface TaskStartArguments {
  quiet: boolean;
  detach: boolean;
  name: string;
  httpPort: number;
  wsPort: number;
  dockerNetwork: string;
}

/**
 * Check if a port is already in use.
 */
function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = createConnection({ port, host: '127.0.0.1' }, () => {
      socket.end();
      resolve(true);
    });

    socket.on('error', () => {
      resolve(false);
    });

    socket.setTimeout(1000, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

/**
 * Attach to container logs (only new logs from this point)
 * Stops the container when user presses Ctrl+C
 */
async function attachToLogs(containerId: string): Promise<void> {
  const client = new DockerClient();

  console.log('Listening for transactions...\n');

  // Use tail: 0 to only show new logs from this point, not historical logs
  const logProcess = client.streamLogs(containerId, { tail: 0 });

  logProcess.stdout?.pipe(process.stdout);
  logProcess.stderr?.pipe(process.stderr);

  // Handle graceful shutdown - stop container when user presses Ctrl+C
  const cleanup = async () => {
    logProcess.kill();
    console.log('\nStopping node...');
    try {
      await client.stop(containerId);
    } catch {
      // Container may already be stopped
    }
    process.exit(0);
  };

  process.on('SIGINT', () => void cleanup());
  process.on('SIGTERM', () => void cleanup());

  await new Promise<void>((resolve, reject) => {
    logProcess.on('exit', () => resolve());
    logProcess.on('error', reject);
  });
}

const taskStart: NewTaskActionFunction<TaskStartArguments> = async (
  args,
  hre: HardhatRuntimeEnvironment,
) => {
  const {
    quiet,
    detach,
    name,
    httpPort: customHttpPort,
    wsPort: customWsPort,
    dockerNetwork,
  } = args;
  const config = hre.config.stylus.node;
  const manager = new ContainerManager();

  // Use custom ports if provided, otherwise use config
  const httpPort = customHttpPort || config.httpPort;
  const wsPort = customWsPort || config.wsPort;
  const rpcUrl = `http://localhost:${httpPort}`;

  // Use custom name if provided, otherwise use default
  const containerName = name || CONTAINER_NAME;

  // Check if container with same name is already running
  const client = new DockerClient();
  const existingId = await client.findByName(containerName);
  if (existingId) {
    const isRunning = await client.isRunning(existingId);
    if (isRunning) {
      console.log(
        `Node ${containerName} is already running. Use a different --name or attach to logs with:\n` +
          `  npx hardhat arb:node logs --name ${containerName}`,
      );
      return;
    }
  }

  // Check if ports are available
  if (await isPortInUse(httpPort)) {
    throw createPluginError(`HTTP port ${httpPort} is already in use`);
  }
  if (await isPortInUse(wsPort)) {
    throw createPluginError(`WebSocket port ${wsPort} is already in use`);
  }

  if (!quiet) {
    console.log('Starting Arbitrum nitro-devnode...\n');
  }

  const containerConfig: ContainerConfig = {
    image: config.image,
    tag: config.tag,
    name: containerName,
    network: dockerNetwork || undefined,
    ports: [
      { host: httpPort, container: 8547 },
      { host: wsPort, container: 8548 },
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
      target: rpcUrl,
      timeout: 60000,
      interval: 1000,
    },
    autoRemove: true,
    detach: true,
  };

  const containerInfo = await manager.start(containerConfig);

  // Perform essential setup
  await performEssentialSetup(rpcUrl, config.devAccount.privateKey, quiet);

  // Prefund all Hardhat accounts
  await prefundAccounts(rpcUrl, config.devAccount.privateKey, quiet);

  // Deploy Stylus infrastructure (CREATE2, Cache Manager, StylusDeployer)
  await deployCreate2Factory(rpcUrl, config.devAccount.privateKey, quiet);
  await deployCacheManager(rpcUrl, config.devAccount.privateKey, quiet);
  await deployStylusDeployer(rpcUrl, config.devAccount.privateKey, quiet);

  if (!quiet) {
    console.log('');
  }

  // Print startup info
  if (!quiet) {
    printStartupInfo({ ...config, httpPort, wsPort });
  }

  // Attach to logs unless detach flag is set
  if (!detach) {
    await attachToLogs(containerInfo.id);
  }
};

export default taskStart;
