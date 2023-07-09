import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx)?$': ['ts-jest', { 
      "tsconfig": "./packages/website/tsconfig.json"
    }],
  },
  'testEnvironment': 'jest-environment-jsdom',

};

export default config
