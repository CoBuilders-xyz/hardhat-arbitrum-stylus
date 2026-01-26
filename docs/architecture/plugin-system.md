# Plugin System

<!-- 
=============================================================================
CONTENT DESCRIPTION FOR DOCUMENTATION AGENT
=============================================================================

This page explains how the Hardhat 3 plugin system works and how our plugins use it.

WHAT TO WRITE:
- Hardhat 3 plugin architecture
- Plugin structure and components
- Hook handlers (config, hre, network)
- Task registration
- Type extensions
- How our plugins implement these concepts

SECTIONS TO INCLUDE:

1. Hardhat 3 Plugin System Overview
   - What changed from Hardhat 2
   - New plugin structure
   - Benefits of new system

2. Plugin Structure
   - HardhatPlugin interface
   - Plugin ID and npm package
   - Dependencies
   - Hook handlers
   - Tasks

3. Hook Handlers
   - config hook: Modify configuration
   - hre hook: Extend runtime environment
   - network hook: Network-specific behavior
   - How to implement each

4. Task Registration
   - New task API
   - Task definition
   - Arguments and flags
   - Task actions (lazy loading)

5. Type Extensions
   - Extending HardhatUserConfig
   - Extending HardhatRuntimeEnvironment
   - Declaration merging

6. Our Implementation
   - How hardhat-arb-node implements these
   - Code examples from the source

