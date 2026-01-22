import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';
import { getAddress, type Hex } from 'viem';

import {
  ContainerManager,
  DockerClient,
  type ContainerConfig,
  createPluginError,
} from '@cobuilders/hardhat-arb-utils';

import { CONTAINER_NAME, HARDHAT_ACCOUNTS } from '../config/defaults.js';
import {
  CACHE_MANAGER_BYTECODE,
  CREATE2_FACTORY_TX,
  DEFAULT_SALT,
  STYLUS_DEPLOYER_BYTECODE,
} from '../constants/bytecode.js';
import {
  becomeChainOwner,
  setL1PricePerUnit,
  sendEth,
  sendRawTransaction,
  deployContract,
  addWasmCacheManager,
  getCode,
  CREATE2_FACTORY,
  deployViaCreate2,
} from '../utils/transactions.js';

interface TaskStartArguments {
  quiet: boolean;
  detach: boolean;
  stylusReady: boolean;
  persist: boolean;
}

/**
 * Print startup information similar to `npx hardhat node`
 */
function printStartupInfo(config: {
  httpPort: number;
  wsPort: number;
  chainId: number;
  devAccount: { address: Hex; privateKey: Hex };
}): void {
  console.log(`Started  HTTP Server at http://localhost:${config.httpPort}/
Started WebSocket Server at ws://localhost:${config.wsPort}

Accounts
========

WARNING: Funds sent on live network to accounts with publicly known private keys WILL BE LOST.
`);

  // Print Hardhat's 20 default accounts
  for (let i = 0; i < HARDHAT_ACCOUNTS.length; i++) {
    const account = HARDHAT_ACCOUNTS[i];
    const paddedIndex = i.toString().padStart(2, ' ');
    console.log(`Account #${paddedIndex}: ${account.address} (10 ETH)`);
    console.log(`Private Key: ${account.privateKey}\n`);
  }

  // Print nitro-devnode default account as #20 (chain owner)
  console.log(
    `Account #20: ${config.devAccount.address} (~800 ETH) - Chain Owner`,
  );
  console.log(`Private Key: ${config.devAccount.privateKey}`);
  console.log(`             ↳ L2 chain owner with ArbOwner privileges\n`);

  console.log(
    'WARNING: Funds sent on live network to accounts with publicly known private keys WILL BE LOST.\n',
  );
}

/**
 * Perform essential chain setup (chain owner + L1 price)
 */
async function performEssentialSetup(
  rpcUrl: string,
  privateKey: Hex,
  quiet: boolean,
): Promise<void> {
  if (!quiet) {
    console.log('Setting up chain ownership...');
  }

  await becomeChainOwner(rpcUrl, privateKey);

  if (!quiet) {
    console.log('Setting L1 price per unit to 0...');
  }

  await setL1PricePerUnit(rpcUrl, privateKey, 0n);
}

/**
 * Prefund all Hardhat accounts with 10 ETH each
 */
async function prefundAccounts(
  rpcUrl: string,
  privateKey: Hex,
  quiet: boolean,
): Promise<void> {
  if (!quiet) {
    console.log('Prefunding accounts...');
  }

  // 10 ETH in wei (devAccount has ~1000 ETH, reserving rest for operations)
  const amount = 10000000000000000000n;

  for (const account of HARDHAT_ACCOUNTS) {
    // Use getAddress to ensure proper EIP-55 checksum
    await sendEth(rpcUrl, privateKey, getAddress(account.address), amount);
  }
}

/**
 * Deploy CREATE2 factory
 */
async function deployCreate2Factory(
  rpcUrl: string,
  privateKey: Hex,
  quiet: boolean,
): Promise<void> {
  // Check if already deployed
  const code = await getCode(rpcUrl, CREATE2_FACTORY.ADDRESS);
  if (code !== '0x') {
    if (!quiet) {
      console.log('CREATE2 factory already deployed');
    }
    return;
  }

  if (!quiet) {
    console.log('Deploying CREATE2 factory...');
  }

  // Fund the deployer address
  await sendEth(
    rpcUrl,
    privateKey,
    CREATE2_FACTORY.DEPLOYER,
    1000000000000000000n,
  ); // 1 ETH

  // Send the pre-signed deployment transaction
  await sendRawTransaction(rpcUrl, CREATE2_FACTORY_TX);

  // Verify deployment
  const deployedCode = await getCode(rpcUrl, CREATE2_FACTORY.ADDRESS);
  if (deployedCode === '0x') {
    throw createPluginError('Failed to deploy CREATE2 factory');
  }
}

/**
 * Deploy Cache Manager contract
 */
