import { DockerClient } from '../../container/docker-client.js';
import { RUSTUP_VOLUME_NAME, CARGO_VOLUME_NAME } from './volumes.js';

/**
 * Options for running a command inside a Stylus Docker container.
 */
export interface RunInStylusContainerOptions {
  /** Callback for progress updates */
  onProgress?: (line: string) => void;
  /** Docker network name for node communication (ephemeral node mode) */
  network?: string;
  /** Node container name (used as hostname for RPC in ephemeral node mode) */
  nodeContainerName?: string;
  /** Explicit RPC endpoint for external network mode */
  rpcEndpoint?: string;
  /** Add --add-host=host.docker.internal:host-gateway for localhost access */
  useHostGateway?: boolean;
  /** Prefix for the temporary container name (e.g., "stylus-compile-tmp") */
  containerPrefix?: string;
}

/**
 * Run a command inside a Stylus Docker container and capture output.
 * Uses Docker volumes to persist rustup and cargo data between runs.
 *
 * @param image - Docker image name (e.g., "stylus-compile:latest")
 * @param contractPath - Absolute path to the contract directory (mounted at /workspace)
 * @param command - Command and arguments to run inside the container
 * @param options - Container run options
 * @returns stdout and stderr from the command
 */
export async function runInStylusContainer(
  image: string,
  contractPath: string,
  command: string[],
  options: RunInStylusContainerOptions = {},
): Promise<{ stdout: string; stderr: string }> {
  const prefix = options.containerPrefix ?? 'stylus-tmp';
  const containerName = `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

  const args = ['run', '--rm', '--name', containerName];

  if (options.network) {
    args.push('--network', options.network);
  }

  if (options.useHostGateway) {
    args.push('--add-host=host.docker.internal:host-gateway');
  }

  args.push(
    '-v',
    `${contractPath}:/workspace:rw`,
    '-v',
    `${RUSTUP_VOLUME_NAME}:/usr/local/rustup:rw`,
    '-v',
    `${CARGO_VOLUME_NAME}:/usr/local/cargo:rw`,
    '-w',
    '/workspace',
    image,
    ...command,
  );

  const client = new DockerClient();
  return client.runStreamingCommand(args, options.onProgress);
}
