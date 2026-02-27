export const HARDHAT_CONFIG_TS = `\
import type { HardhatUserConfig } from 'hardhat/types/config';

import hardhatArbitrumStylusPlugin from '@cobuilders/hardhat-arbitrum-stylus';
import HardhatViem from '@nomicfoundation/hardhat-viem';
import HardhatViemAssertions from '@nomicfoundation/hardhat-viem-assertions';
import HardhatNodeTestRunner from '@nomicfoundation/hardhat-node-test-runner';

const config: HardhatUserConfig = {
  plugins: [
    hardhatArbitrumStylusPlugin,
    HardhatViem,
    HardhatViemAssertions,
    HardhatNodeTestRunner,
  ],
  solidity: '0.8.24',

  // Arbitrum Stylus plugin configuration (all values shown are defaults)
  stylus: {
    node: {
      image: 'offchainlabs/nitro-node',
      tag: 'v3.7.1-926f1ab',
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

  networks: {
    arbitrumLocal: {
      url: 'http://localhost:8547',
      type: 'http',
      accounts: [
        '0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659',
      ],
    },
  },
};

export default config;
`;

export const SOLIDITY_COUNTER_SOL = `\
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SolidityCounter {
    uint256 private _count;

    event CountChanged(uint256 newCount);

    function count() public view returns (uint256) {
        return _count;
    }

    function increment() public {
        _count += 1;
        emit CountChanged(_count);
    }

    function setCount(uint256 newCount) public {
        _count = newCount;
        emit CountChanged(_count);
    }
}
`;

export const STYLUS_COUNTER_LIB_RS = `\
#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
#![cfg_attr(not(any(test, feature = "export-abi")), no_std)]

#[macro_use]
extern crate alloc;

use alloc::vec::Vec;
use stylus_sdk::{alloy_primitives::U256, prelude::*};

sol_storage! {
    #[entrypoint]
    pub struct Counter {
        uint256 count;
    }
}

#[public]
impl Counter {
    pub fn count(&self) -> U256 {
        self.count.get()
    }

    pub fn increment(&mut self) {
        let count = self.count.get();
        self.count.set(count + U256::from(1));
    }
}
`;

export const STYLUS_COUNTER_MAIN_RS = `\
#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]

#[cfg(not(any(test, feature = "export-abi")))]
#[no_mangle]
pub extern "C" fn main() {}

#[cfg(feature = "export-abi")]
fn main() {
    stylus_counter::print_from_args();
}
`;

export const STYLUS_COUNTER_CARGO_TOML = `\
[package]
name = "stylus-counter"
version = "0.1.0"
edition = "2021"
license = "MIT OR Apache-2.0"

[dependencies]
alloy-primitives = "=0.8.20"
alloy-sol-types = "=0.8.20"
stylus-sdk = "=0.9.0"
hex = { version = "0.4", default-features = false }

[features]
default = ["mini-alloc"]
export-abi = ["stylus-sdk/export-abi"]
mini-alloc = ["stylus-sdk/mini-alloc"]

[[bin]]
name = "stylus-counter"
path = "src/main.rs"

[lib]
crate-type = ["lib", "cdylib"]

[profile.release]
codegen-units = 1
strip = true
lto = true
panic = "abort"
opt-level = 3
`;

export const STYLUS_COUNTER_STYLUS_TOML = `\
[workspace]

[workspace.networks]

[contract]
`;

export const STYLUS_COUNTER_RUST_TOOLCHAIN_TOML = `\
[toolchain]
channel = "1.93.0"
`;

export const CROSS_VM_TEST_TS = `\
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';

describe('Cross-VM: Solidity + Stylus', async function () {
  const { stylusViem } = await network.connect();

  it('deploys both VMs and interacts on the same chain', async function () {
    const solCounter = await stylusViem.deployContract('SolidityCounter');
    const stylusCounter = await stylusViem.deployContract('stylus-counter');

    assert.equal(await solCounter.read.count(), 0n);
    assert.equal(await stylusCounter.read.count(), 0n);

    await solCounter.write.increment();
    await stylusCounter.write.increment();

    assert.equal(await solCounter.read.count(), 1n);
    assert.equal(await stylusCounter.read.count(), 1n);

    await solCounter.write.setCount([100n]);
    assert.equal(await solCounter.read.count(), 100n);

    assert.equal(await stylusCounter.read.count(), 1n);
  });
});
`;

export const TSCONFIG_JSON = `\
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["hardhat.config.ts", "test/**/*.ts"]
}
`;

export const PACKAGE_JSON_TEMPLATE = `\
{
  "name": "my-stylus-project",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "npx hardhat test"
  },
  "devDependencies": {
    "@cobuilders/hardhat-arbitrum-stylus": "latest",
    "@cobuilders/hardhat-arb-compile": "latest",
    "@cobuilders/hardhat-arb-deploy": "latest",
    "@cobuilders/hardhat-arb-node": "latest",
    "@cobuilders/hardhat-arb-test": "latest",
    "@nomicfoundation/hardhat-node-test-runner": "^3.0.0",
    "@nomicfoundation/hardhat-viem": "^3.0.0",
    "@nomicfoundation/hardhat-viem-assertions": "^3.0.5",
    "@types/node": "^22.0.0",
    "hardhat": "^3.0.0",
    "tsx": "^4.19.3",
    "typescript": "^5.7.0",
    "viem": "^2.30.0"
  }
}
`;
