import fs from 'node:fs/promises';
import path from 'node:path';
import { after, before } from 'node:test';

/**
 * This helper adds node:test hooks to run the tests inside one of the projects
 * from test/fixture-projects.
 */
export function useFixtureProject(projectName: string): void {
  let projectPath: string;
  let prevWorkingDir: string;

  before(async () => {
    prevWorkingDir = process.cwd();
    projectPath = path.join(
      prevWorkingDir,
      'test',
      'fixture-projects',
      projectName,
    );

    try {
      await fs.access(projectPath);
    } catch {
      throw new Error(
        `Fixture project '${projectName}' doesn't exist at ${projectPath}`,
      );
    }

    process.chdir(projectPath);
  });

  after(() => {
    process.chdir(prevWorkingDir);
  });
}
