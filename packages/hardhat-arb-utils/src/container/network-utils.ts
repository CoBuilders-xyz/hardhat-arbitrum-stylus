/**
 * Utilities for handling network URLs in Docker contexts.
 */

/**
 * Check if a URL points to localhost or 127.x.x.x.
 * These URLs are unreachable from inside a Docker container.
 */
export function isLocalhostUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === 'localhost' || parsed.hostname.startsWith('127.')
    );
  } catch {
    return false;
  }
}

/**
 * Convert a localhost URL to use host.docker.internal,
 * which resolves to the host machine from inside a Docker container.
 */
export function toDockerHostUrl(url: string): string {
  const parsed = new URL(url);
  parsed.hostname = 'host.docker.internal';
  return parsed.toString().replace(/\/$/, '');
}
