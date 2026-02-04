/**
 * Temporary node management for ephemeral Arbitrum nodes.
 *
 * This module provides utilities for managing temporary containers that should
 * be automatically cleaned up when the process exits or when explicitly stopped.
 *
 * Used by:
 * - Network hook (for auto-starting nodes on connection)
 * - Compile plugin (for temporary nodes during compilation)
 */

import { DockerClient } from '@cobuilders/hardhat-arb-utils';

/** Prefix for temporary containers */
const TEMP_CONTAINER_PREFIX = 'nitro-devnode-tmp-';

/** Track all temp containers globally for process exit cleanup */
const allTempContainers = new Set<string>();

/** Track the currently active temp container */
let activeTempContainer: string | null = null;

/** Track if exit handler has been registered */
let exitHandlerRegistered = false;

/**
 * Generate a random container name for temporary nodes.
 */
export function generateTempContainerName(): string {
  const randomId = Math.random().toString(36).substring(2, 10);
  return `${TEMP_CONTAINER_PREFIX}${randomId}`;
}

/**
 * Register a container for cleanup tracking.
 * Also ensures the exit handler is registered.
 */
export function registerTempContainer(name: string): void {
  ensureExitHandlerRegistered();
  allTempContainers.add(name);
}

/**
 * Unregister a container from cleanup tracking.
 */
export function unregisterTempContainer(name: string): void {
  allTempContainers.delete(name);
  if (activeTempContainer === name) {
    activeTempContainer = null;
  }
}

/**
 * Get the currently active temp container name.
 */
export function getActiveTempContainer(): string | null {
  return activeTempContainer;
}

/**
 * Set the active temp container name.
 */
export function setActiveTempContainer(name: string | null): void {
  activeTempContainer = name;
}

/**
 * Check if a temp container is still running.
 */
export async function isTempContainerRunning(
  containerName: string,
): Promise<boolean> {
  const client = new DockerClient();
  const containerId = await client.findByName(containerName);
  if (!containerId) return false;
  return client.isRunning(containerId);
}

/**
 * Cleanup (stop and remove) a specific temp container.
 */
export async function cleanupTempContainer(
  containerName: string,
): Promise<void> {
  const client = new DockerClient();
  const containerId = await client.findByName(containerName);

  if (containerId) {
    try {
      await client.stop(containerId);
      await client.remove(containerId, true);
    } catch {
      // Ignore cleanup errors
    }
  }

  unregisterTempContainer(containerName);
}

/**
 * Cleanup all registered temp containers.
 */
export async function cleanupAllTempContainers(): Promise<void> {
  if (allTempContainers.size === 0) return;

  const client = new DockerClient();
  for (const containerName of allTempContainers) {
    try {
      const containerId = await client.findByName(containerName);
      if (containerId) {
        await client.stop(containerId);
        await client.remove(containerId, true);
      }
    } catch {
      // Ignore cleanup errors during exit
    }
  }
  allTempContainers.clear();
  activeTempContainer = null;
}

/**
 * Ensure exit handlers are registered for cleanup on process termination.
 */
export function ensureExitHandlerRegistered(): void {
  if (exitHandlerRegistered) return;
  exitHandlerRegistered = true;

  const cleanup = async () => {
    await cleanupAllTempContainers();
  };

  // Handle graceful shutdown
  process.on('beforeExit', () => void cleanup());
  process.on('SIGINT', () => void cleanup().then(() => process.exit(130)));
  process.on('SIGTERM', () => void cleanup().then(() => process.exit(143)));
}
