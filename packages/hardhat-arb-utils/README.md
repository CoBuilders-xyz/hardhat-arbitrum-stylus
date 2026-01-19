# @cobuilders/hardhat-arb-utils

Internal shared utilities for the hardhat-arbitrum-stylus plugin suite.

## Features

- **Container Manager**: Generic Docker container lifecycle management
- **Docker Client**: Low-level Docker CLI wrapper

## Usage

```ts
import { ContainerManager } from "@cobuilders/hardhat-arb-utils/container";

const manager = new ContainerManager();

const container = await manager.start({
  image: "some-image",
  tag: "v1.0.0",
  ports: [{ host: 8080, container: 80 }],
});

await manager.stop(container.id);
```
