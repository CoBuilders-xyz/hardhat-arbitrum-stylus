import type { NewTaskActionFunction } from 'hardhat/types/tasks';
import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';

const taskTest: NewTaskActionFunction<{}> = async (
  {},
  _hre: HardhatRuntimeEnvironment,
) => {
  console.log('arb:test is not yet implemented. Stay tuned!');
};

export default taskTest;
