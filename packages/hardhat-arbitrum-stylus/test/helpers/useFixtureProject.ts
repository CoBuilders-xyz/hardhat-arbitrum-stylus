import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { after, before } from 'node:test';

async function copyDir(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(from, to);
    } else if (entry.isSymbolicLink()) {
      const link = await fs.readlink(from);
      await fs.symlink(link, to);
    } else {
      await fs.copyFile(from, to);
    }
  }
}

export function useFixtureProject(name: string): void {
  const originalCwd = process.cwd();
  let tmpDir: string;

  before(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), `hh-fixture-${name}-`));

    const fixtureSrc = path.join(originalCwd, 'test', 'fixture-projects', name);

    await copyDir(fixtureSrc, tmpDir);
    process.chdir(tmpDir);
  });

  after(async () => {
    process.chdir(originalCwd);
    // optional: cleanup tmpDir. You can leave it for debugging.
    await fs.rm(tmpDir, { recursive: true, force: true });
  });
}
