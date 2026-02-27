import type { NewTaskActionFunction } from 'hardhat/types/tasks';
import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';

import { setTestHostMode } from '@cobuilders/hardhat-arb-deploy';

import { runContainerMode } from '../../services/runners/container.js';
import { runHostMode } from '../../services/runners/host.js';

export interface ArbTestArgs {
  testFiles: string[];
  only: boolean;
  grep: string | undefined;
  noCompile: boolean;
  host: boolean;
}

interface ArbTestTaskDeps {
  setTestHostMode: (host: boolean | null) => void;
  runHostMode: (
    hre: HardhatRuntimeEnvironment,
    opts: Omit<ArbTestArgs, 'host'>,
  ) => Promise<void>;
  runContainerMode: (
    hre: HardhatRuntimeEnvironment,
    opts: Omit<ArbTestArgs, 'host'>,
  ) => Promise<void>;
}

const defaultTaskDeps: ArbTestTaskDeps = {
  setTestHostMode,
  runHostMode,
  runContainerMode,
};

export async function runArbTestTask(
  { testFiles, only, grep, noCompile, host }: ArbTestArgs,
  hre: HardhatRuntimeEnvironment,
  deps: ArbTestTaskDeps = defaultTaskDeps,
): Promise<void> {
  deps.setTestHostMode(host);

  try {
    if (host) {
      await deps.runHostMode(hre, { testFiles, only, grep, noCompile });
    } else {
      await deps.runContainerMode(hre, { testFiles, only, grep, noCompile });
    }
  } finally {
    deps.setTestHostMode(null);
  }
}

const taskTest: NewTaskActionFunction<ArbTestArgs> = async (
  args,
  hre: HardhatRuntimeEnvironment,
) => runArbTestTask(args, hre);

export default taskTest;
