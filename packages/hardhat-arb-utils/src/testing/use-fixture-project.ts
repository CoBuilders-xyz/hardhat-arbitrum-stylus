import fs from "node:fs/promises";
import path from "node:path";
import { after, before } from "node:test";

/**
 * This helper adds node:test hooks to run the tests inside one of the projects
 * from test/fixture-projects. It simply changes the working directory to the
 * fixture project folder.
 *
 * This approach allows relative imports in fixture hardhat.config files to
 * resolve back to the plugin source code.
 *
 * @param projectName The base name of the folder with the project to use.
 */
export function useFixtureProject(projectName: string): void {
  let projectPath: string;
  let prevWorkingDir: string;

  before(async () => {
    prevWorkingDir = process.cwd();
    projectPath = path.join(
      prevWorkingDir,
      "test",
      "fixture-projects",
      projectName,
    );

    // Verify the fixture project exists
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
