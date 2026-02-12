import { DockerClient } from '../../container/docker-client.js';

/** Docker volume name for persisting rustup toolchains between container runs */
export const RUSTUP_VOLUME_NAME = 'stylus-compile-rustup';

/** Docker volume name for persisting cargo registry between container runs */
export const CARGO_VOLUME_NAME = 'stylus-compile-cargo';

/**
 * Remove the cache volumes used for Stylus compilation.
 * Returns info about which volumes were removed.
 *
 * @param client - DockerClient instance to use for volume operations
 */
export async function cleanCacheVolumes(
  client: DockerClient = new DockerClient(),
): Promise<{
  removed: string[];
  notFound: string[];
}> {
  const removed: string[] = [];
  const notFound: string[] = [];

  for (const volumeName of [RUSTUP_VOLUME_NAME, CARGO_VOLUME_NAME]) {
    try {
      await client.removeVolume(volumeName);
      removed.push(volumeName);
    } catch {
      notFound.push(volumeName);
    }
  }

  return { removed, notFound };
}

/**
 * Ensure the Docker volumes exist for caching.
 * Returns info about which volumes were created.
 *
 * @param client - DockerClient instance to use for volume operations
 */
export async function ensureVolumes(
  client: DockerClient = new DockerClient(),
): Promise<{
  created: string[];
  existing: string[];
}> {
  const created: string[] = [];
  const existing: string[] = [];

  for (const volumeName of [RUSTUP_VOLUME_NAME, CARGO_VOLUME_NAME]) {
    const exists = await client.volumeExists(volumeName);
    if (exists) {
      existing.push(volumeName);
    } else {
      await client.createVolume(volumeName);
      created.push(volumeName);
    }
  }

  return { created, existing };
}
