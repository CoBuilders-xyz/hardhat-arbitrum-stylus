import { existsSync } from 'node:fs';
import path from 'node:path';

const INIT_CONFLICT_PATHS = [
  'hardhat.config.ts',
  'package.json',
  'tsconfig.json',
  'contracts',
  'test',
  'scripts',
  'ignition',
  'contracts/stylus-counter',
  'contracts/SolidityCounter.sol',
  'test/cross-vm.test.ts',
] as const;

export function checkInitPreflightConflicts(targetDir: string): void {
  const found: string[] = [];

  for (const rel of INIT_CONFLICT_PATHS) {
    if (existsSync(path.join(targetDir, rel))) {
      found.push(rel);
    }
  }

  if (found.length > 0) {
    console.error(
      `\nError: Target directory already contains files or folders that this init command would modify:\n` +
        found.map((f) => `  - ${f}`).join('\n') +
        `\n\nAborting before making any changes to avoid overwriting user files.\n`,
    );
    process.exit(1);
  }
}
