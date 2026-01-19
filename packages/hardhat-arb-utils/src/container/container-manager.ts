import type { ChildProcess } from "node:child_process";

import { DockerClient, DockerError } from "./docker-client.js";
import type {
  ContainerConfig,
  ContainerInfo,
  ReadinessCheck,
} from "./types.js";

/**
 * Error thrown when container operations fail.
 */
export class ContainerManagerError extends Error {
  public readonly originalCause?: Error;

  constructor(message: string, originalCause?: Error) {
    super(message);
    this.name = "ContainerManagerError";
    this.originalCause = originalCause;
  }
}

/**
 * High-level container lifecycle management.
 * Handles starting, stopping, and monitoring Docker containers.
 */
export class ContainerManager {
  private readonly client: DockerClient;
  private readonly managedContainers: Map<string, ContainerInfo> = new Map();

  constructor(client?: DockerClient) {
    this.client = client ?? new DockerClient();
  }

  /**
   * Check if Docker is available on the system.
   */
  async ensureDockerAvailable(): Promise<void> {
    const available = await this.client.isAvailable();
    if (!available) {
      throw new ContainerManagerError(
        "Docker is not available. Please ensure Docker is installed and running.",
      );
    }
  }

  /**
   * Start a container with the given configuration.
   * Pulls the image if it doesn't exist locally.
   */
  async start(config: ContainerConfig): Promise<ContainerInfo> {
    await this.ensureDockerAvailable();

    // Check for existing container with same name
    if (config.name) {
      const existingId = await this.client.findByName(config.name);
      if (existingId) {
        const isRunning = await this.client.isRunning(existingId);
        if (isRunning) {
          const info = await this.client.inspect(existingId);
          if (info) {
            this.managedContainers.set(info.id, info);
            return info;
          }
        }
        // Remove stopped container with same name
        await this.client.remove(existingId, true);
      }
    }

    // Pull image if not present
    const imageExists = await this.client.imageExists(config.image, config.tag);
    if (!imageExists) {
      try {
        await this.client.pullImage(config.image, config.tag);
      } catch (error) {
        if (error instanceof DockerError) {
          throw new ContainerManagerError(
            `Failed to pull image ${config.image}:${config.tag}. ` +
              "Please check your internet connection and image name.",
            error,
          );
        }
        throw error;
      }
    }

    // Start container
    let containerId: string;
    try {
      containerId = await this.client.run({
        ...config,
        detach: true,
      });
    } catch (error) {
      if (error instanceof DockerError) {
        throw new ContainerManagerError(
          `Failed to start container: ${error.message}`,
          error,
        );
      }
      throw error;
    }

    // Get container info
    const info = await this.client.inspect(containerId);
    if (!info) {
      throw new ContainerManagerError(
        `Container started but could not get info for ${containerId}`,
      );
    }

    this.managedContainers.set(containerId, info);

    // Wait for readiness if configured
    if (config.readinessCheck) {
      await this.waitForReady(info, config.readinessCheck);
    }

    return info;
  }

  /**
   * Stop a container.
   */
  async stop(containerId: string): Promise<void> {
    try {
      const isRunning = await this.client.isRunning(containerId);
      if (isRunning) {
        await this.client.stop(containerId);
      }
    } catch (error) {
      if (error instanceof DockerError) {
        throw new ContainerManagerError(
          `Failed to stop container ${containerId}: ${error.message}`,
          error,
        );
      }
      throw error;
    } finally {
      this.managedContainers.delete(containerId);
    }
  }

  /**
   * Remove a container (stops it first if running).
   */
  async remove(containerId: string): Promise<void> {
    try {
      await this.client.remove(containerId, true);
    } catch (error) {
      if (error instanceof DockerError) {
        throw new ContainerManagerError(
          `Failed to remove container ${containerId}: ${error.message}`,
          error,
        );
      }
      throw error;
    } finally {
      this.managedContainers.delete(containerId);
    }
  }

  /**
   * Check if a container is running.
   */
  async isRunning(containerId: string): Promise<boolean> {
    return this.client.isRunning(containerId);
  }

  /**
   * Get container logs.
   */
  async logs(containerId: string, tail?: number): Promise<string> {
    return this.client.logs(containerId, { tail });
  }

  /**
   * Stream container logs (returns a child process with stdout/stderr pipes).
   */
  streamLogs(containerId: string): ChildProcess {
    return this.client.streamLogs(containerId);
  }

  /**
   * Wait for a container to be ready according to the readiness check.
   */
  async waitForReady(
    info: ContainerInfo,
    check: ReadinessCheck,
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < check.timeout) {
      const isReady = await this.performReadinessCheck(info, check);
      if (isReady) {
        return;
      }
      await this.sleep(check.interval);
    }

    throw new ContainerManagerError(
      `Container ${info.id} did not become ready within ${check.timeout}ms`,
    );
  }

  /**
   * Stop all containers managed by this instance.
   */
  async stopAll(): Promise<void> {
    const containerIds = Array.from(this.managedContainers.keys());
    await Promise.all(containerIds.map((id) => this.stop(id)));
  }

  /**
   * Get all containers managed by this instance.
   */
  getManagedContainers(): ContainerInfo[] {
    return Array.from(this.managedContainers.values());
  }

  /**
   * Perform a single readiness check.
   */
  private async performReadinessCheck(
    info: ContainerInfo,
    check: ReadinessCheck,
  ): Promise<boolean> {
    switch (check.type) {
      case "http":
        return this.httpReadinessCheck(check.target);
      case "tcp":
        return this.tcpReadinessCheck(check.target);
      case "exec":
        return this.execReadinessCheck(info.id, check.target);
    }
  }

  /**
   * HTTP readiness check - polls endpoint until success.
   */
  private async httpReadinessCheck(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_chainId",
          params: [],
          id: 1,
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * TCP readiness check - checks if port is open.
   */
  private async tcpReadinessCheck(target: string): Promise<boolean> {
    const [host, portStr] = target.split(":");
    const port = parseInt(portStr, 10);

    return new Promise((resolve) => {
      import("node:net")
        .then(({ createConnection }) => {
          const socket = createConnection({ host, port }, () => {
            socket.end();
            resolve(true);
          });

          socket.on("error", () => {
            resolve(false);
          });

          socket.setTimeout(1000, () => {
            socket.destroy();
            resolve(false);
          });
        })
        .catch(() => {
          resolve(false);
        });
    });
  }

  /**
   * Exec readiness check - runs command in container.
   */
  private async execReadinessCheck(
    containerId: string,
    command: string,
  ): Promise<boolean> {
    try {
      const result = await this.client.execInContainer(
        containerId,
        command.split(" "),
      );
      return result.exitCode === 0;
    } catch {
      return false;
    }
  }

  /**
   * Sleep for a given number of milliseconds.
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
