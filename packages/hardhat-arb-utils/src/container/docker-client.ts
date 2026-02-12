import { spawn, type ChildProcess } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type {
  ContainerConfig,
  ContainerInfo,
  ContainerStatus,
  ExecResult,
} from './types.js';

/**
 * Error thrown when Docker operations fail.
 */
export class DockerError extends Error {
  constructor(
    message: string,
    public readonly command?: string,
    public readonly exitCode?: number,
    public readonly stderr?: string,
  ) {
    super(message);
    this.name = 'DockerError';
  }
}

/**
 * Result of a Docker CLI command execution.
 */
interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Low-level Docker CLI wrapper.
 * Uses child_process to invoke Docker commands for cross-platform compatibility.
 */
export class DockerClient {
  private readonly dockerCommand: string;

  constructor(dockerCommand: string = 'docker') {
    this.dockerCommand = dockerCommand;
  }

  /**
   * Check if Docker is available and running.
   */
  async isAvailable(): Promise<boolean> {
    try {
      const result = await this.exec([
        'info',
        '--format',
        '{{.ServerVersion}}',
      ]);
      return result.exitCode === 0 && result.stdout.trim().length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Check if an image exists locally.
   */
  async imageExists(image: string, tag: string): Promise<boolean> {
    const fullImage = `${image}:${tag}`;
    const result = await this.exec(['image', 'inspect', fullImage]);
    return result.exitCode === 0;
  }

  /**
   * Pull an image from a registry.
   */
  async pullImage(image: string, tag: string): Promise<void> {
    const fullImage = `${image}:${tag}`;
    const result = await this.exec(['pull', fullImage]);
    if (result.exitCode !== 0) {
      throw new DockerError(
        `Failed to pull image ${fullImage}: ${result.stderr}`,
        `docker pull ${fullImage}`,
        result.exitCode,
        result.stderr,
      );
    }
  }

  /**
   * Build a Docker image from a Dockerfile content string.
   * Uses a temporary directory to write the Dockerfile.
   * Streams build progress to the optional callback.
   */
  async buildImage(
    imageName: string,
    tag: string,
    dockerfileContent: string,
    onProgress?: (line: string) => void,
  ): Promise<void> {
    const fullImage = `${imageName}:${tag}`;

    // Create a temporary directory and write the Dockerfile
    const tempDir = mkdtempSync(join(tmpdir(), 'docker-build-'));
    const dockerfilePath = join(tempDir, 'Dockerfile');
    writeFileSync(dockerfilePath, dockerfileContent);

    return new Promise((resolve, reject) => {
      const proc = spawn(
        this.dockerCommand,
        ['build', '-t', fullImage, tempDir],
        {
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      );

      let stderr = '';

      proc.stdout.on('data', (data: Buffer) => {
        const lines = data.toString().split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && onProgress) {
            onProgress(trimmed);
          }
        }
      });

      proc.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
        // Docker build outputs progress to stderr
        const lines = data.toString().split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && onProgress) {
            onProgress(trimmed);
          }
        }
      });

      proc.on('close', (code) => {
        // Clean up temp directory
        try {
          rmSync(tempDir, { recursive: true, force: true });
        } catch {
          // Ignore cleanup errors
        }

        if (code === 0) {
          resolve();
        } else {
          reject(
            new DockerError(
              `Failed to build image ${fullImage}: ${stderr}`,
              `docker build -t ${fullImage}`,
              code ?? 1,
              stderr,
            ),
          );
        }
      });

