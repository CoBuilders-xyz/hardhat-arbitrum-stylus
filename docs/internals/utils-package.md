# Utils Package Internals

<!-- 
=============================================================================
CONTENT DESCRIPTION FOR DOCUMENTATION AGENT
=============================================================================

This page provides a deep dive into the hardhat-arb-utils package.

WHAT TO WRITE:
- Complete documentation of all modules in utils
- Container management internals
- Docker client implementation
- Web3 utilities
- Testing utilities
- How other packages use these

SECTIONS TO INCLUDE:

1. Package Overview
   - What utils provides
   - Module exports

2. Container Module
   - ContainerManager detailed implementation
   - DockerClient detailed implementation
   - Types and interfaces

3. Web3 Module
   - RPC client utilities
   - viem integration
   - Common web3 operations

4. Errors Module
   - Plugin error creation
   - Error types

5. Testing Module
   - Fixture project helpers
   - Test utilities

REFERENCE MATERIALS:
- packages/hardhat-arb-utils/src/index.ts
- packages/hardhat-arb-utils/src/container/*.ts
- packages/hardhat-arb-utils/src/web3/*.ts
- packages/hardhat-arb-utils/src/errors/*.ts
- packages/hardhat-arb-utils/src/testing/*.ts

=============================================================================
-->

Deep dive into `@cobuilders/hardhat-arb-utils` — the shared utilities package.

## Package Overview

```typescript
// packages/hardhat-arb-utils/src/index.ts
export * from "./container/index.js";
export * from "./errors/index.js";
export * from "./web3/index.js";
export * from "./testing/index.js";
```

## Module Structure

```
hardhat-arb-utils/src/
├── container/
│   ├── index.ts              # Exports
│   ├── container-manager.ts  # High-level container management
│   ├── docker-client.ts      # Low-level Docker CLI wrapper
│   └── types.ts              # Type definitions
├── errors/
│   └── index.ts              # Error utilities
├── web3/
│   ├── index.ts              # Exports
│   ├── client.ts             # Web3 client utilities
│   ├── rpc.ts                # RPC helpers
│   ├── types.ts              # Type definitions
│   └── viem.ts               # viem re-exports
└── testing/
    ├── index.ts              # Exports
    └── use-fixture-project.ts # Test fixture helper
```

## Container Module

### ContainerManager

High-level API for container lifecycle:

```typescript
export class ContainerManager {
  private readonly client: DockerClient;
  private readonly managedContainers: Map<string, ContainerInfo>;

  constructor(client?: DockerClient) {
    this.client = client ?? new DockerClient();
  }

  // Ensures Docker daemon is available
  async ensureDockerAvailable(): Promise<void>;

  // Start container with full lifecycle
  async start(config: ContainerConfig): Promise<ContainerInfo>;

  // Stop running container
  async stop(containerId: string): Promise<void>;

  // Remove container
  async remove(containerId: string): Promise<void>;

  // Check if container is running
  async isRunning(containerId: string): Promise<boolean>;

  // Get container logs
  async logs(containerId: string, tail?: number): Promise<string>;

  // Stream logs (real-time)
  streamLogs(containerId: string): ChildProcess;

  // Wait for readiness check to pass
  async waitForReady(info: ContainerInfo, check: ReadinessCheck): Promise<void>;

  // Stop all managed containers
  async stopAll(): Promise<void>;
}
```

### DockerClient

Low-level Docker CLI wrapper:

```typescript
export class DockerClient {
  // Check Docker availability
  async isAvailable(): Promise<boolean>;

  // Run a container
  async run(config: ContainerConfig): Promise<string>;

  // Stop a container
  async stop(containerId: string, timeout?: number): Promise<void>;

  // Remove a container
  async remove(containerId: string, force?: boolean): Promise<void>;

  // Get container logs
  async logs(containerId: string, options?: LogOptions): Promise<string>;

  // Stream container logs
  streamLogs(containerId: string, options?: LogOptions): ChildProcess;

  // Inspect container
  async inspect(containerId: string): Promise<ContainerInfo | null>;

  // Check if container is running
  async isRunning(containerId: string): Promise<boolean>;

  // Find container by name
  async findByName(name: string): Promise<string | null>;

  // Check if image exists locally
  async imageExists(image: string, tag: string): Promise<boolean>;

  // Pull image from registry
  async pullImage(image: string, tag: string): Promise<void>;

  // Execute command in container
  async execInContainer(containerId: string, cmd: string[]): Promise<ExecResult>;
}
```

### Container Types

```typescript
export interface ContainerConfig {
  image: string;
  tag: string;
  name?: string;
  ports: PortMapping[];
  command?: string[];
  readinessCheck?: ReadinessCheck;
  autoRemove?: boolean;
  detach?: boolean;
}

export interface PortMapping {
  host: number;
  container: number;
}

export interface ReadinessCheck {
  type: 'http' | 'tcp' | 'exec';
  target: string;
  timeout: number;
  interval: number;
}

export interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  status: string;
  ports: PortMapping[];
}
```

## Web3 Module

### Client Utilities

```typescript
// Re-export viem types for convenience
export type { Hex, Address } from 'viem';
export { getAddress } from 'viem';
```

### RPC Helpers

Used internally for chain setup:

```typescript
// Send ETH to an address
export async function sendEth(
  rpcUrl: string,
  privateKey: Hex,
  to: Address,
  amount: bigint
): Promise<Hex>;

// Deploy a contract
export async function deployContract(
  rpcUrl: string,
  privateKey: Hex,
  bytecode: Hex
): Promise<{ hash: Hex; contractAddress: Address }>;

// Get code at address
export async function getCode(
  rpcUrl: string,
  address: Address
): Promise<Hex>;

// Send raw transaction
export async function sendRawTransaction(
  rpcUrl: string,
  signedTx: Hex
): Promise<Hex>;
```

## Errors Module

### Plugin Error Factory

```typescript
export function createPluginError(message: string): Error {
  const error = new Error(message);
  error.name = 'HardhatPluginError';
  return error;
}
```

### Usage

```typescript
import { createPluginError } from '@cobuilders/hardhat-arb-utils';

if (!condition) {
  throw createPluginError('Something went wrong');
}
```

## Testing Module

### Fixture Project Helper

```typescript
export function useFixtureProject(projectName: string): void {
  // Changes process.cwd() to the fixture project directory
  // before each test and restores after
}
```

### Usage in Tests

```typescript
import { useFixtureProject } from '@cobuilders/hardhat-arb-utils/testing';

describe('MyPlugin', () => {
  useFixtureProject('my-fixture');

  it('should work', async () => {
    // process.cwd() is now the fixture project
    const hre = await import('hardhat');
  });
});
```

## Extending Utils

### Adding New Utilities

1. Create module in appropriate directory
2. Export from module's `index.ts`
3. Re-export from main `src/index.ts`
4. Add tests

### Guidelines

- Keep utilities generic
- Avoid Hardhat-specific code (that goes in plugins)
- Full TypeScript types
- Test all utilities
