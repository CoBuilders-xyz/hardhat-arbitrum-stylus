# Troubleshooting

<!-- 
CONTENT DESCRIPTION:
Common issues and solutions. Quick reference for problems.
-->

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

## Getting Help

1. Check [GitHub Issues](https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus/issues)
2. Open a new issue with:
   - Error message
   - Steps to reproduce
   - Environment (OS, Node version, Docker version)
