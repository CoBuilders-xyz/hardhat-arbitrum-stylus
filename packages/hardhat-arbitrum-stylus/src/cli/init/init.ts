import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

import { patchHardhatConfig, writeScaffoldFiles } from '../scaffold/files.js';
import { checkInitPreflightConflicts } from '../scaffold/safety.js';
import { detectPackageManager, installDeps } from '../scaffold/utils.js';

const OUR_DEPS = [
  '@cobuilders/hardhat-arbitrum-stylus',
  '@cobuilders/hardhat-arb-compile',
  '@cobuilders/hardhat-arb-deploy',
  '@cobuilders/hardhat-arb-node',
  '@cobuilders/hardhat-arb-test',
  '@nomicfoundation/hardhat-viem',
  '@nomicfoundation/hardhat-viem-assertions',
  '@nomicfoundation/hardhat-node-test-runner',
  'viem',
] as const;

interface HardhatTemplate {
  packageJson: {
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    type?: string;
  };
  path: string;
  files: string[];
  name: string;
}

interface HardhatInitHelpers {
  getWorkspace: (workspace?: string) => Promise<string>;
  getTemplate: (
    hardhatVersion: 'hardhat-2' | 'hardhat-3',
    template?: string,
  ) => Promise<[HardhatTemplate, Promise<boolean>]>;
  validatePackageJson: (
    workspace: string,
    templatePkg: HardhatTemplate['packageJson'],
    migrateToEsm?: boolean,
  ) => Promise<void>;
  copyProjectFiles: (
    workspace: string,
    template: HardhatTemplate,
    force?: boolean,
  ) => Promise<void>;
  installProjectDependencies: (
    workspace: string,
    template: HardhatTemplate,
    install?: boolean,
    update?: boolean,
  ) => Promise<void>;
}

async function loadHardhatInitHelpers(): Promise<HardhatInitHelpers> {
  const require = createRequire(import.meta.url);

  let hardhatEntry: string;
  try {
    hardhatEntry = require.resolve('hardhat');
  } catch (error) {
    throw new Error(
      'Init requires the "hardhat" package to be installed and resolvable from this CLI runtime.',
      { cause: error },
    );
  }

  const hardhatPackageRoot = path.resolve(path.dirname(hardhatEntry), '../..');
  const initModulePath = path.join(
    hardhatPackageRoot,
    'dist/src/internal/cli/init/init.js',
  );

  if (!existsSync(initModulePath)) {
    throw new Error(
      `Could not find Hardhat internal init module at ${initModulePath}. Hardhat internals may have changed.`,
    );
  }

  let imported: unknown;
  try {
    imported = await import(pathToFileURL(initModulePath).href);
  } catch (error) {
    throw new Error(
      'Failed to import Hardhat internal init helpers. Hardhat internals may have changed.',
      { cause: error },
    );
  }

  const requiredExports = [
    'getWorkspace',
    'getTemplate',
    'validatePackageJson',
    'copyProjectFiles',
    'installProjectDependencies',
  ] as const;

  if (typeof imported !== 'object' || imported === null) {
    throw new Error('Unexpected Hardhat internal init module shape.');
  }

  for (const exportName of requiredExports) {
    if (
      !(exportName in imported) ||
      typeof (imported as Record<string, unknown>)[exportName] !== 'function'
    ) {
      throw new Error(
        `Hardhat internal init helper "${exportName}" was not found. Hardhat internals may have changed.`,
      );
    }
  }

  return imported as HardhatInitHelpers;
}

function removeTemplateDefaults(targetDir: string): void {
  for (const rel of ['ignition', 'contracts', 'test', 'scripts'] as const) {
    const fullPath = path.join(targetDir, rel);
    if (existsSync(fullPath)) {
      rmSync(fullPath, { recursive: true, force: true });
      console.log(`  removed ${rel}/`);
    }
  }
}

export async function init(targetDir: string): Promise<void> {
  console.log('\nInitializing Hardhat Arbitrum Stylus project...\n');

  checkInitPreflightConflicts(targetDir);

  console.log('Scaffolding Hardhat 3 + viem template...\n');
  const hardhat = await loadHardhatInitHelpers();

  let analyticsPromise: Promise<boolean> | undefined;

  try {
    const workspace = await hardhat.getWorkspace(targetDir);
    const [template, projectTypeAnalyticsPromise] = await hardhat.getTemplate(
      'hardhat-3',
      'node-test-runner-viem',
    );

    analyticsPromise = projectTypeAnalyticsPromise;

    await hardhat.validatePackageJson(workspace, template.packageJson, true);
    await hardhat.copyProjectFiles(workspace, template, false);
    await Promise.all([
      hardhat.installProjectDependencies(workspace, template, true),
      analyticsPromise,
    ]);
  } catch (error) {
    throw new Error(
      'Failed while scaffolding the Hardhat template using Hardhat internals.',
      { cause: error },
    );
  }

  console.log("\nRemoving default Hardhat template files we don't use...\n");
  removeTemplateDefaults(targetDir);

  console.log('\nPatching hardhat.config.ts with Stylus plugin/config...\n');
  patchHardhatConfig(targetDir);

  const pm = detectPackageManager(targetDir);
  console.log('\nInstalling Arbitrum Stylus dependencies...');
  installDeps(targetDir, [...OUR_DEPS], pm);

  console.log('\nScaffolding Stylus contracts/tests...\n');
  writeScaffoldFiles(targetDir);

  console.log('\nDone! Your Hardhat + Arbitrum Stylus project is ready.');
  console.log('Try running:\n');
  console.log('  npx hardhat arb:node start');
  console.log('  npx hardhat test\n');
}
