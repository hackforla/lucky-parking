import type { JestConfigWithTsJest } from 'ts-jest';
import { config as baseConfig } from './base';

export const config: JestConfigWithTsJest = {
	...baseConfig,
	testEnvironment: "node",
  transform: {
    "^.+\.tsx?$": ["ts-jest", {}],
  },
};