      proc.on('error', (err) => {
        // Clean up temp directory
        try {
          rmSync(tempDir, { recursive: true, force: true });
        } catch {
          // Ignore cleanup errors
        }

        reject(
          new DockerError(
            `Failed to build image ${fullImage}: ${err.message}`,
            `docker build -t ${fullImage}`,
            1,
            err.message,
          ),
        );
      });
    });
  }

  /**
   * Run a container with the given configuration.
   * Returns the container ID.
   */
  async run(config: ContainerConfig): Promise<string> {
    const args = this.buildRunArgs(config);
    const result = await this.exec(args);

    if (result.exitCode !== 0) {
      throw new DockerError(
        `Failed to start container: ${result.stderr}`,
        `docker ${args.join(' ')}`,
        result.exitCode,
        result.stderr,
      );
    }

    return result.stdout.trim();
  }

  /**
   * Stop a running container.
   */
  async stop(containerId: string, timeout: number = 10): Promise<void> {
    const result = await this.exec([
      'stop',
      '-t',
      timeout.toString(),
      containerId,
    ]);
    if (result.exitCode !== 0) {
      throw new DockerError(
        `Failed to stop container ${containerId}: ${result.stderr}`,
        `docker stop ${containerId}`,
        result.exitCode,
        result.stderr,
      );
    }
  }

  /**
   * Start a stopped container.
   */
  async startContainer(containerId: string): Promise<void> {
    const result = await this.exec(['start', containerId]);
    if (result.exitCode !== 0) {
      throw new DockerError(
        `Failed to start container ${containerId}: ${result.stderr}`,
        `docker start ${containerId}`,
        result.exitCode,
        result.stderr,
      );
    }
  }

  /**
   * Remove a container.
   */
  async remove(containerId: string, force: boolean = false): Promise<void> {
    const args = ['rm'];
    if (force) {
      args.push('-f');
    }
    args.push(containerId);

    const result = await this.exec(args);
    if (result.exitCode !== 0) {
      throw new DockerError(
        `Failed to remove container ${containerId}: ${result.stderr}`,
        `docker ${args.join(' ')}`,
        result.exitCode,
        result.stderr,
      );
    }
  }

  /**
   * Inspect a container and return its information.
   */
  async inspect(containerId: string): Promise<ContainerInfo | null> {
    const result = await this.exec([
      'inspect',
      '--format',
      '{{json .}}',
      containerId,
    ]);

    if (result.exitCode !== 0) {
      return null;
    }

    try {
      const data = JSON.parse(result.stdout) as DockerInspectResult;
      return this.parseInspectResult(data);
    } catch {
      return null;
    }
  }

  /**
   * Get container status.
   */
  async getStatus(containerId: string): Promise<ContainerStatus> {
    const result = await this.exec([
      'inspect',
      '--format',
      '{{.State.Status}}',
      containerId,
    ]);

    if (result.exitCode !== 0) {
      return 'unknown';
    }

    const status = result.stdout.trim().toLowerCase();
    if (
      status === 'running' ||
      status === 'stopped' ||
      status === 'exited' ||
      status === 'created'
    ) {
      return status;
    }
    return 'unknown';
  }

  /**
   * Check if a container is running.
   */
  async isRunning(containerId: string): Promise<boolean> {
    const status = await this.getStatus(containerId);
    return status === 'running';
  }

  /**
   * Execute a command inside a running container.
   */
  async execInContainer(
    containerId: string,
    command: string[],
  ): Promise<ExecResult> {
    const args = ['exec', containerId, ...command];
    const result = await this.exec(args);

    return {
      exitCode: result.exitCode,
      stdout: result.stdout,
      stderr: result.stderr,
    };
  }

  /**
   * Get container logs.
   */
  async logs(
    containerId: string,
    options?: { tail?: number; follow?: boolean },
  ): Promise<string> {
    const args = ['logs'];

    if (options?.tail !== undefined) {
      args.push('--tail', options.tail.toString());
    }

    args.push(containerId);

    const result = await this.exec(args);
    // Docker logs outputs to both stdout and stderr
    return result.stdout + result.stderr;
  }

  /**
   * Stream container logs.
   * @param containerId - The container ID to stream logs from
   * @param options - Options for log streaming
   * @param options.tail - Number of lines to show from the end (0 = only new logs)
   */
  streamLogs(containerId: string, options?: { tail?: number }): ChildProcess {
    const args = ['logs', '-f'];

    if (options?.tail !== undefined) {
      args.push('--tail', options.tail.toString());
    }

    args.push(containerId);

    return spawn(this.dockerCommand, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  }

  /**
   * Find a container by name.
   */
  async findByName(name: string): Promise<string | null> {
    const result = await this.exec([
      'ps',
      '-a',
      '--filter',
      `name=^${name}$`,
      '--format',
      '{{.ID}}',
    ]);

    if (result.exitCode !== 0) {
      return null;
    }

    const id = result.stdout.trim();
    return id.length > 0 ? id : null;
  }

  /**
   * Create a Docker network.
   */
  async createNetwork(name: string): Promise<void> {
    const result = await this.exec(['network', 'create', name]);
    if (result.exitCode !== 0) {
      throw new DockerError(
        `Failed to create network ${name}: ${result.stderr}`,
        `docker network create ${name}`,
        result.exitCode,
        result.stderr,
      );
    }
  }

  /**
   * Remove a Docker network.
   */
  async removeNetwork(name: string): Promise<void> {
    const result = await this.exec(['network', 'rm', name]);
    if (result.exitCode !== 0) {
      throw new DockerError(
        `Failed to remove network ${name}: ${result.stderr}`,
        `docker network rm ${name}`,
        result.exitCode,
        result.stderr,
      );
    }
  }

  /**
   * Check if a Docker network exists.
   */
  async networkExists(name: string): Promise<boolean> {
    const result = await this.exec(['network', 'inspect', name]);
    return result.exitCode === 0;
  }

  /**
   * Check if a Docker volume exists.
   */
  async volumeExists(name: string): Promise<boolean> {
    const result = await this.exec(['volume', 'inspect', name]);
    return result.exitCode === 0;
  }

  /**
   * Create a Docker volume.
   */
  async createVolume(name: string): Promise<void> {
    const result = await this.exec(['volume', 'create', name]);
    if (result.exitCode !== 0) {
      throw new DockerError(
        `Failed to create volume ${name}: ${result.stderr}`,
        `docker volume create ${name}`,
        result.exitCode,
        result.stderr,
      );
    }
  }

  /**
   * Remove a Docker volume.
   */
  async removeVolume(name: string): Promise<void> {
    const result = await this.exec(['volume', 'rm', name]);
    if (result.exitCode !== 0) {
      throw new DockerError(
        `Failed to remove volume ${name}: ${result.stderr}`,
        `docker volume rm ${name}`,
        result.exitCode,
        result.stderr,
      );
    }
  }

  /**
   * Build docker run arguments from ContainerConfig.
   */
  private buildRunArgs(config: ContainerConfig): string[] {
    const args = ['run'];

    // Detached mode
    if (config.detach !== false) {
      args.push('-d');
    }

    // Auto-remove
    if (config.autoRemove) {
      args.push('--rm');
    }

    // Container name
    if (config.name) {
      args.push('--name', config.name);
    }

    // Network
    if (config.network) {
      args.push('--network', config.network);
    }

    // Port mappings
    if (config.ports) {
      for (const port of config.ports) {
        const protocol = port.protocol ?? 'tcp';
        args.push('-p', `${port.host}:${port.container}/${protocol}`);
      }
    }

    // Environment variables
    if (config.env) {
      for (const [key, value] of Object.entries(config.env)) {
        args.push('-e', `${key}=${value}`);
      }
    }

    // Volume mappings
    if (config.volumes) {
      for (const volume of config.volumes) {
        const mode = volume.readonly ? 'ro' : 'rw';
        args.push('-v', `${volume.host}:${volume.container}:${mode}`);
      }
    }

    // Image
    args.push(`${config.image}:${config.tag}`);

    // Command arguments (must come after image)
    if (config.command && config.command.length > 0) {
      args.push(...config.command);
    }

    return args;
  }

  /**
   * Execute a Docker CLI command.
   */
  private exec(args: string[]): Promise<CommandResult> {
    return new Promise((resolve) => {
      const proc = spawn(this.dockerCommand, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        resolve({
          stdout,
          stderr,
          exitCode: code ?? 1,
        });
      });

      proc.on('error', () => {
        resolve({
          stdout,
          stderr: stderr || 'Failed to execute docker command',
          exitCode: 1,
        });
      });
    });
  }

  /**
   * Execute a Docker CLI command with stdin input.
   */
  private execWithStdin(args: string[], stdin: string): Promise<CommandResult> {
    return new Promise((resolve) => {
      const proc = spawn(this.dockerCommand, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        resolve({
          stdout,
          stderr,
          exitCode: code ?? 1,
        });
      });

      proc.on('error', () => {
        resolve({
          stdout,
          stderr: stderr || 'Failed to execute docker command',
          exitCode: 1,
        });
      });

      // Write stdin and close
      proc.stdin.write(stdin);
      proc.stdin.end();
    });
  }

  /**
   * Parse Docker inspect result into ContainerInfo.
   */
  private parseInspectResult(data: DockerInspectResult): ContainerInfo {
    const ports: ContainerInfo['ports'] = [];

    if (data.NetworkSettings?.Ports) {
      for (const [containerPort, bindings] of Object.entries(
        data.NetworkSettings.Ports,
      )) {
        if (bindings && bindings.length > 0) {
          const [port, protocol] = containerPort.split('/');
          ports.push({
            container: parseInt(port, 10),
            host: parseInt(bindings[0].HostPort, 10),
            protocol: protocol as 'tcp' | 'udp',
          });
        }
      }
    }

    // Parse image and tag from Config.Image
    const [image, tag] = (data.Config?.Image ?? ':').split(':');

    let status: ContainerStatus = 'unknown';
    const stateStatus = data.State?.Status?.toLowerCase();
    if (
      stateStatus === 'running' ||
      stateStatus === 'stopped' ||
      stateStatus === 'exited' ||
      stateStatus === 'created'
    ) {
      status = stateStatus;
    }

    return {
      id: data.Id,
      name: data.Name?.replace(/^\//, '') ?? '',
      ports,
      status,
      image,
      tag,
    };
  }
}

/**
 * Docker inspect JSON result structure (partial).
 */
interface DockerInspectResult {
  Id: string;
  Name?: string;
  State?: {
    Status?: string;
  };
  Config?: {
    Image?: string;
  };
  NetworkSettings?: {
    Ports?: Record<string, Array<{ HostIp: string; HostPort: string }> | null>;
  };
}
