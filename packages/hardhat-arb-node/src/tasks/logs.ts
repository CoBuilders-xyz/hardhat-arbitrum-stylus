import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

import { DockerClient } from '@cobuilders/hardhat-arb-utils';

import { CONTAINER_NAME } from '../config/defaults.js';

interface TaskLogsArguments {
  follow: boolean;
  tail: number;
}

const taskLogs: NewTaskActionFunction<TaskLogsArguments> = async (
  args,
  _hre: HardhatRuntimeEnvironment,
) => {
  const { follow, tail } = args;
  const client = new DockerClient();

  const containerId = await client.findByName(CONTAINER_NAME);
  if (!containerId) {
    console.log('Node is not running.');
    return;
  }

  if (follow) {
    console.log('Streaming logs (press Ctrl+C to stop)...\n');
    const logProcess = client.streamLogs(containerId);

    logProcess.stdout?.pipe(process.stdout);
    logProcess.stderr?.pipe(process.stderr);

    await new Promise<void>((resolve, reject) => {
      logProcess.on('exit', () => resolve());
      logProcess.on('error', reject);
    });
  } else {
    const logs = await client.logs(containerId, { tail });
    console.log(logs);
  }
};

export default taskLogs;
