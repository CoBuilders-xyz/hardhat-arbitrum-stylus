# Troubleshooting

Solutions to common issues.

## Quick Checks

```bash
node --version      # Need v22+
docker info         # Docker running?
npx hardhat arb:node status  # Node running?
```

## Docker Issues

### Docker Not Running

```
Docker is not available. Please ensure Docker is installed and running.
```

**Fix:** Start Docker Desktop or `sudo systemctl start docker`

### Permission Denied (Linux)

```
permission denied while trying to connect to the Docker daemon
```

**Fix:**
```bash
sudo usermod -aG docker $USER
# Log out and back in
```

## Port Issues

### Port Already in Use

```
Error: HTTP port 8547 is already in use
```

**Fix:** Use different port or stop existing process:

```bash
# Option 1: Different port
npx hardhat arb:node start --http-port 9545

# Option 2: Find and stop process
lsof -i :8547
kill <PID>
```

### Node Already Running

```
Node nitro-devnode is already running
```

**Fix:**
```bash
npx hardhat arb:node stop
# Or use different name
npx hardhat arb:node start --name my-node-2
```

### Random Port Conflicts (Auto-Start)

The auto-start feature uses random ports (10000-60000). In rare cases, the selected port may be in use.

**Symptoms:**

- Tests fail to connect
- "Connection refused" errors during auto-start

**Fix:** Simply re-run the command. A new random port will be selected:

```bash
npx hardhat test  # Try again
```

If the issue persists, check for processes using ports in the 10000-60000 range:

```bash
# Find processes on high ports
ss -tlnp | grep -E ':(1[0-9]{4}|[2-5][0-9]{4}|60000)'
```

## Temp Container Issues

### Orphaned Temp Containers

If a test process is killed abruptly (e.g., `kill -9`), temporary containers may not be cleaned up.

**Symptoms:**

- Multiple `nitro-devnode-tmp-*` containers running
- Docker resources accumulating

**Fix:** Remove orphaned temp containers:

```bash
# List temp containers
docker ps -a | grep nitro-devnode-tmp

# Remove all temp containers
docker rm -f $(docker ps -aq --filter "name=nitro-devnode-tmp")
```

### Container Not Cleaned Up After Tests

Normally, temp containers are cleaned up automatically. If they persist:

**Fix:**

```bash
# Check running containers
docker ps | grep nitro-devnode

# Stop and remove specific container
docker stop <container_id>
docker rm <container_id>
```

## Stylus Issues

### cargo-stylus Not Found

```
cargo-stylus: command not found
```

**Fix:**
```bash
cargo install cargo-stylus
```

### WASM Target Missing

```
can't find crate for `core`
```

**Fix:**
```bash
rustup target add wasm32-unknown-unknown
```

### Check Fails

```
cargo stylus check failed
```

**Fix:** Ensure node is running with Stylus support:

```bash
npx hardhat arb:node stop
npx hardhat arb:node start --stylus-ready
```

### Stylus Deploy Fails

```
program not activated
```

**Fix:** The node wasn't started with `--stylus-ready`:

```bash
npx hardhat arb:node stop
npx hardhat arb:node start --stylus-ready
# Redeploy your contract
```

## Node Issues

### Node Not Responding

**Fix:**
```bash
npx hardhat arb:node status
# If not running:
npx hardhat arb:node start
# If stuck:
npx hardhat arb:node stop
docker rm -f nitro-devnode
npx hardhat arb:node start
```

### Node Starts But RPC Fails

```
Error: Could not connect to RPC endpoint
```

**Fix:** Wait for the node to be fully ready:

```bash
# Check logs for "Listening for transactions"
npx hardhat arb:node logs --tail 20
```

The node may take 10-30 seconds to be ready after starting.

## Hardhat Issues

### Plugin Not Found

```
Cannot find module '@cobuilders/hardhat-arbitrum-stylus'
```

**Fix:**
```bash
npm install @cobuilders/hardhat-arbitrum-stylus
```

### Hardhat 2 Compatibility

```
plugins is not a valid configuration key
```

**Fix:** This plugin requires **Hardhat 3**. Upgrade Hardhat:

```bash
npm install hardhat@latest
```

## Getting Help

1. Check [GitHub Issues](https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus/issues)
2. Open a new issue with:
   - Error message
   - Steps to reproduce
   - Environment (OS, Node version, Docker version)
   - Output of `docker ps -a | grep nitro`
