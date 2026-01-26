# Deploy Plugin

<!-- 
=============================================================================
CONTENT DESCRIPTION FOR DOCUMENTATION AGENT
=============================================================================

This page documents the hardhat-arb-deploy plugin.
THIS PLUGIN IS A PLACEHOLDER - NOT YET IMPLEMENTED.

WHAT TO WRITE:
- Clear "Coming Soon" indication
- Planned functionality description
- Expected features and usage
- Placeholder API documentation
- Links to manual deployment methods

SECTIONS TO INCLUDE:

1. Status Banner
   - Clear "Coming Soon" notice

2. Planned Functionality
   - Stylus contract deployment
   - Solidity contract deployment
   - Deployment scripts
   - Network management

3. Expected Usage (Preview)
   - Anticipated commands
   - Anticipated configuration
   - Deployment script examples (planned format)

4. Manual Deployment Today
   - Using cargo-stylus deploy
   - Using viem/ethers directly
   - StylusDeployer contract usage

REFERENCE MATERIALS:
- packages/hardhat-arb-deploy/src/tasks/deploy.ts (placeholder)
- StylusDeployer contract information
- Arbitrum deployment documentation

CURRENT IMPLEMENTATION (placeholder only):
```typescript
const taskDeploy: NewTaskActionFunction<{}> = async ({}, hre) => {
  console.log('deploy', 'hre.version:', hre.versions.hardhat);
};
```

=============================================================================
-->

**Package:** `@cobuilders/hardhat-arb-deploy`

**Status:** 🔜 Coming Soon

!!! warning "Coming Soon"
    This plugin is under active development. The API documented here represents planned functionality and may change.

## Planned Functionality

<!-- 
Describe what the plugin WILL do:
- Deploy Stylus contracts
- Deploy Solidity contracts
- Manage deployment scripts
- Track deployments across networks
- Integration with hardhat-ignition style
-->

The Deploy plugin will provide:

- Unified deployment for Stylus and Solidity contracts
- Deployment script management
- Network-aware deployment tracking
- Verification integration

## Expected Usage

```bash
# Planned commands
npx hardhat arb:deploy
npx hardhat arb:deploy --network arbitrum-sepolia
```

### Expected Deployment Scripts

```typescript
// deploy/001_deploy_counter.ts (planned format)
import { DeployFunction } from '@cobuilders/hardhat-arb-deploy';

const deploy: DeployFunction = async ({ deployer }) => {
  // Deploy Stylus contract
  await deployer.deploy('Counter', {
    type: 'stylus',
    artifact: './artifacts/counter.wasm',
  });
  
  // Deploy Solidity contract
  await deployer.deploy('CounterProxy', {
    type: 'solidity',
    args: [counterAddress],
  });
};

export default deploy;
```

### Expected Configuration

```typescript
// Planned configuration structure
export default {
  arbDeploy: {
    // Deployment scripts directory
    scriptsDir: './deploy',
    
    // Deployments output directory
    deploymentsDir: './deployments',
  },
};
```

## Manual Deployment Today

While this plugin is in development, you can deploy contracts manually:

### Deploying Stylus Contracts

```bash
# Start node with Stylus support
npx hardhat arb:node start --stylus-ready

# Deploy using cargo-stylus
cargo stylus deploy \
  --endpoint http://localhost:8547 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Deploying with viem

```typescript
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const account = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');

const client = createWalletClient({
  account,
  transport: http('http://localhost:8547'),
});

// Deploy contract...
```

## Roadmap

<!-- Link to GitHub issues or project board -->

Follow development progress:

- [GitHub Issues](https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus/issues)
