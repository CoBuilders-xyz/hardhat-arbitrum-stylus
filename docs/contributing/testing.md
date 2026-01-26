# Testing

<!-- 
=============================================================================
CONTENT DESCRIPTION FOR DOCUMENTATION AGENT
=============================================================================

This page covers running and writing tests for the plugin.

WHAT TO WRITE:
- Running existing tests
- Test structure
- Writing new tests
- Fixture projects
- Integration tests with Docker
- Test patterns used

SECTIONS TO INCLUDE:

1. Running Tests
   - All tests
   - Single package
   - Specific test file

2. Test Structure
   - Where tests live
   - Fixture projects
   - Test utilities

3. Writing Tests
   - Test file naming
   - Using fixture projects
   - Mocking patterns

4. Integration Tests
   - Docker requirements
   - Testing with real containers

5. Test Patterns
   - Common assertions
   - Setup and teardown

REFERENCE MATERIALS:
- packages/hardhat-arb-node/test/*.ts
- packages/hardhat-arb-utils/test/*.ts
- Testing utilities in hardhat-arb-utils

=============================================================================
-->

Guide to running and writing tests for the plugin suite.

## Running Tests

### All Tests

```bash
# From repository root
pnpm test
```

### Single Package

```bash
cd packages/hardhat-arb-node
pnpm test
```

### Specific Test File

```bash
cd packages/hardhat-arb-node
pnpm test -- --test-name-pattern "start"
```

## Test Structure

### Directory Layout

```
packages/hardhat-arb-node/
├── src/                      # Source code
├── test/
│   ├── fixture-projects/     # Test fixtures
│   │   ├── node-plugin/
│   │   │   ├── hardhat.config.ts
│   │   │   └── package.json
│   │   └── node-plugin-custom-config/
│   │       └── ...
│   ├── index.ts              # Test setup
│   ├── start.ts              # Start task tests
│   └── network-hook.ts       # Hook tests
└── tsconfig.json
```

### Fixture Projects

Fixture projects are minimal Hardhat projects used for testing:

```typescript
// test/fixture-projects/node-plugin/hardhat.config.ts
import hardhatArbNode from '@cobuilders/hardhat-arb-node';

export default {
  plugins: [hardhatArbNode],
};
```

## Writing Tests

### Test File Naming

- Unit tests: `*.test.ts`
- Integration tests: `*.integration.ts`

### Using Fixture Projects

```typescript
import { useFixtureProject } from '@cobuilders/hardhat-arb-utils/testing';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

describe('MyPlugin', () => {
  useFixtureProject('node-plugin');

  it('should load plugin', async () => {
    const hre = await import('hardhat');
    assert.ok(hre.config.arbNode);
  });
});
```

### Test Example

```typescript
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { useFixtureProject } from '@cobuilders/hardhat-arb-utils/testing';

describe('arb:node start', () => {
  useFixtureProject('node-plugin');

  let hre: typeof import('hardhat');

  beforeEach(async () => {
    // Fresh import for each test
    hre = await import('hardhat');
  });

  afterEach(async () => {
    // Cleanup
    try {
      await hre.run(['arb:node', 'stop'], { quiet: true });
    } catch {
      // Ignore if not running
    }
  });

  it('should start the node', async () => {
    // Test implementation
  });

  it('should fail if port is in use', async () => {
    // Test error case
  });
});
```

## Integration Tests

Integration tests require Docker to be running.

### Docker Requirement

```typescript
import { DockerClient } from '@cobuilders/hardhat-arb-utils';

describe('Integration', () => {
  let docker: DockerClient;

  beforeEach(async () => {
    docker = new DockerClient();
    const available = await docker.isAvailable();
    if (!available) {
      throw new Error('Docker is required for integration tests');
    }
  });

  it('should start container', async () => {
    // Test with real Docker
  });
});
```

### Cleanup

Always clean up containers:

```typescript
afterEach(async () => {
  try {
    await docker.stop('test-container');
    await docker.remove('test-container', true);
  } catch {
    // Container may not exist
  }
});
```

## Test Patterns

### Async Assertions

```typescript
it('should reject when port is in use', async () => {
  await assert.rejects(
    () => hre.run(['arb:node', 'start'], { httpPort: usedPort }),
    /port.*already in use/i
  );
});
```

### Testing Configuration

```typescript
it('should use custom config', async () => {
  useFixtureProject('node-plugin-custom-config');
  
  const hre = await import('hardhat');
  
  assert.strictEqual(hre.config.arbNode.httpPort, 9999);
});
```

### Mocking

For unit tests, you can inject mock dependencies:

```typescript
import { ContainerManager } from '@cobuilders/hardhat-arb-utils';

class MockDockerClient {
  async isAvailable() { return true; }
  async run() { return 'mock-id'; }
  // ...
}

it('should work without Docker', async () => {
  const manager = new ContainerManager(new MockDockerClient());
  // Test with mock
});
```

## Test Utilities

### useFixtureProject

Changes `process.cwd()` to the fixture project:

```typescript
import { useFixtureProject } from '@cobuilders/hardhat-arb-utils/testing';

describe('Tests', () => {
  useFixtureProject('my-fixture');
  
  // All tests run in the fixture directory
});
```

## CI Testing

Tests run in CI on every PR:

```yaml
# .github/workflows/ci.yml
- name: Run tests
  run: pnpm test
```

Docker is available in CI for integration tests.

## Best Practices

1. **Clean up resources** — Always stop containers in `afterEach`
2. **Isolate tests** — Each test should be independent
3. **Use fixtures** — Don't pollute the main codebase
4. **Test errors** — Verify error cases, not just happy paths
5. **Be deterministic** — Avoid timing-dependent tests
