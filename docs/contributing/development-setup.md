# Development Setup

<!-- 
=============================================================================
CONTENT DESCRIPTION FOR DOCUMENTATION AGENT
=============================================================================

This page covers setting up a local development environment for contributing.

WHAT TO WRITE:
- Cloning the repository
- Installing dependencies
- Building the project
- Running tests locally
- IDE setup for contributors
- Common development tasks

SECTIONS TO INCLUDE:

1. Prerequisites
   - Node.js v22+
   - pnpm
   - Docker (for integration tests)
   - Git

2. Getting Started
   - Clone the repo
   - Install dependencies
   - Build all packages

3. Common Commands
   - Build, test, lint, format
   - Package-specific commands

4. IDE Setup
   - VS Code recommended extensions
   - TypeScript configuration

5. Development Workflow
   - Making changes
   - Testing locally
   - Submitting PRs

=============================================================================
-->

Set up your local development environment for contributing.

## Prerequisites

Before you begin, ensure you have:

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | v22+ | Runtime |
| pnpm | v8+ | Package manager |
| Docker | Latest | Integration tests |
| Git | Latest | Version control |

### Install pnpm

```bash
npm install -g pnpm
```

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus.git
cd hardhat-arbitrum-stylus
```

### Install Dependencies

```bash
pnpm install
```

This installs dependencies for all packages in the workspace.

### Build All Packages

```bash
pnpm build
```

Packages are built in dependency order.

## Common Commands

### Workspace Commands

Run from the repository root:

```bash
# Build all packages
pnpm build

# Run all tests
pnpm test

# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Check formatting
pnpm format

# Fix formatting
pnpm format:fix

# Clean build artifacts
pnpm clean
```

### Package-Specific Commands

```bash
# Work in a specific package
cd packages/hardhat-arb-node

# Build this package
pnpm build

# Run tests for this package
pnpm test

# Lint this package
pnpm lint
```

## Project Structure

```
hardhat-arbitrum-stylus/
├── packages/
│   ├── config/                    # Shared configuration
│   ├── hardhat-arb-compile/       # Compile plugin
│   ├── hardhat-arb-deploy/        # Deploy plugin
│   ├── hardhat-arb-node/          # Node plugin
│   ├── hardhat-arb-test/          # Test plugin
│   ├── hardhat-arb-utils/         # Shared utilities
│   └── hardhat-arbitrum-stylus/   # Toolbox plugin
├── docs/                          # Documentation
└── .changeset/                    # Version management
```

## IDE Setup

### VS Code (Recommended)

#### Recommended Extensions

- **ESLint** — Linting integration
- **Prettier** — Code formatting
- **TypeScript and JavaScript Language Features** (built-in)

#### Workspace Settings

The repository includes `.vscode/settings.json` with recommended settings.

### TypeScript Configuration

Each package has its own `tsconfig.json` that extends the shared base:

```json
{
  "extends": "@cobuilders/config/tsconfig.base.json"
}
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout main
git pull
git checkout -b feature/my-feature
```

### 2. Make Changes

Edit code in `packages/*/src/`.

### 3. Build and Test

```bash
# Build your changes
pnpm build

# Run tests
pnpm test

# Check linting and formatting
pnpm lint
pnpm format
```

### 4. Create Changeset

If your change affects published packages:

```bash
pnpm changeset
```

### 5. Commit and Push

```bash
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature
```

### 6. Open PR

Open a pull request to `main` on GitHub.

## Running Integration Tests

Integration tests require Docker:

```bash
# Ensure Docker is running
docker info

# Run all tests (includes integration tests)
pnpm test
```

## Debugging

### Build Issues

```bash
# Clean and rebuild
pnpm clean
pnpm build
```

### Test Issues

```bash
# Run tests with verbose output
cd packages/hardhat-arb-node
pnpm test -- --verbose
```

### Type Errors

```bash
# Check types without emitting
pnpm exec tsc --noEmit
```

## Tips

### Watch Mode

For active development, rebuild on changes:

```bash
cd packages/hardhat-arb-node
pnpm exec tsc --watch
```

### Testing a Single Package

```bash
cd packages/hardhat-arb-node
pnpm test
```

### Linking for Local Testing

Test your changes in a local project:

```bash
# In the plugin repo
cd packages/hardhat-arb-node
pnpm link --global

# In your test project
pnpm link --global @cobuilders/hardhat-arb-node
```
