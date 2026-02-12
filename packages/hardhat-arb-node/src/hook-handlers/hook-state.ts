/**
 * Shared state for hook-managed nodes.
 * This enables complete decoupling between task nodes and hook nodes.
 */

/** Port range for hook nodes */
const MIN_PORT = 10000;
const MAX_PORT = 60000;

/** The dynamically assigned port for this process (hook nodes only) */
let hookHttpPort: number | null = null;
let hookWsPort: number | null = null;

/**
 * Generate a random port in the safe range.
 * Exported for reuse by compile/deploy tasks that spin up ephemeral nodes.
 */
export function generateRandomPort(): number {
  return Math.floor(Math.random() * (MAX_PORT - MIN_PORT)) + MIN_PORT;
}

/**
 * Initialize hook ports (called once at module load)
 */
export function initHookPorts(): void {
  if (hookHttpPort === null) {
    hookHttpPort = generateRandomPort();
    hookWsPort = hookHttpPort + 1;
  }
}

/**
 * Get the HTTP port for hook-managed nodes
 */
export function getHookHttpPort(): number {
  if (hookHttpPort === null) {
    initHookPorts();
  }
  return hookHttpPort!;
}

/**
 * Get the WebSocket port for hook-managed nodes
 */
export function getHookWsPort(): number {
  if (hookWsPort === null) {
    initHookPorts();
  }
  return hookWsPort!;
}
