import path from 'node:path';

import type { NewTaskActionFunction } from 'hardhat/types/tasks';
import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';
import {
  generateTempContainerName,
  registerTempContainer,
  cleanupTempContainer,
  generateRandomPort,
  HARDHAT_ACCOUNTS,
} from '@cobuilders/hardhat-arb-node';
import { type Hex, DockerClient } from '@cobuilders/hardhat-arb-utils';
import { createPluginError } from '@cobuilders/hardhat-arb-utils/errors';
import {
  writeProgress,
  clearProgress,
  withEphemeralNode,
  type EphemeralNodeContext,
} from '@cobuilders/hardhat-arb-utils/task-helpers';
import {
  discoverStylusContracts,
  ensureVolumes,
  ensureCompileImage,
  validateAllToolchains,
} from '@cobuilders/hardhat-arb-utils/stylus';

import {
  findSolidityArtifact,
  deploySolidityContract,
} from '../../services/deployers/solidity.js';
import { deployHost } from '../../services/deployers/wasm-host.js';
import { deployContainer } from '../../services/deployers/wasm-container.js';

interface DeployTaskArgs {
  contract: string;
  constructorArgs: string[];
  host: boolean;
}

/** Prefix for deploy networks */
const DEPLOY_NETWORK_PREFIX = 'stylus-deploy-net-';

/** Shared ephemeral node options for deploy tasks */
const EPHEMERAL_NODE_OPTS = {
  context: 'deployment',
  networkPrefix: DEPLOY_NETWORK_PREFIX,
  generateTempContainerName,
  registerTempContainer,
  cleanupTempContainer,
  generateRandomPort,
};

/**
 * Check if the contract identifier refers to a Solidity contract.
 * Solidity contracts end in .sol (e.g. "MyContract.sol").
 */
function isSolidityContract(contract: string): boolean {
  return contract.endsWith('.sol');
}

/**
 * Extract the contract name from a .sol file identifier.
 * "SolidityCounter.sol" -> "SolidityCounter"
 */
function solidityContractName(contract: string): string {
  return contract.replace(/\.sol$/, '');
}

/**
 * Resolve the private key for deployment.
 *
 * - Ephemeral mode (no --network): uses Hardhat Account #0 (pre-funded on the ephemeral node)
 * - External mode (--network): reads accounts[0] from the network config
 */
async function resolveDeployPrivateKey(
  hre: HardhatRuntimeEnvironment,
  isExternal: boolean,
): Promise<Hex> {
  if (!isExternal) {
    return HARDHAT_ACCOUNTS[0].privateKey;
  }

  const networkName = hre.globalOptions.network!;
  const networkConfig = hre.config.networks[networkName];

  if (networkConfig.type !== 'http') {
    throw createPluginError(
      `Network "${networkName}" must be an HTTP network for deployment.`,
    );
  }

  const { accounts } = networkConfig;

  if (accounts === 'remote') {
    throw createPluginError(
      `Network "${networkName}" uses remote accounts. ` +
        `Add a private key to accounts in your network config:\n\n` +
        `  networks: {\n` +
        `    ${networkName}: {\n` +
        `      url: "...",\n` +
        `      accounts: [vars.get("DEPLOYER_KEY")],\n` +
        `    },\n` +
        `  }`,
    );
  }

  if (Array.isArray(accounts)) {
    if (accounts.length === 0) {
      throw createPluginError(
        `Network "${networkName}" has an empty accounts array. ` +
          `Add at least one private key to deploy.`,
      );
    }
    return (await accounts[0].getHexString()) as Hex;
  }

  // HD wallet config — derive the first account
  throw createPluginError(
    `Network "${networkName}" uses HD wallet accounts. ` +
      `Please use explicit private keys in your network config for deployment.`,
  );
}

/**
 * Compile and deploy a Solidity contract.
 */
async function deploySolidity(
  hre: HardhatRuntimeEnvironment,
  rpcUrl: string,
  privateKey: Hex,
  contractName: string,
  constructorArgs: string[],
): Promise<void> {
  console.log(`\nCompiling Solidity contracts...`);
  await hre.tasks.getTask('compile').run({ quiet: true });

  const artifact = findSolidityArtifact(
    hre.config.paths.artifacts,
    contractName,
  );

  if (!artifact) {
    throw createPluginError(
      `Solidity artifact for "${contractName}" not found. ` +
        `Make sure the contract exists in your contracts/ directory.`,
    );
  }

  const chainId = hre.config.stylus.node.chainId;

  console.log(`Deploying ${contractName}...`);
  const result = await deploySolidityContract(
    rpcUrl,
    privateKey,
    chainId,
    artifact,
    constructorArgs,
  );

  console.log(`\n  ✓ ${contractName} deployed`);
  console.log(`    Address: ${result.address}`);
  console.log(`    Tx: ${result.txHash}`);
}

