# Hardhat Arbitrum Stylus

<!-- 
CONTENT DESCRIPTION:
Landing page. Brief intro, what's included, quick links.
-->

**Hardhat Arbitrum Stylus** brings Hardhat's developer experience to Arbitrum Stylus development.

!!! tip "Beta Status"
    Some features are coming soon. See [Plugins](plugins/index.md) for current status.

## What's Included

| Plugin | Description | Status |
|--------|-------------|--------|
| `@cobuilders/hardhat-arb-node` | Run local Arbitrum node | ✅ Available |
| `@cobuilders/hardhat-arb-compile` | Compile Stylus contracts | 🔜 Coming Soon |
| `@cobuilders/hardhat-arb-deploy` | Deploy contracts | 🔜 Coming Soon |
| `@cobuilders/hardhat-arb-test` | Test runner | 🔜 Coming Soon |

## Quick Start

```bash
npm install @cobuilders/hardhat-arbitrum-stylus
```

```typescript
// hardhat.config.ts
import hardhatArbitrumStylus from '@cobuilders/hardhat-arbitrum-stylus';

export default {
  plugins: [hardhatArbitrumStylus],
};
```

```bash
npx hardhat arb:node start
```

→ [Full Getting Started Guide](getting-started.md)

## Documentation

**For Users:**

- [Getting Started](getting-started.md) — Installation and setup
- [Plugins](plugins/index.md) — Plugin reference
- [Configuration](configuration.md) — All configuration options
- [Guides](guides/local-development.md) — Development workflows
- [Tutorial](tutorial.md) — Build your first Stylus contract

**For Contributors:**

- [Architecture](contributors/architecture.md) — How the plugin is built
- [Development](contributors/development.md) — Contributing guide
- [Versioning](contributors/versioning.md) — Releases and changesets
