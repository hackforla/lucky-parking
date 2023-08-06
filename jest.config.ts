import type { Config } from "jest";

const config: Config = {
  roots: ["<rootDir>/packages/"],
  preset: "ts-jest",
  collectCoverage: true,
  collectCoverageFrom: [
    "!<rootDir>/node_modules",
    "<rootDir>/packages/ui/**/*.{ts,tsx}",
    "<rootDir>/packages/website/**/*.{ts,tsx}",
  ],
  modulePaths: ["<rootDir>/packages/website"],
  moduleNameMapper: {
    "^@/(.*)$": ["<rootDir>/packages/website/src/$1"],
  },
  transform: {
    "^.+\\.(ts|tsx)?": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/packages/website/tsconfig.json",
      },
    ],
  },
  testEnvironment: "jsdom",
  testPathIgnorePatterns: ["/node_modules/"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};

export default config;
