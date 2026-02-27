import type { HardhatRuntimeEnvironmentHooks } from 'hardhat/types/hooks';
import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';

let capturedHre: HardhatRuntimeEnvironment | undefined;

export function getHre(): HardhatRuntimeEnvironment | undefined {
  return capturedHre;
}

const hreHook = async (): Promise<Partial<HardhatRuntimeEnvironmentHooks>> => ({
  created: async (_context, hre) => {
    capturedHre = hre;
  },
});

export default hreHook;
