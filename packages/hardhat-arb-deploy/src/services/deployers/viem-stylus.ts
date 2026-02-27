import path from 'node:path';

import {
  type Hex,
  DockerClient,
  toDockerHostUrl,
} from '@cobuilders/hardhat-arb-utils';
import { createPluginError } from '@cobuilders/hardhat-arb-utils/errors';
import {
  discoverStylusContracts,
  ensureVolumes,
  ensureCompileImage,
  exportStylusAbi,
  parseAbiFromSolidity,
} from '@cobuilders/hardhat-arb-utils/stylus';
import {
  HARDHAT_ACCOUNTS,
  getHookHttpPort,
} from '@cobuilders/hardhat-arb-node';

import type { EthereumProvider } from 'hardhat/types/providers';
import type { ArtifactManager } from 'hardhat/types/artifacts';
import { getContract, type Address, type Abi } from 'viem';

import { deployHost } from './wasm-host.js';
import { deployContainer } from './wasm-container.js';
import { getTestHostMode } from '../../state/deploy-mode.js';

/**
 * Minimal interface for the viem helpers attached by hardhat-viem.
 * We avoid importing hardhat-viem types directly to keep it optional.
 */
export interface ViemHelpers {
  getPublicClient: () => Promise<unknown>;
  getWalletClients: () => Promise<unknown[]>;
  [key: string]: unknown;
}

/**
 * Runtime config for the Stylus deploy hook.
 * Extends the user-facing StylusDeployConfig with runtime-resolved fields.
 */
export interface StylusDeployRuntimeConfig {
  projectRoot: string;
  useHostToolchain: boolean;
}

/**
 * Reuse toolchain setup across deployStylusViem calls in the same process.
 */
const preparedToolchains = new Set<string>();

// ---- Core deploy logic ----

/**
 * Export ABI from a Stylus contract source using cargo stylus export-abi.
 * This is lightweight — it compiles a native binary to extract the interface,
 * NOT the WASM (that happens inside cargo stylus deploy).
 */
async function exportAbi(
  contractPath: string,
  toolchain: string,
): Promise<unknown[]> {
  const solInterface = await exportStylusAbi(contractPath, toolchain);
  if (!solInterface) return [];
  return parseAbiFromSolidity(solInterface);
}

/**
 * Convert typed constructor arguments to string format for cargo stylus deploy.
 */
function toStringArgs(args: readonly unknown[]): string[] {
  return args.map((arg) => {
    if (typeof arg === 'bigint') return arg.toString();
    return String(arg);
  });
}

/**
 * Deploy a Stylus contract and return a viem contract instance.
 *
 * Uses the existing deployHost/deployContainer functions which wrap
 * `cargo stylus deploy`. The command handles compilation, deployment,
 * and activation in one step.
 *
 * If no pre-compiled artifact exists, the ABI is exported directly from
 * the Rust source via `cargo stylus export-abi`.
 */
export async function deployStylusViem(
  viemHelpers: ViemHelpers,
  provider: EthereumProvider,
  artifacts: ArtifactManager,
  contractName: string,
  config: StylusDeployRuntimeConfig,
  constructorArgs?: readonly unknown[],
): Promise<unknown> {
  const contractsDir = path.join(config.projectRoot, 'contracts');

  // Discover the Stylus contract (path, toolchain, package name)
  const discovered = await discoverStylusContracts(contractsDir, {
    contracts: [contractName],
  });

  if (discovered.length === 0) {
    throw createPluginError(
      `Stylus contract "${contractName}" not found in contracts/ directory.`,
    );
  }

  const contract = discovered[0];

  // Get ABI: try existing artifact first, fall back to export-abi from source
  let abi: unknown[];
  try {
    const artifact = await artifacts.readArtifact(contractName);
    abi = artifact.abi as unknown[];
  } catch {
    // No artifact — export ABI directly from Rust source (lightweight)
    abi = await exportAbi(contract.path, contract.toolchain);
    if (abi.length === 0) {
      throw createPluginError(
        `Could not export ABI for "${contractName}". ` +
          `Ensure the contract has a valid #[public] interface.`,
      );
    }
  }

  // Determine host vs container mode (test flag > config)
  const useHost = getTestHostMode() ?? config.useHostToolchain;

  // RPC URL and private key for the default network (managed by arb-node)
  const rpcUrl = `http://127.0.0.1:${getHookHttpPort()}`;
  const privateKey = HARDHAT_ACCOUNTS[0].privateKey;

  // Convert constructor args to string format for cargo stylus deploy
  const stringArgs =
    constructorArgs && constructorArgs.length > 0
      ? toStringArgs(constructorArgs)
      : undefined;

  // Deploy using existing deploy infrastructure (wraps cargo stylus deploy)
  let address: Hex;

  if (useHost) {
    const result = await deployHost(
      contract.path,
      contract.toolchain,
      contract.name,
      rpcUrl,
      privateKey,
      { constructorArgs: stringArgs },
    );
    address = result.address;
  } else {
    // Container mode: prepare Docker resources and deploy
    const dockerClient = new DockerClient();
    await ensureVolumes(dockerClient);
    await ensureCompileImage();

    const result = await deployContainer(
      contract.path,
      contract.toolchain,
      contract.name,
      privateKey,
      {
        rpcEndpoint: toDockerHostUrl(rpcUrl),
        useHostGateway: true,
        constructorArgs: stringArgs,
        preparedToolchains,
      },
    );
    address = result.address;
  }

  // Create viem contract instance using the existing hardhat-viem clients
  // (they already have the correct chain configuration)
  const publicClient = await viemHelpers.getPublicClient();
  const walletClients = await viemHelpers.getWalletClients();

  return getContract({
    address: address as Address,
    abi: abi as Abi,
    client: {
      public: publicClient,
      wallet: walletClients[0],
    },
  } as any);
}
