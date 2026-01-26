# Troubleshooting

<!-- 
=============================================================================
CONTENT DESCRIPTION FOR DOCUMENTATION AGENT
=============================================================================

This guide covers common issues and their solutions.

WHAT TO WRITE:
- Common error messages and solutions
- Docker-related issues
- Network connectivity issues
- Installation issues
- Compilation issues
- Deployment issues

SECTIONS TO INCLUDE:

1. Installation Issues
   - Node.js version problems
   - Package installation failures
   - TypeScript configuration

2. Docker Issues
   - Docker not running
   - Permission denied
   - Port conflicts
   - Container already exists
   - Image pull failures

3. Node Plugin Issues
   - Node won't start
   - Port already in use
   - Container name conflict
   - Node not responding

4. Network Issues
   - Can't connect to RPC
   - Chain ID mismatch
   - Transaction failures

5. Stylus-Specific Issues
   - cargo-stylus problems
   - WASM compilation failures
   - Contract activation issues

REFERENCE MATERIALS:
- Error messages from source code
- Docker troubleshooting guides
- Arbitrum/Stylus troubleshooting

ERROR MESSAGES FROM SOURCE:
- "Docker is not available. Please ensure Docker is installed and running."
- "HTTP port ${port} is already in use"
- "WebSocket port ${port} is already in use"
- "Failed to deploy CREATE2 factory"
- "Failed to deploy StylusDeployer"

=============================================================================
-->

Solutions to common issues with Hardhat Arbitrum Stylus.

## Quick Diagnostics

Run these checks first:

```bash
# Check Node.js version (needs v22+)
node --version

# Check Docker is running
docker --version
docker info

# Check node status
npx hardhat arb:node status
```

## Installation Issues

### Node.js Version Too Low

**Error:**
```
This version of Hardhat requires Node.js 22 or later
```

**Solution:**
```bash
# Using nvm
nvm install 22
nvm use 22

# Verify
node --version  # Should be v22.x.x+
```

### Package Installation Fails

**Error:**
```
npm ERR! peer dep missing
```

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Docker Issues

### Docker Not Running

**Error:**
```
Docker is not available. Please ensure Docker is installed and running.
```

**Solution:**

=== "Linux"
    ```bash
    sudo systemctl start docker
    ```

=== "macOS"
    ```bash
    # Start Docker Desktop from Applications
    open -a Docker
    ```

=== "Windows"
    ```
    Start Docker Desktop from the Start menu
    ```

### Permission Denied (Linux)

**Error:**
```
permission denied while trying to connect to the Docker daemon socket
```

**Solution:**
```bash
# Add your user to the docker group
sudo usermod -aG docker $USER

# Log out and back in, or run:
newgrp docker
```

### Port Already in Use

**Error:**
```
Error: HTTP port 8547 is already in use
```

**Solution:**

Option 1: Stop the process using the port
```bash
# Find what's using the port
lsof -i :8547

# Kill it
kill <PID>
```

Option 2: Use a different port
```bash
npx hardhat arb:node start --http-port 9545 --ws-port 9546
```

### Container Name Conflict

**Error:**
```
Node nitro-devnode is already running
```

**Solution:**
```bash
# Stop the existing container
npx hardhat arb:node stop

# Or use a different name
npx hardhat arb:node start --name my-other-node
```

### Image Pull Failure

**Error:**
```
Failed to pull image offchainlabs/nitro-node
```

**Solution:**
```bash
# Check internet connection
ping docker.io

# Try pulling manually
docker pull offchainlabs/nitro-node:v3.7.1-926f1ab

# Check Docker Hub status if issues persist
```

## Node Issues

### Node Won't Start

**Symptoms:** Command hangs or times out

**Diagnostics:**
```bash
# Check Docker logs
docker logs nitro-devnode

# Check container status
docker ps -a | grep nitro
```

**Common causes:**

1. **Insufficient memory:** Docker needs ~4GB
2. **Port conflict:** Check ports 8547, 8548
3. **Previous container:** Remove with `docker rm nitro-devnode`

### Node Not Responding

**Error:**
```
fetch failed
```

**Solution:**
```bash
# Check if container is running
docker ps | grep nitro-devnode

# Check container health
npx hardhat arb:node status

# Restart if needed
npx hardhat arb:node stop
npx hardhat arb:node start
```

### Wrong Chain ID

**Symptoms:** Transactions fail with chain ID mismatch

**Solution:**

The local node uses chain ID `412346`. Update your client:

```typescript
// Correct chain ID
const chainId = 412346;
```

## Stylus Issues

### cargo-stylus Not Found

**Error:**
```
cargo-stylus: command not found
```

**Solution:**
```bash
cargo install cargo-stylus
```

### WASM Target Missing

**Error:**
```
can't find crate for `core`
```

**Solution:**
```bash
rustup target add wasm32-unknown-unknown
```

### Contract Check Fails

**Error:**
```
cargo stylus check failed
```

**Diagnostics:**
```bash
# Ensure node is running with Stylus support
npx hardhat arb:node start --stylus-ready

# Check with verbose output
cargo stylus check --endpoint http://localhost:8547 -v
```

### StylusDeployer Not Found

**Symptoms:** Deployment fails because StylusDeployer isn't deployed

**Solution:**

Restart node with `--stylus-ready`:
```bash
npx hardhat arb:node stop
npx hardhat arb:node start --stylus-ready
```

## Getting Help

If you can't resolve an issue:

1. Check [GitHub Issues](https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus/issues)
2. Search for similar problems
3. Open a new issue with:
   - Error message
   - Steps to reproduce
   - Environment info (OS, Node version, Docker version)