/**
 * Compile and deploy a Stylus WASM contract via host toolchain.
 */
async function deployStylusHost(
  hre: HardhatRuntimeEnvironment,
  rpcUrl: string,
  privateKey: Hex,
  contractName: string,
  constructorArgs: string[],
): Promise<void> {
  const contractsDir = path.join(hre.config.paths.root, 'contracts');
  const discovered = await discoverStylusContracts(contractsDir, {
    contracts: [contractName],
  });

  if (discovered.length === 0) {
    throw createPluginError(
      `Stylus contract "${contractName}" not found in contracts/ directory.`,
    );
  }

  const contract = discovered[0];

  // Validate toolchain
  console.log('Validating toolchain requirements...');
  await validateAllToolchains([contract.toolchain]);
  console.log('Toolchain ready.\n');

  console.log(`Deploying ${contractName}...`);

  const result = await deployHost(
    contract.path,
    contract.toolchain,
    contract.name,
    rpcUrl,
    privateKey,
    {
      onProgress: (line) => writeProgress(line),
      constructorArgs: constructorArgs.length > 0 ? constructorArgs : undefined,
    },
  );
  clearProgress();

  console.log(`\n  ✓ ${contract.name} deployed`);
  console.log(`    Address: ${result.address}`);
}

/**
 * Compile and deploy a Stylus WASM contract via Docker container.
 */
async function deployStylusContainer(
  hre: HardhatRuntimeEnvironment,
  privateKey: Hex,
  contractName: string,
  constructorArgs: string[],
  containerOptions: {
    network?: string;
    nodeContainerName?: string;
    rpcEndpoint?: string;
    useHostGateway?: boolean;
  },
): Promise<void> {
  const contractsDir = path.join(hre.config.paths.root, 'contracts');
  const discovered = await discoverStylusContracts(contractsDir, {
    contracts: [contractName],
  });

  if (discovered.length === 0) {
    throw createPluginError(
      `Stylus contract "${contractName}" not found in contracts/ directory.`,
    );
  }

  const contract = discovered[0];

  console.log(`Deploying ${contractName}...`);
  const result = await deployContainer(
    contract.path,
    contract.toolchain,
    contract.name,
    privateKey,
    {
      onProgress: (line) => writeProgress(line),
      network: containerOptions.network,
      nodeContainerName: containerOptions.nodeContainerName,
      rpcEndpoint: containerOptions.rpcEndpoint,
      useHostGateway: containerOptions.useHostGateway,
      constructorArgs: constructorArgs.length > 0 ? constructorArgs : undefined,
    },
  );
  clearProgress();

  console.log(`\n  ✓ ${contract.name} deployed`);
  console.log(`    Address: ${result.address}`);
}

const taskDeploy: NewTaskActionFunction<DeployTaskArgs> = async (
  { contract, constructorArgs, host },
  hre: HardhatRuntimeEnvironment,
) => {
  const useHostToolchain = host || hre.config.stylus.deploy.useHostToolchain;
  const isSol = isSolidityContract(contract);
  const isStylus = !isSol;

  // Prepare Docker resources if needed for container mode
  if (isStylus && !useHostToolchain) {
    const client = new DockerClient();
    const volumeResult = await ensureVolumes(client);
    if (volumeResult.created.length > 0) {
      console.log('Creating cache volumes...');
      console.log(`  Created: ${volumeResult.created.join(', ')}`);
    }

    console.log('Preparing compile image...');
    const wasBuilt = await ensureCompileImage((msg) => writeProgress(msg));
    clearProgress();
    if (wasBuilt) {
      console.log('  Compile image built successfully.');
    } else {
      console.log('  Using cached compile image.');
    }
  }

  const needsDockerNetwork = isStylus && !useHostToolchain;

  await withEphemeralNode(
    hre,
    { ...EPHEMERAL_NODE_OPTS, needsDockerNetwork },
    async (ctx: EphemeralNodeContext) => {
      const privateKey = await resolveDeployPrivateKey(hre, ctx.isExternal);

      if (isSol) {
        await deploySolidity(
          hre,
          ctx.rpcUrl,
          privateKey,
          solidityContractName(contract),
          constructorArgs,
        );
      } else if (useHostToolchain) {
        await deployStylusHost(
          hre,
          ctx.rpcUrl,
          privateKey,
          contract,
          constructorArgs,
        );
      } else {
        await deployStylusContainer(
          hre,
          privateKey,
          contract,
          constructorArgs,
          ctx.container,
        );
      }
    },
  );
};

export default taskDeploy;
