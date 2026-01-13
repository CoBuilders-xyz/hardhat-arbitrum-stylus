import type { NewTaskActionFunction } from 'hardhat/types/tasks';
import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';

const taskNode: NewTaskActionFunction<{}> = async (
  {},
  hre: HardhatRuntimeEnvironment
) => {
  console.log('node');
};

export default taskNode;
