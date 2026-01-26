# Hardhat Arbitrum Stylus

<!-- 
=============================================================================
CONTENT DESCRIPTION FOR DOCUMENTATION AGENT
=============================================================================

This is the landing page for the Hardhat Arbitrum Stylus documentation.

WHAT TO WRITE:
- A compelling introduction to the plugin suite
- Highlight that this brings Hardhat's developer experience to Arbitrum Stylus
- Brief explanation of what Arbitrum Stylus is (Rust/C/C++ smart contracts on Arbitrum)
- Overview of the plugin capabilities (node, compile, deploy, test)
- Visual diagram or feature highlights
- Quick links to getting started

TONE & STYLE:
- Welcoming and professional
- Similar to Hardhat's official documentation style
- Focus on developer productivity and ease of use

KEY POINTS TO COVER:
1. What is Hardhat Arbitrum Stylus? (one-liner)
2. Why use it? (benefits)
3. What's included? (package overview)
4. How to get started? (CTA to quick-start)

REFERENCE MATERIALS:
- Main README.md in repository root
- Individual package README files
- Hardhat 3 documentation for inspiration

=============================================================================
-->

!!! tip "Beta Status"
    Hardhat Arbitrum Stylus is in active development. Some features are coming soon.
    See our [roadmap](#whats-included) for current status.

**Hardhat Arbitrum Stylus** is a plugin suite that brings Hardhat's powerful developer experience to Arbitrum Stylus development.

## What is Arbitrum Stylus?

<!-- Explain Arbitrum Stylus: write smart contracts in Rust, C, C++ that compile to WASM and run on Arbitrum -->

## Why Hardhat Arbitrum Stylus?

<!-- 
Explain the value proposition:
- Familiar Hardhat workflow
- Local development with nitro-devnode
- Integrated tooling (compile, deploy, test)
- TypeScript-first configuration
-->

## What's Included

| Package | Description | Status |
|---------|-------------|--------|
| `@cobuilders/hardhat-arbitrum-stylus` | Toolbox — includes all plugins | ✅ Available |
| `@cobuilders/hardhat-arb-node` | Run local Arbitrum node | ✅ Available |
| `@cobuilders/hardhat-arb-compile` | Compile Stylus contracts | 🔜 Coming Soon |
| `@cobuilders/hardhat-arb-deploy` | Deploy Stylus contracts | 🔜 Coming Soon |
| `@cobuilders/hardhat-arb-test` | Test against Arbitrum node | 🔜 Coming Soon |

## Quick Example

```typescript
// hardhat.config.ts
import hardhatArbitrumStylus from '@cobuilders/hardhat-arbitrum-stylus';

export default {
  plugins: [hardhatArbitrumStylus],
};
```

```bash
# Start local Arbitrum node
npx hardhat arb:node start
```

## Get Started

<div class="grid cards" markdown>

- :material-rocket-launch: **[Quick Start](getting-started/quick-start.md)**
  
    Get up and running in 5 minutes

- :material-book-open-variant: **[Installation](getting-started/installation.md)**
  
    Detailed installation instructions

- :material-puzzle: **[Plugins](plugins/index.md)**
  
    Explore available plugins

- :material-cog: **[Configuration](configuration/index.md)**
  
    Configure the plugin suite

</div>

## For Contributors

Interested in contributing or understanding how the plugin works?

- [Architecture Overview](architecture/index.md) — How the plugin is built
- [Contributing Guide](contributing/index.md) — How to contribute
