import { existsSync } from 'node:fs';
import { execSync, type SpawnSyncReturns, spawnSync } from 'node:child_process';
import path from 'node:path';

export type PackageManager = 'pnpm' | 'yarn' | 'npm';

export function detectPackageManager(targetDir: string): PackageManager {
  if (existsSync(path.join(targetDir, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(path.join(targetDir, 'yarn.lock'))) return 'yarn';
  return 'npm';
}

export function installDeps(
  targetDir: string,
  packages: string[],
  pm?: PackageManager,
): void {
  const resolved = pm ?? detectPackageManager(targetDir);
  const installCmd =
    resolved === 'yarn'
      ? `yarn add --dev ${packages.join(' ')}`
      : `${resolved} install --save-dev ${packages.join(' ')}`;

  console.log(`\nInstalling dependencies with ${resolved}...\n`);
  execSync(installCmd, { cwd: targetDir, stdio: 'inherit' });
}

export function runPackageInstall(
  targetDir: string,
  pm?: PackageManager,
): void {
  const resolved = pm ?? detectPackageManager(targetDir);
  console.log(`\nInstalling dependencies with ${resolved}...\n`);
  execSync(`${resolved} install`, { cwd: targetDir, stdio: 'inherit' });
}

export function spawnInteractive(
  command: string,
  args: string[],
  cwd: string,
): SpawnSyncReturns<Buffer> {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: true,
  });

  if (result.status !== 0) {
    console.error(
      `\nCommand "${command} ${args.join(' ')}" exited with code ${String(result.status)}`,
    );
    process.exit(result.status ?? 1);
  }

  return result;
}
