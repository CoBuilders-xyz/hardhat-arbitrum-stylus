import type { HardhatRuntimeEnvironmentHooks } from 'hardhat/types/hooks';
import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';

let capturedHre: HardhatRuntimeEnvironment | undefined;

export function getHre(): HardhatRuntimeEnvironment | undefined {
  return capturedHre;
}

export default async (): Promise<Partial<HardhatRuntimeEnvironmentHooks>> => ({
  created: async (_context, hre) => {
    capturedHre = hre;
  },
});