async function deployCacheManager(
  rpcUrl: string,
  privateKey: Hex,
  quiet: boolean,
): Promise<Hex> {
  if (!quiet) {
    console.log('Deploying Cache Manager...');
  }

  const { contractAddress } = await deployContract(
    rpcUrl,
    privateKey,
    CACHE_MANAGER_BYTECODE,
  );

  if (!quiet) {
    console.log(`Cache Manager deployed at: ${contractAddress}`);
    console.log('Registering Cache Manager as WASM cache manager...');
  }

  await addWasmCacheManager(rpcUrl, privateKey, contractAddress);

  return contractAddress;
}

/**
 * Deploy StylusDeployer contract
 */
async function deployStylusDeployer(
  rpcUrl: string,
  privateKey: Hex,
  quiet: boolean,
): Promise<Hex> {
  if (!quiet) {
    console.log('Deploying StylusDeployer...');
  }

  const { contractAddress } = await deployViaCreate2(
    rpcUrl,
    privateKey,
    DEFAULT_SALT,
    STYLUS_DEPLOYER_BYTECODE,
  );

  // Verify deployment
  const code = await getCode(rpcUrl, contractAddress);
  if (code === '0x') {
    throw createPluginError('Failed to deploy StylusDeployer');
  }

  if (!quiet) {
    console.log(`StylusDeployer deployed at: ${contractAddress}`);
  }

  return contractAddress;
}

/**
 * Attach to container logs (only new logs from this point)
 * Stops the container when user presses Ctrl+C (unless persist is true)
 */
async function attachToLogs(
  containerId: string,
  persist: boolean,
): Promise<void> {
  const client = new DockerClient();

  console.log('Listening for transactions...\n');

  // Use tail: 0 to only show new logs from this point, not historical logs
  const logProcess = client.streamLogs(containerId, { tail: 0 });

  logProcess.stdout?.pipe(process.stdout);
  logProcess.stderr?.pipe(process.stderr);

  // Handle graceful shutdown - stop container when user presses Ctrl+C
  const cleanup = async () => {
    logProcess.kill();
    if (persist) {
      console.log('\nDetaching from node (container will keep running)...');
    } else {
      console.log('\nStopping node...');
      try {
        await client.stop(containerId);
      } catch {
        // Container may already be stopped
      }
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
  const { quiet, detach, stylusReady, persist } = args;
  const config = hre.config.arbNode;
  const client = new DockerClient();
  const manager = new ContainerManager();
  const rpcUrl = `http://localhost:${config.httpPort}`;

  // Check if a persistent container already exists
  const existingContainerId = await client.findByName(CONTAINER_NAME);
  if (persist && existingContainerId) {
    const status = await client.getStatus(existingContainerId);

    if (status === 'running') {
      if (!quiet) {
        console.log('Persistent node is already running.\n');
        printStartupInfo(config);
      }
      if (!detach) {
        await attachToLogs(existingContainerId, persist);
      }
      return;
    }

    // Container exists but is stopped/exited - restart it
    if (status === 'exited' || status === 'stopped' || status === 'created') {
      if (!quiet) {
        console.log('Restarting persistent node...\n');
      }
      await client.startContainer(existingContainerId);

      // Wait for readiness
      const info = await client.inspect(existingContainerId);
      if (info) {
        await manager.waitForReady(info, {
          type: 'http',
          target: rpcUrl,
          timeout: 60000,
          interval: 1000,
        });
      }

      if (!quiet) {
        printStartupInfo(config);
      }
      if (!detach) {
        await attachToLogs(existingContainerId, persist);
      }
      return;
    }
  }

  if (!quiet) {
    console.log('Starting Arbitrum nitro-devnode...\n');
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
      target: rpcUrl,
      timeout: 60000,
      interval: 1000,
    },
    autoRemove: !persist,
    detach: true,
  };

  const containerInfo = await manager.start(containerConfig);

  // Perform essential setup
  await performEssentialSetup(rpcUrl, config.devAccount.privateKey, quiet);

  // Prefund all Hardhat accounts
  await prefundAccounts(rpcUrl, config.devAccount.privateKey, quiet);

  // Perform full Stylus setup if requested
  if (stylusReady) {
    await deployCreate2Factory(rpcUrl, config.devAccount.privateKey, quiet);
    await deployCacheManager(rpcUrl, config.devAccount.privateKey, quiet);
    await deployStylusDeployer(rpcUrl, config.devAccount.privateKey, quiet);

    if (!quiet) {
      console.log('');
    }
  }

  // Print startup info
  if (!quiet) {
    printStartupInfo(config);
  }

  // Attach to logs unless detach flag is set
  if (!detach) {
    await attachToLogs(containerInfo.id, persist);
  }
};

export default taskStart;
