import type { NewTaskActionFunction } from 'hardhat/types/tasks';
import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';

const taskDeploy: NewTaskActionFunction<{}> = async (
  {},
  hre: HardhatRuntimeEnvironment
) => {
  console.log('deploy');
};

export default taskDeploy;
