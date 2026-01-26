# Plugins Overview

<!-- 
=============================================================================
CONTENT DESCRIPTION FOR DOCUMENTATION AGENT
=============================================================================

This is the overview page for the Plugins section, listing all available plugins.

WHAT TO WRITE:
- Overview of the plugin architecture (toolbox + individual plugins)
- When to use the toolbox vs individual plugins
- Brief description of each plugin with status
- Navigation to individual plugin documentation
- Version compatibility information

SECTIONS TO INCLUDE:

1. Plugin Architecture
   - Explain the toolbox approach (one install, all plugins)
   - Explain individual packages for selective installation
   - How plugins work with Hardhat 3

2. Available Plugins Table
   - Package name, description, status for each
   - Links to individual documentation pages

3. Plugin Status
   - ✅ Available - fully implemented and tested
   - 🔜 Coming Soon - in development
   - Explain what "Coming Soon" means

4. Choosing Your Installation
   - Toolbox: when you want everything
   - Individual: when you need specific features only

REFERENCE MATERIALS:
- Main README.md package table
- Individual package README files
- Package.json files for version info

=============================================================================
-->

Hardhat Arbitrum Stylus provides a suite of plugins for Stylus development.

## Plugin Architecture

<!-- 
Explain:
- Main toolbox (@cobuilders/hardhat-arbitrum-stylus) bundles all plugins
- Individual plugins available for selective installation
- Shared utilities in @cobuilders/hardhat-arb-utils (internal)
-->

## Available Plugins

| Plugin | Package | Description | Status |
|--------|---------|-------------|--------|
| [Toolbox](toolbox.md) | `@cobuilders/hardhat-arbitrum-stylus` | All-in-one installation | ✅ Available |
| [Node](node.md) | `@cobuilders/hardhat-arb-node` | Local Arbitrum node management | ✅ Available |
| [Compile](compile.md) | `@cobuilders/hardhat-arb-compile` | Stylus contract compilation | 🔜 Coming Soon |
| [Deploy](deploy.md) | `@cobuilders/hardhat-arb-deploy` | Contract deployment | 🔜 Coming Soon |
| [Test](test.md) | `@cobuilders/hardhat-arb-test` | Test runner integration | 🔜 Coming Soon |

## Status Legend

- **✅ Available** — Fully implemented, tested, and ready for use
- **🔜 Coming Soon** — In active development, API may change

## Toolbox vs Individual Plugins

<!-- 
When to use toolbox:
- Most users
- Want all features
- Single dependency

When to use individual:
- Smaller footprint
- Only need specific features
- Custom plugin composition
-->

### Recommended: Toolbox

```bash
npm install @cobuilders/hardhat-arbitrum-stylus
```

### Alternative: Individual Plugins

```bash
npm install @cobuilders/hardhat-arb-node
```

## Hardhat 3 Plugin System

<!-- 
Brief explanation of how plugins work in Hardhat 3:
- Plugin registration in config
- Hook handlers
- Task registration
-->

All plugins use the new Hardhat 3 plugin system:

```typescript
import hardhatArbitrumStylus from '@cobuilders/hardhat-arbitrum-stylus';

export default {
  plugins: [hardhatArbitrumStylus],
};
```
