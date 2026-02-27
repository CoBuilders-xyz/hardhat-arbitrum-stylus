#!/usr/bin/env node

import { parseArgs } from 'node:util';

import { init } from './init/init.js';

const { values } = parseArgs({
  options: {
    init: { type: 'boolean', default: false },
  },
  strict: true,
});

const targetDir = process.cwd();

if (values.init) {
  await init(targetDir);
} else {
  console.log(`Usage: hardhat-arbitrum-stylus <option>

Options:
  --init   Initialize a Hardhat 3 + viem project and scaffold Arbitrum Stylus files`);
  process.exit(0);
}
