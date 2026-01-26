# Quick Start

<!-- 
=============================================================================
CONTENT DESCRIPTION FOR DOCUMENTATION AGENT
=============================================================================

This page provides a quick walkthrough of using Hardhat Arbitrum Stylus.

WHAT TO WRITE:
- 5-minute getting started experience
- Running the local Arbitrum node
- Basic workflow demonstration
- What to expect at each step
- Clear success criteria

SECTIONS TO INCLUDE:

1. Prerequisites Check
   - Brief reminder of what's needed
   - Link to full prerequisites

2. Start Local Node
   - Running arb:node start
   - Expected output explanation
   - Pre-funded accounts explanation
   - Node startup information

3. Interact with Node
   - Using curl or web3 tools to interact
   - Checking chain ID
   - Basic RPC commands

4. Stop the Node
   - arb:node stop command
   - Cleanup information

5. What's Next
   - Links to tutorials for building contracts
   - Links to configuration for customization
   - Links to plugin reference

IMPORTANT NOTES:
- Focus on the arb:node plugin (which is implemented)
- Mark compile/deploy/test as "Coming Soon"
- Include expected output examples
- Show the 20 pre-funded accounts info

REFERENCE MATERIALS:
- hardhat-arb-node source code (especially start.ts)
- printStartupInfo function output
- HARDHAT_ACCOUNTS defaults
- Default ports: 8547 (HTTP), 8548 (WS)

=============================================================================
-->

Get up and running with Hardhat Arbitrum Stylus in 5 minutes.

## Prerequisites Check

Make sure you have:

- [x] Node.js v22+
- [x] Docker running
- [x] Plugin installed ([Installation Guide](installation.md))

## Start the Local Node

Start a local Arbitrum nitro-devnode:

```bash
npx hardhat arb:node start
```

### Expected Output

<!-- 
Show the startup output including:
- HTTP/WebSocket server addresses
- Pre-funded accounts list
- Chain owner account
- "Listening for transactions..." message
-->

```
Starting Arbitrum nitro-devnode...

Setting up chain ownership...
Setting L1 price per unit to 0...
Prefunding accounts...

Started HTTP Server at http://localhost:8547/
Started WebSocket Server at ws://localhost:8548

Accounts
========

WARNING: Funds sent on live network to accounts with publicly known private keys WILL BE LOST.

Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

... (20 accounts total)

Account #20: 0x3f1Eae7D46d88F08fc2F8ed27FCb2AB183EB2d0E (~800 ETH) - Chain Owner
Private Key: 0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659
             ↳ L2 chain owner with ArbOwner privileges

Listening for transactions...
```

### Pre-funded Accounts

<!-- Explain the accounts:
- 20 Hardhat default accounts with 10 ETH each
- 1 Chain Owner account with ~800 ETH
- These match Hardhat's standard accounts
-->

## Verify the Node

In another terminal, test the node:

```bash
# Check chain ID (should return 412346)
curl -X POST http://localhost:8547 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

Expected response:

```json
{"jsonrpc":"2.0","id":1,"result":"0x64a7a"}
```

## Run in Background

To run the node in the background:

```bash
npx hardhat arb:node start --detach
```

Check status:

```bash
npx hardhat arb:node status
```

View logs:

```bash
npx hardhat arb:node logs --follow
```

## Stop the Node

```bash
npx hardhat arb:node stop
```

## Enable Stylus Support

For deploying Stylus contracts, add the `--stylus-ready` flag:

```bash
npx hardhat arb:node start --stylus-ready
```

This deploys:

- CREATE2 Factory
- Cache Manager
- StylusDeployer contract

## Coming Soon

!!! info "Compile, Deploy, and Test"
    The `arb:compile`, `arb:deploy`, and `arb:test` commands are coming soon.
    
    - `arb:compile` — Compile Stylus contracts
    - `arb:deploy` — Deploy contracts to the node
    - `arb:test` — Run tests against the node

## Next Steps

- [Node Plugin Reference](../plugins/node.md) — All node commands and options
- [Configuration](../configuration/node-config.md) — Customize ports, images, etc.
- [Local Development Guide](../guides/local-development.md) — Full development workflow
