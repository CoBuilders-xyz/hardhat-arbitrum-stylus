import type { NewTaskActionFunction } from 'hardhat/types/tasks';
import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';

const taskCompile: NewTaskActionFunction<{}> = async (
  {},
  hre: HardhatRuntimeEnvironment
) => {
  console.log('compile', 'hre.version:', hre.versions.hardhat);
};

export default taskCompile;
