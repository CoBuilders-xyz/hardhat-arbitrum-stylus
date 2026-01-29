import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

import { DockerClient } from '@cobuilders/hardhat-arb-utils';

import { CONTAINER_NAME } from '../config/defaults.js';

interface TaskLogsArguments {
  follow: boolean;
  tail: number;
  name: string;
}

const taskLogs: NewTaskActionFunction<TaskLogsArguments> = async (
  args,
  _hre: HardhatRuntimeEnvironment,
) => {
  const { follow, tail, name } = args;
  const containerName = name || CONTAINER_NAME;
  const client = new DockerClient();

  const containerId = await client.findByName(containerName);
  if (!containerId) {
    console.log(`Node ${containerName} is not running.`);
    console.log(
      'If the node was started with a custom name, use --name to specify it.',
    );
    return;
  }

  if (follow) {
    console.log('Streaming logs (press Ctrl+C to stop)...\n');
    const logProcess = client.streamLogs(containerId, { tail });

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