REFERENCE MATERIALS:
- packages/hardhat-arb-node/src/index.ts
- packages/hardhat-arb-node/src/type-extensions.ts
- packages/hardhat-arb-node/src/hook-handlers/*.ts
- Hardhat 3 documentation

CODE EXAMPLES FROM SOURCE:

Plugin definition (index.ts):
```typescript
const hardhatArbNodePlugin: HardhatPlugin = {
  id: 'hardhat-arb-node',
  npmPackage: '@cobuilders/hardhat-arb-node',
  hookHandlers: {
    config: () => import('./hook-handlers/config.js'),
    hre: () => import('./hook-handlers/hre.js'),
    network: () => import('./hook-handlers/network.js'),
  },
  tasks: [...],
};
```

=============================================================================
-->

This page explains how the Hardhat 3 plugin system works and how our plugins are built.

## Hardhat 3 Plugin System

<!-- 
Overview of the new plugin system:
- Declarative plugin definition
- Hook-based architecture
- Lazy loading for performance
- Better TypeScript support
-->

Hardhat 3 introduced a new plugin architecture that's:

- **Declarative** — Plugins define capabilities, not imperative setup
- **Hook-based** — Plugins interact via well-defined hooks
- **Lazy-loaded** — Components load only when needed
- **Type-safe** — Full TypeScript support with declaration merging

## Plugin Structure

A Hardhat 3 plugin is an object implementing `HardhatPlugin`:

```typescript
import type { HardhatPlugin } from 'hardhat/types/plugins';

const myPlugin: HardhatPlugin = {
  // Unique identifier
  id: 'my-plugin',
  
  // npm package name
  npmPackage: '@my-org/my-plugin',
  
  // Dependencies on other plugins
  dependencies: () => [
    import('other-plugin'),
  ],
  
  // Hook handlers for extending Hardhat
  hookHandlers: {
    config: () => import('./hook-handlers/config.js'),
    hre: () => import('./hook-handlers/hre.js'),
  },
  
  // Task definitions
  tasks: [
    // ... task definitions
  ],
};

export default myPlugin;
```

### Our Implementation

From `hardhat-arb-node`:

```typescript
const hardhatArbNodePlugin: HardhatPlugin = {
  id: 'hardhat-arb-node',
  npmPackage: '@cobuilders/hardhat-arb-node',
  hookHandlers: {
    config: () => import('./hook-handlers/config.js'),
    hre: () => import('./hook-handlers/hre.js'),
    network: () => import('./hook-handlers/network.js'),
  },
  tasks: [
    // Task definitions...
  ],
};
```

## Hook Handlers

Hooks allow plugins to extend Hardhat at specific points.

### Config Hook

Modifies and validates configuration:

```typescript
// hook-handlers/config.ts
import type { ConfigHookHandler } from 'hardhat/types/hooks';

const configHookHandler: ConfigHookHandler = {
  // Extend user config with defaults
  extendUserConfig: async (config, context) => {
    return {
      ...config,
      arbNode: {
        ...DEFAULT_CONFIG,
        ...config.arbNode,
      },
    };
  },
  
  // Validate the final config
  validateUserConfig: async (config) => {
    // Validation logic
  },
  
  // Resolve user config to final config
  resolveUserConfig: async (config) => {
    return {
      ...config,
      arbNode: resolveConfig(config.arbNode),
    };
  },
};

export default configHookHandler;
```

### HRE Hook

Extends the Hardhat Runtime Environment:

```typescript
// hook-handlers/hre.ts
import type { HreHookHandler } from 'hardhat/types/hooks';

const hreHookHandler: HreHookHandler = {
  // Add properties to HRE
  extendHardhatRuntimeEnvironment: async (hre) => {
    // Add custom functionality to hre
  },
};

export default hreHookHandler;
```

### Network Hook

Network-specific behavior:

```typescript
// hook-handlers/network.ts
import type { NetworkHookHandler } from 'hardhat/types/hooks';

const networkHookHandler: NetworkHookHandler = {
  // Called when network is resolved
  resolveNetworkConfig: async (config, networkName) => {
    // Modify network configuration
  },
};

export default networkHookHandler;
```

## Task Registration

Tasks are registered declaratively in the plugin definition:

```typescript
import { task, emptyTask } from 'hardhat/config';
import { ArgumentType } from 'hardhat/types/arguments';

const plugin: HardhatPlugin = {
  tasks: [
    // Empty task for grouping
    emptyTask('arb:node', 'Manage Arbitrum nitro-devnode').build(),
    
    // Subtask with options
    task(['arb:node', 'start'], 'Start the local Arbitrum node')
      .addFlag({
        name: 'quiet',
        description: 'Suppress output',
      })
      .addFlag({
        name: 'detach',
        shortName: 'd',
        description: 'Run in background',
      })
      .addOption({
        name: 'httpPort',
        type: ArgumentType.INT,
        defaultValue: 0,
        description: 'Custom HTTP port',
      })
      .setAction(() => import('./tasks/start.js'))
      .build(),
  ],
};
```

### Task Actions

Task actions are lazy-loaded modules:

```typescript
// tasks/start.ts
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

interface TaskStartArguments {
  quiet: boolean;
  detach: boolean;
  httpPort: number;
}

const taskStart: NewTaskActionFunction<TaskStartArguments> = async (
  args,
  hre,
) => {
  const { quiet, detach, httpPort } = args;
  // Implementation...
};

export default taskStart;
```

## Type Extensions

Plugins extend Hardhat's types via declaration merging:

```typescript
// type-extensions.ts
import 'hardhat/types/config';
import 'hardhat/types/hre';

declare module 'hardhat/types/config' {
  interface HardhatUserConfig {
    arbNode?: ArbNodeUserConfig;
  }

  interface HardhatConfig {
    arbNode: ArbNodeConfig;
  }
}

declare module 'hardhat/types/hre' {
  interface HardhatRuntimeEnvironment {
    // Custom HRE properties
  }
}
```

This enables:

- IDE autocomplete for configuration
- Type checking for plugin options
- Documentation via JSDoc comments

## Composition Pattern

The toolbox plugin uses composition:

```typescript
const hardhatArbitrumStylusPlugin: HardhatPlugin = {
  id: 'hardhat-arbitrum-stylus',
  dependencies: () => [
    import('@cobuilders/hardhat-arb-node'),
    import('@cobuilders/hardhat-arb-compile'),
    import('@cobuilders/hardhat-arb-deploy'),
    import('@cobuilders/hardhat-arb-test'),
  ],
  npmPackage: '@cobuilders/hardhat-arbitrum-stylus',
};
```

The toolbox:

- Defines no tasks directly
- Declares dependencies on all plugins
- Provides single-install convenience

## Resources

- [Hardhat 3 Plugin Documentation](https://hardhat.org)
- [TypeScript Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
