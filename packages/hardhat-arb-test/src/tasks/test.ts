import type { NewTaskActionFunction } from 'hardhat/types/tasks';
import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';

const taskTest: NewTaskActionFunction<{}> = async (
  {},
  hre: HardhatRuntimeEnvironment
) => {
  console.log('test');
};

export default taskTest;
