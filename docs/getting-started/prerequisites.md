# Prerequisites

<!-- 
=============================================================================
CONTENT DESCRIPTION FOR DOCUMENTATION AGENT
=============================================================================

This page covers all prerequisites needed for Hardhat Arbitrum Stylus development.

WHAT TO WRITE:
- Detailed requirements for each tool
- Installation instructions for each platform (Linux, macOS, Windows)
- Version requirements and recommendations
- Verification commands to check installations
- Common installation issues and solutions

TOOLS TO COVER:

1. Node.js (v22+)
   - Why v22 is required (Hardhat 3 requirement)
   - Installation via nvm, official installer
   - Verification: node --version

2. Docker
   - Why Docker is needed (nitro-devnode runs in container)
   - Installation for each platform
   - Post-installation setup (Docker group on Linux)
   - Verification: docker --version, docker run hello-world

3. Rust Toolchain (for Stylus contracts)
   - Installation via rustup
   - Adding wasm32 target
   - Stylus SDK installation (cargo stylus)
   - Verification commands

4. Package Manager
   - pnpm (recommended), npm, or yarn
   - Installation instructions

PLATFORM-SPECIFIC SECTIONS:
- Linux (Ubuntu/Debian, Fedora)
- macOS (Homebrew-based)
- Windows (WSL2 recommended)

REFERENCE MATERIALS:
- Node.js official docs
- Docker official docs
- Rust/rustup docs
- Arbitrum Stylus SDK docs
- nitro-devnode documentation

=============================================================================
-->

This page covers the tools you need to install before using Hardhat Arbitrum Stylus.

## Node.js

<!-- 
Explain:
- Version requirement: v22+
- Why: Hardhat 3 requires Node.js v22
- Installation methods (nvm recommended)
- Platform-specific instructions
-->

### Requirements

- Node.js **v22 or later**

### Installation

=== "Using nvm (Recommended)"

    ```bash
    # Install nvm
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    
    # Install Node.js 22
    nvm install 22
    nvm use 22
    ```

=== "Official Installer"

    <!-- Link to nodejs.org downloads -->

### Verification

```bash
node --version
# Should output v22.x.x or higher
```

## Docker

<!-- 
Explain:
- Why Docker is required (nitro-devnode runs as container)
- Installation for each platform
- Linux post-install steps (docker group)
- Memory/resource recommendations
-->

### Requirements

- Docker Engine or Docker Desktop
- At least 4GB RAM allocated to Docker

### Installation

=== "Linux"

    ```bash
    # Ubuntu/Debian
    # Add instructions for installing Docker Engine
    ```

=== "macOS"

    ```bash
    # Using Homebrew
    brew install --cask docker
    ```

=== "Windows"

    <!-- Recommend WSL2 + Docker Desktop -->

### Verification

```bash
docker --version
docker run hello-world
```

## Rust Toolchain

<!-- 
Explain:
- Required for compiling Stylus contracts
- Installation via rustup
- Adding wasm32-unknown-unknown target
- Installing cargo-stylus
-->

!!! note "Only Required for Stylus Contracts"
    If you're only deploying Solidity contracts to Arbitrum, you don't need Rust.

### Installation

```bash
# Install Rust via rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add WASM target
rustup target add wasm32-unknown-unknown

# Install cargo-stylus (Stylus CLI)
cargo install cargo-stylus
```

### Verification

```bash
rustc --version
cargo stylus --version
```

## Package Manager

<!-- 
Explain pnpm (recommended), npm, yarn options
-->

We recommend **pnpm** for its speed and disk efficiency.

```bash
# Install pnpm
npm install -g pnpm

# Verify
pnpm --version
```

## Verification Checklist

Run these commands to verify your setup:

```bash
node --version      # v22.x.x+
docker --version    # Docker version 24.x.x+
rustc --version     # rustc 1.x.x
cargo stylus --version
pnpm --version      # 8.x.x+
```

## Troubleshooting

<!-- 
Common issues:
- Docker permission denied (Linux)
- Node version mismatch
- Rust target not found
- cargo-stylus installation fails
-->

### Docker Permission Denied (Linux)

<!-- Add user to docker group instructions -->

### Node.js Version Issues

<!-- nvm use, .nvmrc file tips -->
