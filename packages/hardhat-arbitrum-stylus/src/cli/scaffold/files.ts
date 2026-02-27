import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  SOLIDITY_COUNTER_SOL,
  STYLUS_COUNTER_LIB_RS,
  STYLUS_COUNTER_MAIN_RS,
  STYLUS_COUNTER_CARGO_TOML,
  STYLUS_COUNTER_STYLUS_TOML,
  STYLUS_COUNTER_RUST_TOOLCHAIN_TOML,
  CROSS_VM_TEST_TS,
} from './templates.js';

interface FileEntry {
  relativePath: string;
  content: string;
}

const SCAFFOLD_FILES: FileEntry[] = [
  {
    relativePath: 'contracts/SolidityCounter.sol',
    content: SOLIDITY_COUNTER_SOL,
  },
  {
    relativePath: 'contracts/stylus-counter/src/lib.rs',
    content: STYLUS_COUNTER_LIB_RS,
  },
  {
    relativePath: 'contracts/stylus-counter/src/main.rs',
    content: STYLUS_COUNTER_MAIN_RS,
  },
  {
    relativePath: 'contracts/stylus-counter/Cargo.toml',
    content: STYLUS_COUNTER_CARGO_TOML,
  },
  {
    relativePath: 'contracts/stylus-counter/Stylus.toml',
    content: STYLUS_COUNTER_STYLUS_TOML,
  },
  {
    relativePath: 'contracts/stylus-counter/rust-toolchain.toml',
    content: STYLUS_COUNTER_RUST_TOOLCHAIN_TOML,
  },
  { relativePath: 'test/cross-vm.test.ts', content: CROSS_VM_TEST_TS },
];

export function writeScaffoldFiles(targetDir: string): void {
  for (const { relativePath, content } of SCAFFOLD_FILES) {
    const fullPath = path.join(targetDir, relativePath);
    mkdirSync(path.dirname(fullPath), { recursive: true });
    writeFileSync(fullPath, content, 'utf-8');
    console.log(`  created ${relativePath}`);
  }
}

export function patchHardhatConfig(targetDir: string): void {
  const fullPath = path.join(targetDir, 'hardhat.config.ts');
  let content = readFileSync(fullPath, 'utf-8');

  const importAnchor =
    'import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";';
  const pluginImport =
    'import hardhatArbitrumStylusPlugin from "@cobuilders/hardhat-arbitrum-stylus";';
  const pluginsAnchor = 'plugins: [hardhatToolboxViemPlugin],';
  const stylusAnchor = '  networks: {';
  const networksAnchor = '  networks: {\n';

  if (!content.includes(importAnchor) || !content.includes(pluginsAnchor)) {
    throw new Error(
      'Unexpected hardhat.config.ts template shape. Aborting instead of patching an unknown config format.',
    );
  }

  if (
    content.includes('hardhatArbitrumStylusPlugin') ||
    content.includes('arbitrumLocal:')
  ) {
    throw new Error(
      'hardhat.config.ts already appears to include the Stylus plugin or arbitrumLocal network. Aborting to avoid duplicate config.',
    );
  }

  content = content.replace(importAnchor, `${importAnchor}\n${pluginImport}`);
  content = content.replace(
    pluginsAnchor,
    'plugins: [hardhatToolboxViemPlugin, hardhatArbitrumStylusPlugin],',
  );

  if (!content.includes(stylusAnchor) || !content.includes(networksAnchor)) {
    throw new Error(
      'Unexpected hardhat.config.ts networks block shape. Aborting instead of patching an unknown config format.',
    );
  }

  const stylusBlock = `  // Arbitrum Stylus plugin configuration (all values shown are defaults)
  stylus: {
    node: {
      image: "offchainlabs/nitro-node",
      tag: "v3.7.1-926f1ab",
      httpPort: 8547,
      wsPort: 8548,
      chainId: 412346,
    },
    compile: {
      useHostToolchain: false,
    },
    deploy: {
      useHostToolchain: false,
    },
  },
`;

  const arbitrumLocalNetwork = `  networks: {
    arbitrumLocal: {
      url: "http://localhost:8547",
      type: "http",
      accounts: [
        "0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659",
      ],
    },
`;

  content = content.replace(stylusAnchor, `${stylusBlock}${stylusAnchor}`);
  content = content.replace(networksAnchor, arbitrumLocalNetwork);

  writeFileSync(fullPath, content, 'utf-8');
  console.log('  patched hardhat.config.ts');
}

export function writeFile(
  targetDir: string,
  relativePath: string,
  content: string,
): void {
  const fullPath = path.join(targetDir, relativePath);
  mkdirSync(path.dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, content, 'utf-8');
  console.log(`  created ${relativePath}`);
}
