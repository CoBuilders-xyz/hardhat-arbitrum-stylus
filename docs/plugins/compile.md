# Compile Plugin

<!-- 
=============================================================================
CONTENT DESCRIPTION FOR DOCUMENTATION AGENT
=============================================================================

This page documents the hardhat-arb-compile plugin.
THIS PLUGIN IS A PLACEHOLDER - NOT YET IMPLEMENTED.

WHAT TO WRITE:
- Clear "Coming Soon" indication
- Planned functionality description
- Expected features and usage
- Placeholder API documentation
- Links to Stylus SDK for manual compilation

SECTIONS TO INCLUDE:

1. Status Banner
   - Clear "Coming Soon" notice
   - Link to roadmap or issues

2. Planned Functionality
   - What the plugin will do
   - Integration with cargo-stylus
   - Solidity + Stylus compilation

3. Expected Usage (Preview)
   - Anticipated commands
   - Anticipated configuration
   - Make clear these are PLANNED, not current

4. Manual Compilation
   - How to compile Stylus contracts today
   - Using cargo-stylus directly
   - Integration with the node plugin

REFERENCE MATERIALS:
- packages/hardhat-arb-compile/src/tasks/compile.ts (placeholder)
- Arbitrum Stylus SDK documentation
- cargo-stylus documentation

CURRENT IMPLEMENTATION (placeholder only):
```typescript
const taskCompile: NewTaskActionFunction<{}> = async ({}, hre) => {
  console.log('compile', 'hre.version:', hre.versions.hardhat);
};
```

=============================================================================
-->

**Package:** `@cobuilders/hardhat-arb-compile`

**Status:** 🔜 Coming Soon

!!! warning "Coming Soon"
    This plugin is under active development. The API documented here represents planned functionality and may change.

## Planned Functionality

<!-- 
Describe what the plugin WILL do:
- Compile Rust Stylus contracts using cargo-stylus
- Compile Solidity contracts
- Generate deployment artifacts
- Type generation for TypeScript
-->

The Compile plugin will provide:

- Stylus contract compilation via `cargo-stylus`
- Solidity contract compilation
- Unified artifact generation
- TypeScript type generation

## Expected Usage

```bash
# Planned command
npx hardhat arb:compile
```

### Expected Configuration

```typescript
// Planned configuration structure
export default {
  arbCompile: {
    // Stylus project paths
    stylusProjects: ['./contracts/stylus'],
    
    // Solidity paths
    solidityPaths: ['./contracts/solidity'],
    
    // Output directory
    artifactsDir: './artifacts',
  },
};
```

## Manual Compilation Today

While this plugin is in development, you can compile Stylus contracts manually:

### Using cargo-stylus

```bash
# Navigate to your Stylus project
cd contracts/my-stylus-contract

# Check compilation
cargo stylus check

# Build for deployment
cargo stylus export-abi
cargo build --release --target wasm32-unknown-unknown
```

### Workflow with Node Plugin

1. Start the local node:
   ```bash
   npx hardhat arb:node start --stylus-ready
   ```

2. Compile your Stylus contract:
   ```bash
   cargo stylus check --endpoint http://localhost:8547
   ```

3. Deploy using cargo-stylus:
   ```bash
   cargo stylus deploy --endpoint http://localhost:8547 --private-key <key>
   ```

## Roadmap

<!-- Link to GitHub issues or project board for tracking -->

Follow development progress:

- [GitHub Issues](https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus/issues)
