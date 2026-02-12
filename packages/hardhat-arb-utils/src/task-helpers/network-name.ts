/**
 * Generate a random Docker network name with the given prefix.
 *
 * @param prefix - String prefix for the network name (e.g. "stylus-compile-net-")
 */
export function generateNetworkName(prefix: string): string {
  const randomId = Math.random().toString(36).substring(2, 10);
  return `${prefix}${randomId}`;
}
