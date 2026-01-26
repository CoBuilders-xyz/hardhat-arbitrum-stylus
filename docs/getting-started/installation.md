# Installation

<!-- 
=============================================================================
CONTENT DESCRIPTION FOR DOCUMENTATION AGENT
=============================================================================

This page covers installing the Hardhat Arbitrum Stylus plugin suite.

WHAT TO WRITE:
- Step-by-step installation instructions
- New project vs existing project scenarios
- Package manager variations (pnpm, npm, yarn)
- Plugin configuration in hardhat.config.ts
- TypeScript setup considerations
- Verification that installation worked

SECTIONS TO INCLUDE:

1. Quick Install
   - One-liner for installing the toolbox
   - Basic hardhat.config.ts setup

2. New Project Setup
   - Creating a new Hardhat project
   - Adding the plugin
   - Project structure overview

3. Existing Project Setup
   - Adding to existing Hardhat 3 project
   - Migration notes from Hardhat 2 (if applicable)

4. Individual Package Installation
   - Installing specific packages instead of toolbox
   - When to use individual packages

5. Configuration
   - Basic hardhat.config.ts setup
   - TypeScript considerations
   - Plugin options overview (link to configuration section)

6. Verification
   - Commands to verify installation
   - Expected output

REFERENCE MATERIALS:
- Package README files
- Hardhat 3 plugin installation docs
- Package.json dependencies

IMPORTANT NOTES:
- This is for Hardhat 3, not Hardhat 2
- Plugin system uses new import syntax
- TypeScript is the recommended configuration format

=============================================================================
-->

This guide covers installing Hardhat Arbitrum Stylus in your project.

## Quick Install

```bash
npm install @cobuilders/hardhat-arbitrum-stylus
```

Add to your `hardhat.config.ts`:

```typescript
import hardhatArbitrumStylus from '@cobuilders/hardhat-arbitrum-stylus';

export default {
  plugins: [hardhatArbitrumStylus],
};
```

## New Project Setup

<!-- 
Step-by-step for creating a new project:
1. Create directory
2. Initialize package.json
3. Install Hardhat and plugin
4. Create config file
5. Verify setup
-->

### Step 1: Create Project Directory

```bash
mkdir my-stylus-project
cd my-stylus-project
```

### Step 2: Initialize Package

=== "pnpm"

    ```bash
    pnpm init
    ```

=== "npm"

    ```bash
    npm init -y
    ```

=== "yarn"

    ```bash
    yarn init -y
    ```

### Step 3: Install Dependencies

=== "pnpm"

    ```bash
    pnpm add hardhat @cobuilders/hardhat-arbitrum-stylus
    pnpm add -D typescript @types/node
    ```

=== "npm"

    ```bash
    npm install hardhat @cobuilders/hardhat-arbitrum-stylus
    npm install -D typescript @types/node
    ```

### Step 4: Create Configuration

Create `hardhat.config.ts`:

```typescript
import type { HardhatUserConfig } from 'hardhat/config';
import hardhatArbitrumStylus from '@cobuilders/hardhat-arbitrum-stylus';

const config: HardhatUserConfig = {
  plugins: [hardhatArbitrumStylus],
};

export default config;
```

### Step 5: Verify Installation

```bash
npx hardhat --help
```

You should see `arb:node`, `arb:compile`, `arb:deploy`, and `arb:test` tasks listed.

## Existing Project Setup

<!-- 
For projects already using Hardhat 3:
- Add plugin dependency
- Update config
- Any breaking changes to note
-->

If you have an existing Hardhat 3 project:

```bash
npm install @cobuilders/hardhat-arbitrum-stylus
```

Update your `hardhat.config.ts`:

```typescript
import hardhatArbitrumStylus from '@cobuilders/hardhat-arbitrum-stylus';

export default {
  // Your existing config...
  plugins: [
    // Your existing plugins...
    hardhatArbitrumStylus,
  ],
};
```

## Installing Individual Packages

<!-- 
Explain when you might want individual packages:
- Only need node management
- Custom plugin composition
- Smaller dependency footprint
-->

Instead of the full toolbox, you can install specific packages:

```bash
# Only the node plugin
npm install @cobuilders/hardhat-arb-node

# Multiple specific plugins
npm install @cobuilders/hardhat-arb-node @cobuilders/hardhat-arb-compile
```

```typescript
import hardhatArbNode from '@cobuilders/hardhat-arb-node';
import hardhatArbCompile from '@cobuilders/hardhat-arb-compile';

export default {
  plugins: [hardhatArbNode, hardhatArbCompile],
};
```

## TypeScript Configuration

<!-- 
tsconfig.json recommendations
ESM vs CJS considerations
-->

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true
  }
}
```

## Next Steps

- [Quick Start](quick-start.md) — Run your first commands
- [Configuration](../configuration/index.md) — Customize plugin settings
